# Ingestion and Impact Discovery Implementation Log

Date: 2026-07-17

## Decision

The previously deferred ingestion and automatic impact-discovery boundaries
are implemented in the Build Week submission. The product claim is
**extensible multi-format ingestion**, not universal connector coverage.
Automatic impact discovery is a **shadow proposal** and cannot modify source or
claim authority without a separate human decision.

## Implemented

- PDF extraction with page locators using PDF.js.
- DOCX extraction using Mammoth.
- HTML extraction using Cheerio with executable/non-content nodes removed.
- JSON, CSV, Markdown, and text adapters.
- Explicit `needs_ocr` and `unsupported` states.
- 10 MB input and 250,000 extracted-character limits.
- File hashes, evidence hashes, parser identity, source manifest, and
  procedure/lot scope on every extracted artifact.
- GPT-5.6 Terra impact discovery through ChatGPT-authenticated Codex.
- Complete active-claim partition into impact items and unchanged claim IDs.
- Corroborate, invalidate, supersede, and review actions.
- Six code-owned gates: schema, scope, claim partition, evidence binding,
  action semantics, and shadow authority.
- Deterministic, explicitly labelled fallback when the Codex process is not
  available.
- Responsive workbench surface for upload, ingestion evidence, live impact
  proposals, gates, unchanged claims, and human-review lock.

## Verification

- TypeScript typecheck: pass.
- Unit/adversarial suite: 44/44 pass.
- Production build: pass.
- Browser PDF upload: 8 page-addressable evidence anchors, parser
  `pdfjs-dist`, stable file hash, `eligible_for_review`.
- Serverless PDF verification initially exposed missing DOM geometry globals.
  The final implementation imports the PDF.js-supported `@napi-rs/canvas`
  polyfills explicitly and externalizes both server packages for Next.js
  tracing.
- A subsequent production probe exposed PDF.js's dynamic fake-worker import.
  The `/api/ingest` file trace now explicitly includes `pdf.worker.mjs`.
- Impact API process inputs and results use a request-scoped system temporary
  directory. The CLI's existing repository artifact paths remain the default
  outside serverless execution.
- Desktop and 390 px mobile browser review: pass; no product console error or
  incoherent overlap.
- Final live public corroboration impact run: 6/6 gates, exact reference
  agreement, Codex Session ID `019f71de-fd65-71b1-bf61-3f509dd1b681`.
- Live correction supersession run: two supersessions, 6/6 gates, exact
  reference agreement, Codex Session ID
  `019f71df-247f-7d33-a30b-f48b5beab9dd`.
- Dependency inventory: 131 packages, 0 unknown licenses.
- npm audit: 0 known vulnerabilities at implementation time.
- Updated video: 177.200 seconds, H.264/AAC, English narration, no music,
  SHA-256 `65ad5cc7a51c36b884b6064db070ee36aa57d39d4e0b01afb07c7820932bd080`.

## Residual boundaries

- Scanned images are registered but require an OCR adapter.
- Automatic discovery has two bounded golden reference classes; this is not a
  universal recall claim.
- Upload bytes are processed in memory by the demo route and not durably
  persisted.
- The hosted environment cannot inherit a developer's local ChatGPT/Codex
  authentication; the endpoint returns a validated deterministic fallback
  when Codex is absent.
- Source and claim authority remain application-owned. A shadow impact proposal
  is not an adjudication, legal conclusion, or autonomous procurement action.
