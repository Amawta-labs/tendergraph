import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { getFixture, listEvidenceDeltas } from "../src/lib/harness/fixtures";
import {
  finalizeImpactDiscovery,
  heuristicImpactCandidate,
  prepareImpactDiscoveryForDocument,
  prepareImpactDiscoveryForEvent,
  referenceImpactCandidate,
  validateImpactCandidate,
} from "../src/lib/harness/impact-discovery";
import { ingestDocument } from "../src/lib/harness/ingestion";
import type {
  CaseFixture,
  DocumentIngestionMetadata,
} from "../src/lib/harness/schemas";

const baseMetadata: DocumentIngestionMetadata = {
  jurisdiction: "CL",
  procedureId: "PROC-TEST-001",
  lotId: null,
  artifactType: "evaluation_report",
  canonicalUrl: "https://example.test/procurement/evaluation",
  issuer: "Test procurement authority",
  license: "Public record",
  publishedAt: "2026-07-17T12:00:00.000Z",
};

function correctionFixture(): CaseFixture {
  const fixture = getFixture("cl-correction-demo");
  if (!fixture) throw new Error("Correction fixture missing");
  return structuredClone(fixture);
}

function correctionEvent() {
  const event = listEvidenceDeltas().find(
    (delta) => delta.event.id === "delta-cl-correction-resolution",
  )?.event;
  if (!event) throw new Error("Correction event missing");
  return structuredClone(event);
}

