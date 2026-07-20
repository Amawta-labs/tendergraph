# Devpost Form Copy

Paste only the block requested by the corresponding Devpost field.

## General info

### Project name

TenderGraph

### Elevator pitch

An agentic tender operating system that turns changing procurement evidence
into reviewable decisions.

### Category

Work & Productivity

## Links

### App

https://openaihack.vercel.app

### Source code

https://github.com/Amawta-labs/tendergraph

### Demo video

https://youtu.be/08tWuzAmOcs

## Built with

Codex, GPT-5.6, Next.js, React, TypeScript, Zod, Vitest, Playwright, Vercel

## Media gallery

Upload these 1920x1080 production captures in this order.

### 1. Ranked opportunity inbox

- File: `artifacts/submission/devpost-media-operational/01-opportunities-ranked.png`
- Title: Agents rank opportunities before company resources are committed
- Caption: TenderGraph scores three reproducible opportunities and recommends
  select, review, or pass. The bidder has not selected an opportunity yet, and
  every downstream operational stage remains locked.

### 2. Human investment gate

- File: `artifacts/submission/devpost-media-operational/02-human-investment-gate.png`
- Title: Selection does not silently allocate bidder resources
- Caption: After the recommended tender is selected, a named bid manager must
  approve the investment decision before requirements and preparation work can
  begin.

### 3. Dependency-aware bid plan

- File: `artifacts/submission/devpost-media-operational/03-bid-plan-unlocked.png`
- Title: Human approval unlocks an evidence-bound preparation plan
- Caption: Requirements drive named tasks and explicit dependencies. Compliance
  stays blocked while the certificate review remains unresolved, and the final
  submission control remains disabled.

### 4. Complete amendment impact

- File: `artifacts/submission/devpost-media-operational/04-amendment-impact.png`
- Title: One changed requirement, four explicitly preserved
- Caption: Amendment v2 shortens delivery from 15 to 10 days. TenderGraph checks
  the complete requirement set, supersedes the old source, and proposes a
  bounded shadow replan.

### 5. Replanned work and retained submission

- File: `artifacts/submission/devpost-media-operational/05-replanned-submission-held.png`
- Title: Only affected tasks reopen; agents still cannot submit
- Caption: The technical response and delivery confirmation are reopened with
  direct amendment provenance. Unaffected work remains complete and final
  release authority stays human-only.

### 6. Hash-verified public case

- File: `artifacts/submission/devpost-media-operational/06-evidence-bound-public-case.png`
- Title: Every reviewed conclusion leads back to exact evidence
- Caption: The separate public Chilean case exposes source, page, section,
  quoted passage, parser identity, hash, and authority while preserving the
  distinction between an evaluation recommendation and a signed contract.

### 7. Live Codex trace

- File: `artifacts/submission/devpost-media-operational/07-live-codex-trace.png`
- Title: GPT-5.6 reasoning inside code-owned contracts
- Caption: The retained live trace exposes the GPT-5.6 Terra model, Codex
  Session ID, runtime stages, and all 15 passed composition gates.

## Project story

### Commercial claim

TenderGraph is an agentic tender operating system for the multi-trillion-dollar
tender economy. It gives bidder teams one governed workspace to discover
opportunities, qualify fit, reconstruct requirements, prepare compliant bids,
monitor changes, and learn from outcomes.

Its differentiator is the trusted operating layer beneath those agents:
versioned documents, addressable evidence, dependency-aware requirements,
explicit approvals, and code-owned gates. Agents may reason and propose, but
they cannot silently turn stale evidence or generated prose into an approved
business action.

