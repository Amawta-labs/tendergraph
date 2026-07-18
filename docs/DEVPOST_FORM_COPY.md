# Devpost Form Copy

Paste only the block requested by the corresponding Devpost field. The public
YouTube URL remains intentionally unset until the exact final video is
published and verified while signed out.

## General info

### Project name

TenderGraph

### Elevator pitch

Decision intelligence for tender markets: who won, why, and what changed;
compiled from evidence, not guessed by AI.

### Category

Work & Productivity

## Links

### App

https://openaihack.vercel.app

### Source code

https://github.com/Amawta-labs/tendergraph

### Demo video

`TODO_PUBLIC_YOUTUBE_URL`

## Built with

Codex, GPT-5.6, Next.js, React, TypeScript, Zod, Vitest, Playwright, Vercel

## Media gallery

Upload these 1920x1080 images in this order.

### 1. Public workbench

- File: `artifacts/submission/public-workbench.png`
- Title: Auditable public procurement workbench
- Caption: A hash-verified public evaluation with reviewed claims, exact
  evidence anchors, incremental impact, and 15 code-owned validation gates.

### 2. Automatic impact discovery

- File: `artifacts/submission/impact-discovery.png`
- Title: New evidence, bounded automatic reevaluation
- Caption: A PDF becomes eight hashed evidence anchors; GPT-5.6/Codex identifies
  one material claim impact, proves five claims unchanged, passes 6/6 gates,
  and remains blocked in shadow mode for human review.

### 3. Evidence diff

- File: `artifacts/submission/correction-diff.png`
- Title: Exact claim supersession after corrective evidence
- Caption: A visibly synthetic correction benchmark shows which claims were
  replaced, which evidence changed, and which award rule remained unchanged.

### 4. Verification evidence

- File: `artifacts/submission/verification-evidence.png`
- Title: Verified, not asserted
- Caption: 44/44 contract tests, 23/23 deterministic scenarios, 2/2 live
  composition runs, 2/2 live impact runs, and an ablation in which the harness
  rejected all eight injected faults.

### 5. Codex collaboration

- File: `artifacts/submission/codex-collaboration.png`
- Title: Inspectable Codex collaboration
- Caption: Dated implementation history and retained runtime Session IDs make
  both the development workflow and live Codex execution inspectable.

## Project story

### Commercial claim

TenderGraph is the decision-change control plane for the multi-trillion-dollar
tender economy. It converts fragmented opening, evaluation, award, and
correction records into a versioned graph of source-backed claims, so bidder
teams can reconstruct who was recommended, why competitors lost, and exactly
what new evidence changed without trusting an opaque AI summary.

