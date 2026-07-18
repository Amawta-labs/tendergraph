# Devpost Submission Draft

## Submission metadata

- **Project:** TenderGraph
- **Track:** Work & Productivity
- **Tagline:** Decision intelligence for tender markets: who won, why, and what changed; compiled from evidence, not guessed by AI.
- **Repository:** https://github.com/Amawta-labs/tendergraph
- **Hosted demo:** https://openaihack.vercel.app
- **Video:** `TODO_PUBLIC_YOUTUBE_URL`
- **Prepared local video asset:** `public/tendergraph-build-week-chat-first-demo.mp4`
- **Hosted video asset:** https://openaihack.vercel.app/tendergraph-build-week-chat-first-demo.mp4
- **Primary Codex /feedback session:** `019f615b-8a9a-7be1-bc50-65059c70d511`

## What TenderGraph does

**TenderGraph is the decision-change control plane for the multi-trillion-dollar tender economy.** It helps bidder and procurement teams reconstruct opening and award decisions from source documents without turning model prose into authority. It compiles source manifests, addressable evidence records, reviewed claims, policy decisions, and a reader-facing answer into one auditable run.

The market is material and the problem is structural. Public procurement represented [12.7% of OECD GDP and 29.9% of total government expenditure in 2023](https://www.oecd.org/en/publications/government-at-a-glance-2025_0efd0bcd-en/full-report/size-of-public-procurement_6979cd47.html), while the [World Bank estimated USD 11 trillion in global public procurement](https://blogs.worldbank.org/en/developmenttalk/how-large-public-procurement) in 2018. OECD research identifies [complex procedures, administrative burden, and extensive documentation](https://www.oecd.org/en/publications/smes-in-public-procurement_9789264307476-en.html) as persistent barriers for suppliers. TenderGraph addresses the intelligence gap after discovery: who was recommended, why competitors lost, which evidence proves it, and what changed later.

The default case is a hash-verified public Chilean evaluation. TenderGraph identifies the commission's award recommendation, compares evaluated scores, explains why the other suppliers were not recommended, and preserves the source limitation that the snapshot is not proof of a signed contract.

The differentiating workflow is a validated evidence-change pipeline. TenderGraph ingests PDF, DOCX, HTML, JSON, CSV, Markdown, and text into hashed evidence anchors. GPT-5.6/Codex then compares the new evidence with every active claim and proposes corroboration, invalidation, supersession, review, or an explicit unchanged classification. Six code-owned gates reject scope contamination, incomplete claim partitions, invented evidence, invalid action semantics, and any attempt to grant model authority. The result remains in shadow mode until human review.

A public event demonstrates independent corroboration of one claim. A separate, visibly synthetic correction benchmark demonstrates two automatic supersession detections: the winner changes, the loss explanation reverses, and the award rule remains unchanged. Both live impact evaluations matched their versioned references exactly.

## Why this is frontier

An older-model application could summarize a PDF. TenderGraph's unit of work is a controlled decision-state transition across versioned sources, evidence, reviewed claims, GPT-5.6/Codex composition, code-owned admission gates, and an audit trace.

[OpenAI's agent guidance](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/) identifies complex decisions, difficult-to-maintain rules, and heavy unstructured data as workflows where agents add value, while emphasizing guardrails and human intervention. TenderGraph concentrates model freedom in semantic synthesis and removes model authority where errors create exposure. New evidence can corroborate, invalidate, or supersede a claim; unrelated conclusions remain explicit and stable.

The recent paper [*From Prompts to Contracts*](https://arxiv.org/abs/2607.08028) reports that code-owned guarantees are load-bearing and are not reproduced by prompt instructions alone. TenderGraph adopts that authority architecture and extends it with procurement scope, human-reviewed consequential claims, evidence-delta events, claim supersession, and exact before/after decision diffs.

The claim is not that GPT-5.6 is infallible or that older models cannot generate similar prose. The frontier contribution is a system in which advanced reasoning can operate without becoming the source of truth.

## Commercial wedge

The initial buyer is a bidder's commercial intelligence, proposal, or public sector sales team. Post-opening and post-award reconstruction provides an observable first workflow: compress a fragmented award file into an inspectable decision record, preserve evidence for debriefs and challenges, and turn losses into reusable institutional knowledge.

Expansion paths include continuous opening and award monitoring, licensed jurisdiction connectors, OCR, organization-specific review policy, portfolio-level competitor intelligence, and private RFPs. The defensible asset is the accumulated decision graph: source contracts, claim-evidence histories, correction events, and organization-specific review decisions. The current submission implements extensible document ingestion and automatic shadow impact discovery; it does not claim universal live connector coverage.

## How it works

1. Typed source manifests bind every artifact to a jurisdiction, procedure, lot, retrieval timestamp, canonical URL, content hash, eligibility status, and runtime-use policy.
2. Exact evidence records retain document locators, extracted text, parser version, and evidence hashes.
3. Claims are admitted by code-owned policy. Consequential claims require a named human reviewer and timestamp.
4. Codex invokes GPT-5.6 Terra to compose a structured answer from only the selected claims and evidence.
5. Fifteen validation gates reject altered claim text, mismatched evidence, missing or duplicated claims, source failures, scope contamination, provenance errors, internal leakage, incomplete traces, and latency violations.
6. If Codex is unavailable or violates the contract, TenderGraph returns a deterministic safe composition and records the reason.
7. New documents pass through format-specific parsers and become hashed evidence anchors with `context_only` authority.
8. GPT-5.6/Codex classifies every active claim against the new evidence; six impact gates admit only a shadow proposal requiring human review.

## What is technically demonstrated

- A working Next.js procurement workbench with a public evaluation case and synthetic portability/correction benchmarks.
- A ChatGPT-authenticated Codex runtime path that does not require an API key.
- A distributable TenderGraph Codex plugin and `$tendergraph-analyze` skill.
- Immutable six-stage local audit traces retrievable across local processes; hosted durable storage is a production boundary.
- Claim invalidation, supersession, and exact before/after evidence dependency diffs.
- 44 unit/adversarial tests, 23 deterministic evaluation scenarios, an 8-fault enforcement ablation, a 2-run live composition evaluation, and a 2-run live impact evaluation.

## Evaluation evidence

- Unit and adversarial suite: `44/44`
- Deterministic contract scenarios: `23/23`
- Enforcement ablation: harness admitted `0/8`; schema-only control admitted `8/8`
- Live Codex smoke: `2/2`, each with `15/15` validation gates
- Live Codex impact smoke: `2/2`, each with `6/6` gates and exact reference agreement
- Dependency audit: `0` known npm vulnerabilities
- Deterministic report: `artifacts/evals/deterministic-eval.json`
- Ablation report: `artifacts/evals/enforcement-ablation.json`
- Live report: `artifacts/evals/codex-smoke.json`
- Impact report: `artifacts/evals/impact-smoke.json`

## How we used Codex and GPT-5.6

Codex was both the development collaborator and a product runtime surface. It did not merely autocomplete code: it inspected and separated prior domain work, mapped a new research paper into application contracts, implemented the typed harness and workbench, generated and challenged adversarial tests, retrieved and hash-checked a public procurement snapshot, ran browser and deployment verification, reviewed submission media, and turned findings into bounded engineering commits.

The team retained the key product and governance decisions: focus on bidder-facing opening and award intelligence; distinguish public facts from synthetic benchmarks; require human approval for consequential claims; preserve the difference between an evaluation recommendation and a signed contract; treat changed evidence as a dependency update rather than a full-answer rewrite; and keep deterministic fallback as the final authority boundary.

At runtime, GPT-5.6 Terra performs only structured composition. It cannot select authoritative sources, promote claims, rewrite evidence, decide source status, or bypass validation. Invalid model output is discarded by code. The same workflow is packaged as a reusable Codex Skill that returns the model, Session ID, audit trace, gate results, and retained artifact. Dated commits and retained sessions make both development and runtime execution inspectable.

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
npm run eval:impact
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

TenderGraph does not claim autonomous procurement decision-making, legal compliance, universal live connector coverage, OCR for scanned images, or automatic authority changes. The public case is a frozen snapshot; the correction, EU, UK, and deep Chile fixtures are explicitly synthetic. Ingestion supports an extensible set of common document formats, and automatic impact discovery produces only a shadow proposal requiring human review. The hosted deployment cannot inherit a developer's local ChatGPT authentication, so live Codex testing uses the documented local or plugin path. Trace durability is local in this release; the hosted demo uses ephemeral storage.