Public procurement alone represented
[12.7% of OECD GDP and 29.9% of government expenditure in 2023](https://www.oecd.org/en/publications/government-at-a-glance-2025_0efd0bcd-en/full-report/size-of-public-procurement_6979cd47.html).
The [World Bank estimated the global market at USD 11 trillion](https://blogs.worldbank.org/en/developmenttalk/how-large-public-procurement)
in 2018. The commercial opportunity is not another tender search interface. It
is a durable intelligence layer for decisions in a market where the OECD
identifies [complex procedures, administrative burden, and extensive
documentation](https://www.oecd.org/en/publications/smes-in-public-procurement_9789264307476-en.html)
as persistent supplier barriers.

### Inspiration

We were asked to examine a tender at the opening stage. By the time we
completed the review, Chile's public procurement portal already showed the
procedure as awarded.

The documents were still relevant, but the procurement process had advanced
while our analysis remained tied to an earlier stage. That exposed a broader
problem: bidder teams work across opportunities, requirements, spreadsheets,
attachments, amendments, deadlines, and outcomes, but the state of a tender
keeps changing while the work is underway.

A new opportunity must first be qualified. Requirements must be traced to the
current documents. People need to know what to prepare, what remains missing,
and whether the bid is still commercially viable. An amendment can then alter
one requirement, invalidate existing work, or create a new compliance blocker
days before submission.

Most teams manage this lifecycle across disconnected portals, email,
spreadsheets, shared folders, and document assistants that only answer
questions about the file currently in front of them.

The scale is substantial. Public procurement represented
[12.7% of OECD GDP and 29.9% of government expenditure in
2023](https://www.oecd.org/en/publications/government-at-a-glance-2025_0efd0bcd-en/full-report/size-of-public-procurement_6979cd47.html).

The
[Open Contracting Data Standard](https://standard.open-contracting.org/latest/en/guidance/map/amendments/)
models procurement as a sequence of releases, updates, and amendments. We
built TenderGraph to coordinate that changing lifecycle while keeping
evidence, approvals, and submission authority explicit.

### What it does

TenderGraph is an agentic tender operating system for bidder teams.

It coordinates seven stages of the bidding lifecycle:

- opportunity discovery;
- qualification;
- requirements analysis;
- bid preparation;
- compliance;
- amendment monitoring;
- outcome learning.

The default workspace begins with three clearly labeled synthetic
opportunities. TenderGraph ranks them using fit scores, highlights blockers,
and recommends whether each opportunity should be selected, reviewed, or
passed.

Selecting an opportunity does not automatically commit team resources. A bid
manager must approve qualification before the preparation plan is unlocked.

TenderGraph then organizes the current requirements, connects each one to
versioned evidence, assigns readiness states, and generates a dependency-aware
bid plan with responsible human owners. Requirements can be covered, changed,
incomplete, or waiting for review.

Compliance remains blocked while unresolved gaps exist. The final submission
package can never be released by an agent; submission authority remains
human-only.

When an amendment arrives, TenderGraph evaluates it against the complete
requirement set. It identifies which requirements changed, which remain valid,
which tasks must be reopened, and which compliance decisions require review.

The current benchmark demonstrates this flow with a shortened delivery window.
One requirement changes, four remain unchanged, affected tasks are replanned,
and the submission stays blocked until the team resolves the new delivery and
certificate issues.

TenderGraph also includes a hash-verified public Chilean evaluation case. It
reconstructs the commission's recommendation, compares evaluated scores,
explains why other suppliers were not recommended, and links each reviewed
claim to exact evidence. It preserves the source limitation that an evaluation
recommendation is not proof of a signed contract.

GPT-5.6 can reason, classify, compose, and propose actions. It cannot approve
qualification, compliance, consequential claims, or final submission.

### How we built it

TenderGraph is a Next.js and TypeScript application built around typed Zod
contracts.

The lifecycle engine models opportunities, agent stages, current and
superseded sources, requirements, bid tasks, approvals, amendments, compliance
blockers, and submission authority.

Each source record includes its procedure, jurisdiction, version, current
status, and content hash. Requirements remain connected to the exact evidence
used to establish their current value. Bid tasks reference both requirements
and upstream dependencies.

Six lifecycle gates run in application code:

- current source validation;
- requirement-to-evidence binding;
- complete requirement classification;
- valid task dependencies;
- complete amendment-impact coverage;
- human-only submission authority.

These gates prevent an agent from working from an obsolete document, inventing
a requirement, omitting part of an amendment's impact, starting blocked tasks,
or approving its own submission.

The deeper evidence harness supports PDF, DOCX, HTML, JSON, CSV, Markdown, and
plain text. It converts documents into hashed, addressable evidence records
without granting them authority merely because they were ingested.

Codex invokes GPT-5.6 Terra to compose answers from selected claims and
evidence. Fifteen additional runtime gates reject altered claim text, evidence
swaps, omissions, duplicated claims, invalid sources, scope contamination,
provenance failures, internal leakage, incomplete traces, and latency
violations.

For evidence changes, GPT-5.6/Codex evaluates the complete active-claim set.
Six impact gates validate scope, evidence identity, partition completeness,
action semantics, and the rule that model proposals remain subject to human
review.

This work applies a central lesson from
[*From Prompts to Contracts*](https://arxiv.org/abs/2607.08028): guarantees that
matter should be enforced by application code rather than left as instructions
inside a prompt.

Codex was also our development collaborator. It helped us:

- translate the research architecture into procurement contracts;
- implement the lifecycle engine and chat-first workspace;
- build the evidence harness and validation gates;
- generate adversarial tests;
- verify the public Chilean case;
- diagnose serverless deployment failures;
- run browser, responsive, and production checks;
- review the submission media and documentation.

The product and governance decisions remained ours: the bidder-team audience,
the seven-stage lifecycle, the public-versus-synthetic evidence boundary,
mandatory approval for consequential actions, and permanent human authority
over bid submission.

The workflow is also packaged as a Codex plugin with two bounded skills.
`$tendergraph-operate` runs the governed bidder lifecycle and its six gates;
`$tendergraph-analyze` runs evidence-backed opening, award, and correction
analysis. The authenticated analysis runtime uses a ChatGPT-authenticated
Codex session and does not require a separate OpenAI API key.

### Challenges we ran into

The first challenge was expanding from document analysis into a coherent
operational workflow.

A useful tender agent cannot simply summarize an opportunity. It must know
whether the opportunity fits the company, which documents are current, what
work is blocked, which requirements changed, and whether the organization has
approved the next action.

We therefore modeled the lifecycle as connected stages rather than a set of
unrelated AI features. Qualification approval unlocks preparation.
Requirements drive tasks. Task dependencies drive readiness. Compliance blocks
submission. Amendments can reopen earlier work.

The second challenge was that schema-valid output was not authority-valid.

A model can return valid JSON while changing claim text, citing evidence from
the wrong source, omitting an affected requirement, duplicating a
classification, or proposing an action it is not authorized to perform. We
validate semantic identity, provenance, completeness, scope, and authority in
code.

We also needed to demonstrate an end-to-end bidding workflow without
presenting fictional opportunities as live procurement records. The active-bid
inbox is therefore clearly labeled as a reproducible synthetic benchmark. The
public Chilean evaluation remains separate and hash-verified.

Deployment exposed failures that local tests missed in PDF rendering, worker
packaging, and serverless storage. We added the required canvas polyfills,
output-file tracing, and request-scoped temporary storage, then reran the real
ingestion and impact workflows against production.

Finally, Vercel cannot inherit a developer's ChatGPT-authenticated Codex
session. The hosted application uses a validated deterministic fallback when
Codex is unavailable, while authenticated GPT-5.6 runs execute locally or
through the plugin.

### Accomplishments that we're proud of

- A working seven-stage tender lifecycle covering discovery, qualification,
  requirements, bid preparation, compliance, monitoring, and outcome learning.
- Three ranked opportunities with fit scores, blockers, and select, review, or
  pass recommendations.
- Human qualification approval that unlocks the bid plan.
- Versioned requirements linked to current source evidence.
- Dependency-aware tasks with named human owners.
- Compliance that remains blocked while gaps are unresolved.
- Amendment analysis across the complete requirement set.
- Permanent human-only authority over final submission.
- Six lifecycle gates enforced in application code.
- A clearly labeled synthetic active-bid benchmark and a separate
  hash-verified public Chilean case.
- All 49 unit and adversarial tests passing.
- All 23 deterministic contract scenarios passing.
- In a controlled enforcement ablation, the full harness admitted 0 of 8
  injected faults while schema-only admission accepted all 8.
- Live Codex composition and impact runs with retained Session IDs.
- Exact agreement on the corrective impact benchmark.
- Production PDF ingestion with stable, addressable evidence anchors.
- Desktop and mobile verification with no console errors.
- A public Apache-2.0 repository with reproducible setup, a reusable Codex
  plugin and two skills, dated Build Week history, and a hash-verified submission
  package.

### What we learned

The most important lesson was that agentic work requires both autonomy and
authority boundaries.

Agents can discover opportunities, calculate fit, organize requirements,
generate work plans, monitor amendments, and propose updates. They should not
silently allocate company resources, approve unresolved compliance, or release
a legally consequential submission.

We also learned that procurement automation must preserve the connection
between operational work and evidence. A task is not trustworthy because an
agent created it. It is trustworthy when it can be traced to a current
requirement, a valid source, and an approved decision.

Amendment monitoring also requires checking the full requirement set.
Identifying what changed is only half of the task. Teams need to know which
requirements were checked and remain valid.

Finally, production probes became part of the reasoning harness. Passing unit
tests did not establish that document workers, native dependencies, temporary
storage, or responsive interfaces would survive the deployed environment.

### What's next for TenderGraph

The next steps are licensed live procurement connectors, OCR for scanned
documents, durable hosted workspaces and review history, organization-level
access controls, jurisdiction-specific policy packs, and secure integrations
with document and bid-submission systems.

The current release demonstrates the full operational lifecycle through a
reproducible synthetic active-bid benchmark. It does not claim universal
live-source discovery or autonomous submission.

From this foundation, TenderGraph can expand into continuous opportunity
monitoring, company-specific qualification policies, assisted bid drafting,
reusable compliance libraries, pricing workflows, portfolio intelligence, and
private RFPs.

The long-term product is an increasingly autonomous tender operation in which
agents handle discovery, analysis, preparation, monitoring, and learning,
while consequential commercial and legal authority remains with the
organization.

The moat is the customer's accumulated decision graph: every opportunity,
source, requirement, task dependency, amendment, reviewed claim, approval, and
outcome preserved over time.

## Testing instructions

1. Open https://openaihack.vercel.app and inspect the synthetic active-bid
   workspace.
2. Compare the three ranked opportunities, approve qualification, and inspect
   requirements, bid plan, compliance blockers, monitoring impact, and the six
   lifecycle gates. Submission authority must remain human-only.
3. Select the public Chile evaluation from the sidebar and inspect its
   addressable evidence and 15 validation gates.
4. Upload a supported document in the evidence control plane and inspect its
   hash, parser, evidence-anchor count, and authority state.
5. Open https://openaihack.vercel.app/?case=cl-correction-demo to inspect the
   supersession diff and automatic shadow impact proposal.
6. For the live Codex path, follow the repository README with Node.js 24+,
   npm 11+, Codex CLI 0.144.0+, and a ChatGPT-authenticated `codex login`
   session. No `OPENAI_API_KEY` is required.

The hosted environment may use the deterministic composer because local
ChatGPT authentication is never copied into Vercel. The public case is a frozen
snapshot; correction and portability fixtures are explicitly synthetic.

## Plugin or developer-tool instructions

TenderGraph includes a Codex plugin with `$tendergraph-operate` for the bidder
lifecycle and `$tendergraph-analyze` for evidence-backed decisions.

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
Use $tendergraph-operate to run the complete amended lifecycle and explain
every authority gate.

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
npm run tendergraph:lifecycle -- --state amended
npm run dev
```

Expected results for the submitted version:

- 49/49 unit and adversarial tests.
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
