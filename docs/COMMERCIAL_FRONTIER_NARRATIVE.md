# TenderGraph Commercial and Frontier Narrative

## The claim

**TenderGraph is the trusted operating layer for agentic tender teams in the
multi-trillion-dollar tender economy.**

It coordinates discovery, qualification, requirements, bid preparation,
compliance, monitoring, and outcomes on top of a versioned graph of sources,
requirements, evidence, actions, and approvals. Agents can move work forward
without being allowed to convert stale evidence or generated prose into an
approved business action.

This is not document automation. It is the governed memory, evidence, and
control layer required for an autonomous bidding team.

## Why the market matters

Public procurement alone represented **12.7% of OECD GDP and 29.9% of total
government expenditure in 2023**. The World Bank estimated global public
procurement at **USD 11 trillion in 2018**, approximately 12% of global GDP.
These figures exclude the private RFP and enterprise sourcing markets that
share the same document-heavy decision pattern.

The supplier problem is not a shortage of tender portals. OECD research
identifies complex procedures, administrative burden, extensive documentation,
limited information, and weak feedback as persistent barriers, especially for
smaller suppliers. A bidder can find an opportunity and still lack reliable
answers to the commercially important questions:

1. Does this opportunity fit the company well enough to invest bid resources?
2. Which requirements are current, covered, changed, or still incomplete?
3. What must each person prepare, and which tasks are blocked by dependencies?
4. Did a later clarification or amendment invalidate existing work?
5. Is the package compliant, and who is authorized to approve or submit it?
6. What did the final outcome teach the team for the next opportunity?

TenderGraph is designed around those questions.

## The commercial wedge

The initial buyer is a bidder's commercial intelligence, proposal, or public
sector sales team. The working product spans the full operating loop:

- rank opportunities and qualify fit;
- reconstruct current requirements from versioned evidence;
- coordinate dependency-aware bid tasks;
- block compliance and submission when evidence is incomplete;
- monitor amendments and prove which requirements remain unchanged;
- compress a fragmented award file into an inspectable outcome record;
- preserve exact evidence for debriefs, internal review, and challenge
  preparation;
- turn losses into reusable institutional knowledge instead of isolated PDF
  reading;
- detect when a correction changes the winner or loss rationale without
  silently rewriting unrelated conclusions.

The current Build Week system includes a visibly synthetic active-bid benchmark
covering all seven stages and a hash-verified public outcome case. It ranks
three opportunities, requires human qualification, builds a dependency-aware
bid plan, keeps unresolved compliance blocked, and evaluates a shortened
delivery window against all five requirements: one changes and four remain
valid. It also ingests PDF, DOCX, HTML, JSON, CSV, Markdown, and text into
hashed, addressable evidence, then asks GPT-5.6/Codex to discover which active
claims may be corroborated, invalidated, superseded, or require review. The
proposal is validated in code and remains in shadow mode until a human
decision. This is extensible multi-format ingestion, not a claim of universal
connector coverage. The next expansion is continuous monitoring, licensed
jurisdiction connectors, organization-specific review policies,
portfolio-level competitor intelligence, OCR, and private RFPs.

## Why this is a frontier system

An older-model product could summarize a PDF. That is not the unit of work
here.

TenderGraph's unit of work is a **controlled decision-state transition**:

```text
versioned sources
  -> addressable evidence
  -> reviewed claims
  -> GPT-5.6/Codex composition
  -> code-owned admission gates
  -> reader answer plus audit trace
  -> explicit evidence delta and claim supersession

new document
  -> format adapter and hashed evidence chunks
  -> GPT-5.6/Codex claim-by-claim impact classification
  -> code-owned impact gates
  -> shadow proposal and mandatory human review

ranked opportunity
  -> human qualification
  -> current requirements and bid dependencies
  -> compliance review
  -> amendment monitoring
  -> human-only submission
  -> outcome evidence returned to decision memory
```

OpenAI's agent guidance identifies complex decision-making, difficult-to-
maintain rules, and heavy unstructured data as the workflows where agents add
value. It also states that guardrails and human intervention are critical for
high-risk actions. TenderGraph applies that pattern to procurement:

- GPT-5.6/Codex handles semantic composition and the agent-facing workflow.
- Source eligibility, claim promotion, scope, evidence identity, and output
  admission remain application-owned.
- Consequential claims require a named human reviewer and timestamp.
- A model candidate that changes a fact, swaps evidence, crosses procedure
  scope, leaks internals, or omits a required claim is discarded.
- New evidence creates a versioned event. Claims can be corroborated,
  invalidated, or superseded; the unchanged complement is explicit.
- New documents can be parsed and evaluated automatically, but the model's
  impact proposal cannot mutate source or claim authority.

The model's freedom is concentrated where it creates value: semantic
synthesis. Its authority is removed where an error would create commercial,
legal, or reputational exposure.

