import type {
  AnswerPlan,
  CaseFixture,
  StructuredTenderAnswer,
} from "./schemas";

export function composeDeterministicFallback(
  fixture: CaseFixture,
  plan: AnswerPlan,
): StructuredTenderAnswer {
  const claimById = new Map(fixture.claims.map((claim) => [claim.id, claim]));
  const selected = plan.selectedClaimIds
    .map((claimId) => claimById.get(claimId))
    .filter((claim) => claim !== undefined);

  if (selected.length === 0) {
    return {
      title: fixture.name,
      summary: "The harness found no runtime-eligible claims for this question.",
      status: "insufficient_evidence",
      sections: [],
      gaps: ["No promoted claim satisfies the requested scope and intent."],
      recommendation: "Collect or review additional evidence before deciding.",
    };
  }

  const sections = selected.map((claim) => ({
    heading: claim.predicate.replaceAll("_", " "),
    body: claim.statement,
    claimIds: [claim.id],
    evidenceIds: claim.evidenceIds,
  }));

  return {
    title: `${fixture.name}: verified findings`,
    summary: `${selected.length} promoted claim${selected.length === 1 ? "" : "s"} answer the request. The wording below is assembled deterministically from reviewed evidence.`,
    status: fixture.dataStatus === "synthetic" ? "simulated" : "official",
    sections,
    gaps: fixture.claims
      .filter((claim) => claim.status === "pending_review")
      .map((claim) => `Pending review: ${claim.statement}`),
    recommendation:
      "Use the cited evidence and unresolved review items before taking a consequential procurement decision.",
  };
}
