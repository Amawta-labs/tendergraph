import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { performance } from "node:perf_hooks";

import { CompositionResultSchema } from "../src/lib/harness/schemas";

const scenarios = [
  {
    id: "public-award",
    fixtureId: "cl-real-5802381-7547UCUK",
    question: "Who was recommended for award and why?",
    expectedClaimIds: [
      "claim-cl-real-scores",
      "claim-cl-real-award-recommendation",
      "claim-cl-real-loss-reason",
    ],
  },
  {
    id: "corrected-award",
    fixtureId: "cl-correction-demo",
    question: "Who won after the correction and why?",
    expectedClaimIds: [
      "claim-cl-correction-rule",
      "claim-cl-correction-winner",
      "claim-cl-correction-loss",
    ],
  },
] as const;

async function runScenario(rootDir: string, scenario: (typeof scenarios)[number]) {
  const startedAt = performance.now();
  const stdout = await new Promise<string>((resolve, reject) => {
    const child = spawn(
      "npm",
      [
        "run",
        "tendergraph:codex",
        "--",
        "--fixture",
        scenario.fixtureId,
        "--question",
        scenario.question,
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
        reject(new Error(`Codex smoke process failed with exit code ${code}: ${errorOutput}`));
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
    .find((event) => event.event === "tendergraph.run.completed");
  if (typeof completed?.runId !== "string") {
    throw new Error(`Scenario ${scenario.id} did not return a run ID`);
  }
  const result = CompositionResultSchema.parse(
    JSON.parse(
      await readFile(
        path.join(rootDir, ".tendergraph", "runs", completed.runId, "result.json"),
        "utf8",
      ),
    ),
  );
  const actualClaimIds = result.readerOutput.sections.flatMap(
    (section) => section.claimIds,
  );
  const failures: string[] = [];
  if (result.mode !== "live") failures.push(`mode=${result.mode}`);
  if (result.trace.compositionSurface !== "codex") {
    failures.push(`surface=${result.trace.compositionSurface}`);
  }
  if (!result.trace.codexSessionId) failures.push("missing Codex session ID");
  if (result.trace.validationResults.some((gate) => !gate.passed)) {
    failures.push(
      `gates=${result.trace.validationResults
        .filter((gate) => !gate.passed)
        .map((gate) => gate.code)
        .join(",")}`,
    );
  }
  if (JSON.stringify(actualClaimIds) !== JSON.stringify(scenario.expectedClaimIds)) {
    failures.push(`claims=${actualClaimIds.join(",")}`);
  }

  return {
    scenarioId: scenario.id,
    passed: failures.length === 0,
    runId: completed.runId,
    traceId: result.trace.traceId,
    codexSessionId: result.trace.codexSessionId,
    model: result.trace.model,
    mode: result.mode,
    gatesPassed: result.trace.validationResults.filter((gate) => gate.passed).length,
    gatesTotal: result.trace.validationResults.length,
    elapsedMs: Math.round(performance.now() - startedAt),
    failures,
  };
}

async function main() {
  const rootDir = process.cwd();
  const runs = [];
  for (const scenario of scenarios) runs.push(await runScenario(rootDir, scenario));
  const report = {
    contract: "tendergraph-codex-smoke.v1",
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
    path.join(outputDir, "codex-smoke.json"),
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
  if (report.failed) process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
