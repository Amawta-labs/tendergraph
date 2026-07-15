# TenderGraph

TenderGraph is an auditable procurement intelligence workbench for bidder teams. This repository implements a vertical slice of **opening and award analysis** using a code-owned harness around GPT-5.6.

The model composes answers. It does not decide which sources, claims, policies, or validations are authoritative.

## What runs today

- One hash-verified public Chilean evaluation case plus three synthetic portability benchmarks representing Chile, TED, and UK Contracts Finder structures.
- Source manifests with hashes, retrieval mode, provenance, and evidence anchors.
- Risk-tiered claim admission with human review required for consequential claims.
- Deterministic answer planning and validation gates outside the prompt.
- GPT-5.6 Terra structured composition through ChatGPT-authenticated Codex.
- A distributable Codex plugin and skill for running the evidence audit without an API key.
- Automatic deterministic fallback when the model is unavailable or violates a contract.
- Separate reader output and audit trace.
- An 18-scenario benchmark and eight one-property fault-injection tests.
- A responsive workbench for findings, evidence, review gaps, and gate status.

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

Install the repository plugin in Codex with:

```bash
codex plugin marketplace add /absolute/path/to/openaihack
codex plugin add tendergraph@tendergraph-local
```

Invoke `$tendergraph-analyze` from Codex to run the same workflow. Invalid or policy-violating GPT-5.6 output is discarded and replaced by the deterministic composer.

The Responses API adapter remains available for teams with separate API billing, but it is optional and is not the Build Week demo path.

## Verify

```bash
npm run typecheck
npm test
npm run eval
npm run eval:ablation
npm run build
```

The evaluation command executes the versioned scenarios in [`evals/scenarios.json`](evals/scenarios.json). The unit suite separately proves that missing claims, wrong routing, incomplete traces, answer omissions, internal leakage, unknown evidence, broken source links, and excess latency are detected.

`npm run eval:live` exercises the optional Responses API adapter and requires separately billed `OPENAI_API_KEY`. `npm run eval:ablation` is a credential-free controlled enforcement ablation; it must not be represented as a model-quality experiment.

## Harness flow

```text
request + procedure scope
  -> source manifests and evidence records
  -> risk-tiered claim admission
  -> deterministic answer plan
  -> GPT-5.6 Terra structured composition in Codex
  -> schema, grounding, scope, hygiene and trace gates
  -> accepted reader output OR deterministic fallback
  -> separate audit trace
```

Only `eligible` claims may enter an answer plan. Consequential claims additionally require a reviewer and review timestamp. A confidence score never grants runtime authority.

See [`docs/HARNESS_ENGINEERING_PLAN.md`](docs/HARNESS_ENGINEERING_PLAN.md) for the engineering contract and [`PREPROJECT_TENDERGRAPH.md`](PREPROJECT_TENDERGRAPH.md) for the product baseline.
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

### `GET /api/traces/:traceId`

Returns the stored audit trace for a run. The in-memory store is a demo adapter; the production boundary is PostgreSQL plus immutable object storage.

## Codex collaboration

Codex was used to:

- Inspect and reconcile the existing TenderGraph pre-project with the paper.
- Translate the paper's source-to-claim pipeline into procurement-domain schemas.
- Implement the harness, deterministic composer, OpenAI boundary, UI, tests, and evaluation runner.
- Identify the paper's key limitation: contract preservation does not prove upstream claim correctness, so TenderGraph adds domain-specific claim verification targets.
- Preserve the product decisions that consequential procurement conclusions require evidence and human approval.

Codex is also a product runtime surface: `plugins/tendergraph` packages the analysis workflow, while `src/cli/codex-run.ts` invokes GPT-5.6 Terra in a read-only sandbox and records the resulting Codex session ID in the audit trace.

Before submission, the entrant will add the primary `/feedback` session ID and retain dated Git history as required by the hackathon rules.

## Originality and attribution

This is an independent implementation inspired by *From Prompts to Contracts: Harness Engineering for Auditable Enterprise LLM Agents* (arXiv:2607.08028v1). No source code from its reference baseline was copied. See [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).

## License

Code is licensed under Apache License 2.0. Synthetic benchmark data authored for this repository is licensed under CC BY 4.0 unless otherwise stated.
