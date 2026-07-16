import type {
  AnswerPlan,
  CaseFixture,
  StructuredTenderAnswer,
} from "./schemas";

function inferDecisionStage(
  selected: CaseFixture["claims"],
  plan: AnswerPlan,
): StructuredTenderAnswer["decisionStage"] {
  const explicitStages = selected
    .map((claim) => claim.qualifiers.decisionStage)
    .filter(Boolean);
  if (explicitStages.includes("commission_recommendation")) {
    return "commission_recommendation";
  }
  if (plan.intent === "opening") return "opening";
  if (plan.intent === "compliance") return "document_review";
  if (selected.some((claim) => /award_recommendation/.test(claim.predicate))) {
    return "commission_recommendation";
  }
  if (selected.some((claim) => /winner|award/.test(claim.predicate))) {
    return "award_decision";
  }
  if (selected.some((claim) => /score|evaluation/.test(claim.predicate))) {
    return "evaluation";
  }
  return "unknown";
}

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
      decisionStage:
        plan.intent === "opening"
          ? "opening"
          : plan.intent === "compliance"
            ? "document_review"
            : "unknown",
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
    summary: `${selected.length} promoted claim${selected.length === 1 ? "" : "s"} answer the request. Every statement below is bound to reviewed evidence by the claim contract.`,
    status: fixture.dataStatus === "synthetic" ? "simulated" : "official",
    decisionStage: inferDecisionStage(selected, plan),
    sections,
    gaps: fixture.claims
      .filter((claim) => claim.status === "pending_review")
      .map((claim) => `Pending review: ${claim.statement}`),
    recommendation:
      "Use the cited evidence and unresolved review items before taking a consequential procurement decision.",
  };
}
