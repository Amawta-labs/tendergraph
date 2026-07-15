# TenderGraph

## Agentic Procurement Intelligence for Bidders

| Field | Value |
| --- | --- |
| Document | Product, technical, evaluation, and hackathon pre-project |
| Status | Approved implementation baseline |
| Version | 1.1 |
| Last updated | July 14, 2026 |
| Build Week track | Work & Productivity |
| Entrant | Individual |
| Product language | English |
| Repository model | Public, Apache-2.0 planned |

> TenderGraph turns fragmented tender packages into evidence-backed decisions, coordinates specialist AI agents across the bidder lifecycle, and shows exactly what changed when new evidence arrives.

## 1. Executive Summary

Procurement teams work across notices, emails, PDFs, spreadsheets, forms, certificates, portals, and internal product data. Their decisions are consequential, but the work that produces them is usually fragmented and difficult to audit. Teams repeatedly answer the same questions:

- Is this opportunity worth pursuing?
- What must we submit, by whom, and by when?
- Which requirements are mandatory, scored, ambiguous, or unsupported?
- How competitive is the proposed offer?
- What happened at opening and award?
- Why did we win or lose, and what should change next time?

TenderGraph is an agentic procurement intelligence operating system for supplier-side bid teams. It covers the full lifecycle from opportunity discovery to post-award learning. Its primary product surface is a traceable decision workbench, not a generic document chat.

The system combines a jurisdiction-independent procurement model, source-specific connectors, durable multi-step agent workflows, deterministic validation tools, and an evidence graph. Every material claim must point to a source location. When a new document arrives, TenderGraph identifies the affected claims, reruns only the relevant analysis, and presents a before-and-after explanation.

The first public release proves universality through three public procurement ecosystems:

1. Chile Mercado Publico for a document-rich, item-level case.
2. European Union TED for cross-border notice ingestion.
3. United Kingdom Contracts Finder for OCDS-compatible records.

## 2. Product Thesis

### 2.1 Problem

The hard part of tender work is not summarization. It is assembling enough trustworthy evidence to make and defend a decision under time pressure.

Existing workflows commonly fail because:

- Opportunity data and tender documents live in different systems.
- Requirements are buried in prose, tables, appendices, and revisions.
- Commercial, technical, and administrative analysis happens separately.
- Spreadsheet calculations are detached from source evidence.
- New amendments force broad manual re-review.
- Opening and award analysis is not connected back to the original bid decision.
- Organizational learning remains in individual inboxes and files.

### 2.2 Product Promise

For each procurement case, TenderGraph provides:

- A normalized opportunity and lot structure.
- A go/no-go recommendation with stated assumptions.
- A requirement and responsibility matrix.
- Technical and commercial offer analysis.
- Evaluation and score simulation.
- Opening and award intelligence.
- Evidence anchors for every surfaced decision.
- Explicit gaps, conflicts, and review gates.
- Incremental reevaluation when evidence changes.
- A durable timeline of agent and human actions.

### 2.3 Primary Audience

The primary user is a **Bid or Proposal Manager** working for a supplier that participates in public or private tenders.

Secondary users are:

- Commercial leaders deciding where to allocate bid effort.
- Product and technical specialists validating compliance.
- Pricing teams testing commercial scenarios.
- Executives reviewing exposure, probability, and outcome.
- Analysts investigating opening and award results.

### 2.4 Non-Goals

TenderGraph does not:

- Submit bids autonomously.
- Provide legal advice or certify legal compliance.
- Make award decisions on behalf of a buyer.
- Hide uncertainty behind a single model-generated score.
- Treat unsupported model output as evidence.
- Assume that procurement rules are identical across jurisdictions.
- Depend on unrestricted scraping as its only ingestion strategy.

## 3. Product Principles

