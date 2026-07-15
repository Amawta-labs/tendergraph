import { readFile } from "node:fs/promises";

import { z } from "zod";

import { getFixture } from "../src/lib/harness/fixtures";
import { runHarness } from "../src/lib/harness/run";

const ScenarioSchema = z.object({
  id: z.string(),
  fixtureId: z.string(),
  question: z.string(),
  expectedClaimIds: z.array(z.string()),
  expectedStatus: z.string(),
});

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required for the 54-run live evaluation");
  }
  const raw = await readFile(new URL("./scenarios.json", import.meta.url), "utf8");
  const scenarios = z.array(ScenarioSchema).parse(JSON.parse(raw));
  const runs = [];

  for (const scenario of scenarios) {
    const fixture = getFixture(scenario.fixtureId);
    if (!fixture) throw new Error(`Unknown fixture: ${scenario.fixtureId}`);
    for (let repetition = 1; repetition <= 3; repetition += 1) {
      const startedAt = Date.now();
      try {
        const result = await runHarness(fixture, scenario.question, { mode: "live" });
        runs.push({
          scenarioId: scenario.id,
          repetition,
          passed: result.trace.validationResults.every((gate) => gate.passed),
          latencyMs: Date.now() - startedAt,
          failure: null,
        });
      } catch (error) {
        runs.push({
          scenarioId: scenario.id,
          repetition,
          passed: false,
          latencyMs: Date.now() - startedAt,
          failure: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  }

  console.log(
    JSON.stringify(
      {
        contract: "tendergraph-live-eval.v1",
        model: process.env.OPENAI_MODEL ?? "gpt-5.6",
        expectedRuns: scenarios.length * 3,
        passed: runs.filter((run) => run.passed).length,
        failed: runs.filter((run) => !run.passed).length,
        runs,
      },
      null,
      2,
    ),
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
