# Devpost Submission Draft

## Submission metadata

- **Project:** TenderGraph
- **Track:** Work & Productivity
- **Tagline:** An agentic tender operating system that turns changing procurement evidence into reviewable decisions.
- **Repository:** https://github.com/Amawta-labs/tendergraph
- **Hosted demo:** https://openaihack.vercel.app
- **Video:** https://www.youtube.com/watch?v=G0XekMloa4c
- **Prepared local video asset:** `public/tendergraph-build-week-chat-first-demo.mp4`
- **Hosted video asset:** https://openaihack.vercel.app/tendergraph-build-week-chat-first-demo.mp4
- **Primary Codex /feedback session:** `019f615b-8a9a-7be1-bc50-65059c70d511`

## What TenderGraph does

TenderGraph grew out of a real procurement analysis project in Chile. We were asked to examine a tender at the opening stage. By the time we completed the review, Chile's public procurement portal already showed the procedure as awarded. The documents remained relevant, but the process had moved to a new decision state while our analysis was tied to the earlier one.

**TenderGraph is an agentic tender operating system for bidder teams.** It
coordinates opportunity discovery, qualification, requirement analysis, bid
preparation, compliance, monitoring, and outcome learning. Its trusted
operating layer knows which documents are current, which requirements changed,
which conclusions remain valid, and who can approve an action.