1. **Evidence before conclusions.** Data and source anchors appear before generated recommendations.
2. **Universal core, local policy.** Shared entities remain jurisdiction-independent; legal and portal rules live in adapters and policy packs.
3. **Agents have contracts.** Agent communication uses typed outputs, not unrestricted prose.
4. **Deterministic where possible.** Arithmetic, dates, currency conversion, hashes, file parsing, and score calculations use code.
5. **Uncertainty is a state.** Missing, conflicting, illegible, and unsupported evidence remain visible.
6. **Changes are explainable.** Every reevaluation records affected claims, prior values, new values, and causes.
7. **Humans own consequential decisions.** Agents prepare and audit evidence; users approve go/no-go and submission decisions.
8. **The demo is the product.** The judged experience must be coherent, runnable, and representative of the implementation.

## 4. Bidder Lifecycle

| Stage | Primary question | Core output | Leading agent |
| --- | --- | --- | --- |
| Discovery | Is this relevant to our portfolio? | Ranked opportunity and fit signals | Opportunity Agent |
| Go/no-go | Should we invest in this bid? | Recommendation, risks, assumptions, decision gate | Opportunity Agent |
| Intake | Do we have the complete current package? | Versioned document inventory and source manifest | Intake Agent |
| Requirements | What is required and who owns it? | Compliance and responsibility matrix | Requirements Agent |
| Technical | Can our offer meet the specifications? | Requirement-to-product comparison and gaps | Technical Agent |
| Commercial | Is the offer coherent and competitive? | Normalized prices, terms, delivery, warranty, scenarios | Commercial Agent |
| Evaluation | How will the bid likely score? | Rule model, score simulation, sensitivity analysis | Evaluation Agent |
| Opening | Who participated and what did they offer? | Supplier, item, price, term, and document comparison | Award Agent |
| Award | Who won, why, and with what evidence? | Award matrix, reasons, inconsistencies, review flags | Award Agent |
| Learning | What should change next time? | Reusable findings, competitor signals, playbook updates | Briefing Agent |

## 5. Experience Definition

### 5.1 Information Architecture

The public application uses these primary routes:

- `/opportunities` - source search, saved opportunities, and fit ranking.
- `/cases/[caseId]` - persistent procurement workspace.
- `/cases/[caseId]/requirements` - requirements and ownership matrix.
- `/cases/[caseId]/offers` - technical and commercial offer view.
- `/cases/[caseId]/evaluation` - evaluation model and score simulation.
- `/cases/[caseId]/award` - opening and award analysis.
- `/cases/[caseId]/evidence` - source inventory and evidence explorer.
- `/cases/[caseId]/timeline` - agent runs, changes, approvals, and failures.

The case workspace provides an always-visible case header with source, jurisdiction, deadline, current stage, evidence coverage, unresolved gaps, and latest run status.

### 5.2 Primary Workbench

The default case view is a dense operational workspace containing:

- Decision summary.
- Deadline and stage status.
- Agent pipeline progress.
- Requirements coverage.
- Commercial and technical alerts.
- Evidence-backed findings.
- Human review queue.
- Recent changes.

Chat is available as a contextual side panel. It may answer questions or initiate permitted workflows, but it does not replace the structured views.

### 5.3 Hero Interaction: Incremental Reevaluation

The signature workflow is:

1. The user opens a completed case.
2. TenderGraph shows the current decision and evidence coverage.
3. A new amendment or supporting document is added.
4. The system hashes, classifies, parses, and versions the document.
5. The evidence graph identifies claims and requirements that may be affected.
6. Only dependent agents rerun.
7. The Evidence Auditor checks the updated results.
8. The interface presents a diff: what changed, why, source anchors, and required human action.
9. The event is stored in the case timeline.

## 6. Agent System

### 6.1 Orchestration Model

TenderGraph owns the workflow graph, state transitions, retries, timeouts, permissions, and audit trail. GPT-5.6 performs bounded specialist reasoning within that application-controlled workflow.

The Build Week model interface is ChatGPT-authenticated Codex running GPT-5.6 Terra through the TenderGraph plugin and code-owned harness. The OpenAI Responses API remains an optional deployment adapter for environments with separate API billing. In both cases, the product owns workflow state, contracts, validation, and durability.

### 6.2 Specialist Agents

