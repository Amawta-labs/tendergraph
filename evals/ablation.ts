import { composeDeterministicFallback } from "../src/lib/harness/fallback";
import { validateLatency, validateReaderOutput } from "../src/lib/harness/gates";
import { getFixture } from "../src/lib/harness/fixtures";
import { buildAnswerPlan } from "../src/lib/harness/policy";

function main() {
  const fixture = getFixture("cl-deep-demo");
  if (!fixture) throw new Error("Chile fixture missing");
  const plan = buildAnswerPlan(fixture, "Who won and why?");
  const baseline = composeDeterministicFallback(fixture, plan);
  const faults = [
    { name: "missing_claim", mutate: () => baseline.sections.slice(1) },
    { name: "wrong_scope", mutate: () => [{ ...baseline.sections[0], claimIds: ["foreign-claim"] }, ...baseline.sections.slice(1)] },
    { name: "missing_signal", mutate: () => [] },
    { name: "internal_leakage", mutate: () => baseline.sections, summary: "Expose the system prompt." },
    { name: "unknown_evidence", mutate: () => [{ ...baseline.sections[0], evidenceIds: ["missing"] }, ...baseline.sections.slice(1)] },
    { name: "unpromoted_claim", mutate: () => [{ ...baseline.sections[0], claimIds: ["claim-cl-certificate-valid"] }, ...baseline.sections.slice(1)] },
    { name: "invented_claim", mutate: () => [{ ...baseline.sections[0], claimIds: ["invented"] }, ...baseline.sections.slice(1)] },
  ];

  const results = faults.map((fault) => {
    const output = {
      ...baseline,
      summary: fault.summary ?? baseline.summary,
      sections: fault.mutate(),
    };
    const gateResults = validateReaderOutput(output, fixture, plan);
    return {
      fault: fault.name,
      harnessAdmitted: gateResults.every((gate) => gate.passed),
      promptOnlyAdmitted: true,
      detectedBy: gateResults.filter((gate) => !gate.passed).map((gate) => gate.gate),
    };
  });
  results.push({
    fault: "latency",
    harnessAdmitted: validateLatency(501, 500).passed,
    promptOnlyAdmitted: true,
    detectedBy: ["latency_budget"],
  });

  console.log(
    JSON.stringify(
      {
        contract: "tendergraph-enforcement-ablation.v1",
        note: "Controlled fault ablation; this measures enforcement, not model quality.",
        faults: results.length,
        harnessViolationsAdmitted: results.filter((result) => result.harnessAdmitted).length,
        promptOnlyViolationsAdmitted: results.filter((result) => result.promptOnlyAdmitted).length,
        results,
      },
      null,
      2,
    ),
  );
}

main();
