# Devpost Form Copy

Paste only the block requested by the corresponding Devpost field. The public
YouTube URL remains intentionally unset until the exact final video is
published and verified while signed out.

## General info

### Project name

TenderGraph

### Elevator pitch

An auditable procurement decision compiler that shows what changed, why it
changed, and which evidence supports every claim.

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

### 2. Evidence diff

- File: `artifacts/submission/correction-diff.png`
- Title: Exact claim supersession after corrective evidence
- Caption: A visibly synthetic correction benchmark shows which claims were
  replaced, which evidence changed, and which award rule remained unchanged.

### 3. Verification evidence

- File: `artifacts/submission/verification-evidence.png`
- Title: Verified, not asserted
- Caption: 32/32 contract tests, 23/23 deterministic scenarios, 2/2 live Codex
  runs, and an ablation in which the harness rejected all eight injected faults.

### 4. Codex collaboration

- File: `artifacts/submission/codex-collaboration.png`
- Title: Inspectable Codex collaboration
- Caption: Dated implementation history and retained runtime Session IDs make
  both the development workflow and live Codex execution inspectable.

## Project story

### Inspiration

Procurement teams often receive a final score or award recommendation without
a reliable way to reconstruct which source, evidence fragment, reviewed claim,
and rule produced it. Conventional AI summaries make this worse when fluent
prose becomes detached from authority. We built TenderGraph to make every
consequential statement inspectable and to show exactly what changes when new
evidence arrives.

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

Its incremental evidence-delta contract records changed evidence and affected
claim versions, rejects incomplete dependency declarations, computes the
unchanged complement, and displays the exact before-and-after diff. A visibly
synthetic correction benchmark demonstrates explicit claim supersession: the
recommended winner and loss explanation change while the award rule remains
unchanged.

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

We also packaged the analysis workflow as a distributable Codex plugin and
`$tendergraph-analyze` skill. Judges can use the hosted workbench immediately
or run the ChatGPT-authenticated Codex path locally without an OpenAI API key.

### How we used Codex and GPT-5.6

Codex was both our development collaborator and a product runtime surface. It
inspected the domain plan and research paper, implemented typed contracts and
the workbench, generated and challenged adversarial tests, ran builds and
browser checks, retrieved a public procurement snapshot, and converted review
findings into bounded engineering commits.

We retained the key product and governance decisions: focus on bidder-facing
opening and award intelligence; distinguish public facts from synthetic
benchmarks; require human approval for consequential claims; preserve the
difference between a recommendation and a signed contract; and treat changed
evidence as a dependency update rather than a full-answer rewrite.

At runtime, GPT-5.6 Terra performs structured composition. It cannot choose
authoritative sources, promote claims, rewrite evidence, decide source status,
or bypass validation. The required Codex `/feedback` upload was completed with
logs for the primary project thread.

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
- 32 unit and adversarial tests, all passing.
- 23 deterministic evaluation scenarios, all passing.
- An enforcement ablation that admitted 0 of 8 injected faults while a
  schema-only control admitted all 8.
- Two live Codex smoke runs, each passing all 15 validation gates.
- A public Apache-2.0 repository, reproducible setup, plugin, and hosted demo.

### What we learned

Reliable agentic systems need a distinction between generation and authority.
The model can help compose and explain, but source eligibility, claim approval,
evidence identity, dependency completeness, and output admission must remain
explicit, testable contracts. We also learned that incremental reevaluation is
most useful when the unchanged complement is proven, not merely when a new
answer is displayed.

### What's next

Next we would add licensed live procurement connectors, automatic document
ingestion, assisted impact discovery with mandatory review, durable hosted
trace storage, organization-level access controls, and jurisdiction-specific
policy packs. These are production extensions; they are not represented as
implemented in this submission.

## Testing instructions

1. Open https://openaihack.vercel.app.
2. Inspect the public Chile case, its addressable evidence, and the 15
   validation gates.
3. Open https://openaihack.vercel.app/?case=cl-correction-demo to inspect the
   expanded supersession diff.
4. For the live Codex path, follow the repository README with Node.js 24+,
   npm 11+, Codex CLI 0.144.0+, and a ChatGPT-authenticated `codex login`
   session. No `OPENAI_API_KEY` is required.

The hosted environment may use the deterministic composer because local
ChatGPT authentication is never copied into Vercel. The public case is a frozen
snapshot; correction and portability fixtures are explicitly synthetic.

## Codex feedback Session ID

`019f615b-8a9a-7be1-bc50-65059c70d511`