| Agent | Responsibility | Must not do |
| --- | --- | --- |
| Opportunity Agent | Fit analysis, go/no-go inputs, portfolio relevance | Invent organizational capabilities |
| Intake Agent | Source discovery, file classification, versioning, completeness | Interpret legal effect |
| Requirements Agent | Extract and classify obligations, dates, criteria, dependencies | Mark compliance without evidence |
| Technical Agent | Compare specifications against product evidence | Treat vendor claims as independently verified facts |
| Commercial Agent | Normalize amounts, currencies, units, terms, delivery, warranty | Perform untraceable arithmetic |
| Evaluation Agent | Model criteria and simulate scores | Present simulation as official result |
| Award Agent | Normalize opening and award outcomes | Infer exclusion when only non-award is known |
| Evidence Auditor | Validate claim support and block unsupported findings | Create new business conclusions |
| Briefing Agent | Produce executive summaries and next actions | Remove gaps or qualifications for readability |

### 6.3 Agent Result Contract

```ts
type AgentStatus =
  | "completed"
  | "partial"
  | "needs_review"
  | "blocked"
  | "failed";

interface AgentResult {
  runId: string;
  caseId: string;
  agent: AgentRole;
  status: AgentStatus;
  claims: Claim[];
  evidenceRefs: EvidenceRef[];
  gaps: EvidenceGap[];
  metrics: AgentMetrics;
  provenance: {
    model: string;
    promptVersion: string;
    toolVersions: Record<string, string>;
    sourceHashes: string[];
    startedAt: string;
    completedAt: string;
  };
}
```

Every `Claim` contains:

```ts
interface Claim {
  id: string;
  kind: ClaimKind;
  statement: string;
  value?: unknown;
  confidence: number;
  evidenceRefIds: string[];
  dependencyClaimIds: string[];
  requirementIds: string[];
  status: "supported" | "conflicting" | "unsupported" | "superseded";
  humanReviewRequired: boolean;
}
```

The Evidence Auditor prevents `unsupported` claims from appearing as decisions or recommendations.

## 7. Universal Procurement Model

TenderGraph uses the Open Contracting Data Standard as the public-procurement lifecycle foundation and adds bidder-side operational entities.

### 7.1 Canonical Entities

- `ProcurementCase`: the bidder's durable workspace.
- `Tender`: normalized notice and procedure.
- `Lot`: separately awardable item group.
- `Requirement`: administrative, technical, commercial, legal, or scored obligation.
- `Supplier`: buyer-visible participant or internal bidding entity.
- `Offer`: supplier-lot commercial and technical proposition.
- `EvaluationRule`: criterion, formula, weight, threshold, or exclusion rule.
- `Score`: official, simulated, reconstructed, or unknown result.
- `DocumentArtifact`: immutable original or derived file.
- `EvidenceAnchor`: page, row, cell, section, text span, image region, or API field.
- `Claim`: normalized proposition supported by evidence.
- `Decision`: human or system recommendation with dependencies.
- `EvidenceGap`: missing, unreadable, ambiguous, contradictory, or unauthorized evidence.
- `AgentRun`: durable execution record.
- `ChangeEvent`: before-and-after case mutation.

### 7.2 Jurisdiction Packs

Jurisdiction packs may add mappings, labels, portal behavior, currencies, languages, and local classifications. They may not change the meaning of core evidence states.

Initial packs:

- `cl`: Mercado Publico notices, items, attachments, opening, and award conventions.
- `eu`: TED eForms notices and European procedure metadata.
- `uk`: Contracts Finder notices and OCDS releases/records.

Future packs include `us` for SAM.gov and `private-rfp` for uploaded buyer packages.

## 8. Connectors and Corpus

### 8.1 Connector Contract

```ts
interface ProcurementConnector {
  id: "mercado-publico" | "ted" | "contracts-finder";
  search(input: SearchInput): Promise<SearchResult[]>;
  fetchNotice(externalId: string): Promise<SourceNotice>;
  listDocuments(externalId: string): Promise<SourceDocument[]>;
  fetchDocument(document: SourceDocument): Promise<DocumentArtifact>;
  fetchOutcome?(externalId: string): Promise<SourceOutcome | null>;
  snapshot(externalId: string): Promise<ConnectorSnapshot>;
}
```

Each connector must:

