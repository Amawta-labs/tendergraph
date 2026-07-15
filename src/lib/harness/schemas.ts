import { z } from "zod";

export const JurisdictionSchema = z.enum(["CL", "EU", "UK"]);
export const ConnectorSchema = z.enum([
  "mercado_publico",
  "ted",
  "contracts_finder",
]);
export const RiskTierSchema = z.enum(["low", "consequential"]);
export const ClaimStatusSchema = z.enum([
  "candidate",
  "pending_review",
  "eligible",
  "rejected",
  "superseded",
]);

export const ProcedureScopeSchema = z.object({
  jurisdiction: JurisdictionSchema,
  procedureId: z.string().min(1),
  lotId: z.string().min(1).nullable(),
});

export const EntityRefSchema = z.object({
  type: z.enum(["buyer", "supplier", "procedure", "lot", "document"]),
  id: z.string().min(1),
  label: z.string().min(1),
});

export const SourceManifestSchema = z.object({
  id: z.string().min(1),
  connector: ConnectorSchema,
  jurisdiction: JurisdictionSchema,
  procedureId: z.string().min(1),
  lotId: z.string().min(1).nullable(),
  artifactType: z.string().min(1),
  canonicalUrl: z.string().url(),
  retrievedAt: z.string().datetime(),
  publishedAt: z.string().datetime().nullable(),
  mimeType: z.string().min(1),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  license: z.string().min(1).nullable(),
  snapshotKey: z.string().min(1),
  retrievalMode: z.enum(["live", "snapshot"]),
});

export const EvidenceRecordSchema = z.object({
  id: z.string().min(1),
  sourceManifestId: z.string().min(1),
  contentHash: z.string().regex(/^[a-f0-9]{64}$/),
  locator: z.object({
    page: z.number().int().positive().nullable(),
    section: z.string().min(1).nullable(),
    table: z.string().min(1).nullable(),
    startOffset: z.number().int().nonnegative().nullable(),
    endOffset: z.number().int().nonnegative().nullable(),
  }),
  extractedText: z.string().min(1),
  parserVersion: z.string().min(1),
});

export const ClaimCandidateSchema = z.object({
  id: z.string().min(1),
  procedureId: z.string().min(1),
  lotId: z.string().min(1).nullable(),
  subject: EntityRefSchema,
  predicate: z.string().min(1),
  value: z.string().min(1),
  statement: z.string().min(1),
  qualifiers: z.record(z.string(), z.string()),
  evidenceIds: z.array(z.string().min(1)).min(1),
  extractorRunId: z.string().min(1),
  confidence: z.number().min(0).max(1).nullable(),
  riskTier: RiskTierSchema,
});

export const PromotedClaimSchema = ClaimCandidateSchema.extend({
  status: ClaimStatusSchema,
  promotionReason: z.string().min(1),
  reviewedBy: z.string().min(1).nullable(),
  reviewedAt: z.string().datetime().nullable(),
  supersedesClaimId: z.string().min(1).nullable(),
});

export const CaseFixtureSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  dataStatus: z.enum(["synthetic", "public_snapshot"]),
  sourceNote: z.string().min(1),
  scope: ProcedureScopeSchema,
  buyer: EntityRefSchema,
  manifests: z.array(SourceManifestSchema).min(1),
  evidence: z.array(EvidenceRecordSchema).min(1),
  claims: z.array(PromotedClaimSchema).min(1),
});

export const AnswerPlanSchema = z.object({
  requestId: z.string().min(1),
  scope: ProcedureScopeSchema,
  intent: z.enum(["award_explanation", "compliance", "opening", "overview"]),
  question: z.string().min(1),
  selectedClaimIds: z.array(z.string().min(1)),
  requiredSignals: z.array(z.string().min(1)),
  prohibitedAssertions: z.array(z.string().min(1)),
  outputContract: z.literal("structured_tender_answer.v1"),
});

export const AnswerSectionSchema = z.object({
  heading: z.string().min(1),
  body: z.string().min(1),
  claimIds: z.array(z.string().min(1)),
  evidenceIds: z.array(z.string().min(1)),
});

export const StructuredTenderAnswerSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  status: z.enum(["official", "simulated", "insufficient_evidence"]),
  sections: z.array(AnswerSectionSchema),
  gaps: z.array(z.string()),
  recommendation: z.string().min(1),
});

