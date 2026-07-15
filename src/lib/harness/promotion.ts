import type { ClaimCandidate, PromotedClaim } from "./schemas";

export interface PromotionDecision {
  action: "approve" | "reject";
  reason: string;
  reviewer?: string;
  reviewedAt?: string;
}

export function promoteClaim(
  candidate: ClaimCandidate,
  decision: PromotionDecision,
): PromotedClaim {
  if (candidate.evidenceIds.length === 0) {
    throw new Error("A claim cannot be promoted without evidence");
  }
  if (!decision.reason.trim()) {
    throw new Error("A promotion decision requires a reason");
  }
  if (
    candidate.riskTier === "consequential" &&
    decision.action === "approve" &&
    (!decision.reviewer || !decision.reviewedAt)
  ) {
    return {
      ...candidate,
      status: "pending_review",
      promotionReason: decision.reason,
      reviewedBy: null,
      reviewedAt: null,
      supersedesClaimId: null,
    };
  }

  return {
    ...candidate,
    status: decision.action === "approve" ? "eligible" : "rejected",
    promotionReason: decision.reason,
    reviewedBy: decision.reviewer ?? null,
    reviewedAt: decision.reviewedAt ?? null,
    supersedesClaimId: null,
  };
}