- Identify its official source URL.
- Preserve raw responses and source timestamps.
- Apply rate limits and bounded retries.
- Record source and document hashes.
- Distinguish live results from snapshots.
- Degrade explicitly when a source is unavailable.
- Document authentication and licensing requirements.

### 8.2 Golden Corpus Selection

Each selected case must have:

- A public and stable identifier.
- A notice or tender record.
- Multiple lots, items, or meaningful requirements.
- At least one attached or linked document when available.
- Opening or award information.
- Sufficient complexity to exercise more than one agent.
- Source terms compatible with public demonstration.

The Chilean case is the deep document-processing scenario. EU and UK cases prove that the same canonical model accepts structurally different jurisdictions. All three receive immutable repository fixtures for tests and demo fallback.

Arquimed client packages, derived private reports, credentials, and branding are excluded unless explicit written authorization is obtained. Public tender records may be re-fetched from their official sources, but TenderGraph's code and derived implementation must be new Build Week work.

## 9. Technical Architecture

### 9.1 Stack

- Next.js 16 App Router and React 19.
- TypeScript with strict mode.
- shadcn/ui primitives, Geist typography, and Lucide icons.
- PostgreSQL with Drizzle ORM for canonical state.
- Private object storage for original and derived artifacts.
- Durable workflow runtime for ingestion and agent execution.
- ChatGPT-authenticated Codex with GPT-5.6 Terra for the Build Week demo.
- Optional OpenAI Responses API adapter for separately billed deployments.
- Server-sent events or equivalent resumable event delivery for run progress.
- Vitest for unit/integration tests and Playwright for browser verification.

Vercel is the preferred public deployment platform. Vercel Workflow is the preferred durable runtime, subject to implementation-time verification against its current official API because the Workflow DevKit changes frequently.

### 9.2 Durable Workflow

The primary workflow is:

```text
create case
  -> fetch or upload sources
  -> hash and persist originals
  -> parse and render documents
  -> normalize procurement entities
  -> fan out specialist agents
  -> build claim-evidence graph
  -> audit claims
  -> synthesize decisions and gaps
  -> persist snapshot and metrics
  -> publish completion event
```

Every external call runs inside a retryable step. Fatal source or validation errors stop only the dependent branch. The workflow returns `partial` when useful audited results exist with explicit gaps.

### 9.3 State Model

```text
draft
  -> ingesting
  -> parsing
  -> analyzing
  -> auditing
  -> needs_review | ready | partial | failed
  -> reevaluating
  -> needs_review | ready | partial | failed
```

Workflow state and product state remain separate. A workflow may complete successfully while the procurement case remains `needs_review` because of conflicting evidence.

### 9.4 Storage Boundaries

- PostgreSQL stores cases, normalized entities, claims, evidence metadata, gaps, runs, and events.
- Object storage stores source files, rendered pages, extracted text, tables, snapshots, and exports.
- Secrets remain server-side and are never stored in fixtures.
- Snapshot fixtures contain only public, minimized data necessary for reproducibility.

