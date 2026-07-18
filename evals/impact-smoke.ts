import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { performance } from "node:perf_hooks";

import { ImpactDiscoveryResultSchema } from "../src/lib/harness/schemas";

const scenarios = [
  {
    id: "public-selection-corroboration",
    fixtureId: "cl-real-5802381-7547UCUK",
    eventId: "delta-cl-5802381-public-selection",
    expectedActions: ["corroborate"],
  },
  {
    id: "corrected-award-supersession",
    fixtureId: "cl-correction-demo",
    eventId: "delta-cl-correction-resolution",
    expectedActions: ["supersede", "supersede"],
  },
] as const;

async function runScenario(
  rootDir: string,
  scenario: (typeof scenarios)[number],
) {
  const startedAt = performance.now();
  const stdout = await new Promise<string>((resolve, reject) => {
    const child = spawn(
      "npm",
      [
        "run",
        "tendergraph:impact",
        "--",
        "--fixture",
        scenario.fixtureId,
        "--event",
        scenario.eventId,
        "--model",
        "gpt-5.6-terra",
      ],
      { cwd: rootDir, env: process.env },
    );
    child.stdin.end();
    let output = "";
    let errorOutput = "";
    child.stdout.on("data", (chunk) => {
      output += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      errorOutput += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(
          new Error(
            `Impact smoke process failed with exit code ${code}: ${errorOutput}`,
          ),
        );
        return;
      }
      resolve(output);
    });
  });
  const completed = stdout
    .split("\n")
    .filter(Boolean)
    .flatMap((line) => {
      try {
        return [JSON.parse(line) as Record<string, unknown>];
      } catch {
        return [];
      }
    })
    .find((event) => event.event === "tendergraph.impact.completed");
  if (typeof completed?.runId !== "string") {
    throw new Error(`Scenario ${scenario.id} did not return a run ID`);
  }
  const result = ImpactDiscoveryResultSchema.parse(
    JSON.parse(
      await readFile(
        path.join(
          rootDir,
          ".tendergraph",
          "impact-runs",
          completed.runId,
          "result.json",
        ),
        "utf8",
      ),
    ),
  );
  const failures: string[] = [];
  if (result.mode !== "live") failures.push(`mode=${result.mode}`);
  if (result.compositionSurface !== "codex") {
    failures.push(`surface=${result.compositionSurface}`);
  }
  if (!result.codexSessionId) failures.push("missing Codex session ID");
  if (result.validationResults.some((gate) => !gate.passed)) {
    failures.push(
      `gates=${result.validationResults
        .filter((gate) => !gate.passed)
        .map((gate) => gate.code)
        .join(",")}`,
    );
  }
  if (result.referenceAgreement?.exact !== true) {
    failures.push("reference agreement is not exact");
  }
  const actions = result.items.map((item) => item.action);
  if (JSON.stringify(actions) !== JSON.stringify(scenario.expectedActions)) {
    failures.push(`actions=${actions.join(",")}`);
  }
  if (!result.requiresHumanReview || result.status !== "shadow") {
    failures.push("shadow review invariant failed");
  }

  return {
    scenarioId: scenario.id,
    passed: failures.length === 0,
    runId: completed.runId,
    proposalId: result.proposalId,
    codexSessionId: result.codexSessionId,
    model: result.model,
    actions,
    gatesPassed: result.validationResults.filter((gate) => gate.passed).length,
    gatesTotal: result.validationResults.length,
    exactReferenceAgreement: result.referenceAgreement?.exact ?? false,
    elapsedMs: Math.round(performance.now() - startedAt),
    failures,
  };
}

async function main() {
  const rootDir = process.cwd();
  const runs = [];
  for (const scenario of scenarios) {
    runs.push(await runScenario(rootDir, scenario));
  }
  const report = {
    contract: "tendergraph-impact-smoke.v1",
    createdAt: new Date().toISOString(),
    model: "gpt-5.6-terra",
    expectedRuns: scenarios.length,
    passed: runs.filter((run) => run.passed).length,
    failed: runs.filter((run) => !run.passed).length,
    runs,
  };
  const outputDir = path.join(rootDir, "artifacts", "evals");
  await mkdir(outputDir, { recursive: true });
  await writeFile(
    path.join(outputDir, "impact-smoke.json"),
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
  if (report.failed > 0) process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
