import { containsInternalLeakage, isRuntimeEligible } from "./policy";
import { composeDeterministicFallback } from "./fallback";
import {
  StructuredTenderAnswerSchema,
  type AnswerPlan,
  type CaseFixture,
  type HarnessTrace,
  type StructuredTenderAnswer,
  type ValidationGateResult,
} from "./schemas";

function gate(
  name: string,
  passed: boolean,
  code: string | null,
  details: Record<string, unknown> = {},
): ValidationGateResult {
  return { gate: name, passed, code: passed ? null : code, details };
}

export function validateReaderOutput(
  output: StructuredTenderAnswer,
  fixture: CaseFixture,
  plan: AnswerPlan,
): ValidationGateResult[] {
  const schema = StructuredTenderAnswerSchema.safeParse(output);
  const claimById = new Map(fixture.claims.map((claim) => [claim.id, claim]));
  const evidenceIds = new Set(fixture.evidence.map((evidence) => evidence.id));
  const manifestIds = new Set(fixture.manifests.map((manifest) => manifest.id));
  const selected = new Set(plan.selectedClaimIds);
  const outputClaimIds = output.sections.flatMap((section) => section.claimIds);
  const outputEvidenceIds = output.sections.flatMap((section) => section.evidenceIds);

  const claimsGrounded = outputClaimIds.every((claimId) => {
    const claim = claimById.get(claimId);
    return Boolean(claim && selected.has(claimId) && isRuntimeEligible(claim));
  });
  const evidenceGrounded = outputEvidenceIds.every((evidenceId) =>
    evidenceIds.has(evidenceId),
  );
  const sourceLinksResolve = fixture.evidence.every((evidence) =>
    manifestIds.has(evidence.sourceManifestId),
  );
  const scoped = outputClaimIds.every((claimId) => {
    const claim = claimById.get(claimId);
    return (
      claim?.procedureId === plan.scope.procedureId &&
      claim?.lotId === plan.scope.lotId
    );
  });
  const expectedClaimCoverage = plan.selectedClaimIds.every((claimId) =>
    outputClaimIds.includes(claimId),
  );
  const claimCounts = new Map<string, number>();
  for (const claimId of outputClaimIds) {
    claimCounts.set(claimId, (claimCounts.get(claimId) ?? 0) + 1);
  }
  const exactClaimCoverage =
    outputClaimIds.length === plan.selectedClaimIds.length &&
    plan.selectedClaimIds.every((claimId) => claimCounts.get(claimId) === 1);
  const claimEvidencePaired = output.sections.every((section) => {
    if (section.claimIds.length !== 1) return false;
    const claim = claimById.get(section.claimIds[0]);
    if (!claim) return false;
    const expectedEvidence = new Set(claim.evidenceIds);
    const actualEvidence = new Set(section.evidenceIds);
    return (
      section.evidenceIds.length === claim.evidenceIds.length &&
      expectedEvidence.size === actualEvidence.size &&
      [...expectedEvidence].every((evidenceId) => actualEvidence.has(evidenceId))
    );
  });
  const claimTextIntact = output.sections.every((section) => {
    if (section.claimIds.length !== 1) return false;
    return claimById.get(section.claimIds[0])?.statement === section.body;
  });
  const canonicalOutput = composeDeterministicFallback(fixture, plan);
  const statusMatchesSource = output.status === canonicalOutput.status;
  const narrativeIsCanonical =
    output.summary === canonicalOutput.summary &&
    output.recommendation === canonicalOutput.recommendation &&
    output.gaps.length === canonicalOutput.gaps.length &&
    output.gaps.every((gap, index) => gap === canonicalOutput.gaps[index]);

  return [
    gate("output_schema", schema.success, "INVALID_OUTPUT_SCHEMA", {
      issues: schema.success ? [] : schema.error.issues,
    }),
    gate("claim_admission", claimsGrounded, "UNPROMOTED_OR_UNSELECTED_CLAIM", {
      outputClaimIds,
    }),
    gate("claim_uniqueness", exactClaimCoverage, "DUPLICATE_OR_MISSING_CLAIM", {
      expected: plan.selectedClaimIds,
      actual: outputClaimIds,
    }),
    gate("claim_text_integrity", claimTextIntact, "ALTERED_CLAIM_TEXT"),
    gate(
      "claim_evidence_pairing",
      claimEvidencePaired,
      "MISMATCHED_CLAIM_EVIDENCE",
    ),
    gate("evidence_grounding", evidenceGrounded, "UNKNOWN_EVIDENCE", {
      outputEvidenceIds,
    }),
    gate("source_integrity", sourceLinksResolve, "BROKEN_SOURCE_LINK"),
    gate("scope_isolation", scoped, "SCOPE_CONTAMINATION"),
    gate("answer_completeness", expectedClaimCoverage, "MISSING_EXPECTED_CLAIM", {
      expected: plan.selectedClaimIds,
      actual: outputClaimIds,
    }),
    gate("status_provenance", statusMatchesSource, "INVALID_DATA_STATUS", {
      expected: canonicalOutput.status,
      actual: output.status,
    }),
    gate("narrative_integrity", narrativeIsCanonical, "ALTERED_CANONICAL_NARRATIVE"),
    gate(
      "output_hygiene",
      !containsInternalLeakage(output),
      "INTERNAL_CONTENT_LEAKAGE",
    ),
  ];
}

export function validateTrace(trace: HarnessTrace): ValidationGateResult {
  const complete = Boolean(
    trace.traceId &&
      trace.requestId &&
      trace.createdAt &&
      trace.contractVersion &&
      trace.compositionMode &&
      trace.resolvedScope.procedureId,
  );
  return gate("trace_completeness", complete, "INCOMPLETE_TRACE");
}

export function validateLatency(
  elapsedMs: number,
  limitMs: number,
): ValidationGateResult {
  return gate("latency_budget", elapsedMs <= limitMs, "LATENCY_BUDGET_EXCEEDED", {
    elapsedMs,
    limitMs,
  });
}

export function allGatesPassed(results: ValidationGateResult[]): boolean {
  return results.every((result) => result.passed);
}
