import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { composeDeterministicFallback } from "./fallback";
import { allGatesPassed, validateLatency, validateReaderOutput, validateTrace } from "./gates";
import { buildAnswerPlan } from "./policy";
import {
  CodexRunInputSchema,
  CompositionResultSchema,
  StructuredTenderAnswerSchema,
  type CaseFixture,
  type CodexRunInput,
  type CompositionResult,
  type HarnessTrace,
  type StructuredTenderAnswer,
} from "./schemas";
import { saveTrace } from "./store";

export interface CodexCompositionMetadata {
  model: string;
  sessionId: string | null;
  elapsedMs: number;
  failureReason?: string;
}

export function prepareCodexRun(
  fixture: CaseFixture,
  question: string,
  requestedModel: string,
): CodexRunInput {
  const answerPlan = buildAnswerPlan(fixture, question);
  const canonicalOutput = composeDeterministicFallback(fixture, answerPlan);
  const selected = new Set(answerPlan.selectedClaimIds);
  const promotedClaims = fixture.claims.filter((claim) => selected.has(claim.id));
  const evidenceIds = new Set(promotedClaims.flatMap((claim) => claim.evidenceIds));

  return CodexRunInputSchema.parse({
    contractVersion: "codex-composition.v1",
    runId: randomUUID(),
    createdAt: new Date().toISOString(),
    requestedModel,
    fixture: {
      id: fixture.id,
      name: fixture.name,
      dataStatus: fixture.dataStatus,
      sourceNote: fixture.sourceNote,
      scope: fixture.scope,
    },
    answerPlan,
    readerContract: {
      summary: canonicalOutput.summary,
      status: canonicalOutput.status,
      gaps: canonicalOutput.gaps,
      recommendation: canonicalOutput.recommendation,
    },
    promotedClaims,
    evidence: fixture.evidence.filter((record) => evidenceIds.has(record.id)),
  });
}

export function finalizeCodexRun(
  fixture: CaseFixture,
  input: CodexRunInput,
  candidateValue: unknown,
  metadata: CodexCompositionMetadata,
): CompositionResult {
  const parsedCandidate = StructuredTenderAnswerSchema.safeParse(candidateValue);
  let readerOutput: StructuredTenderAnswer;
  let compositionMode: HarnessTrace["compositionMode"] = "live";
  let compositionSurface: HarnessTrace["compositionSurface"] = "codex";
  let fallbackReason: string | null = null;

  if (metadata.failureReason) {
    compositionMode = "deterministic_fallback";
    compositionSurface = "deterministic";
    fallbackReason = metadata.failureReason;
    readerOutput = composeDeterministicFallback(fixture, input.answerPlan);
  } else if (parsedCandidate.success) {
    readerOutput = parsedCandidate.data;
    const liveGates = validateReaderOutput(readerOutput, fixture, input.answerPlan);
    if (!allGatesPassed(liveGates)) {
      compositionMode = "deterministic_fallback";
      compositionSurface = "deterministic";
      fallbackReason = `Codex composition failed validation: ${liveGates
        .filter((gate) => !gate.passed)
        .map((gate) => gate.code)
        .join(", ")}`;
      readerOutput = composeDeterministicFallback(fixture, input.answerPlan);
    }
  } else {
    compositionMode = "deterministic_fallback";
    compositionSurface = "deterministic";
    fallbackReason = `Codex composition violated the output schema: ${parsedCandidate.error.issues
      .map((issue) => issue.message)
      .join("; ")}`;
    readerOutput = composeDeterministicFallback(fixture, input.answerPlan);
  }

  const validationResults = validateReaderOutput(readerOutput, fixture, input.answerPlan);
  if (!allGatesPassed(validationResults)) {
    throw new Error(
      `No safe composition is available: ${validationResults
        .filter((gate) => !gate.passed)
        .map((gate) => gate.code)
        .join(", ")}`,
    );
  }

  const trace: HarnessTrace = {
    traceId: randomUUID(),
    requestId: input.answerPlan.requestId,
    createdAt: new Date().toISOString(),
    resolvedScope: input.answerPlan.scope,
    sourceManifestIds: fixture.manifests.map((manifest) => manifest.id),
    evidenceIds: readerOutput.sections.flatMap((section) => section.evidenceIds),
    selectedClaimIds: input.answerPlan.selectedClaimIds,
    model: metadata.model,
    compositionSurface,
    codexSessionId: metadata.sessionId,
    compositionMode,
    validationResults,
    fallbackReason,
    timings: {
      compositionMs: metadata.elapsedMs,
      totalMs: metadata.elapsedMs,
    },
    contractVersion: "harness.v1",
  };
  trace.validationResults.push(validateTrace(trace));
  trace.validationResults.push(validateLatency(metadata.elapsedMs, 140_000));
  return CompositionResultSchema.parse({ mode: compositionMode, readerOutput, trace });
}

export async function loadLatestCodexResult(
  rootDir: string,
): Promise<CompositionResult | null> {
  try {
    const raw = await readFile(
      path.join(rootDir, "artifacts", "codex-runs", "latest.json"),
      "utf8",
    );
    return CompositionResultSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function publishCodexArtifacts(
  rootDir: string,
  input: CodexRunInput,
  candidate: unknown,
  result: CompositionResult,
): Promise<void> {
  const outputDir = path.join(rootDir, "artifacts", "codex-runs");
  await mkdir(outputDir, { recursive: true });
  await saveTrace(result.trace, rootDir);
  await Promise.all([
    writeFile(path.join(outputDir, "latest-input.json"), JSON.stringify(input, null, 2)),
    writeFile(
      path.join(outputDir, "latest-candidate.json"),
      JSON.stringify(candidate, null, 2),
    ),
    writeFile(path.join(outputDir, "latest.json"), JSON.stringify(result, null, 2)),
  ]);
}
