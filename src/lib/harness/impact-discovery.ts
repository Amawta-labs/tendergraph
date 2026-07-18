import { randomUUID } from "node:crypto";

import {
  ImpactCandidateSchema,
  ImpactDiscoveryInputSchema,
  ImpactDiscoveryResultSchema,
  type CaseFixture,
  type DocumentIngestionResult,
  type EvidenceDeltaEvent,
  type ImpactAction,
  type ImpactCandidate,
  type ImpactDiscoveryInput,
  type ImpactDiscoveryResult,
  type PromotedClaim,
  type ValidationGateResult,
} from "./schemas";

export interface ImpactCompositionMetadata {
  model: string;
  sessionId: string | null;
  elapsedMs: number;
  failureReason?: string;
}

class ImpactCandidateValidationError extends Error {
  constructor(readonly gates: ValidationGateResult[]) {
    super(
      `Impact proposal failed validation: ${gates
        .filter((gate) => !gate.passed)
        .map((gate) => gate.code)
        .join(", ")}`,
    );
  }
}

function gate(
  name: string,
  passed: boolean,
  code: string,
  details: Record<string, unknown>,
): ValidationGateResult {
  return {
    gate: name,
    passed,
    code: passed ? null : code,
    details,
  };
}

function sameMembers(left: string[], right: string[]): boolean {
  if (left.length !== right.length) return false;
  const rightSet = new Set(right);
  return rightSet.size === left.length && left.every((value) => rightSet.has(value));
}

function baselineClaimsForEvent(
  fixture: CaseFixture,
  event: EvidenceDeltaEvent,
): PromotedClaim[] {
  const replacementIds = new Set(
    event.affectedClaims
      .filter((change) => change.changeType === "claim_superseded")
      .map((change) => change.claimId),
  );
  const addedEvidenceIds = new Set(event.addedEvidenceIds);

  return fixture.claims
    .filter((claim) => !replacementIds.has(claim.id))
    .map((claim) => ({
      ...claim,
      status: claim.status === "superseded" ? "eligible" as const : claim.status,
      evidenceIds: claim.evidenceIds.filter((id) => !addedEvidenceIds.has(id)),
      supersedesClaimId: null,
    }))
    .filter((claim) => claim.evidenceIds.length > 0);
}

export function prepareImpactDiscoveryForEvent(
  fixture: CaseFixture,
  event: EvidenceDeltaEvent,
  requestedModel: string,
): ImpactDiscoveryInput {
  if (
    event.procedureId !== fixture.scope.procedureId ||
    event.lotId !== fixture.scope.lotId
  ) {
    throw new Error("Impact discovery event scope does not match the fixture");
  }
  const manifestIds = new Set(event.addedSourceManifestIds);
  const evidenceIds = new Set(event.addedEvidenceIds);
  return ImpactDiscoveryInputSchema.parse({
    contractVersion: "impact-discovery-input.v1",
    runId: randomUUID(),
    createdAt: new Date().toISOString(),
    requestedModel,
    fixture: {
      id: fixture.id,
      name: fixture.name,
      dataStatus: fixture.dataStatus,
      scope: fixture.scope,
    },
    addedSourceManifests: fixture.manifests.filter((manifest) =>
      manifestIds.has(manifest.id),
    ),
    addedEvidence: fixture.evidence.filter((evidence) =>
      evidenceIds.has(evidence.id),
    ),
    activeClaims: baselineClaimsForEvent(fixture, event),
  });
}

