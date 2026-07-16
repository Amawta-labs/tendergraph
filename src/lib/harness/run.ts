import { performance } from "node:perf_hooks";
import { randomUUID } from "node:crypto";

import { composeDeterministicFallback } from "./fallback";
import {
  allGatesPassed,
  validateLatency,
  validateReaderOutput,
  validateTrace,
} from "./gates";
import { composeWithOpenAI } from "./openai-composer";
import { buildAnswerPlan } from "./policy";
import { saveTrace } from "./store";
import { buildTraceStages } from "./trace";
import type {
  CaseFixture,
  CompositionResult,
  HarnessTrace,
  StructuredTenderAnswer,
  ValidationGateResult,
} from "./schemas";

export type Composer = (
  fixture: CaseFixture,
  plan: ReturnType<typeof buildAnswerPlan>,
) => Promise<StructuredTenderAnswer>;

export interface RunHarnessOptions {
  mode?: "auto" | "live" | "fallback";
  composer?: Composer;
  model?: string;
}

export async function runHarness(
  fixture: CaseFixture,
  question: string,
  options: RunHarnessOptions = {},
): Promise<CompositionResult> {
  const startedAt = performance.now();
  const plan = buildAnswerPlan(fixture, question);
  const mode = options.mode ?? "auto";
  let readerOutput: StructuredTenderAnswer;
  let compositionMode: HarnessTrace["compositionMode"] = "live";
  let fallbackReason: string | null = null;
  let validationResults: ValidationGateResult[] = [];
  const composeStartedAt = performance.now();

  try {
    if (mode === "fallback") {
      throw new Error("Deterministic fallback requested");
    }
    const composer = options.composer ?? composeWithOpenAI;
    readerOutput = await composer(fixture, plan);
    validationResults = validateReaderOutput(readerOutput, fixture, plan);
    if (!allGatesPassed(validationResults)) {
      const failures = validationResults
        .filter((result) => !result.passed)
        .map((result) => result.code)
        .join(", ");
      throw new Error(`Live composition failed validation: ${failures}`);
    }
  } catch (error) {
    if (mode === "live") throw error;
    compositionMode = "deterministic_fallback";
    fallbackReason = error instanceof Error ? error.message : "Unknown composer error";
    readerOutput = composeDeterministicFallback(fixture, plan);
    validationResults = validateReaderOutput(readerOutput, fixture, plan);
  }

  if (!allGatesPassed(validationResults)) {
    const failures = validationResults
      .filter((result) => !result.passed)
      .map((result) => result.code)
      .join(", ");
    throw new Error(`No safe composition is available: ${failures}`);
  }

  validationResults.push(
    validateLatency(
      Math.round(performance.now() - startedAt),
      compositionMode === "live" ? 20_000 : 500,
    ),
  );
  const compositionSurface: HarnessTrace["compositionSurface"] =
    compositionMode === "live" ? "openai_responses_api" : "deterministic";
  const trace: HarnessTrace = {
    traceId: randomUUID(),
    requestId: plan.requestId,
    createdAt: new Date().toISOString(),
    resolvedScope: plan.scope,
    sourceManifestIds: fixture.manifests.map((manifest) => manifest.id),
    evidenceIds: readerOutput.sections.flatMap((section) => section.evidenceIds),
    selectedClaimIds: plan.selectedClaimIds,
    model:
      compositionMode === "live"
        ? options.model ?? process.env.OPENAI_MODEL ?? "gpt-5.6"
        : null,
    compositionSurface,
    codexSessionId: null,
    compositionMode,
    validationResults,
    fallbackReason,
    timings: {
      compositionMs: Math.round(performance.now() - composeStartedAt),
      totalMs: Math.round(performance.now() - startedAt),
    },
    stages: buildTraceStages({
      fixture,
      plan,
      compositionMode,
      compositionSurface,
      validationResults,
    }),
    contractVersion: "harness.v1",
  };
  trace.validationResults.push(validateTrace(trace));
  await saveTrace(trace);

  return { mode: compositionMode, readerOutput, trace };
}
