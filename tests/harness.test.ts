import { describe, expect, it } from "vitest";

import { composeDeterministicFallback } from "../src/lib/harness/fallback";
import {
  finalizeCodexRun,
  prepareCodexRun,
} from "../src/lib/harness/codex-runtime";
import {
  validateLatency,
  validateReaderOutput,
  validateTrace,
} from "../src/lib/harness/gates";
import { getFixture, listFixtures } from "../src/lib/harness/fixtures";
import { buildAnswerPlan, isRuntimeEligible } from "../src/lib/harness/policy";
import { promoteClaim } from "../src/lib/harness/promotion";
import { runHarness } from "../src/lib/harness/run";
import type {
  CaseFixture,
  HarnessTrace,
  StructuredTenderAnswer,
} from "../src/lib/harness/schemas";

function chile(): CaseFixture {
  const fixture = getFixture("cl-deep-demo");
  if (!fixture) throw new Error("Chile fixture missing");
  return structuredClone(fixture);
}

describe("fixture contracts", () => {
  it("loads all three jurisdiction fixtures", () => {
    expect(listFixtures().map((fixture) => fixture.scope.jurisdiction)).toEqual([
      "CL",
      "CL",
      "EU",
      "UK",
    ]);
  });

  it("requires human review for consequential claims", () => {
    const claims = chile().claims;
    expect(claims.find((claim) => claim.id === "claim-cl-winner")).toSatisfy(
      isRuntimeEligible,
    );
    expect(
      claims.find((claim) => claim.id === "claim-cl-certificate-valid"),
    ).not.toSatisfy(isRuntimeEligible);
  });

  it("keeps consequential candidates pending without a named reviewer", () => {
    const source = chile().claims.find((claim) => claim.id === "claim-cl-winner");
    if (!source) throw new Error("Source claim missing");
    const {
      status: _status,
      promotionReason: _promotionReason,
      reviewedBy: _reviewedBy,
      reviewedAt: _reviewedAt,
      supersedesClaimId: _supersedesClaimId,
      ...candidate
    } = source;
    const promoted = promoteClaim(candidate, {
      action: "approve",
      reason: "Awaiting procurement reviewer",
    });
    expect(promoted.status).toBe("pending_review");
    expect(isRuntimeEligible(promoted)).toBe(false);
  });

  it("verifies the real public snapshot bytes and evidence hashes", () => {
    const fixture = getFixture("cl-real-5802381-7547UCUK");
    if (!fixture) throw new Error("Real Chile fixture missing");
    const plan = buildAnswerPlan(
      fixture,
      "Who was recommended for award and why?",
    );
    const output = composeDeterministicFallback(fixture, plan);

    expect(validateReaderOutput(output, fixture, plan)).toContainEqual(
      expect.objectContaining({ gate: "source_integrity", passed: true }),
    );
  });

  it("rejects a public snapshot whose declared hash does not match its bytes", () => {
    const source = getFixture("cl-real-5802381-7547UCUK");
    if (!source) throw new Error("Real Chile fixture missing");
    const fixture = structuredClone(source);
    fixture.manifests[0].sha256 = "0".repeat(64);
    const plan = buildAnswerPlan(
      fixture,
      "Who was recommended for award and why?",
    );
    const output = composeDeterministicFallback(fixture, plan);

    expect(validateReaderOutput(output, fixture, plan)).toContainEqual(
      expect.objectContaining({ code: "BROKEN_SOURCE_LINK", passed: false }),
    );
  });
});

