# TenderGraph

TenderGraph is an auditable procurement intelligence workbench for bidder teams. This repository implements a vertical slice of **opening and award analysis** using a code-owned harness around GPT-5.6.

The model composes answers. It does not decide which sources, claims, policies, or validations are authoritative.

**Public demo:** https://openaihack.vercel.app

**Demo video:** https://www.youtube.com/watch?v=G0XekMloa4c

**Repository:** https://github.com/Amawta-labs/tendergraph

**Supersession story:** https://openaihack.vercel.app/?case=cl-correction-demo

## What runs today

- One hash-verified public Chilean evaluation case plus four synthetic benchmarks covering Chilean corrections, Chilean deep evidence, TED, and UK Contracts Finder structures.
- Source manifests with hashes, eligibility status, runtime policy, selection rule, retrieval mode, provenance, and evidence anchors.
- Risk-tiered claim admission with human review required for consequential claims.
- Deterministic answer planning and validation gates outside the prompt.
- GPT-5.6 Terra structured composition through ChatGPT-authenticated Codex.
- A distributable Codex plugin and skill for running the evidence audit without an API key.
- Automatic deterministic fallback when the model is unavailable or violates a contract.
- Separate reader output and a validated six-stage audit trace.
- A validated, predeclared incremental evidence-delta contract for corroboration, invalidation, and claim supersession.
- Extensible in-memory ingestion for PDF, DOCX, HTML, JSON, CSV, Markdown, and text, with file hashes, addressable evidence chunks, parser identity, and explicit OCR/unsupported states.
- GPT-5.6/Codex impact discovery that classifies every active claim against new evidence in shadow mode; six code-owned gates and mandatory human review prevent automatic authority changes.
- A 23-scenario benchmark, one-property fault-injection tests, and a two-scenario live impact benchmark.
- A responsive, chat-first workbench with a tender sidebar, structured
  conversation, contextual evidence/change/trace inspector, document ingestion,
  impact proposals, and explicit runtime state.

The default case is a frozen public Mercado Público evaluation report. TenderGraph preserves its decision-stage limitation: the source contains a commission recommendation, not proof of a signed final contract. The remaining portability fixtures are synthetic and visibly labelled.

## Run locally

Requirements: Node.js 24+, npm 11+, Codex CLI 0.144.0 or newer, and a ChatGPT-authenticated Codex session.

```bash
npm install
npm run tendergraph:codex -- \
  --fixture cl-deep-demo \
  --question "Who won Lot 1 and why?" \
  --model gpt-5.6-terra
npm run dev
```

Open `http://localhost:3000`.

The Codex command uses `codex login` and Build Week Codex credits. It does not read or require `OPENAI_API_KEY`. It writes the admitted result to `artifacts/codex-runs/latest.json`; the workbench loads that result on its next request.

The workbench exposes three honest runtime choices:

- `Codex` invokes the local ChatGPT-authenticated Codex bridge. On hosted
  deployments, where that local login is unavailable, the interface says so and
  preserves the validated fallback.
- `OpenAI API` invokes the server-side Responses API adapter when
  `OPENAI_API_KEY` is configured. Without it, `auto` mode returns the explicit
  validated fallback.
- `Safe fallback` runs the credential-free deterministic composer directly.

To enable the optional API path locally, create `.env.local` without committing
it:

```bash
OPENAI_API_KEY=your_api_key
OPENAI_MODEL=gpt-5.6
```

The key is read only by server-side application code. It is never passed as a
client prop and must not use a `NEXT_PUBLIC_` prefix. For Vercel, add
`OPENAI_API_KEY` as a Sensitive Environment Variable for the desired
environment and redeploy; environment changes do not alter prior deployments.

Install the repository plugin in Codex with:

```bash
codex plugin marketplace add /absolute/path/to/openaihack
codex plugin add tendergraph@tendergraph-local
```

Invoke `$tendergraph-analyze` from Codex to run the same workflow. Invalid or policy-violating GPT-5.6 output is discarded and replaced by the deterministic composer.

The `Codex live` workbench action calls the local `/api/codex-run` bridge, which executes the same typed plugin workflow and returns a safe deterministic result if the Codex process is unavailable. The Responses API adapter remains available for teams with separate API billing, but it is optional and is not the Build Week demo path.

The hosted demo cannot inherit a developer's ChatGPT login. Its `Codex live` action therefore demonstrates the explicit deterministic fallback; use the local command or plugin instructions above to execute a live Codex session.

## Verify

```bash
npm run typecheck
npm test
npm run eval
npm run eval:ablation
npm run eval:codex
npm run eval:impact
npm run build
```

The evaluation command executes the versioned scenarios in [`evals/scenarios.json`](evals/scenarios.json). The unit suite separately proves that missing claims, wrong routing, incomplete traces, answer omissions, internal leakage, unknown evidence, broken source links, and excess latency are detected.

`npm run eval:codex` performs two representative live Codex runs and writes the session-bearing report to `artifacts/evals/codex-smoke.json`. `npm run eval:live` exercises the optional Responses API adapter and requires separately billed `OPENAI_API_KEY`. `npm run eval:ablation` compares code-owned gates with schema-only admission; it is a credential-free enforcement experiment, not a model-quality or prompt-adherence experiment.