## 10. Public Application Interfaces

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/cases` | Create a case from a connector reference or allowed upload |
| `GET` | `/api/cases/:caseId` | Read normalized workspace state |
| `POST` | `/api/cases/:caseId/runs` | Start initial analysis or an explicit rerun |
| `GET` | `/api/runs/:runId` | Read durable run status and stage summaries |
| `GET` | `/api/runs/:runId/events` | Stream or page run events |
| `GET` | `/api/cases/:caseId/evidence` | Search evidence anchors and artifacts |
| `POST` | `/api/cases/:caseId/reevaluate` | Add evidence and start dependency-aware reevaluation |
| `GET` | `/api/connectors` | List connector readiness and snapshot availability |
| `GET` | `/api/opportunities` | Search normalized public opportunities |

Public demo endpoints are rate-limited and restricted to curated cases. Arbitrary anonymous uploads and unlimited model execution are disabled. Local development retains a controlled upload path for future private-RFP work.

## 11. Evidence and Reevaluation

### 11.1 Evidence Anchors

An evidence anchor includes:

- Artifact ID and immutable hash.
- Source URL and retrieval timestamp.
- Document version.
- Page, row, cell, section, API path, or image coordinates.
- Short source excerpt where legally and technically appropriate.
- Extraction method and confidence.

### 11.2 Dependency Graph

Claims form a directed graph. Requirements, offers, scores, and decisions reference the claims they depend on. A new or superseding artifact produces candidate invalidations based on source identity, document class, entity references, and requirement mappings.

The reevaluation workflow:

1. Persists the new artifact and creates a change event.
2. Finds potentially affected evidence anchors and claims.
3. Marks affected derived claims `superseded` and records the pending replacement in the active reevaluation run.
4. Runs only the necessary parsers and specialist agents.
5. Recalculates deterministic values.
6. Audits updated claims.
7. Commits the new case version atomically.
8. Presents a human-readable diff.

## 12. Reliability, Safety, and Public Demo Controls

- No decision is displayed without audited evidence.
- Contradictions remain visible with all competing sources.
- Model timeouts and rate limits use bounded retries.
- Connector failures use labeled snapshots only when live ingestion cannot complete.
- Snapshot output must never be presented as a fresh live retrieval.
- File type, size, count, and decompression limits apply before processing.
- Active content and archive traversal are blocked.
- Public runs use per-IP and global spending limits.
- Stable, privacy-preserving safety identifiers are sent for end-user model calls where applicable.
- Logs exclude API keys, credentials, raw authorization headers, and unnecessary personal data.
- TenderGraph provides operational analysis, not legal certification.

## 13. GPT-5.6 and Codex Strategy

### 13.1 GPT-5.6 in the Product

GPT-5.6 is used meaningfully for:

- Cross-format requirement extraction.
- Entity and claim normalization.
- Technical evidence comparison.
- Evaluation-rule interpretation.
- Tool selection and bounded programmatic workflows.
- Conflict explanation and gap detection.
- Incremental impact analysis.
- Executive briefing after evidence audit.

Structured outputs and tools enforce agent contracts. Prompt caching, persisted reasoning, and model routing may be introduced only after representative evaluations demonstrate a benefit.

The implemented Build Week path packages this workflow as `plugins/tendergraph`. The plugin calls the application CLI, which runs GPT-5.6 Terra in a read-only Codex sandbox, validates the result in application code, persists the Codex session ID, and publishes a replayable artifact. It requires Codex credits and ChatGPT login, not an API key.

### 13.2 Codex in the Build

The repository README and submission materials will document:

- The primary `/feedback` session ID.
- Architecture and product decisions made with Codex.
- Code, tests, fixtures, and interface work accelerated by Codex.
- Human decisions, corrections, and approval boundaries.
- Dated commits showing work created during the submission period.
- Specific examples where Codex identified or fixed product, security, or reliability issues.

Codex usage is not represented merely by generated code volume. The evidence must show iterative product and engineering collaboration.

## 14. Evaluation Plan

### 14.1 Product Metrics

| Metric | Initial acceptance target |
| --- | --- |
| Evidence coverage for surfaced decisions | 100% |
| Claim precision on manually labeled golden cases | At least 90% |
| Requirement recall on manually labeled golden cases | At least 85% |
| Affected-claim selection in curated reevaluation tests | 100% of expected claims |
| Unsupported claims shown as decisions | 0 |
| Golden connectors completing through live or labeled fallback | 3 of 3 |
| Public case load from persisted result | Under 2 seconds at p95 target |
| First visible run progress event | Under 5 seconds at p95 target |

### 14.2 Required Scenarios

1. Successful live ingestion from each jurisdiction.
2. Snapshot fallback after a simulated source failure.
3. Missing mandatory document.
4. Conflicting dates or amounts across two official sources.
5. Illegible or unsupported document format.
6. Model response without valid evidence references.
7. Rate-limited or timed-out model call.
8. Score simulation with a deterministic formula.
9. New amendment affecting a subset of requirements.
10. New evidence that does not affect any existing claim.
11. Currency and date normalization across jurisdictions.
12. Browser verification on desktop and mobile with no overlapping content.

## 15. OpenAI Build Week Strategy

### 15.1 Track

TenderGraph enters **Work & Productivity** because it makes bid teams faster and more effective across workflow automation, analytics, sales intelligence, and back-office operations.

### 15.2 Judging Alignment

| Criterion | TenderGraph proof |
| --- | --- |
| Technological Implementation | Typed harness, live GPT-5.6 Terra through an installable Codex plugin, programmatic validation gates, evidence graph, deterministic fallback, and dated Codex collaboration |
| Design | Complete operational workbench, coherent lifecycle, navigable evidence, polished states, and a reliable end-to-end demo |
| Potential Impact | Specific bidder audience, measurable reduction in review work, and applicability across three procurement systems |
| Quality of the Idea | Claim-evidence graph, dependency-aware reevaluation, universal core with local policy packs, and explicit AI decision boundaries |

Stage One viability is demonstrated by a deployed working application, three sample cases, required OpenAI integration, a testable repository, and a reproducible fallback path.

### 15.3 Three-Minute Demo Script

| Time | Content |
| --- | --- |
| 0:00-0:20 | State the bidder problem and product promise |
| 0:20-0:45 | Import or rerun the deep Chilean case and show live agent progress |
| 0:45-1:20 | Review go/no-go, requirements, offers, simulation, and award in one workspace |
| 1:20-1:45 | Open a material claim and navigate to exact evidence |
| 1:45-2:15 | Add a new document and show dependency-aware reevaluation and diff |
| 2:15-2:35 | Switch to EU and UK cases to show the same canonical model |
| 2:35-2:55 | Explain the GPT-5.6 runtime and Codex build collaboration |
| 2:55-3:00 | Close on impact and the auditable decision promise |

The recording must show the working product. It must not rely on slides to represent unfinished behavior.

## 16. Hackathon Compliance

This section is an operational summary, not legal advice. The [Official Rules](https://openai.devpost.com/rules) always prevail and may change.

### 16.1 Controlling Dates

| Event | Official time |
| --- | --- |
| Submission period opens | July 13, 2026 at 9:00 AM PT |
| Codex credit request deadline | July 17, 2026 at 12:00 PM PT |
| Submission deadline | July 21, 2026 at 5:00 PM PT |
| Judging period | July 22, 2026 at 10:00 AM PT through August 5, 2026 at 5:00 PM PT |
| Winners announced | On or around August 12, 2026 at 2:00 PM PT |

No ability to modify the submission after the deadline should be assumed.

### 16.2 Compliance Matrix

| Requirement | Project response | Evidence artifact | Owner | Due | Status |
| --- | --- | --- | --- | --- | --- |
| Eligible entrant | Individual entrant will self-certify age, supported country, and absence of conflicts | Devpost account and pre-submit attestation | Entrant | Before submission | Verify |
| Registration | Registered for OpenAI Build Week | Devpost registration | Entrant | Complete | Done |
| Credits | Codex credit request submitted | Request confirmation | Entrant | Complete | Done |
| Correct track | Enter Work & Productivity | Devpost category field | Entrant | July 21 | Planned |
| New work | Build new implementation in this repository during the submission period | Git history and Codex sessions | Entrant | Continuous | In progress |
| Codex use | Use Codex throughout core product development | README examples and `/feedback` session ID | Entrant | July 20 | In progress |
| GPT-5.6 use | Use GPT-5.6 meaningfully in the running product | Source code, run logs, demo narration | Entrant | July 19 | Planned |
| Functionality | Project runs consistently as described and shown | Public deployment and automated tests | Entrant | July 20 | Planned |
| Repository | Public repository with relevant license | Repository URL and Apache-2.0 `LICENSE` | Entrant | July 18 | Planned |
| README | English setup, test, sample-data, Codex, and GPT-5.6 documentation | `README.md` | Entrant | July 20 | Planned |
| Demo video | Public YouTube video under three minutes with required audio | YouTube URL | Entrant | July 20 | Planned |
| Testing access | Free, unrestricted working demo through the judging period | Production URL and monitoring | Entrant | August 5 | Planned |
| Language | Submission, demo, README, and testing instructions in English | Submission package | Entrant | July 20 | Planned |
| Third-party rights | Document licenses and authorization for every API, dataset, library, and asset | `THIRD_PARTY_NOTICES.md` and source manifest | Entrant | July 19 | Planned |
| Original ownership | Exclude unauthorized client code, data, brands, and private reports | Repository audit and data manifest | Entrant | July 19 | Planned |
| Media rights | Use original/licensed visuals and no unlicensed music or marks | Video asset manifest | Entrant | July 20 | Planned |
| Submission description | Explain features, functionality, impact, and differentiation | Devpost text | Entrant | July 20 | Planned |
| Session ID | Submit the primary Codex `/feedback` session ID | Devpost field and private record | Entrant | July 21 | Planned |
| Final rule check | Re-read official rules and resolve changes | Timestamped checklist | Entrant | July 19 and July 21 | Planned |
| Submission lock | Submit before deadline and archive final materials | Devpost confirmation and release tag | Entrant | July 21 | Planned |

### 16.3 Intellectual Property Rules

- Submission code and original product materials must be owned by the entrant.
- Open-source dependencies must retain compatible licenses and notices.
- Public datasets require source-specific authorization and attribution review.
- No confidential Arquimed content may enter the repository, deployment, video, or screenshots.
- The OpenAI and Devpost names may identify the event but their branding is not treated as project-owned material.
- The entrant must verify that the project was not developed under disqualifying financial or preferential support from OpenAI or Devpost.
- Submission grants the limited promotional and judging rights described in the Official Rules; the entrant retains ownership subject to those terms.

### 16.4 Required Submission Package

- Working public deployment.
- Public code repository and license.
- English README with setup and testing instructions.
- Public sample data or reproducible fixtures.
- English Devpost project description.
- Public YouTube demo under three minutes with narration.
- Primary Codex `/feedback` session ID.
- Clear explanation of GPT-5.6 integration.
- Source and third-party license manifest.
- Final compliance and security audit.

## 17. Delivery Roadmap

The product vision is not limited to the competition window. Build Week delivery uses capability gates to produce a coherent public release without redefining the long-term product as a short-lived prototype.

### Gate 0: Provenance and Compliance

- Initialize repository and dated history.
- Add license, README baseline, and third-party manifest.
- Lock official-rule checklist and source terms.
- Confirm public-data-only boundary.

### Gate 1: Canonical Foundation

- Implement core entities, evidence anchors, claims, gaps, runs, and events.
- Create database and artifact-storage boundaries.
- Add snapshot format and validation.

### Gate 2: Source Universality

- Implement Chile, EU, and UK adapters.
- Select and freeze three golden cases.
- Verify live ingestion and snapshot fallback.

### Gate 3: Agent Intelligence

- Implement durable workflow and specialist contracts.
- Integrate GPT-5.6 structured outputs and tools.
- Add Evidence Auditor and deterministic scoring.

### Gate 4: Coherent Workbench

- Implement case navigation and lifecycle views.
- Connect live run progress, evidence navigation, gaps, and review states.
- Add desktop and mobile responsive behavior.

### Gate 5: Incremental Reevaluation

- Build dependency graph and affected-claim selection.
- Persist before-and-after versions.
- Present an evidence-backed change diff.

### Gate 6: Evaluation and Hardening

- Label golden cases.
- Run metrics and failure scenarios.
- Add rate limits, spending controls, security review, and browser verification.

### Gate 7: Submission

- Deploy public release.
- Complete README and Devpost copy.
- Record, edit, and publish the demo.
- Capture `/feedback` ID and final release tag.
- Recheck official rules and submit with buffer.

### Post-Build Week

- Private RFP ingestion and organization workspaces.
- Authentication, roles, and approval policy.
- Additional jurisdictions and enterprise connectors.
- Historical competitor intelligence.
- Portfolio and product catalog integration.
- Bid calendar, task ownership, and notifications.
- Evaluation harness expansion and tenant-level observability.

## 18. Business Hypothesis

TenderGraph is a B2B SaaS product for suppliers with recurring bid volume. The initial commercial hypothesis combines:

- Workspace or organization subscription.
- Included active procurement cases.
- Usage-based document and agent processing above plan limits.
- Enterprise connector and private deployment options.

The Build Week release validates product behavior and user value, not pricing. No revenue or market-size claim is treated as validated without evidence.

## 19. Primary Risks

| Risk | Mitigation |
| --- | --- |
| Product breadth weakens the demo | Use one deep golden case and show other jurisdictions as proof of the same model |
| Agent output is unsupported | Evidence Auditor blocks unsupported decisions |
| External sources fail | Live-first execution with visibly labeled immutable snapshots |
| Workflow exceeds runtime limits | Durable steps, fan-out, bounded retries, and resumable state |
| Universal model becomes lowest-common-denominator | OCDS-based core plus explicit jurisdiction extensions |
| Public demo creates uncontrolled API spend | Curated cases, rate limits, quotas, and persisted results |
| Prior Arquimed work creates eligibility ambiguity | New repository, new code, public-source refetch, dated history, and explicit disclosure |
| Source or media licensing causes disqualification | Rights manifest and pre-submit asset audit |
| Three-minute video becomes a feature list | Center the story on one decision and one evidence-driven change |
| Beta APIs create instability | Application-owned orchestration and replaceable provider boundaries |

## 20. Sources of Truth

- [OpenAI Build Week overview](https://openai.devpost.com/)
- [OpenAI Build Week Official Rules](https://openai.devpost.com/rules)
- [OpenAI Build Week FAQ](https://openai.devpost.com/details/faqs)
- [OpenAI Build Week resources](https://openai.devpost.com/resources)
- [OpenAI GPT-5.6 guidance](https://developers.openai.com/api/docs/guides/latest-model?model=gpt-5.6)
- [Open Contracting Data Standard](https://standard.open-contracting.org/latest/en/)
- [TED API documentation](https://docs.ted.europa.eu/api/latest/index.html)
- [UK Contracts Finder API documentation](https://www.contractsfinder.service.gov.uk/apidocumentation)
- [SAM.gov Opportunities API documentation](https://open.gsa.gov/api/get-opportunities-public-api/)
- [Mercado Publico API](https://api.mercadopublico.cl/)
- [Vercel Workflow documentation](https://vercel.com/docs/workflow)

## 21. Definition of Pre-Project Completion

This pre-project is complete when it provides a stable basis for implementation without reopening product-level decisions. Changes to audience, lifecycle, evidence policy, canonical model, agent ownership, public-data boundary, or hackathon compliance require an explicit document revision and version increment.

Implementation may refine internal schemas and component structure, but it must preserve these invariants:

1. TenderGraph is bidder-focused.
2. The workbench is the primary experience.
3. Every surfaced decision is evidence-backed.
4. Jurisdiction logic does not contaminate the canonical core.
5. Incremental reevaluation remains the defining interaction.
6. GPT-5.6 is used meaningfully in the running product.
7. Codex collaboration is documented with dated evidence.
8. The public release complies with the current Official Rules.

## 22. Harness Engineering Adoption

TenderGraph adopts the architecture described in *From Prompts to Contracts: Harness Engineering for Auditable Enterprise LLM Agents* through an independent procurement-domain implementation. The model is a replaceable composition boundary; application code owns source eligibility, claim admission, routing, answer planning, output contracts, validation, fallback, and trace generation.

The runtime authority chain is:

```text
source manifest
  -> evidence record
  -> claim candidate
  -> promoted runtime-eligible claim
  -> deterministic answer plan
  -> GPT-5.6 composition
  -> validation gates
  -> reader output + separate audit trace
```

Consequential claims require human review. This includes compliance, exclusion, causal explanations, official award interpretation, score interpretation, and bid/no-bid recommendations. Model confidence does not grant eligibility.

Every structured output has a deterministic fallback. Invalid schema, unsupported claims, unknown evidence, scope contamination, internal leakage, missing answer signals, model failure, or timeout prevents the live output from reaching the user.

Build Week uses one deep Chilean opening-and-award flow plus TED and Contracts Finder portability fixtures. The repository benchmark contains 18 fixed scenarios and a one-property fault-injection suite. Contract-preservation metrics remain separate from upstream claim correctness, which requires manual evidence verification.

The implementation contract, gates, evaluation protocol, and reference attribution are maintained in `docs/HARNESS_ENGINEERING_PLAN.md` and `THIRD_PARTY_NOTICES.md`.