export function prepareImpactDiscoveryForDocument(
  fixture: CaseFixture,
  document: DocumentIngestionResult,
  requestedModel: string,
): ImpactDiscoveryInput {
  if (
    document.sourceManifest.procedureId !== fixture.scope.procedureId ||
    document.sourceManifest.lotId !== fixture.scope.lotId
  ) {
    throw new Error("Ingested document scope does not match the active fixture");
  }
  if (document.status !== "extracted" || document.evidence.length === 0) {
    throw new Error("Impact discovery requires extracted evidence");
  }
  return ImpactDiscoveryInputSchema.parse({
    contractVersion: "impact-discovery-input.v1",
    runId: randomUUID(),
    createdAt: new Date().toISOString(),
    requestedModel,
    fixture: {
      id: fixture.id,
      name: fixture.name,
      dataStatus: fixture.dataStatus,
      scope: fixture.scope,
    },
    addedSourceManifests: [document.sourceManifest],
    addedEvidence: document.evidence,
    activeClaims: fixture.claims.filter((claim) => claim.status === "eligible"),
  });
}

function introducedEvidenceIds(
  afterEvidenceIds: string[],
  beforeEvidenceIds: string[],
  allowedEvidenceIds: Set<string>,
): string[] {
  const introduced = afterEvidenceIds.filter(
    (id) => !beforeEvidenceIds.includes(id) && allowedEvidenceIds.has(id),
  );
  return introduced.length > 0 ? introduced : [...allowedEvidenceIds];
}

export function referenceImpactCandidate(
  fixture: CaseFixture,
  event: EvidenceDeltaEvent,
  input: ImpactDiscoveryInput,
): ImpactCandidate {
  const allowedEvidenceIds = new Set(input.addedEvidence.map((evidence) => evidence.id));
  const items = event.affectedClaims.map((change) => {
    if (change.changeType === "claim_superseded") {
      const replacement = fixture.claims.find((claim) => claim.id === change.claimId);
      if (!replacement) throw new Error(`Replacement claim ${change.claimId} is missing`);
      return {
        claimId: change.previousClaimId,
        action: "supersede" as const,
        evidenceIds: introducedEvidenceIds(
          change.afterEvidenceIds,
          change.beforeEvidenceIds,
          allowedEvidenceIds,
        ),
        confidence: 1,
        rationale: change.explanation,
        proposedStatement: replacement.statement,
      };
    }
    return {
      claimId: change.claimId,
      action:
        change.changeType === "claim_invalidated"
          ? "invalidate" as const
          : "corroborate" as const,
      evidenceIds: introducedEvidenceIds(
        change.afterEvidenceIds,
        change.beforeEvidenceIds,
        allowedEvidenceIds,
      ),
      confidence: 1,
      rationale: change.explanation,
      proposedStatement: null,
    };
  });
  const impacted = new Set(items.map((item) => item.claimId));
  return ImpactCandidateSchema.parse({
    items,
    unchangedClaimIds: input.activeClaims
      .filter((claim) => !impacted.has(claim.id))
      .map((claim) => claim.id),
    gaps: [],
  });
}

const STOP_WORDS = new Set([
  "the", "and", "for", "that", "this", "with", "from", "was", "were", "are",
  "has", "have", "into", "than", "not", "its", "their", "after", "before",
]);

function tokens(value: string): Set<string> {
  return new Set(
    value
      .toLowerCase()
      .replaceAll(/[^a-z0-9]+/g, " ")
      .split(" ")
      .filter((token) => token.length > 2 && !STOP_WORDS.has(token)),
  );
}

function overlapScore(left: Set<string>, right: Set<string>): number {
  if (left.size === 0 || right.size === 0) return 0;
  let overlap = 0;
  for (const token of left) if (right.has(token)) overlap += 1;
  return overlap / Math.max(1, left.size);
}

