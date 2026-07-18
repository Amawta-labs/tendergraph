import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { performance } from "node:perf_hooks";

import {
  finalizeImpactDiscovery,
  prepareImpactDiscoveryForEvent,
  type ImpactCompositionMetadata,
} from "../lib/harness/impact-discovery";
import { getFixture, listEvidenceDeltas } from "../lib/harness/fixtures";
import {
  ImpactDiscoveryInputSchema,
  type EvidenceDeltaEvent,
  type ImpactDiscoveryInput,
} from "../lib/harness/schemas";

interface CliOptions {
  fixtureId: string;
  eventId: string | null;
  inputPath: string | null;
  model: string;
}

class CodexImpactProcessError extends Error {
  constructor(message: string, readonly sessionId: string | null) {
    super(message);
  }
}

function extractSessionId(stdout: string): string | null {
  const sessionId = stdout
    .split("\n")
    .filter(Boolean)
    .flatMap((line) => {
      try {
        return [JSON.parse(line) as Record<string, unknown>];
      } catch {
        return [];
      }
    })
    .find((event) => event.type === "thread.started")?.thread_id;
  return typeof sessionId === "string" ? sessionId : null;
}

function parseArgs(args: string[]): CliOptions {
  const value = (flag: string) => {
    const index = args.indexOf(flag);
    return index >= 0 ? args[index + 1] : undefined;
  };
  return {
    fixtureId: value("--fixture") ?? "cl-correction-demo",
    eventId: value("--event") ?? null,
    inputPath: value("--input") ?? null,
    model: value("--model") ?? "gpt-5.6-terra",
  };
}

async function runCodexImpact(
  rootDir: string,
  inputPath: string,
  candidatePath: string,
  model: string,
): Promise<ImpactCompositionMetadata> {
  const schemaPath = path.join(rootDir, "contracts", "impact-candidate.schema.json");
  const contractJson = await readFile(inputPath, "utf8");
  const prompt = [
    "You are the shadow impact-discovery boundary of TenderGraph.",
    "The complete contract is provided on stdin.",
    "Compare addedEvidence with every activeClaim and classify every active claim exactly once.",
    "Put a claim in items when new evidence may corroborate, invalidate, supersede, or require review.",
    "Put every other claim ID in unchangedClaimIds.",
    "Impact means a material change in claim state or evidentiary authority, not incidental repetition.",
    "Use corroborate only when the new source adds independent authority or materially stronger support for that claim.",
    "If evidence merely repeats an unchanged general rule while changing other claims, put that rule in unchangedClaimIds.",
    "Use only claim IDs from activeClaims and evidence IDs from addedEvidence.",
    "For supersede, proposedStatement must be a concise replacement statement supported only by addedEvidence.",
    "For every other action, proposedStatement must be null.",
    "Use review when the evidence suggests impact but does not establish a safe semantic action.",
    "Do not promote, reject, or mutate claims; this output is a shadow proposal requiring human review.",
    "Do not inspect the repository, call tools, or use outside knowledge.",
    "Return only JSON matching the supplied schema.",
  ].join(" ");
  const startedAt = performance.now();

  return await new Promise((resolve, reject) => {
    const child = spawn(
      "codex",
      [
        "exec",
        "--json",
        "--model",
        model,
        "--ignore-user-config",
        "--sandbox",
        "read-only",
        "--cd",
        rootDir,
        "--output-schema",
        schemaPath,
        "--output-last-message",
        candidatePath,
        prompt,
      ],
      { cwd: rootDir, env: process.env, detached: process.platform !== "win32" },
    );
    child.stdin.end(contractJson);
    let stdout = "";
    let stderr = "";
    let settled = false;
    const finish = (callback: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      callback();
    };
    const timeout = setTimeout(() => {
      try {
        if (child.pid && process.platform !== "win32") {
          process.kill(-child.pid, "SIGTERM");
        } else {
          child.kill("SIGTERM");
        }
      } catch {
        // The process may already have exited while the timeout fired.
      }
      finish(() =>
        reject(
          new CodexImpactProcessError(
            "Codex impact discovery exceeded the 150 second limit",
            extractSessionId(stdout),
          ),
        ),
      );
    }, 150_000);
    child.stdout.on("data", (chunk) => {
      const text = chunk.toString();
      stdout += text;
      process.stdout.write(text);
    });
    child.stderr.on("data", (chunk) => {
      const text = chunk.toString();
      stderr += text;
      process.stderr.write(text);
    });
    child.on("error", (error) => finish(() => reject(error)));
    child.on("close", (code) => {
      if (code !== 0) {
        finish(() =>
          reject(
            new CodexImpactProcessError(
              `Codex impact discovery exited with code ${code}: ${stderr.slice(-500)}`,
              extractSessionId(stdout),
            ),
          ),
        );
        return;
      }
      finish(() =>
        resolve({
          model,
          sessionId: extractSessionId(stdout),
          elapsedMs: Math.round(performance.now() - startedAt),
        }),
      );
    });
  });
}