`npm run eval:impact` runs two live GPT-5.6/Codex impact scenarios: independent corroboration and a corrective resolution with two claim supersessions. Both must preserve shadow mode, pass 6/6 code gates, retain a Codex Session ID, and match the versioned reference impact exactly.

The credential-free runners persist their reports at
`artifacts/evals/deterministic-eval.json` and
`artifacts/evals/enforcement-ablation.json`.

## Harness flow

```text
request + procedure scope
  -> source manifests and evidence records
  -> risk-tiered claim admission
  -> deterministic answer plan
  -> GPT-5.6 Terra structured composition in Codex
  -> schema, grounding, scope, hygiene and trace gates
  -> accepted reader output OR deterministic fallback
  -> separate six-stage audit trace

new document + active procedure
  -> format adapter and hashed evidence chunks
  -> GPT-5.6/Codex claim-by-claim impact proposal
  -> scope, partition, evidence, action and authority gates
  -> shadow proposal requiring human review
```

Only `eligible` claims may enter an answer plan. Consequential claims additionally require a reviewer and review timestamp. A confidence score never grants runtime authority.

The default public case includes a versioned evidence event declaring that the public selection record affects only the award-recommendation claim. A separate synthetic correction benchmark validates that a later resolution supersedes the winner and loss explanation while leaving the award rule unchanged. The workbench can also ingest a new document and ask GPT-5.6/Codex to discover the affected claim partition automatically. The proposal remains `shadow`: it cannot promote, reject, or rewrite claims without a separate human decision. Open the correction story directly at `http://localhost:3000/?case=cl-correction-demo`.

See [`docs/HARNESS_ENGINEERING_PLAN.md`](docs/HARNESS_ENGINEERING_PLAN.md) for the engineering contract, [`docs/PAPER_ADOPTION_AUDIT.md`](docs/PAPER_ADOPTION_AUDIT.md) for the exact paper mapping and experimental limits, and [`PREPROJECT_TENDERGRAPH.md`](PREPROJECT_TENDERGRAPH.md) for the product baseline.
The boundary between prior domain exploration and new Build Week work is recorded in [`docs/BUILD_WEEK_PROVENANCE.md`](docs/BUILD_WEEK_PROVENANCE.md).

## API

### `POST /api/harness`

```json
{
  "fixtureId": "cl-deep-demo",
  "question": "Who won Lot 1 and why?",
  "mode": "auto"
}
```

Returns `readerOutput` and `trace`. `mode` accepts `auto` or `fallback`.

### `POST /api/codex-run`

Accepts `fixtureId` and `question`, invokes the authenticated local Codex CLI with `gpt-5.6-terra`, and applies the same code-owned validation gates. If Codex is unavailable or violates the contract, the endpoint returns a deterministic result with `runtimeWarning`.

### `POST /api/ingest`

Accepts a multipart document plus procedure metadata. It extracts PDF, DOCX, HTML, JSON, CSV, Markdown, or text into hashed evidence anchors. Image-only files are registered as `needs_ocr`; unknown formats are explicit `unsupported` results. Uploaded bytes are processed in memory by the demo route and never become claim authority automatically.

### `POST /api/impact-discovery`

Accepts either a versioned evidence event or an ingested document. It invokes GPT-5.6 Terra through Codex to classify every active claim as impacted or unchanged, then enforces scope, complete claim partition, evidence binding, action semantics, and shadow authority in code. The response always requires human review; a missing Codex runtime produces an explicit validated deterministic fallback.

### `GET /api/traces/:traceId`

Returns the stored audit trace for a run. The local adapter writes immutable
records under `.tendergraph/traces`. Vercel uses ephemeral `/tmp` storage for
the public demo, so hosted trace durability is not claimed in this release. A
durable deployment would require an external database and immutable object
storage.

## Codex collaboration

Codex was used to:

- Inspect and reconcile the existing TenderGraph pre-project with the paper.
- Translate the paper's source-to-claim pipeline into procurement-domain schemas.
- Implement the harness, deterministic composer, OpenAI boundary, UI, tests, and evaluation runner.
- Identify the paper's key limitation: contract preservation does not prove upstream claim correctness, so TenderGraph adds domain-specific claim verification targets.
- Preserve the product decisions that consequential procurement conclusions require evidence and human approval.

Codex accelerated repository inspection, contract implementation, adversarial test generation, public-source verification, browser review, and repeatable build/evaluation work. The team made the product and engineering decisions: the bidder audience and opening/award scope; the public-versus-synthetic truth boundary; the commission-recommendation limitation; human approval for consequential claims; incremental dependency reevaluation; and deterministic fallback as the final authority boundary.

Codex is also a product runtime surface: `plugins/tendergraph` packages the analysis workflow, while `src/cli/codex-run.ts` invokes GPT-5.6 Terra in a read-only sandbox and records the resulting Codex session ID in the audit trace.

The required Codex feedback upload was completed with logs for the primary
project thread. Its confirmed Session ID is
`019f615b-8a9a-7be1-bc50-65059c70d511`; the receipt is preserved at
`artifacts/submission/codex-feedback.json`.

## Originality and attribution

This is an independent implementation inspired by *From Prompts to Contracts: Harness Engineering for Auditable Enterprise LLM Agents* (arXiv:2607.08028v1). No source code from its reference baseline was copied. See [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).

## License

Code is licensed under Apache License 2.0. Synthetic benchmark data authored for this repository is licensed under CC BY 4.0 unless otherwise stated.
