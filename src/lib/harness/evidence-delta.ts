import {
  EvidenceDeltaEventSchema,
  EvidenceDeltaResultSchema,
  type CaseFixture,
  type EvidenceDeltaEvent,
  type EvidenceDeltaResult,
} from "./schemas";

function sameMembers(left: string[], right: string[]): boolean {
  if (left.length !== right.length) return false;
  const rightSet = new Set(right);
  return rightSet.size === left.length && left.every((value) => rightSet.has(value));
}

export function evaluateEvidenceDelta(
  fixture: CaseFixture,
  eventValue: EvidenceDeltaEvent,
): EvidenceDeltaResult {
  const event = EvidenceDeltaEventSchema.parse(eventValue);
  if (
    event.procedureId !== fixture.scope.procedureId ||
    event.lotId !== fixture.scope.lotId
  ) {
    throw new Error("Evidence delta scope does not match the fixture");
  }

  const manifestIds = new Set(fixture.manifests.map((manifest) => manifest.id));
  const evidenceIds = new Set(fixture.evidence.map((evidence) => evidence.id));
  const claimById = new Map(fixture.claims.map((claim) => [claim.id, claim]));
  const affectedClaimIds = event.affectedClaims.map((change) => change.claimId);
  const affectedSet = new Set(affectedClaimIds);
  const addedEvidenceSet = new Set(event.addedEvidenceIds);

  if (!event.addedSourceManifestIds.every((id) => manifestIds.has(id))) {
    throw new Error("Evidence delta references an unknown source manifest");
  }
  if (!event.addedEvidenceIds.every((id) => evidenceIds.has(id))) {
    throw new Error("Evidence delta references unknown evidence");
  }
  if (affectedSet.size !== affectedClaimIds.length) {
    throw new Error("Evidence delta repeats an affected claim");
  }

  for (const change of event.affectedClaims) {
    const claim = claimById.get(change.claimId);
    if (!claim) throw new Error(`Evidence delta references unknown claim ${change.claimId}`);
    if (!sameMembers(change.afterEvidenceIds, claim.evidenceIds)) {
      throw new Error(`After evidence does not match current claim ${change.claimId}`);
    }
    if (!change.beforeEvidenceIds.every((id) => change.afterEvidenceIds.includes(id))) {
      throw new Error(`Before evidence is not a subset for ${change.claimId}`);
    }
    const introduced = change.afterEvidenceIds.filter(
      (id) => !change.beforeEvidenceIds.includes(id),
    );
    if (
      introduced.length === 0 ||
      !introduced.every((id) => addedEvidenceSet.has(id))
    ) {
      throw new Error(`Affected claim ${change.claimId} has no declared evidence delta`);
    }
  }

  const unlistedConsumer = fixture.claims.find(
    (claim) =>
      !affectedSet.has(claim.id) &&
      claim.evidenceIds.some((id) => addedEvidenceSet.has(id)),
  );
  if (unlistedConsumer) {
    throw new Error(`Evidence delta omits affected claim ${unlistedConsumer.id}`);
  }

  return EvidenceDeltaResultSchema.parse({
    event,
    affectedClaimIds,
    unchangedClaimIds: fixture.claims
      .filter((claim) => !affectedSet.has(claim.id))
      .map((claim) => claim.id),
    addedEvidenceIds: event.addedEvidenceIds,
    addedSourceManifestIds: event.addedSourceManifestIds,
    valid: true,
  });
}
