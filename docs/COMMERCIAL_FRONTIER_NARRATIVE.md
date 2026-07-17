# TenderGraph Commercial and Frontier Narrative

## The claim

**TenderGraph is the decision-change control plane for the multi-trillion-dollar
tender economy.**

It turns fragmented opening, evaluation, award, and correction records into a
versioned graph of source-backed claims. Bidder teams can reconstruct who was
recommended, why competitors lost, and exactly what new evidence changed
without trusting an opaque AI summary.

This is not document automation. It is a commercial intelligence and evidence
layer for decisions that change over time.

## Why the market matters

Public procurement alone represented **12.7% of OECD GDP and 29.9% of total
government expenditure in 2023**. The World Bank estimated global public
procurement at **USD 11 trillion in 2018**, approximately 12% of global GDP.
These figures exclude the private RFP and enterprise sourcing markets that
share the same document-heavy decision pattern.

The supplier problem is not a shortage of tender portals. OECD research
identifies complex procedures, administrative burden, extensive documentation,
limited information, and weak feedback as persistent barriers, especially for
smaller suppliers. A bidder can find an opportunity and still lack a reliable
answer to the commercially important questions:

1. Who was actually recommended, at which decision stage?
2. Why did each competing offer lose?
3. Which document and exact passage support each conclusion?
4. Did a later clarification, score correction, or resolution change the
   decision?
5. Which prior conclusions remain valid?

TenderGraph is designed around those questions.

## The commercial wedge

The initial buyer is a bidder's commercial intelligence, proposal, or public
sector sales team. The initial workflow is post-opening and post-award
reconstruction, where an observable public decision lets the product prove
value:

- compress a fragmented award file into an inspectable decision record;
- preserve exact evidence for debriefs, internal review, and challenge
  preparation;
- turn losses into reusable institutional knowledge instead of isolated PDF
  reading;
- detect when a correction changes the winner or loss rationale without
  silently rewriting unrelated conclusions.

The natural expansion is continuous monitoring across openings and awards,
licensed jurisdiction connectors, organization-specific review policies,
portfolio-level competitor intelligence, and private RFPs. The current Build
Week submission proves the control layer and one deep public case; it does not
claim universal ingestion or automatic impact discovery.

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
- A visible synthetic correction benchmark with two explicit supersessions.
- 15 code-owned runtime gates.
- 32/32 unit and adversarial tests.
- 23/23 deterministic contract scenarios.
- An enforcement ablation where the harness admitted 0/8 injected faults and
  the schema-only control admitted 8/8.
- Two live GPT-5.6 Terra runs through ChatGPT-authenticated Codex, each passing
  15/15 gates.
- A Codex plugin and skill that make the workflow runnable without an API key.

## Defensibility

The moat is not a prompt or exclusive access to a model. It is the accumulated,
versioned decision graph:

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
