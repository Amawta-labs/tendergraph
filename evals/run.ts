import { readFile } from "node:fs/promises";

import { z } from "zod";

import { getFixture } from "../src/lib/harness/fixtures";
import { runHarness } from "../src/lib/harness/run";

const ScenarioSchema = z.object({
  id: z.string(),
  fixtureId: z.string(),
  question: z.string(),
  expectedClaimIds: z.array(z.string()),
  expectedStatus: z.enum(["official", "simulated", "insufficient_evidence"]),
});

const ScenarioListSchema = z.array(ScenarioSchema);

async function main() {
  const raw = await readFile(new URL("./scenarios.json", import.meta.url), "utf8");
  const scenarios = ScenarioListSchema.parse(JSON.parse(raw));
  const failures: Array<{ id: string; reasons: string[] }> = [];
  const timings: number[] = [];

  for (const scenario of scenarios) {
    const fixture = getFixture(scenario.fixtureId);
    if (!fixture) throw new Error(`Unknown fixture: ${scenario.fixtureId}`);
    const result = await runHarness(fixture, scenario.question, { mode: "fallback" });
    const claimIds = result.readerOutput.sections.flatMap((section) => section.claimIds);
    const reasons: string[] = [];
    if (JSON.stringify(claimIds) !== JSON.stringify(scenario.expectedClaimIds)) {
      reasons.push(`claims: expected ${scenario.expectedClaimIds}, received ${claimIds}`);
    }
    if (result.readerOutput.status !== scenario.expectedStatus) {
      reasons.push(
        `status: expected ${scenario.expectedStatus}, received ${result.readerOutput.status}`,
      );
    }
    if (result.trace.validationResults.some((gate) => !gate.passed)) {
      reasons.push(
        `gates: ${result.trace.validationResults
          .filter((gate) => !gate.passed)
          .map((gate) => gate.code)
          .join(", ")}`,
      );
    }
    if (reasons.length) failures.push({ id: scenario.id, reasons });
    timings.push(result.trace.timings.totalMs);
  }

  const report = {
    contract: "tendergraph-eval.v1",
    scenarios: scenarios.length,
    passed: scenarios.length - failures.length,
    failed: failures.length,
    maxDeterministicRuntimeMs: Math.max(...timings),
    failures,
  };
  console.log(JSON.stringify(report, null, 2));
  if (failures.length) process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
