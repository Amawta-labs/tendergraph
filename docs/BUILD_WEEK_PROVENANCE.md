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
- Final verified public-case runtime session: `019f6931-199d-7070-9b6e-0142bc573fa5`.
- Final verified correction-case runtime session: `019f6931-3d99-7df1-86e6-b99ce0fc370a`.
- Recorded anonymized interactive browser session: `019f698f-55a0-7801-8461-dbb0fa9c2c13`.
- The machine-readable smoke report is preserved at
  `artifacts/evals/codex-smoke.json`.
- The browser evidence manifest is preserved at
  `artifacts/submission/live-codex-run-anonymized.json`.
- The Devpost `/feedback` upload was completed with logs for the primary project
  thread `019f615b-8a9a-7be1-bc50-65059c70d511`. The response and submission
  metadata are preserved in `artifacts/submission/codex-feedback.json`; runtime
  sessions above remain separate evidence.

## Change discipline

Each material capability is committed with its tests and documentation. Public
source snapshots added later must include their canonical URL, retrieval date,
license or reuse basis, content hash, and a clear distinction between source
facts and TenderGraph-derived claims.
