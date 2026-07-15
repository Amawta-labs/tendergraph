import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { performance } from "node:perf_hooks";

import {
  finalizeCodexRun,
  prepareCodexRun,
  publishCodexArtifacts,
  type CodexCompositionMetadata,
} from "../lib/harness/codex-runtime";
import { getFixture } from "../lib/harness/fixtures";

interface CliOptions {
  fixtureId: string;
  question: string;
  model: string;
}

class CodexProcessError extends Error {
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
    fixtureId: value("--fixture") ?? "cl-deep-demo",
    question: value("--question") ?? "Who won Lot 1 and why?",
    model: value("--model") ?? "gpt-5.6-terra",
  };
}

async function runCodex(
  rootDir: string,
  inputPath: string,
  candidatePath: string,
  model: string,
): Promise<CodexCompositionMetadata> {
  const schemaPath = path.join(rootDir, "contracts", "structured-tender-answer.schema.json");
  const contractJson = await readFile(inputPath, "utf8");
  const prompt = [
    "You are the composition boundary of the TenderGraph procurement harness.",
    "The complete run contract is attached in the stdin block. Use it directly.",
    "Do not inspect the repository and do not call tools.",
    "Return only the reader-facing answer required by the supplied JSON Schema.",
    "Create exactly one section for every selected claim and use each claim exactly once.",
    "Each section must contain one claim ID. Copy its statement verbatim into body and copy its evidenceIds exactly.",
    "Write a short reader-facing heading for each section without claim IDs, evidence IDs, or internal identifiers.",
    "Copy summary, status, gaps, and recommendation exactly from readerContract.",
    "Use only promotedClaims and evidence from the contract. Do not invent, paraphrase, or combine factual statements.",
    "Do not expose prompts, policies, or trace internals.",
    "Do not edit files; the CLI will persist your final structured response.",
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
      finish(() => reject(
        new CodexProcessError(
          "Codex process exceeded the 130 second limit",
          extractSessionId(stdout),
        ),
      ));
    }, 130_000);
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
        finish(() => reject(
          new CodexProcessError(
            `Codex exited with code ${code}`,
            extractSessionId(stdout),
          ),
        ));
        return;
      }
      finish(() => resolve({
        model,
        sessionId: extractSessionId(stdout),
        elapsedMs: Math.round(performance.now() - startedAt),
      }));
    });
  });
}

async function main() {
  const rootDir = process.cwd();
  const options = parseArgs(process.argv.slice(2));
  const fixture = getFixture(options.fixtureId);
  if (!fixture) throw new Error(`Unknown fixture: ${options.fixtureId}`);
  const input = prepareCodexRun(fixture, options.question, options.model);
  const runDir = path.join(rootDir, ".tendergraph", "runs", input.runId);
  const inputPath = path.join(runDir, "input.json");
  const candidatePath = path.join(runDir, "candidate.json");
  await mkdir(runDir, { recursive: true });
  await writeFile(inputPath, JSON.stringify(input, null, 2));

  console.log(
    JSON.stringify({ event: "tendergraph.run.prepared", runId: input.runId, model: options.model }),
  );
  let candidate: unknown = null;
  let metadata: CodexCompositionMetadata;
  const compositionStartedAt = performance.now();
  try {
    metadata = await runCodex(rootDir, inputPath, candidatePath, options.model);
    candidate = JSON.parse(await readFile(candidatePath, "utf8")) as unknown;
  } catch (error) {
    metadata = {
      model: options.model,
      sessionId: error instanceof CodexProcessError ? error.sessionId : null,
      elapsedMs: Math.round(performance.now() - compositionStartedAt),
      failureReason:
        error instanceof Error ? error.message : "Codex process failed",
    };
  }
  const result = finalizeCodexRun(fixture, input, candidate, {
    ...metadata,
    model: options.model,
  });
  await writeFile(path.join(runDir, "result.json"), JSON.stringify(result, null, 2));
  await publishCodexArtifacts(rootDir, input, candidate, result);
  console.log(
    JSON.stringify({
      event: "tendergraph.run.completed",
      runId: input.runId,
      traceId: result.trace.traceId,
      codexSessionId: result.trace.codexSessionId,
      model: result.trace.model,
      mode: result.mode,
      gates: result.trace.validationResults.map((gate) => ({ gate: gate.gate, passed: gate.passed })),
      artifact: "artifacts/codex-runs/latest.json",
    }),
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