export const ValidationGateResultSchema = z.object({
  gate: z.string().min(1),
  passed: z.boolean(),
  code: z.string().min(1).nullable(),
  details: z.record(z.string(), z.unknown()),
});

export const HarnessTraceSchema = z.object({
  traceId: z.string().min(1),
  requestId: z.string().min(1),
  createdAt: z.string().datetime(),
  resolvedScope: ProcedureScopeSchema,
  sourceManifestIds: z.array(z.string().min(1)),
  evidenceIds: z.array(z.string().min(1)),
  selectedClaimIds: z.array(z.string().min(1)),
  model: z.string().min(1).nullable(),
  compositionSurface: z.enum([
    "openai_responses_api",
    "codex",
    "deterministic",
  ]),
  codexSessionId: z.string().min(1).nullable(),
  compositionMode: z.enum(["live", "deterministic_fallback"]),
  validationResults: z.array(ValidationGateResultSchema),
  fallbackReason: z.string().min(1).nullable(),
  timings: z.record(z.string(), z.number().nonnegative()),
  contractVersion: z.literal("harness.v1"),
});

export const CompositionResultSchema = z.object({
  mode: z.enum(["live", "deterministic_fallback"]),
  readerOutput: StructuredTenderAnswerSchema,
  trace: HarnessTraceSchema,
});

export const EvidenceDeltaEventSchema = z.object({
  id: z.string().min(1),
  procedureId: z.string().min(1),
  lotId: z.string().min(1).nullable(),
  title: z.string().min(1),
  description: z.string().min(1),
  addedSourceManifestIds: z.array(z.string().min(1)).min(1),
  addedEvidenceIds: z.array(z.string().min(1)).min(1),
  affectedClaims: z.array(
    z.object({
      claimId: z.string().min(1),
      changeType: z.literal("evidence_added"),
      beforeEvidenceIds: z.array(z.string().min(1)).min(1),
      afterEvidenceIds: z.array(z.string().min(1)).min(1),
      explanation: z.string().min(1),
    }),
  ).min(1),
});

export const EvidenceDeltaResultSchema = z.object({
  event: EvidenceDeltaEventSchema,
  affectedClaimIds: z.array(z.string().min(1)),
  unchangedClaimIds: z.array(z.string().min(1)),
  addedEvidenceIds: z.array(z.string().min(1)),
  addedSourceManifestIds: z.array(z.string().min(1)),
  valid: z.literal(true),
});

export const CodexRunInputSchema = z.object({
  contractVersion: z.literal("codex-composition.v1"),
  runId: z.string().min(1),
  createdAt: z.string().datetime(),
  requestedModel: z.string().min(1),
  fixture: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    dataStatus: z.enum(["synthetic", "public_snapshot"]),
    sourceNote: z.string().min(1),
    scope: ProcedureScopeSchema,
  }),
  answerPlan: AnswerPlanSchema,
  readerContract: z.object({
    summary: z.string().min(1),
    status: z.enum(["official", "simulated", "insufficient_evidence"]),
    gaps: z.array(z.string()),
    recommendation: z.string().min(1),
  }),
  promotedClaims: z.array(PromotedClaimSchema),
  evidence: z.array(EvidenceRecordSchema),
});

export type CaseFixture = z.infer<typeof CaseFixtureSchema>;
export type SourceManifest = z.infer<typeof SourceManifestSchema>;
export type EvidenceRecord = z.infer<typeof EvidenceRecordSchema>;
export type ClaimCandidate = z.infer<typeof ClaimCandidateSchema>;
export type PromotedClaim = z.infer<typeof PromotedClaimSchema>;
export type AnswerPlan = z.infer<typeof AnswerPlanSchema>;
export type StructuredTenderAnswer = z.infer<typeof StructuredTenderAnswerSchema>;
export type ValidationGateResult = z.infer<typeof ValidationGateResultSchema>;
export type HarnessTrace = z.infer<typeof HarnessTraceSchema>;
export type CompositionResult = z.infer<typeof CompositionResultSchema>;
export type EvidenceDeltaEvent = z.infer<typeof EvidenceDeltaEventSchema>;
export type EvidenceDeltaResult = z.infer<typeof EvidenceDeltaResultSchema>;
export type CodexRunInput = z.infer<typeof CodexRunInputSchema>;