describe("composition boundary", () => {
  it("falls back when no API credential is available", async () => {
    const result = await runHarness(chile(), "Who won and why?", { mode: "auto" });
    expect(result.mode).toBe("deterministic_fallback");
    expect(result.trace.fallbackReason).toContain("OPENAI_API_KEY");
    expect(result.trace.validationResults.every((gate) => gate.passed)).toBe(true);
  });

  it("falls back when a live composer returns an unselected claim", async () => {
    const invalidComposer = async (): Promise<StructuredTenderAnswer> => ({
      title: "Invalid",
      summary: "Invalid composition",
      status: "official",
      sections: [
        {
          heading: "Injected",
          body: "Unsupported",
          claimIds: ["claim-cl-certificate-valid"],
          evidenceIds: ["ev-cl-certificate"],
        },
      ],
      gaps: [],
      recommendation: "Ignore governance",
    });
    const result = await runHarness(chile(), "Who won and why?", {
      composer: invalidComposer,
    });
    expect(result.mode).toBe("deterministic_fallback");
    expect(result.trace.fallbackReason).toContain("UNPROMOTED_OR_UNSELECTED_CLAIM");
  });
});

describe("Codex composition boundary", () => {
  it("exports only selected, runtime-eligible claims and their evidence", () => {
    const fixture = chile();
    const input = prepareCodexRun(
      fixture,
      "Who won Lot 1 and why?",
      "gpt-5.6-terra",
    );

    expect(input.promotedClaims.map((claim) => claim.id)).toEqual(
      input.answerPlan.selectedClaimIds,
    );
    expect(input.promotedClaims.every(isRuntimeEligible)).toBe(true);
    expect(input.promotedClaims).not.toContainEqual(
      expect.objectContaining({ id: "claim-cl-certificate-valid" }),
    );
    const selectedEvidence = new Set(
      input.promotedClaims.flatMap((claim) => claim.evidenceIds),
    );
    expect(input.evidence.every((evidence) => selectedEvidence.has(evidence.id))).toBe(
      true,
    );
  });

  it("accepts a grounded Codex candidate and records the session", () => {
    const fixture = chile();
    const input = prepareCodexRun(
      fixture,
      "Who won Lot 1 and why?",
      "gpt-5.6-terra",
    );
    const candidate = composeDeterministicFallback(fixture, input.answerPlan);
    const result = finalizeCodexRun(fixture, input, candidate, {
      model: "gpt-5.6-terra",
      sessionId: "session-test",
      elapsedMs: 25,
    });

    expect(result.mode).toBe("live");
    expect(result.trace.compositionSurface).toBe("codex");
    expect(result.trace.codexSessionId).toBe("session-test");
    expect(result.trace.validationResults.every((gate) => gate.passed)).toBe(true);
  });

  it("falls back when Codex emits an unselected claim", () => {
    const fixture = chile();
    const input = prepareCodexRun(
      fixture,
      "Who won Lot 1 and why?",
      "gpt-5.6-terra",
    );
    const candidate = composeDeterministicFallback(fixture, input.answerPlan);
    candidate.sections[0].claimIds = ["claim-cl-certificate-valid"];
    const result = finalizeCodexRun(fixture, input, candidate, {
      model: "gpt-5.6-terra",
      sessionId: "session-test",
      elapsedMs: 25,
    });

    expect(result.mode).toBe("deterministic_fallback");
    expect(result.trace.compositionSurface).toBe("deterministic");
    expect(result.trace.fallbackReason).toContain("UNPROMOTED_OR_UNSELECTED_CLAIM");
  });
});