Public procurement alone represented
[12.7% of OECD GDP and 29.9% of government expenditure in 2023](https://www.oecd.org/en/publications/government-at-a-glance-2025_0efd0bcd-en/full-report/size-of-public-procurement_6979cd47.html).
The [World Bank estimated the global market at USD 11 trillion](https://blogs.worldbank.org/en/developmenttalk/how-large-public-procurement)
in 2018. The commercial opportunity is not another tender search interface. It
is a durable intelligence layer for decisions in a market where the OECD
identifies [complex procedures, administrative burden, and extensive
documentation](https://www.oecd.org/en/publications/smes-in-public-procurement_9789264307476-en.html)
as persistent supplier barriers.

### Inspiration

Procurement teams do not need another chatbot that summarizes one PDF. They
need to know who was recommended, why each competitor lost, which exact passage
supports every conclusion, whether a later correction changed the decision,
and which prior conclusions remain valid.

This is a temporal problem as much as a document problem. The
[Open Contracting Data Standard](https://standard.open-contracting.org/latest/en/guidance/map/amendments/)
treats procurement information as a sequence of new releases, updates, and
amendments. TenderGraph makes that changing decision state inspectable rather
than silently generating a fresh answer.

### What it does

TenderGraph reconstructs opening and award decisions from source documents
without treating model prose as authority. It compiles source manifests,
addressable evidence records, human-reviewed claims, policy decisions, and a
reader-facing answer into one auditable run.

The default case is a hash-verified public Chilean evaluation. TenderGraph
identifies the commission's award recommendation, compares evaluated scores,
explains why the other suppliers were not recommended, and preserves the
important limitation that an evaluation snapshot is not proof of a signed
contract.

Its document pipeline ingests PDF, DOCX, HTML, JSON, CSV, Markdown, and text
into hashed evidence anchors. GPT-5.6/Codex then compares new evidence with
every active claim and proposes corroboration, invalidation, supersession,
review, or an explicit unchanged classification. Six code-owned gates reject
incomplete partitions, invented evidence, cross-procedure contamination,
invalid actions, and model authority. A visibly synthetic correction benchmark
demonstrates automatic supersession discovery: the recommended winner and loss
explanation change while the award rule remains unchanged.

### Why this is frontier

An older-model product could summarize a PDF. TenderGraph's unit of work is a
controlled decision-state transition across versioned sources, evidence,
reviewed claims, GPT-5.6/Codex composition, code-owned admission gates, and an
audit trace.

[OpenAI's agent guidance](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/)
identifies complex decisions, difficult-to-maintain rules, and heavy
unstructured data as workflows where agents add value, while emphasizing
guardrails and human intervention for high-risk actions. TenderGraph applies
that pattern directly: the model's freedom is concentrated in semantic
synthesis, while its authority is removed wherever an error could create
commercial, legal, or reputational exposure.

New evidence never triggers an untracked rewrite. It can corroborate,
invalidate, or supersede a claim, while the unchanged complement remains
explicit. The automatic proposal remains in shadow mode until human review.
The claim is not that GPT-5.6 is infallible. It is that frontier reasoning can
operate inside a testable decision system instead of being presented as the
system of record.

### How we built it

TenderGraph is a Next.js and TypeScript workbench backed by typed Zod
contracts. Source manifests bind artifacts to jurisdiction, procedure, lot,
retrieval time, canonical URL, content hash, eligibility status, and runtime
policy. Exact evidence records retain document locators, extracted text,
parser version, and evidence hashes. Consequential claims require a named
human reviewer and timestamp before they can be selected.

Codex invokes GPT-5.6 Terra to compose a structured answer only from selected
claims and evidence. Fifteen code-owned validation gates reject altered claim
text, mismatched evidence, missing or duplicated claims, source failures, scope
contamination, provenance errors, internal leakage, incomplete traces, and
latency violations. Invalid model output is discarded; deterministic
composition is the safe fallback.

Format-specific ingestion adapters create file hashes, parser identity,
document locators, and evidence hashes without granting claim authority.
GPT-5.6/Codex impact discovery classifies the complete active-claim partition;
six additional code gates admit only a shadow proposal that requires human
review.

We also packaged the analysis workflow as a distributable Codex plugin and
`$tendergraph-analyze` skill. Judges can use the hosted workbench immediately
or run the ChatGPT-authenticated Codex path locally without an OpenAI API key.

### How we used Codex and GPT-5.6

Codex was both our development collaborator and a product runtime surface. It
did not merely autocomplete code. It inspected and separated the prior domain
work, mapped a new research paper into application contracts, implemented the
typed harness and workbench, generated and challenged adversarial tests,
retrieved and hash-checked a public procurement snapshot, ran browser and
deployment verification, reviewed the submission media, and converted
findings into bounded engineering commits.

We retained the key product and governance decisions: focus on bidder-facing
opening and award intelligence; distinguish public facts from synthetic
benchmarks; require human approval for consequential claims; preserve the
difference between a recommendation and a signed contract; and treat changed
evidence as a dependency update rather than a full-answer rewrite.

At runtime, GPT-5.6 Terra performs structured composition. It cannot choose
authoritative sources, promote claims, rewrite evidence, decide source status,
or bypass validation. The required Codex `/feedback` upload was completed with
logs for the primary project thread. The same workflow is packaged as a Codex
Skill that reports the model, Session ID, audit trace, validation gates, and
retained result artifact. Dated commits and retained sessions make both the
build process and product runtime inspectable.

### Challenges

The central challenge was establishing an authority boundary strong enough to
survive adversarial model output. A schema-valid response can still alter
claim text, cite the wrong evidence, omit an affected dependency, or leak
internal metadata. We therefore validate semantic identity and provenance in
code rather than trusting format compliance.

Another challenge was demonstrating a real procurement case without
overclaiming what the frozen public snapshot proves. The product explicitly
separates public evidence from synthetic portability and correction
benchmarks, and it labels the public outcome as an evaluation recommendation,
not a confirmed signed contract.

### Accomplishments

- A working hosted procurement workbench with a hash-verified public case.
- Exact claim-to-evidence inspection and visible incremental supersession.
- Fifteen runtime validation gates with deterministic safe fallback.
- 44 unit and adversarial tests, all passing.
- 23 deterministic evaluation scenarios, all passing.
- An enforcement ablation that admitted 0 of 8 injected faults while a
  schema-only control admitted all 8.
- Two live Codex smoke runs, each passing all 15 validation gates.
- Two live Codex impact runs, each passing all 6 impact gates with exact
  reference agreement.
- A public Apache-2.0 repository, reproducible setup, plugin, and hosted demo.

### What we learned

Reliable agentic systems need a distinction between generation and authority.
The model can help compose and explain, but source eligibility, claim approval,
evidence identity, dependency completeness, and output admission must remain
explicit, testable contracts. We also learned that incremental reevaluation is
most useful when the unchanged complement is proven, not merely when a new
answer is displayed.

This matches the central result of
[*From Prompts to Contracts*](https://arxiv.org/abs/2607.08028):
code-owned guarantees are load-bearing and are not reproduced by prompt
instructions alone. TenderGraph extends that architecture with procurement
scope, human-reviewed award claims, evidence-delta events, supersession, and
exact before-and-after decision diffs.

### What's next

Next we would add licensed live procurement connectors, OCR for scanned
documents, durable hosted trace and review storage, organization-level access
controls, and jurisdiction-specific policy packs. Multi-format ingestion and
assisted impact discovery with mandatory review are implemented in this
submission; universal live-source coverage is not claimed.

Commercially, the initial wedge is post-opening and post-award intelligence for
bidder teams, where a public outcome makes value observable. The expansion is
continuous opening and award monitoring, organization-specific review policy,
portfolio-level competitor intelligence, and private RFPs. The defensible
asset is the customer's accumulated decision graph and review history, not a
prompt or exclusive access to one model.

## Testing instructions

1. Open https://openaihack.vercel.app.
2. Inspect the public Chile case, its addressable evidence, and the 15
   validation gates.
3. Upload a supported document in the evidence control plane and inspect its
   hash, parser, evidence-anchor count, and authority state.
4. Open https://openaihack.vercel.app/?case=cl-correction-demo to inspect the
   supersession diff and automatic shadow impact proposal.
5. For the live Codex path, follow the repository README with Node.js 24+,
   npm 11+, Codex CLI 0.144.0+, and a ChatGPT-authenticated `codex login`
   session. No `OPENAI_API_KEY` is required.

The hosted environment may use the deterministic composer because local
ChatGPT authentication is never copied into Vercel. The public case is a frozen
snapshot; correction and portability fixtures are explicitly synthetic.

## Codex feedback Session ID

`019f615b-8a9a-7be1-bc50-65059c70d511`
