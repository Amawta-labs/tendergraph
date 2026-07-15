# Build Week Provenance

## Submission window

TenderGraph is being created in this repository during the OpenAI Build Week
submission period, July 13-21, 2026. The Git history in this repository is the
primary dated record of implementation work.

## Prior context

The team previously explored Chilean public-procurement workflows in a separate
project named Arquimed. That work established domain needs around openings,
awards, supplier documents, scores, and evidence review.

TenderGraph does not include Arquimed source code, private client documents,
credentials, branding, or derived reports. Its schemas, harness, plugin, test
fixtures, evaluation code, and interface are new Build Week work. The included
fixtures are independently authored synthetic benchmarks.

## External intellectual input

The harness architecture is an independent implementation informed by *From
Prompts to Contracts: Harness Engineering for Auditable Enterprise LLM Agents*
(arXiv:2607.08028v1). No reference implementation source code was copied. See
`THIRD_PARTY_NOTICES.md` for attribution.

## Codex evidence

- A verified GPT-5.6 Terra composition run is preserved in
  `artifacts/codex-runs/latest.json`.
- Runtime Codex session: `019f63da-96d6-7583-8e03-bf7f87050b7e`.
- The Devpost `/feedback` field must use the primary Codex project thread where
  most core functionality was built. It must be captured and recorded before
  submission; the runtime session above is not a substitute.

## Change discipline

Each material capability is committed with its tests and documentation. Public
source snapshots added later must include their canonical URL, retrieval date,
license or reuse basis, content hash, and a clear distinction between source
facts and TenderGraph-derived claims.