function findEvent(
  fixtureId: string,
  eventId: string | null,
): EvidenceDeltaEvent | null {
  const deltas = listEvidenceDeltas();
  if (eventId) {
    return deltas.find((delta) => delta.event.id === eventId)?.event ?? null;
  }
  const fixture = getFixture(fixtureId);
  return (
    deltas.find(
      (delta) => delta.event.procedureId === fixture?.scope.procedureId,
    )?.event ?? null
  );
}

async function loadInput(
  rootDir: string,
  options: CliOptions,
): Promise<{ input: ImpactDiscoveryInput; referenceEvent: EvidenceDeltaEvent | null }> {
  if (options.inputPath) {
    const absolutePath = path.resolve(rootDir, options.inputPath);
    const input = ImpactDiscoveryInputSchema.parse(
      JSON.parse(await readFile(absolutePath, "utf8")),
    );
    return {
      input,
      referenceEvent: options.eventId
        ? findEvent(input.fixture.id, options.eventId)
        : null,
    };
  }
  const fixture = getFixture(options.fixtureId);
  if (!fixture) throw new Error(`Unknown fixture: ${options.fixtureId}`);
  const referenceEvent = findEvent(options.fixtureId, options.eventId);
  if (!referenceEvent) {
    throw new Error(`No evidence event found for fixture: ${options.fixtureId}`);
  }
  return {
    input: prepareImpactDiscoveryForEvent(
      fixture,
      referenceEvent,
      options.model,
    ),
    referenceEvent,
  };
}

async function main() {
  const rootDir = process.cwd();
  const options = parseArgs(process.argv.slice(2));
  const { input, referenceEvent } = await loadInput(rootDir, options);
  const fixture = getFixture(input.fixture.id);
  if (!fixture) throw new Error(`Unknown fixture: ${input.fixture.id}`);
  const runDir = path.join(rootDir, ".tendergraph", "impact-runs", input.runId);
  const inputPath = path.join(runDir, "input.json");
  const candidatePath = path.join(runDir, "candidate.json");
  const resultPath = path.join(runDir, "result.json");
  await mkdir(runDir, { recursive: true });
  await writeFile(inputPath, JSON.stringify(input, null, 2));

  console.log(
    JSON.stringify({
      event: "tendergraph.impact.prepared",
      runId: input.runId,
      model: options.model,
    }),
  );
  let candidate: unknown = null;
  let metadata: ImpactCompositionMetadata;
  const startedAt = performance.now();
  try {
    metadata = await runCodexImpact(
      rootDir,
      inputPath,
      candidatePath,
      options.model,
    );
    candidate = JSON.parse(await readFile(candidatePath, "utf8")) as unknown;
  } catch (error) {
    metadata = {
      model: options.model,
      sessionId:
        error instanceof CodexImpactProcessError ? error.sessionId : null,
      elapsedMs: Math.round(performance.now() - startedAt),
      failureReason:
        error instanceof Error ? error.message : "Codex impact discovery failed",
    };
  }
  await rm(candidatePath, { force: true });
  const result = finalizeImpactDiscovery(
    fixture,
    input,
    candidate,
    metadata,
    referenceEvent,
  );
  await writeFile(resultPath, JSON.stringify(result, null, 2));
  const artifactDir = path.join(rootDir, "artifacts", "impact-runs");
  await mkdir(artifactDir, { recursive: true });
  const serializedCandidate = JSON.stringify(candidate) ?? "null";
  await Promise.all([
    writeFile(
      path.join(artifactDir, "latest-input.json"),
      JSON.stringify(input, null, 2),
    ),
    writeFile(
      path.join(artifactDir, "latest-candidate.json"),
      JSON.stringify(
        {
          contractVersion: "impact-candidate-record.v1",
          sha256: createHash("sha256").update(serializedCandidate).digest("hex"),
          characterCount: serializedCandidate.length,
          outputSchemaValid: candidate !== null,
          rawCandidateRetained: false,
        },
        null,
        2,
      ),
    ),
    writeFile(
      path.join(artifactDir, "latest.json"),
      JSON.stringify(result, null, 2),
    ),
  ]);
  console.log(
    JSON.stringify({
      event: "tendergraph.impact.completed",
      runId: input.runId,
      proposalId: result.proposalId,
      codexSessionId: result.codexSessionId,
      model: result.model,
      mode: result.mode,
      items: result.items.length,
      unchanged: result.unchangedClaimIds.length,
      exactReferenceAgreement: result.referenceAgreement?.exact ?? null,
      artifact: "artifacts/impact-runs/latest.json",
    }),
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