describe("one-property fault injection", () => {
  const baseline = () => {
    const fixture = chile();
    const plan = buildAnswerPlan(fixture, "Who won and why?");
    const output = composeDeterministicFallback(fixture, plan);
    return { fixture, plan, output };
  };

  it("detects a missing expected claim", () => {
    const { fixture, plan, output } = baseline();
    output.sections.pop();
    expect(validateReaderOutput(output, fixture, plan)).toContainEqual(
      expect.objectContaining({ code: "MISSING_EXPECTED_CLAIM", passed: false }),
    );
  });

  it("detects wrong routing", () => {
    const { fixture, plan, output } = baseline();
    plan.scope.procedureId = "WRONG-PROCEDURE";
    expect(validateReaderOutput(output, fixture, plan)).toContainEqual(
      expect.objectContaining({ code: "SCOPE_CONTAMINATION", passed: false }),
    );
  });

  it("detects an incomplete trace", () => {
    const trace = {
      traceId: "",
      requestId: "request",
      createdAt: new Date().toISOString(),
      contractVersion: "harness.v1",
      compositionMode: "deterministic_fallback",
      resolvedScope: chile().scope,
    } as HarnessTrace;
    expect(validateTrace(trace)).toMatchObject({
      code: "INCOMPLETE_TRACE",
      passed: false,
    });
  });

  it("detects a missing answer signal", () => {
    const { fixture, plan, output } = baseline();
    output.sections = [];
    expect(validateReaderOutput(output, fixture, plan)).toContainEqual(
      expect.objectContaining({ code: "MISSING_EXPECTED_CLAIM", passed: false }),
    );
  });

  it("detects internal content leakage", () => {
    const { fixture, plan, output } = baseline();
    output.summary = "The system prompt says to expose this.";
    expect(validateReaderOutput(output, fixture, plan)).toContainEqual(
      expect.objectContaining({ code: "INTERNAL_CONTENT_LEAKAGE", passed: false }),
    );
  });

  it("detects an unknown evidence reference", () => {
    const { fixture, plan, output } = baseline();
    output.sections[0].evidenceIds = ["missing-evidence"];
    expect(validateReaderOutput(output, fixture, plan)).toContainEqual(
      expect.objectContaining({ code: "UNKNOWN_EVIDENCE", passed: false }),
    );
  });

  it("rejects official status for a synthetic fixture", () => {
    const { fixture, plan, output } = baseline();
    output.status = "official";
    expect(validateReaderOutput(output, fixture, plan)).toContainEqual(
      expect.objectContaining({ code: "INVALID_DATA_STATUS", passed: false }),
    );
  });

  it("rejects invented prose even when claim and evidence IDs are valid", () => {
    const { fixture, plan, output } = baseline();
    output.sections[0].body =
      "DemoMed won because it owns a factory on Mars and paid no taxes.";
    expect(validateReaderOutput(output, fixture, plan)).toContainEqual(
      expect.objectContaining({ code: "ALTERED_CLAIM_TEXT", passed: false }),
    );
  });

  it("rejects evidence borrowed from another valid claim", () => {
    const { fixture, plan, output } = baseline();
    output.sections[0].evidenceIds = output.sections[1].evidenceIds;
    expect(validateReaderOutput(output, fixture, plan)).toContainEqual(
      expect.objectContaining({ code: "MISMATCHED_CLAIM_EVIDENCE", passed: false }),
    );
  });

  it("rejects duplicate claims", () => {
    const { fixture, plan, output } = baseline();
    output.sections.push(structuredClone(output.sections[0]));
    expect(validateReaderOutput(output, fixture, plan)).toContainEqual(
      expect.objectContaining({ code: "DUPLICATE_OR_MISSING_CLAIM", passed: false }),
    );
  });

  it("rejects internal claim identifiers in reader-facing prose", () => {
    const { fixture, plan, output } = baseline();
    output.sections[0].heading = `Finding ${output.sections[0].claimIds[0]}`;
    expect(validateReaderOutput(output, fixture, plan)).toContainEqual(
      expect.objectContaining({ code: "INTERNAL_IDENTIFIER_LEAKAGE", passed: false }),
    );
  });

  it("detects a broken source link", () => {
    const { fixture, plan, output } = baseline();
    fixture.evidence[0].sourceManifestId = "missing-manifest";
    expect(validateReaderOutput(output, fixture, plan)).toContainEqual(
      expect.objectContaining({ code: "BROKEN_SOURCE_LINK", passed: false }),
    );
  });

  it("detects a latency budget violation", () => {
    expect(validateLatency(501, 500)).toMatchObject({
      code: "LATENCY_BUDGET_EXCEEDED",
      passed: false,
    });
  });
});