export function heuristicImpactCandidate(input: ImpactDiscoveryInput): ImpactCandidate {
  const evidenceTokenSets = input.addedEvidence.map((evidence) => ({
    id: evidence.id,
    tokens: tokens(evidence.extractedText),
  }));
  const ranked = input.activeClaims
    .map((claim) => {
      const claimTokens = tokens(
        `${claim.predicate} ${claim.value} ${claim.statement}`,
      );
      const evidence = evidenceTokenSets
        .map((record) => ({
          id: record.id,
          score: overlapScore(claimTokens, record.tokens),
        }))
        .sort((left, right) => right.score - left.score);
      return {
        claim,
        evidence,
        score: evidence[0]?.score ?? 0,
      };
    })
    .filter((entry) => entry.score >= 0.16)
    .sort((left, right) => right.score - left.score)
    .slice(0, 4);
  const impacted = new Set(ranked.map((entry) => entry.claim.id));
  return ImpactCandidateSchema.parse({
    items: ranked.map((entry) => ({
      claimId: entry.claim.id,
      action: "review",
      evidenceIds: entry.evidence
        .filter((record) => record.score >= Math.max(0.12, entry.score * 0.7))
        .slice(0, 3)
        .map((record) => record.id),
      confidence: Math.min(0.85, Math.max(0.2, entry.score)),
      rationale:
        "Lexical overlap indicates that the new evidence may affect this claim; semantic review is required.",
      proposedStatement: null,
    })),
    unchangedClaimIds: input.activeClaims
      .filter((claim) => !impacted.has(claim.id))
      .map((claim) => claim.id),
    gaps:
      ranked.length === 0
        ? ["No claim crossed the deterministic overlap threshold."]
        : ["Deterministic fallback cannot infer supersession semantics."],
  });
}

export function validateImpactCandidate(
  input: ImpactDiscoveryInput,
  candidateValue: unknown,
): { candidate: ImpactCandidate; gates: ValidationGateResult[] } {
  const parsed = ImpactCandidateSchema.safeParse(candidateValue);
  if (!parsed.success) {
    throw new ImpactCandidateValidationError([
      gate("impact_schema", false, "INVALID_IMPACT_SCHEMA", {
        issues: parsed.error.issues.map((issue) => issue.message),
      }),
    ]);
  }
  const candidate = parsed.data;
  const activeClaimIds = input.activeClaims.map((claim) => claim.id);
  const activeClaimSet = new Set(activeClaimIds);
  const addedEvidenceSet = new Set(input.addedEvidence.map((evidence) => evidence.id));
  const itemIds = candidate.items.map((item) => item.claimId);
  const partitionIds = [...itemIds, ...candidate.unchangedClaimIds];
  const noDuplicates = new Set(partitionIds).size === partitionIds.length;
  const partitionComplete =
    noDuplicates &&
    partitionIds.every((id) => activeClaimSet.has(id)) &&
    sameMembers(partitionIds, activeClaimIds);
  const evidenceBound = candidate.items.every(
    (item) =>
      item.evidenceIds.length > 0 &&
      item.evidenceIds.every((id) => addedEvidenceSet.has(id)),
  );
  const actionSemantics = candidate.items.every((item) => {
    const current = input.activeClaims.find((claim) => claim.id === item.claimId);
    if (!current) return false;
    if (item.action === "supersede") {
      return (
        item.proposedStatement !== null &&
        item.proposedStatement.trim() !== current.statement.trim()
      );
    }
    return item.proposedStatement === null;
  });
  const scopeBound = input.addedSourceManifests.every(
    (manifest) =>
      manifest.procedureId === input.fixture.scope.procedureId &&
      manifest.lotId === input.fixture.scope.lotId,
  );
  const gates = [
    gate("impact_schema", true, "INVALID_IMPACT_SCHEMA", {
      items: candidate.items.length,
    }),
    gate("impact_scope", scopeBound, "IMPACT_SCOPE_CONTAMINATION", {
      procedureId: input.fixture.scope.procedureId,
      sourceManifestIds: input.addedSourceManifests.map((manifest) => manifest.id),
    }),
    gate("impact_claim_partition", partitionComplete, "INCOMPLETE_IMPACT_PARTITION", {
      activeClaimIds,
      itemIds,
      unchangedClaimIds: candidate.unchangedClaimIds,
    }),
    gate("impact_evidence_binding", evidenceBound, "UNBOUND_IMPACT_EVIDENCE", {
      allowedEvidenceIds: [...addedEvidenceSet],
    }),
    gate("impact_action_semantics", actionSemantics, "INVALID_IMPACT_ACTION", {
      actions: candidate.items.map((item) => item.action),
    }),
    gate("shadow_authority", true, "MODEL_MUTATED_AUTHORITY", {
      autoApplied: false,
      requiresHumanReview: true,
    }),
  ];
  if (gates.some((result) => !result.passed)) {
    throw new ImpactCandidateValidationError(gates);
  }
  return { candidate, gates };
}