describe("extensible document ingestion", () => {
  it("extracts text into hashed evidence without granting claim authority", async () => {
    const result = await ingestDocument({
      filename: "evaluation.txt",
      mimeType: "text/plain",
      bytes: new TextEncoder().encode(
        "The commission recommends Supplier Alpha.\n\nSupplier Beta scored lower.",
      ),
      metadata: baseMetadata,
    });

    expect(result.status).toBe("extracted");
    expect(result.format).toBe("text");
    expect(result.file.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(result.evidence).toHaveLength(1);
    expect(result.evidence[0].contentHash).toMatch(/^[a-f0-9]{64}$/);
    expect(result.sourceManifest.runtimePolicy).toBe("context_only");
    expect(result.authorityState).toBe("eligible_for_review");
  });

  it("keeps a local upload context-only when no canonical URL is supplied", async () => {
    const result = await ingestDocument({
      filename: "notes.md",
      mimeType: "text/markdown",
      bytes: new TextEncoder().encode("# Evaluation\n\nSupplier Alpha ranked first."),
      metadata: { ...baseMetadata, canonicalUrl: null },
    });

    expect(result.status).toBe("extracted");
    expect(result.authorityState).toBe("context_only");
    expect(result.sourceManifest.canonicalUrl).toContain(
      "uploads.tendergraph.invalid",
    );
    expect(result.warnings).toContain(
      "No canonical source URL was supplied; the document cannot become claim authority.",
    );
  });

  it("uses a structured HTML parser and excludes executable content", async () => {
    const result = await ingestDocument({
      filename: "award.html",
      mimeType: "text/html",
      bytes: new TextEncoder().encode(
        "<html><body><h1>Award</h1><p>Supplier Alpha won.</p><script>secret()</script></body></html>",
      ),
      metadata: baseMetadata,
    });

    expect(result.parser.adapter).toBe("cheerio");
    expect(result.evidence[0].extractedText).toContain("Supplier Alpha won");
    expect(result.evidence[0].extractedText).not.toContain("secret");
  });

  it("extracts page-addressable evidence from the public PDF fixture", async () => {
    const bytes = new Uint8Array(
      await readFile(
        path.join(
          process.cwd(),
          "fixtures/public-snapshots/cl-5802381-7547UCUK/evaluation-report.pdf",
        ),
      ),
    );
    const result = await ingestDocument({
      filename: "evaluation-report.pdf",
      mimeType: "application/pdf",
      bytes,
      metadata: {
        ...baseMetadata,
        procedureId: "5802381-7547UCUK",
      },
    });

    expect(result.status).toBe("extracted");
    expect(result.format).toBe("pdf");
    expect(result.pageCount).toBeGreaterThan(0);
    expect(result.evidence.length).toBeGreaterThan(1);
    expect(result.evidence.every((record) => record.locator.page !== null)).toBe(
      true,
    );
  });

  it("registers images as needing OCR instead of pretending extraction succeeded", async () => {
    const result = await ingestDocument({
      filename: "scan.png",
      mimeType: "image/png",
      bytes: new Uint8Array([137, 80, 78, 71]),
      metadata: baseMetadata,
    });

    expect(result.status).toBe("needs_ocr");
    expect(result.evidence).toEqual([]);
    expect(result.sourceManifest.runtimePolicy).toBe("context_only");
  });

  it("rejects documents above the byte safety limit", async () => {
    await expect(
      ingestDocument({
        filename: "oversized.txt",
        mimeType: "text/plain",
        bytes: new Uint8Array(10 * 1024 * 1024 + 1),
        metadata: baseMetadata,
      }),
    ).rejects.toThrow("exceeds");
  });
});

describe("automatic shadow impact discovery", () => {
  it("builds an exact reference proposal without mutating authority", () => {
    const fixture = correctionFixture();
    const event = correctionEvent();
    const input = prepareImpactDiscoveryForEvent(
      fixture,
      event,
      "gpt-5.6-terra",
    );
    const candidate = referenceImpactCandidate(fixture, event, input);
    const result = finalizeImpactDiscovery(
      fixture,
      input,
      candidate,
      {
        model: "gpt-5.6-terra",
        sessionId: "impact-session-test",
        elapsedMs: 42,
      },
      event,
    );

    expect(result.mode).toBe("live");
    expect(result.status).toBe("shadow");
    expect(result.requiresHumanReview).toBe(true);
    expect(result.referenceAgreement?.exact).toBe(true);
    expect(result.items.map((item) => item.action)).toEqual([
      "supersede",
      "supersede",
    ]);
    expect(result.unchangedClaimIds).toEqual(["claim-cl-correction-rule"]);
  });

  it("rejects an impact proposal that omits an active claim", () => {
    const fixture = correctionFixture();
    const event = correctionEvent();
    const input = prepareImpactDiscoveryForEvent(
      fixture,
      event,
      "gpt-5.6-terra",
    );
    const candidate = referenceImpactCandidate(fixture, event, input);
    candidate.unchangedClaimIds = [];

    expect(() => validateImpactCandidate(input, candidate)).toThrow(
      "INCOMPLETE_IMPACT_PARTITION",
    );
  });

  it("rejects invented evidence IDs", () => {
    const fixture = correctionFixture();
    const event = correctionEvent();
    const input = prepareImpactDiscoveryForEvent(
      fixture,
      event,
      "gpt-5.6-terra",
    );
    const candidate = referenceImpactCandidate(fixture, event, input);
    candidate.items[0].evidenceIds = ["ev-invented"];

    expect(() => validateImpactCandidate(input, candidate)).toThrow(
      "UNBOUND_IMPACT_EVIDENCE",
    );
  });

  it("rejects supersession without a changed proposed statement", () => {
    const fixture = correctionFixture();
    const event = correctionEvent();
    const input = prepareImpactDiscoveryForEvent(
      fixture,
      event,
      "gpt-5.6-terra",
    );
    const candidate = referenceImpactCandidate(fixture, event, input);
    const prior = input.activeClaims.find(
      (claim) => claim.id === candidate.items[0].claimId,
    );
    candidate.items[0].proposedStatement = prior?.statement ?? null;

    expect(() => validateImpactCandidate(input, candidate)).toThrow(
      "INVALID_IMPACT_ACTION",
    );
  });

  it("falls back to a validated shadow proposal when Codex fails", () => {
    const fixture = correctionFixture();
    const event = correctionEvent();
    const input = prepareImpactDiscoveryForEvent(
      fixture,
      event,
      "gpt-5.6-terra",
    );
    const result = finalizeImpactDiscovery(
      fixture,
      input,
      null,
      {
        model: "gpt-5.6-terra",
        sessionId: null,
        elapsedMs: 10,
        failureReason: "Codex unavailable",
      },
      event,
    );

    expect(result.mode).toBe("deterministic_fallback");
    expect(result.referenceAgreement?.exact).toBe(true);
    expect(result.validationResults.every((gate) => gate.passed)).toBe(true);
  });

  it("discovers review candidates from newly ingested evidence in shadow mode", async () => {
    const source = getFixture("cl-real-5802381-7547UCUK");
    if (!source) throw new Error("Real fixture missing");
    const fixture = structuredClone(source);
    const document = await ingestDocument({
      filename: "correction.txt",
      mimeType: "text/plain",
      bytes: new TextEncoder().encode(
        "A corrected commission report changes the award recommendation and final evaluated percentage.",
      ),
      metadata: {
        ...baseMetadata,
        procedureId: fixture.scope.procedureId,
        lotId: fixture.scope.lotId,
      },
    });
    const input = prepareImpactDiscoveryForDocument(
      fixture,
      document,
      "gpt-5.6-terra",
    );
    const candidate = heuristicImpactCandidate(input);
    const result = finalizeImpactDiscovery(
      fixture,
      input,
      candidate,
      {
        model: "gpt-5.6-terra",
        sessionId: "impact-upload-test",
        elapsedMs: 12,
      },
      null,
    );

    expect(result.status).toBe("shadow");
    expect(result.referenceAgreement).toBeNull();
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.needsHumanReviewClaimIds).toEqual(
      result.items.map((item) => item.claimId),
    );
  });
});
