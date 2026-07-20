# Devpost Form Copy

Paste only the block requested by the corresponding Devpost field.

## General info

### Project name

TenderGraph

### Elevator pitch

An auditable procurement agent that shows exactly what new evidence changes,
what remains valid, and the source behind every claim.

### Category

Work & Productivity

## Links

### App

https://openaihack.vercel.app

### Source code

https://github.com/Amawta-labs/tendergraph

### Demo video

https://www.youtube.com/watch?v=G0XekMloa4c

## Built with

Codex, GPT-5.6, Next.js, React, TypeScript, Zod, Vitest, Playwright, Vercel

## Media gallery

Upload these 1920x1080 images in this order.

### 1. Auditable workbench

- File: `artifacts/submission/devpost-media/01-auditable-workbench.png`
- Title: Procurement decisions, reconstructed and reviewable
- Caption: TenderGraph turns a hash-verified public evaluation into reviewed
  findings, exact citations, a visible evidence-change event, and a proposal
  that remains under human control.

### 2. Exact evidence

- File: `artifacts/submission/devpost-media/02-exact-evidence.png`
- Title: Every reviewed claim leads back to its source
- Caption: The evidence inspector exposes source, page, section, quoted passage,
  parser identity, content hash, and authority status instead of asking judges
  to trust generated prose.

### 3. Decision change

- File: `artifacts/submission/devpost-media/03-decision-change.png`
- Title: New evidence changes claims, not history
- Caption: A visibly synthetic corrective resolution produces two shadow
  supersession proposals while one reviewed claim remains unchanged. No
  conclusion is promoted without human review.

### 4. Live Codex trace

- File: `artifacts/submission/devpost-media/04-live-codex-trace.png`
- Title: GPT-5.6 reasoning inside code-owned contracts
- Caption: The live trace retains the GPT-5.6 Terra model, Codex Session ID,
  runtime stages, and 15 passed composition gates.

### 5. Verified enforcement

- File: `artifacts/submission/devpost-media/05-verified-enforcement.png`
- Title: A working system, not a prompt demo
- Caption: 44/44 tests, 23/23 deterministic scenarios, 15/15 composition gates,
  6/6 impact gates, 0/8 controlled faults admitted, and three fresh retained
  Codex runs.

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

TenderGraph grew out of a real procurement analysis project in Chile. We were
asked to examine a tender at the opening stage. By the time we completed the
review, Chile's public procurement portal already showed the procedure as
awarded.

The documents were still relevant, but the procurement process had moved to a
new decision state while our analysis remained tied to the earlier one. That
was a narrow instance of a broader pattern: procurement teams build conclusions
from a valid set of records, and later publications, amendments, or corrections
change what those conclusions mean.

The highest-risk version of that pattern is a corrective resolution. A team has
already briefed leadership on an award recommendation. A correction then
arrives, but conventional document assistants do not enforce which prior
conclusions must change, which remain supported by the admitted evidence, or
who is authorized to approve the update.

