import { z } from "zod";

export const LifecycleStageIdSchema = z.enum([
  "discovery",
  "qualification",
  "requirements",
  "bid_preparation",
  "compliance",
  "monitoring",
  "outcome",
]);

export const LifecycleAgentSchema = z.enum([
  "opportunity_agent",
  "qualification_agent",
  "requirements_agent",
  "bid_agent",
  "compliance_agent",
  "monitoring_agent",
  "outcome_agent",
]);

export const LifecycleStageStatusSchema = z.enum([
  "complete",
  "active",
  "needs_review",
  "blocked",
  "not_started",
]);

export const RequirementStatusSchema = z.enum([
  "covered",
  "changed",
  "needs_review",
  "gap",
]);

export const BidTaskStatusSchema = z.enum([
  "complete",
  "in_progress",
  "needs_review",
  "blocked",
]);

export const LifecycleApprovalIdSchema = z.enum([
  "qualification",
  "compliance",
  "submission",
]);

export const LifecycleEvidenceSchema = z.strictObject({
  id: z.string().min(1),
  sourceId: z.string().min(1),
  label: z.string().min(1),
  version: z.string().min(1),
  current: z.boolean(),
  contentHash: z.string().regex(/^[a-f0-9]{64}$/),
});

export const LifecycleRequirementSchema = z.strictObject({
  id: z.string().min(1),
  title: z.string().min(1),
  category: z.enum([
    "administrative",
    "technical",
    "commercial",
    "delivery",
  ]),
  status: RequirementStatusSchema,
  currentValue: z.string().min(1),
  previousValue: z.string().min(1).nullable(),
  evidenceIds: z.array(z.string().min(1)).min(1),
  owner: z.string().min(1),
  blocker: z.boolean(),
});

export const LifecycleBidTaskSchema = z.strictObject({
  id: z.string().min(1),
  title: z.string().min(1),
  agent: LifecycleAgentSchema,
  status: BidTaskStatusSchema,
  requirementIds: z.array(z.string().min(1)),
  dependsOn: z.array(z.string().min(1)),
  humanOwner: z.string().min(1).nullable(),
});

export const LifecycleStageSchema = z.strictObject({
  id: LifecycleStageIdSchema,
  label: z.string().min(1),
  agent: LifecycleAgentSchema,
  status: LifecycleStageStatusSchema,
  summary: z.string().min(1),
  metric: z.string().min(1),
  evidenceIds: z.array(z.string().min(1)),
  requiresApproval: LifecycleApprovalIdSchema.nullable(),
});

export const LifecycleChangeSchema = z.strictObject({
  id: z.string().min(1),
  title: z.string().min(1),
  detectedAt: z.string().datetime(),
  sourceId: z.string().min(1),
  affectedRequirementIds: z.array(z.string().min(1)).min(1),
  unchangedRequirementIds: z.array(z.string().min(1)),
  action: z.enum(["review", "replan"]),
  authority: z.literal("shadow"),
});

export const LifecycleApprovalSchema = z.strictObject({
  id: LifecycleApprovalIdSchema,
  label: z.string().min(1),
  status: z.enum(["ready", "approved", "blocked"]),
  reason: z.string().min(1),
  approvedBy: z.string().min(1).nullable(),
  approvedAt: z.string().datetime().nullable(),
});

export const LifecycleWorkspaceSchema = z.strictObject({
  contractVersion: z.literal("tender-lifecycle.v1"),
  workspaceId: z.string().min(1),
  generatedAt: z.string().datetime(),
  dataStatus: z.literal("synthetic"),
  opportunity: z.strictObject({
    title: z.string().min(1),
    buyer: z.string().min(1),
    jurisdiction: z.string().min(1),
    procedureId: z.string().min(1),
    deadline: z.string().datetime(),
    lifecycleState: z.literal("bid_in_preparation"),
    fitScore: z.number().int().min(0).max(100),
    valueBand: z.string().min(1),
  }),
  opportunityMatches: z.array(
    z.strictObject({
      id: z.string().min(1),
      title: z.string().min(1),
      jurisdiction: z.string().min(1),
      deadline: z.string().datetime(),
      fitScore: z.number().int().min(0).max(100),
      status: z.enum(["selected", "review", "pass"]),
      matchReason: z.string().min(1),
    }),
  ).min(1),
  evidence: z.array(LifecycleEvidenceSchema).min(1),
  requirements: z.array(LifecycleRequirementSchema).min(1),
  bidTasks: z.array(LifecycleBidTaskSchema).min(1),
  stages: z.array(LifecycleStageSchema).length(7),
  changes: z.array(LifecycleChangeSchema),
  approvals: z.array(LifecycleApprovalSchema).length(3),
  validationResults: z.array(
    z.strictObject({
      gate: z.string().min(1),
      passed: z.boolean(),
      details: z.string().min(1),
    }),
  ),
  nextAction: z.string().min(1),
  submissionAuthority: z.literal("human_only"),
});

export const LifecycleRunRequestSchema = z.strictObject({
  workspaceId: z.literal("tg-active-bid-demo"),
  approvals: z.array(LifecycleApprovalIdSchema).default([]),
});

export type LifecycleApprovalId = z.infer<typeof LifecycleApprovalIdSchema>;
export type LifecycleWorkspace = z.infer<typeof LifecycleWorkspaceSchema>;
