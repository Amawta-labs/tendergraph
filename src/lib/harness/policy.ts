import { randomUUID } from "node:crypto";

import type { AnswerPlan, CaseFixture, PromotedClaim } from "./schemas";

const INTERNAL_MARKERS = [
  "system prompt",
  "chain of thought",
  "developer message",
  "internal trace",
  "api key",
];

export function isRuntimeEligible(claim: PromotedClaim): boolean {
  if (claim.status !== "eligible") return false;
  if (claim.riskTier === "consequential") {
    return Boolean(claim.reviewedBy && claim.reviewedAt);
  }
  return true;
}

export function inferIntent(question: string): AnswerPlan["intent"] {
  const normalized = question.toLowerCase();
  if (/award|won|winner|lost|loss|adjudic/.test(normalized)) {
    return "award_explanation";
  }
  if (/compliance|requirement|document|certificate|cumpl/.test(normalized)) {
    return "compliance";
  }
  if (/opening|participant|offer|apertura/.test(normalized)) {
    return "opening";
  }
  return "overview";
}

export function buildAnswerPlan(fixture: CaseFixture, question: string): AnswerPlan {
  const intent = inferIntent(question);
  const selectedClaimIds = fixture.claims
    .filter(isRuntimeEligible)
    .filter((claim) => {
      if (intent === "overview") return true;
      if (intent === "award_explanation") {
        return /award|winner|score|loss|price/.test(claim.predicate);
      }
      if (intent === "compliance") {
        return /document|certificate|compliance|requirement/.test(claim.predicate);
      }
      return /participant|offer|price|opening/.test(claim.predicate);
    })
    .map((claim) => claim.id);

  const requiredSignals =
    intent === "award_explanation"
      ? ["winner", "evidence", "uncertainty"]
      : intent === "compliance"
        ? ["requirement", "evidence", "review state"]
        : ["evidence", "scope", "uncertainty"];

  return {
    requestId: randomUUID(),
    scope: fixture.scope,
    intent,
    question,
    selectedClaimIds,
    requiredSignals,
    prohibitedAssertions: [
      "Do not present a simulation as an official decision.",
      "Do not infer exclusion from non-award.",
      "Do not state causality without an eligible consequential claim.",
      "Do not mix procedures, lots, suppliers, or jurisdictions.",
      ...INTERNAL_MARKERS.map((marker) => `Do not expose ${marker}.`),
    ],
    outputContract: "structured_tender_answer.v1",
  };
}

export function containsInternalLeakage(value: unknown): boolean {
  const serialized = JSON.stringify(value).toLowerCase();
  return INTERNAL_MARKERS.some((marker) => serialized.includes(marker));
}