The scale is substantial. Public procurement represented
[12.7% of OECD GDP and 29.9% of government expenditure in
2023](https://www.oecd.org/en/publications/government-at-a-glance-2025_0efd0bcd-en/full-report/size-of-public-procurement_6979cd47.html),
yet opening, evaluation, award, and correction records remain spread
across portals, spreadsheets, PDFs, and attachments.

[Open Contracting Data Standard](https://standard.open-contracting.org/latest/en/guidance/map/amendments/)
models procurement as a sequence of releases, updates, and amendments. We built
TenderGraph to make that changing decision state visible and reviewable,
without allowing a newly generated answer to silently replace an approved
conclusion.

### What it does

TenderGraph is an auditable procurement agent. It reconstructs who was
recommended, why competitors were not recommended, and which exact source
passage supports each reviewed claim.

The default case is a hash-verified public Chilean evaluation. TenderGraph
compares the evaluated scores, identifies the commission's recommendation, and
preserves an essential limitation: an evaluation report is not proof of a
signed contract.

When new evidence arrives, TenderGraph checks every active claim instead of
rewriting the whole answer. GPT-5.6/Codex proposes corroboration, invalidation,
supersession, review, or an explicit unchanged classification. Six code-owned
gates validate scope, partition completeness, evidence identity, action
semantics, and shadow authority. Only a human can approve the proposed change.

A clearly labeled synthetic correction benchmark makes this visible: two
claims are superseded, one remains unchanged under the admitted evidence, and
the complete before-and-after history remains inspectable.

An older application could summarize a PDF. TenderGraph controls how a
decision is allowed to change across versioned evidence. GPT-5.6 can reason
over the record; it cannot become authority.

### How we built it

TenderGraph is a Next.js and TypeScript workbench built around typed Zod
contracts. Source manifests bind every artifact to a jurisdiction, procedure,
lot, retrieval time, canonical URL, content hash, eligibility status, and
runtime policy. Evidence records retain exact document locators, extracted
text, parser identity, and evidence hashes. Consequential claims require a
named human reviewer and review timestamp.

The ingestion pipeline converts PDF, DOCX, HTML, JSON, CSV, Markdown, and text
into hashed, addressable evidence without granting it claim authority. Codex
then invokes GPT-5.6 Terra to compose from selected claims and evidence.
Fifteen code-owned gates reject altered claims, evidence swaps, omissions,
duplication, invalid sources, scope contamination, provenance failures,
internal leakage, incomplete traces, and latency violations. Invalid output is
discarded and replaced by deterministic safe composition.

For evidence changes, GPT-5.6/Codex classifies the complete active-claim
partition. Six additional gates validate the resulting shadow proposal before
it can reach human review. This adopts the central lesson of
[*From Prompts to Contracts*](https://arxiv.org/abs/2607.08028): guarantees that
matter must be owned and enforced by code, not merely requested in a prompt.

Codex was also our development collaborator. It helped map the research
architecture into contracts, implement the harness and chat-first workbench,
generate adversarial tests, verify the public case, diagnose serverless
failures, run browser and deployment checks, and review the submission media.
We retained the product and governance decisions.

The workflow is also packaged as a Codex plugin and
`$tendergraph-analyze` skill. The authenticated runtime uses Codex with GPT-5.6
through the user's ChatGPT session and does not require an OpenAI API key.

### Challenges we ran into

The hardest problem was that schema-valid is not authority-valid. A model can
produce valid JSON while altering claim text, citing the wrong evidence,
omitting an affected dependency, or exposing internal metadata. We therefore
validate semantic identity, provenance, completeness, and scope in code.

We also needed a real procurement case without overstating what its source
proved. TenderGraph separates the hash-verified public evaluation from
synthetic correction and portability benchmarks. The public result remains an
evaluation recommendation, not a confirmed contract.

Deployment exposed failures that local tests missed: PDF geometry globals,
PDF.js worker tracing, and read-only serverless storage. We added explicit
canvas polyfills, output-file tracing, and request-scoped temporary storage,
then reran the real PDF and impact workflows against production.

Finally, Vercel cannot inherit a developer's ChatGPT-authenticated Codex
session. The hosted demo therefore uses a validated deterministic fallback
when Codex is unavailable, while authenticated GPT-5.6 runs execute locally or
through the plugin.

### Accomplishments that we're proud of

- In a controlled enforcement ablation, the full harness admitted 0/8 injected
  faults while schema-only admission accepted 8/8.
- Two live Codex composition runs passed 15/15 gates.
- Two live Codex impact runs passed 6/6 gates and matched their versioned
  references exactly.
- The synthetic correction benchmark found 2/2 expected supersessions while
  preserving the explicitly unchanged claim.
- All 44 unit and adversarial tests and all 23 deterministic contract scenarios
  pass.
- Production PDF ingestion converts the four-page public evaluation into eight
  addressable evidence anchors with stable hashes and locators.
- The working product includes exact claim-to-evidence inspection, visible
  decision changes, deterministic fallback, and mandatory human review.
- The public Apache-2.0 repository includes the reusable Codex plugin and skill,
  dated Build Week history, reproducible setup, and a hash-verified submission
  package.

### What we learned

Reliable agents require a strict distinction between generation and authority.
A model can reason, compose, and explain, but source eligibility, claim
approval, evidence identity, dependency completeness, and output admission
must remain explicit, testable contracts.

Incremental reevaluation is useful only when the complete claim set is checked.
Showing which reviewed conclusions remain unchanged under the admitted
evidence is as important as identifying the affected claims.

We also learned that production probes belong inside the reasoning harness.
Passing unit tests did not prove that PDF workers, native dependencies, or
temporary storage would survive serverless packaging. End-to-end deployment
checks found failures that local execution could not.

### What's next for TenderGraph

Next we will add licensed live procurement connectors, OCR for scanned
documents, durable hosted trace and review storage, organization-level access
controls, and jurisdiction-specific policy packs. Multi-format ingestion and
assisted impact discovery with mandatory review are implemented today;
universal live-source coverage is not claimed.

The initial commercial wedge is post-opening and post-award intelligence for
bidder teams, where public outcomes make value observable. From there,
TenderGraph can expand into continuous award monitoring, organization-specific
review policies, portfolio-level competitor intelligence, and private RFPs.

The moat is the customer's accumulated decision graph: every source, reviewed
claim, evidence dependency, correction event, and approved outcome preserved
over time.

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

## Plugin or developer-tool instructions

TenderGraph includes a Codex plugin and the `$tendergraph-analyze` skill.

**Supported platforms**

- Hosted workbench: modern desktop browsers on Linux, macOS, and Windows.
- Local Codex/plugin path: tested on Linux x64.
- Requirements: Node.js 24+, npm 11+, Codex CLI 0.144.0+, Git, and a
  ChatGPT-authenticated `codex login` session.
- No `OPENAI_API_KEY` is required for the Codex/plugin path.

**Installation**

```bash
git clone https://github.com/Amawta-labs/tendergraph.git
cd tendergraph
npm install
codex login
codex plugin marketplace add /absolute/path/to/tendergraph
codex plugin add tendergraph@tendergraph-local
```

Start Codex from the repository and invoke:

```text
Use $tendergraph-analyze to audit the Chile public evaluation case and publish
its trace.
```

**Testing**

```bash
npm test
npm run eval
npm run eval:ablation
npm run eval:codex
npm run eval:impact
npm run dev
```

Expected results for the submitted version:

- 44/44 unit and adversarial tests.
- 23/23 deterministic contract scenarios.
- Enforcement harness admits 0/8 controlled injected faults; schema-only
  admission accepts 8/8.
- Two live composition runs pass 15/15 gates.
- Two live impact runs pass 6/6 gates and match their versioned references.

Judges can test the product without rebuilding it at
https://openaihack.vercel.app/?submission=public and inspect the correction
benchmark at
https://openaihack.vercel.app/?case=cl-correction-demo&submission=public.
The hosted deployment cannot inherit a local ChatGPT login, so it returns the
validated deterministic fallback when Codex is unavailable. Live GPT-5.6/Codex
testing uses the documented local plugin path.

## Codex feedback Session ID

`019f615b-8a9a-7be1-bc50-65059c70d511`
