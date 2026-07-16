# Devpost Submission Draft

## Submission metadata

- **Project:** TenderGraph
- **Track:** Work & Productivity
- **Tagline:** An auditable procurement decision compiler that shows what changed, why it changed, and which evidence supports every claim.
- **Repository:** `TODO_AFTER_GITHUB_REAUTH`
- **Hosted demo:** https://openaihack.vercel.app
- **Video:** `TODO_PUBLIC_YOUTUBE_URL`
- **Prepared local video asset:** `public/tendergraph-build-week-demo.mp4`
- **Hosted video asset:** https://openaihack.vercel.app/tendergraph-build-week-demo.mp4
- **Primary Codex /feedback session:** `TODO_PRIMARY_PROJECT_THREAD_FEEDBACK_ID`

## What TenderGraph does

TenderGraph helps bidder and procurement teams reconstruct opening and award decisions from source documents without turning model prose into authority. It compiles source manifests, addressable evidence records, reviewed claims, policy decisions, and a reader-facing answer into one auditable run.

The default case is a hash-verified public Chilean evaluation. TenderGraph identifies the commission's award recommendation, compares evaluated scores, explains why the other suppliers were not recommended, and preserves the source limitation that the snapshot is not proof of a signed contract.

The differentiating workflow is a validated incremental evidence-delta contract. Versioned events declare changed evidence and affected claim versions; TenderGraph rejects incomplete or inconsistent dependency declarations, computes the unchanged complement, and presents the exact before/after diff. A public event demonstrates corroboration of one claim. A separate, visibly synthetic correction benchmark demonstrates two explicit supersessions: the winner changes, the loss explanation reverses, and the award rule remains unchanged. Automatic document ingestion and impact discovery are not part of this submission.

## How it works

1. Typed source manifests bind every artifact to a jurisdiction, procedure, lot, retrieval timestamp, canonical URL, content hash, eligibility status, and runtime-use policy.
2. Exact evidence records retain document locators, extracted text, parser version, and evidence hashes.
3. Claims are admitted by code-owned policy. Consequential claims require a named human reviewer and timestamp.
4. Codex invokes GPT-5.6 Terra to compose a structured answer from only the selected claims and evidence.
5. Fifteen validation gates reject altered claim text, mismatched evidence, missing or duplicated claims, source failures, scope contamination, provenance errors, internal leakage, incomplete traces, and latency violations.
6. If Codex is unavailable or violates the contract, TenderGraph returns a deterministic safe composition and records the reason.

## What is technically demonstrated

- A working Next.js procurement workbench with a public evaluation case and synthetic portability/correction benchmarks.
- A ChatGPT-authenticated Codex runtime path that does not require an API key.
- A distributable TenderGraph Codex plugin and `$tendergraph-analyze` skill.
- Immutable six-stage local audit traces retrievable across local processes; hosted durable storage is a production boundary.
- Claim invalidation, supersession, and exact before/after evidence dependency diffs.
- 30 unit/adversarial tests, 23 deterministic evaluation scenarios, an 8-fault enforcement ablation, and a 2-run live Codex smoke evaluation.

## Evaluation evidence

- Unit and adversarial suite: `32/32`
- Deterministic contract scenarios: `23/23`
- Enforcement ablation: harness admitted `0/8`; schema-only control admitted `8/8`
- Live Codex smoke: `2/2`, each with `15/15` validation gates
- Dependency audit: `0` known npm vulnerabilities
- Live report: `artifacts/evals/codex-smoke.json`

## How we used Codex and GPT-5.6

Codex was both the development collaborator and a product runtime surface. It inspected the existing domain plan and the paper, implemented the typed contracts and workbench, generated and challenged tests, ran builds and browser checks, retrieved a public procurement snapshot, and helped turn review findings into bounded engineering commits.

The team retained the key product and governance decisions: focus on bidder-facing opening and award intelligence; distinguish public facts from synthetic benchmarks; require human approval for consequential claims; preserve the difference between an evaluation recommendation and a signed contract; treat changed evidence as a dependency update rather than a full-answer rewrite; and keep deterministic fallback as the final authority boundary.

At runtime, GPT-5.6 Terra performs only structured composition. It cannot select authoritative sources, promote claims, rewrite evidence, decide source status, or bypass validation. Invalid model output is discarded by code.

## Testing instructions

### Hosted demo

1. Open https://openaihack.vercel.app.
2. Inspect the public Chile case, its addressable evidence records, and the 15 validation gates.
3. Open https://openaihack.vercel.app/?case=cl-correction-demo to inspect the expanded supersession diff.
4. The hosted environment may use the deterministic composer because ChatGPT-authenticated Codex sessions are local credentials and are not copied into Vercel.

### Live Codex path

Requirements: Node.js 24+, npm 11+, Codex CLI 0.144.0+, and a ChatGPT-authenticated `codex login` session.

```bash
npm install
npm run eval:codex
npm run dev
```

Open `http://localhost:3000`, keep `Codex live` selected, and run an audit. No `OPENAI_API_KEY` is required.

### Plugin path

```bash
codex plugin marketplace add /absolute/path/to/openaihack
codex plugin add tendergraph@tendergraph-local
```

Invoke `$tendergraph-analyze` in Codex.

## Limitations

TenderGraph does not claim autonomous procurement decision-making, legal compliance, universal live connector coverage, automatic document ingestion, or automatic impact discovery. The public case is a frozen snapshot; the correction, EU, UK, and deep Chile fixtures are explicitly synthetic. The hosted deployment cannot inherit a developer's local ChatGPT authentication, so live Codex testing uses the documented local or plugin path. Trace durability is local in this release; the hosted demo uses ephemeral storage.
