import { containsInternalLeakage, isRuntimeEligible } from "./policy";
import { composeDeterministicFallback } from "./fallback";
import {
  HarnessTraceSchema,
  StructuredTenderAnswerSchema,
  type AnswerPlan,
  type CaseFixture,
  type HarnessTrace,
  type StructuredTenderAnswer,
  type ValidationGateResult,
} from "./schemas";
import { TRACE_STAGE_ORDER } from "./trace";

function gate(
  name: string,
  passed: boolean,
  code: string | null,
  details: Record<string, unknown> = {},
): ValidationGateResult {
  return { gate: name, passed, code: passed ? null : code, details };
}

export function validateReaderOutput(
  outputValue: unknown,
  fixture: CaseFixture,
  plan: AnswerPlan,
): ValidationGateResult[] {
  const schema = StructuredTenderAnswerSchema.safeParse(outputValue);
  if (!schema.success) {
    return [
      gate("output_schema", false, "INVALID_OUTPUT_SCHEMA", {
        issues: schema.error.issues,
      }),
    ];
  }
  const output: StructuredTenderAnswer = schema.data;
  const claimById = new Map(fixture.claims.map((claim) => [claim.id, claim]));
  const evidenceIds = new Set(fixture.evidence.map((evidence) => evidence.id));
  const manifestIds = new Set(fixture.manifests.map((manifest) => manifest.id));
  const manifestById = new Map(
    fixture.manifests.map((manifest) => [manifest.id, manifest]),
  );
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
  const sourceLinksResolve = fixture.evidence.every((evidence) => {
    const manifest = manifestById.get(evidence.sourceManifestId);
    return Boolean(
      manifestIds.has(evidence.sourceManifestId) &&
        manifest?.procedureId === fixture.scope.procedureId &&
        manifest?.jurisdiction === fixture.scope.jurisdiction &&
        manifest?.lotId === fixture.scope.lotId,
    );
  });
  const evidenceById = new Map(
    fixture.evidence.map((evidence) => [evidence.id, evidence]),
  );
  const usedSourcesAreEligible = outputEvidenceIds.every((evidenceId) => {
    const evidence = evidenceById.get(evidenceId);
    const manifest = evidence
      ? manifestById.get(evidence.sourceManifestId)
      : undefined;
    return Boolean(
      manifest?.sourceStatus === "eligible" &&
        manifest.runtimePolicy === "claim_authority",
    );
  });
  const snapshotHashesResolve =
    fixture.dataStatus !== "public_snapshot" ||
    fixture.manifests.every((manifest) => {
      const snapshotRoot = path.join(
        process.cwd(),
        "fixtures",
        "public-snapshots",
      );
      const prefix = `fixtures/public-snapshots/`;
      if (!manifest.snapshotKey.startsWith(prefix)) return false;
      const snapshotPath = path.resolve(
        snapshotRoot,
        manifest.snapshotKey.slice(prefix.length),
      );
      if (!snapshotPath.startsWith(`${snapshotRoot}${path.sep}`)) return false;
      if (!existsSync(snapshotPath)) return false;
      const hash = createHash("sha256").update(readFileSync(snapshotPath)).digest("hex");
      return hash === manifest.sha256;
    });
  const evidenceHashesResolve =
    fixture.dataStatus !== "public_snapshot" ||
    fixture.evidence.every((evidence) => {
      const hash = createHash("sha256")
        .update(evidence.extractedText)
        .digest("hex");
      return hash === evidence.contentHash;
    });
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
  const statusMatchesSource =
    output.status === canonicalOutput.status &&
    output.decisionStage === canonicalOutput.decisionStage;
  const narrativeIsCanonical =
    output.summary === canonicalOutput.summary &&
    output.recommendation === canonicalOutput.recommendation &&
    output.gaps.length === canonicalOutput.gaps.length &&
    output.gaps.every((gap, index) => gap === canonicalOutput.gaps[index]);
  const readerProse = [
    output.title,
    output.summary,
    ...output.sections.flatMap((section) => [section.heading, section.body]),
    ...output.gaps,
    output.recommendation,
  ].join(" ");
  const readerProseHasNoInternalIds = !/\b(?:claim|ev|manifest)-[a-z0-9-]+\b/i.test(
    readerProse,
  );
  const decisionLanguage = [
    output.title,
    output.summary,
    ...output.sections.map((section) => section.heading),
    ...output.gaps,
    output.recommendation,
  ].join(" ");
  const decisionLanguageIsBounded = !(
    /\b(?:we|i|tendergraph) recommend(?:s)?\b/i.test(decisionLanguage) ||
    /\byou should (?:bid|not bid|award|exclude|disqualify)\b/i.test(
      decisionLanguage,
    ) ||
    /\b(?:bid|no[- ]bid) recommendation\b/i.test(decisionLanguage) ||
    (fixture.dataStatus === "synthetic" &&
      /\bofficial (?:award|adjudication|decision|result)\b/i.test(decisionLanguage))
  );
  const internalContentIsBounded = !containsInternalLeakage(output);
  const sourceIntegrityPassed =
    sourceLinksResolve &&
    snapshotHashesResolve &&
    evidenceHashesResolve &&
    usedSourcesAreEligible;

  return [
    gate("output_schema", true, "INVALID_OUTPUT_SCHEMA", { issues: [] }),
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
    gate(
      "source_integrity",
      sourceIntegrityPassed,
      usedSourcesAreEligible ? "BROKEN_SOURCE_LINK" : "INELIGIBLE_SOURCE",
      {
        sourceLinksResolve,
        snapshotHashesResolve,
        evidenceHashesResolve,
        usedSourcesAreEligible,
      },
    ),
    gate("scope_isolation", scoped, "SCOPE_CONTAMINATION"),
    gate("answer_completeness", expectedClaimCoverage, "MISSING_EXPECTED_CLAIM", {
      expected: plan.selectedClaimIds,
      actual: outputClaimIds,
    }),
    gate("status_provenance", statusMatchesSource, "INVALID_DATA_STATUS", {
      expected: canonicalOutput.status,
      actual: output.status,
      expectedDecisionStage: canonicalOutput.decisionStage,
      actualDecisionStage: output.decisionStage,
    }),
    gate("narrative_integrity", narrativeIsCanonical, "ALTERED_CANONICAL_NARRATIVE"),
    gate(
      "reader_audit_separation",
      readerProseHasNoInternalIds,
      "INTERNAL_IDENTIFIER_LEAKAGE",
    ),
    gate(
      "output_hygiene",
      internalContentIsBounded && decisionLanguageIsBounded,
      internalContentIsBounded
        ? "UNBOUNDED_DECISION_LANGUAGE"
        : "INTERNAL_CONTENT_LEAKAGE",
      {
        containsInternalLeakage: !internalContentIsBounded,
        decisionLanguageIsBounded,
      },
    ),
  ];
}

export function validateTrace(trace: HarnessTrace): ValidationGateResult {
  const parsed = HarnessTraceSchema.safeParse(trace);
  const stages = parsed.success ? parsed.data.stages : [];
  const actualOrder = stages.map((stage) => stage.stage);
  const stageOrderComplete =
    actualOrder.length === TRACE_STAGE_ORDER.length &&
    TRACE_STAGE_ORDER.every((stage, index) => actualOrder[index] === stage);
  const stageArtifactsComplete = stages.every(
    (stage) => stage.artifactIds.length > 0,
  );
  const routedProcedure = stages.find(
    (stage) => stage.stage === "entity_routing",
  )?.details.procedureId;
  const routeMatches = parsed.success
    ? routedProcedure === parsed.data.resolvedScope.procedureId
    : false;
  const complete =
    parsed.success && stageOrderComplete && stageArtifactsComplete && routeMatches;

  return gate("trace_completeness", complete, "INCOMPLETE_TRACE", {
    schemaIssues: parsed.success ? [] : parsed.error.issues,
    expectedStageOrder: TRACE_STAGE_ORDER,
    actualStageOrder: actualOrder,
    stageArtifactsComplete,
    routeMatches,
  });
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
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