function expectedImpactItems(
  event: EvidenceDeltaEvent,
): Array<{ claimId: string; action: ImpactAction }> {
  return event.affectedClaims.map((change) => {
    if (change.changeType === "claim_superseded") {
      return {
        claimId: change.previousClaimId,
        action: "supersede",
      };
    }
    return {
      claimId: change.claimId,
      action:
        change.changeType === "claim_invalidated" ? "invalidate" : "corroborate",
    };
  });
}

function compareWithReference(
  event: EvidenceDeltaEvent,
  candidate: ImpactCandidate,
): NonNullable<ImpactDiscoveryResult["referenceAgreement"]> {
  const expected = expectedImpactItems(event);
  const matched = expected.filter((expectedItem) =>
    candidate.items.some(
      (candidateItem) =>
        candidateItem.claimId === expectedItem.claimId &&
        candidateItem.action === expectedItem.action,
    ),
  ).length;
  const precision =
    candidate.items.length === 0
      ? expected.length === 0 ? 1 : 0
      : matched / candidate.items.length;
  const recall = expected.length === 0 ? 1 : matched / expected.length;
  return {
    expectedItems: expected.length,
    matchedItems: matched,
    precision,
    recall,
    exact:
      matched === expected.length &&
      candidate.items.length === expected.length &&
      precision === 1 &&
      recall === 1,
  };
}

export function finalizeImpactDiscovery(
  fixture: CaseFixture,
  input: ImpactDiscoveryInput,
  candidateValue: unknown,
  metadata: ImpactCompositionMetadata,
  referenceEvent: EvidenceDeltaEvent | null,
): ImpactDiscoveryResult {
  let mode: ImpactDiscoveryResult["mode"] = "live";
  let compositionSurface: ImpactDiscoveryResult["compositionSurface"] = "codex";
  let fallbackReason = metadata.failureReason ?? null;
  let candidate: ImpactCandidate;
  let gates: ValidationGateResult[];

  try {
    if (metadata.failureReason) throw new Error(metadata.failureReason);
    ({ candidate, gates } = validateImpactCandidate(input, candidateValue));
  } catch (error) {
    mode = "deterministic_fallback";
    compositionSurface = "deterministic";
    fallbackReason = error instanceof Error ? error.message : "Impact discovery failed";
    const fallbackCandidate =
      referenceEvent === null
        ? heuristicImpactCandidate(input)
        : referenceImpactCandidate(fixture, referenceEvent, input);
    ({ candidate, gates } = validateImpactCandidate(input, fallbackCandidate));
  }

  return ImpactDiscoveryResultSchema.parse({
    contractVersion: "impact-discovery-result.v1",
    proposalId: input.runId,
    createdAt: new Date().toISOString(),
    fixtureId: fixture.id,
    scope: input.fixture.scope,
    status: "shadow",
    mode,
    model: mode === "live" ? metadata.model : null,
    compositionSurface,
    codexSessionId: mode === "live" ? metadata.sessionId : null,
    sourceManifestIds: input.addedSourceManifests.map((manifest) => manifest.id),
    evidenceIds: input.addedEvidence.map((evidence) => evidence.id),
    items: candidate.items,
    unchangedClaimIds: candidate.unchangedClaimIds,
    needsHumanReviewClaimIds: candidate.items.map((item) => item.claimId),
    gaps: candidate.gaps,
    validationResults: gates,
    requiresHumanReview: true,
    referenceAgreement:
      referenceEvent === null
        ? null
        : compareWithReference(referenceEvent, candidate),
    elapsedMs: metadata.elapsedMs,
    fallbackReason,
  });
}