Public procurement represented [12.7% of OECD GDP and 29.9% of total government expenditure in 2023](https://www.oecd.org/en/publications/government-at-a-glance-2025_0efd0bcd-en/full-report/size-of-public-procurement_6979cd47.html), yet procurement work remains fragmented across portals, spreadsheets, PDFs, attachments, and disconnected approvals.

The current release proves the complete workflow through a bounded synthetic
active-bid workspace and proves the underlying evidence layer through a
hash-verified public Chilean evaluation. The synthetic workspace ranks
three opportunities as select, review, or pass; gates qualification;
reconstructs requirement readiness; creates a dependency-aware bid plan;
blocks incomplete compliance; monitors amendments; and reserves submission for
a human.

The benchmark shortens the delivery window from 15 to 10 days. TenderGraph
classifies one requirement as changed and four as unchanged, replans the
affected tasks, and keeps compliance blocked until the delivery and certificate
issues are reviewed.

The default case is a hash-verified public Chilean evaluation. TenderGraph identifies the commission's recommendation, compares evaluated scores, explains why the other suppliers were not recommended, and preserves the source limitation that the evaluation report is not proof of a signed contract.

When new evidence arrives, GPT-5.6/Codex compares it with every active claim and proposes corroboration, invalidation, supersession, review, or an explicit unchanged classification. Six code-owned gates validate scope, partition completeness, evidence identity, action semantics, and shadow authority. Only a human can approve the proposed change.

A public event demonstrates one corroboration and five unchanged classifications. A separate, visibly synthetic correction benchmark demonstrates two supersessions while one claim remains unchanged under the admitted evidence. Both live impact evaluations matched their versioned references exactly.

## Why this is frontier

An older-model application could summarize a PDF. TenderGraph's unit of work is
a controlled operational lifecycle: opportunity qualification, current
requirements, task dependencies, compliance state, amendment impact, human
approvals, outcome evidence, and a complete audit trace.

[OpenAI's agent guidance](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/) identifies complex decisions, difficult-to-maintain rules, and heavy unstructured data as workflows where agents add value, while emphasizing guardrails and human intervention. TenderGraph concentrates model freedom in semantic synthesis and removes model authority where errors create exposure. New evidence can corroborate, invalidate, or supersede a claim; unrelated conclusions remain explicit and stable.

The recent paper [*From Prompts to Contracts*](https://arxiv.org/abs/2607.08028) reports that code-owned guarantees are load-bearing and are not reproduced by prompt instructions alone. TenderGraph adopts that authority architecture and extends it with procurement scope, human-reviewed consequential claims, evidence-delta events, claim supersession, and exact before/after decision diffs.

The claim is not that GPT-5.6 is infallible or that older models cannot generate similar prose. The frontier contribution is a system in which advanced reasoning can operate without becoming the source of truth.

## Commercial wedge

The initial buyer is a bidder's commercial intelligence, proposal, or public
sector sales team. TenderGraph replaces fragmented handoffs from opportunity
screening to proposal review with one governed operating workspace. Outcome
reconstruction then closes the loop: it preserves evidence for debriefs and
challenges and turns losses into reusable institutional knowledge.

Expansion paths include licensed live opportunity connectors, OCR,
organization-specific review policy, portfolio-level competitor intelligence,
and private RFPs. The current submission implements the lifecycle contract,
synthetic ranked discovery, extensible document ingestion, bid planning, and
automatic shadow impact discovery; it does not claim universal live connector
coverage or autonomous submission.

## How it works

1. A typed `tender-lifecycle.v1` workspace coordinates seven bounded agents and
   three human approval points across the bidding lifecycle.
2. A ranked opportunity inbox feeds a selected tender into qualification,
   requirements, bid preparation, compliance, monitoring, and outcome stages.
3. Typed source manifests bind every artifact to a jurisdiction, procedure, lot, retrieval timestamp, canonical URL, content hash, eligibility status, and runtime-use policy.
4. Exact evidence records retain document locators, extracted text, parser version, and evidence hashes.
5. Claims are admitted by code-owned policy. Consequential claims require a named human reviewer and timestamp.
6. Codex invokes GPT-5.6 Terra to compose a structured answer from only the selected claims and evidence.
7. Fifteen validation gates reject altered claim text, mismatched evidence, missing or duplicated claims, source failures, scope contamination, provenance errors, internal leakage, incomplete traces, and latency violations.
8. If Codex is unavailable or violates the contract, TenderGraph returns a deterministic safe composition and records the reason.
9. New documents pass through format-specific parsers and become hashed evidence anchors with `context_only` authority.
10. GPT-5.6/Codex classifies every active claim against the new evidence; six impact gates admit only a shadow proposal requiring human review.
11. Six lifecycle gates validate current documents, requirement evidence,
    complete change coverage, task dependencies, and human-only submission.

## What is technically demonstrated

- A working seven-stage tender operating workspace with ranked opportunities,
  human qualification, requirement readiness, bid dependencies, compliance
  blockers, amendment monitoring, and outcome learning.
- A complete amendment partition with one changed requirement, four explicitly
  unchanged requirements, and affected bid tasks reopened.
- A public evaluation case and synthetic portability/correction benchmarks.
- A ChatGPT-authenticated Codex runtime path that does not require an API key.
- A distributable TenderGraph Codex plugin and `$tendergraph-analyze` skill.
- Immutable six-stage local audit traces retrievable across local processes; hosted durable storage is a production boundary.
- Claim invalidation, supersession, and exact before/after evidence dependency diffs.
- 49 unit/adversarial tests, 23 deterministic evaluation scenarios, an 8-fault enforcement ablation, a 2-run live composition evaluation, and a 2-run live impact evaluation.

## Evaluation evidence

- Unit and adversarial suite: `49/49`
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

The team retained the key product and governance decisions: focus on a
bidder-facing full lifecycle; distinguish public facts from synthetic
benchmarks; require human approval for qualification, compliance,
consequential claims, and submission; preserve the difference between an
evaluation recommendation and a signed contract; treat changed evidence as a
dependency update rather than a full-answer rewrite; and keep deterministic
fallback as the final authority boundary.

At runtime, GPT-5.6 Terra performs only structured composition. It cannot select authoritative sources, promote claims, rewrite evidence, decide source status, or bypass validation. Invalid model output is discarded by code. The same workflow is packaged as a reusable Codex Skill that returns the model, Session ID, audit trace, gate results, and retained artifact. Dated commits and retained sessions make both development and runtime execution inspectable.

## Testing instructions

### Hosted demo

1. Open https://openaihack.vercel.app.
2. Compare the ranked opportunities and approve qualification.
3. Inspect requirements, bid plan, compliance blockers, monitoring impact, and
   the six lifecycle gates. Confirm that submission remains human-only.
4. Select the public Chile case from the sidebar and inspect its addressable
   evidence records and 15 validation gates.
5. Open https://openaihack.vercel.app/?case=cl-correction-demo to inspect the expanded supersession diff.
6. The hosted environment may use the deterministic composer because ChatGPT-authenticated Codex sessions are local credentials and are not copied into Vercel.

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

TenderGraph does not claim autonomous submission, legal advice, universal live
connector coverage, OCR for scanned images, or automatic authority changes.
The active-bid workspace, correction, EU, UK, and deep Chile fixtures are
explicitly synthetic; the public Chile case is a frozen snapshot. Ingestion
supports an extensible set of common document formats, and automatic impact
discovery produces only a shadow proposal requiring human review. The hosted
deployment cannot inherit a developer's local ChatGPT authentication, so live
Codex testing uses the documented local or plugin path. Trace durability is
local in this release; the hosted demo uses ephemeral storage.