That separation is the frontier claim. It is not that GPT-5.6 is magically
infallible or that an older model could never produce similar prose. It is that
frontier reasoning can now operate inside a testable decision system rather
than being presented as the system of record.

## Why Codex is substantive here

Codex was not used as autocomplete or as a one-shot code generator. It ran the
end-to-end engineering and verification loop:

1. inspected the prior domain work and separated it from the Build Week
   implementation;
2. read and mapped a new research paper into application contracts;
3. implemented schemas, gates, traces, fallback, the evidence-delta model, and
   the workbench;
4. generated adversarial cases and an enforcement ablation;
5. retrieved, hashed, and checked a real public procurement snapshot;
6. ran browser verification, production deployment checks, and media review;
7. preserved live model Session IDs and `/feedback` evidence;
8. packaged the same workflow as a reusable Codex Skill.

This is consistent with OpenAI's description of Codex as a frontier coding
agent for end-to-end engineering work and reusable team workflows. Dated
commits, retained sessions, test artifacts, and the public repository make the
collaboration inspectable.

Codex also remains inside the product boundary. The TenderGraph Skill invokes
the application-owned harness through a ChatGPT-authenticated Codex session,
uses GPT-5.6 Terra for the bounded composition step, and returns the model,
Session ID, trace, gates, and retained artifact. The agent cannot bypass the
claim authority layer.

## Why this is more than a paper adaptation

The paper *From Prompts to Contracts* shows that code-owned guarantees are
load-bearing: prompt instructions alone allowed violations to reach readers,
while the harness blocked them. TenderGraph adopts that authority architecture
and extends it for a temporal procurement problem:

- jurisdiction, procedure, and lot scope;
- evaluation-stage versus signed-contract distinctions;
- human review for consequential award claims;
- versioned evidence-delta events;
- claim invalidation and supersession;
- exact before-and-after decision diffs;
- an explicit unchanged complement.

The research pattern provides the safety architecture. TenderGraph supplies the
procurement ontology, commercial workflow, temporal change model, real public
case, and product experience.

## Evidence demonstrated in the submission

- One hash-verified public Chilean evaluation with addressable evidence.
- One seven-stage synthetic active-bid workspace with three ranked
  opportunities, requirement readiness, bid dependencies, compliance blockers,
  and human-only submission authority.
- Six passing lifecycle gates.
- A visible synthetic correction benchmark with two explicit supersessions.
- 15 code-owned runtime gates.
- 49/49 unit and adversarial tests, including lifecycle authority, PDF
  ingestion, and impact attacks.
- 23/23 deterministic contract scenarios.
- An enforcement ablation where the harness admitted 0/8 injected faults and
  the schema-only control admitted 8/8.
- Two live GPT-5.6 Terra runs through ChatGPT-authenticated Codex, each passing
  15/15 gates.
- Two live GPT-5.6 Terra impact runs, each passing 6/6 impact gates with exact
  reference agreement: one corroboration and one two-claim supersession.
- A Codex plugin and skill that make the workflow runnable without an API key.

## Defensibility

The moat is not a prompt or exclusive access to a model. It is the accumulated,
versioned decision graph:

- opportunity histories and company-specific qualification decisions;
- current requirements, task dependencies, amendments, and approvals;
- jurisdiction-specific source and policy contracts;
- claim-evidence histories across openings, awards, and corrections;
- organization-specific review decisions;
- reusable loss-reason and competitor patterns;
- evaluation suites that test whether every new capability preserves
  authority and traceability.

Model quality will improve and models will change. The decision history,
contracts, and review graph compound for the customer.

## Sources

1. [OECD, Government at a Glance 2025: Size of public procurement](https://www.oecd.org/en/publications/government-at-a-glance-2025_0efd0bcd-en/full-report/size-of-public-procurement_6979cd47.html)
   reports 12.7% of OECD GDP and 29.9% of government expenditure in 2023.
2. [World Bank, How large is public procurement?](https://blogs.worldbank.org/en/developmenttalk/how-large-public-procurement)
   estimates USD 11 trillion and 12% of global GDP in 2018.
3. [OECD, SMEs in Public Procurement](https://www.oecd.org/en/publications/smes-in-public-procurement_9789264307476-en.html)
   documents complexity, administrative burden, documentation, and capacity
   barriers for suppliers.
4. [Open Contracting Data Standard: Updates and amendments](https://standard.open-contracting.org/latest/en/guidance/map/amendments/)
   models procurement information as releases with new information, updates,
   and amendments, including before-and-after values.
5. [OpenAI, A practical guide to building agents](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/)
   frames agents around complex decisions, unstructured data, tools,
   guardrails, and human intervention.
6. [OpenAI Codex](https://openai.com/codex/) describes frontier coding agents,
   end-to-end engineering work, and reusable Skills.
7. [Ahn and Kim, From Prompts to Contracts](https://arxiv.org/abs/2607.08028)
   reports that code-owned contract enforcement is load-bearing and not
   reproduced by prompt instructions alone.
