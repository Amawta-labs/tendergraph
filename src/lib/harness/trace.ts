import type {
  AnswerPlan,
  CaseFixture,
  HarnessTrace,
  TraceStage,
  ValidationGateResult,
} from "./schemas";

export const TRACE_STAGE_ORDER = [
  "entity_routing",
  "source_collection",
  "claim_selection",
  "answer_planning",
  "composition",
  "output_validation",
] as const;

interface BuildTraceStagesInput {
  fixture: CaseFixture;
  plan: AnswerPlan;
  compositionMode: HarnessTrace["compositionMode"];
  compositionSurface: HarnessTrace["compositionSurface"];
  validationResults: ValidationGateResult[];
}

export function buildTraceStages({
  fixture,
  plan,
  compositionMode,
  compositionSurface,
  validationResults,
}: BuildTraceStagesInput): TraceStage[] {
  const sourceState =
    fixture.dataStatus === "synthetic"
      ? "fixture"
      : fixture.manifests.some((manifest) => manifest.retrievalMode === "live")
        ? "live"
        : "local";
  const failedGates = validationResults.filter((result) => !result.passed);

  return [
    {
      stage: "entity_routing",
      status: "completed",
      sourceState: null,
      artifactIds: [
        `procedure:${plan.scope.procedureId}`,
        ...(plan.scope.lotId ? [`lot:${plan.scope.lotId}`] : []),
      ],
      details: {
        jurisdiction: plan.scope.jurisdiction,
        procedureId: plan.scope.procedureId,
        lotId: plan.scope.lotId,
        routeMethod: "explicit_fixture_scope",
      },
    },
    {
      stage: "source_collection",
      status: "completed",
      sourceState,
      artifactIds: fixture.manifests.map((manifest) => manifest.id),
      details: {
        eligibleSources: fixture.manifests.filter(
          (manifest) =>
            manifest.sourceStatus === "eligible" &&
            manifest.runtimePolicy === "claim_authority",
        ).length,
        totalSources: fixture.manifests.length,
      },
    },
    {
      stage: "claim_selection",
      status: "completed",
      sourceState: null,
      artifactIds:
        plan.selectedClaimIds.length > 0
          ? plan.selectedClaimIds
          : ["selection:none"],
      details: { selectedClaims: plan.selectedClaimIds.length, intent: plan.intent },
    },
    {
      stage: "answer_planning",
      status: "completed",
      sourceState: null,
      artifactIds: [plan.requestId, plan.outputContract],
      details: {
        requiredSignals: plan.requiredSignals,
        prohibitedAssertions: plan.prohibitedAssertions.length,
      },
    },
    {
      stage: "composition",
      status: compositionMode === "live" ? "completed" : "fallback",
      sourceState: compositionMode === "live" ? "live" : "fallback",
      artifactIds: [compositionSurface],
      details: { compositionMode, compositionSurface },
    },
    {
      stage: "output_validation",
      status: failedGates.length === 0 ? "completed" : "error",
      sourceState: null,
      artifactIds: validationResults.map((result) => result.gate),
      details: {
        passed: validationResults.length - failedGates.length,
        failed: failedGates.length,
        failureCodes: failedGates.map((result) => result.code),
      },
    },
  ];
}
