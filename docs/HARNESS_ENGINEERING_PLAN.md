# TenderGraph Harness Engineering Contract

| Field | Value |
| --- | --- |
| Status | Implemented vertical slice |
| Contract version | `harness.v1` |
| Output version | `structured_tender_answer.v1` |
| Build Week composer | ChatGPT-authenticated Codex with `gpt-5.6-terra` |
| Optional composer | OpenAI Responses API with `gpt-5.6` |
| Runtime authority | Application-owned harness |

## 1. Adoption Decision

TenderGraph independently reimplements the harness engineering pattern described in *From Prompts to Contracts: Harness Engineering for Auditable Enterprise LLM Agents*. The adoption target is a Level 5 traceable harness: deterministic product behavior lives in schemas, policies, validation gates, and trace artifacts rather than prompt prose.

The reference repository is an architectural input, not a code dependency. This preserves project ownership, keeps the procurement model domain-specific, and makes Build Week additions distinguishable in Git history.

## 2. Authority Model

| Layer | May support a reader-facing claim? | Purpose |
| --- | --- | --- |
| Original artifact | Yes | Primary authority |
| `SourceManifest` | Indirectly | Identity, hash, source, license, version, retrieval mode |
| `EvidenceRecord` | Yes | Addressable excerpt or field from an artifact |
| Candidate claim | No | Unreviewed extraction result |
| Eligible promoted claim | Yes | Runtime-admitted proposition |
| Case brief or wiki | No | Navigation and non-authoritative context |
| GPT-5.6 output | No by itself | Reader-oriented composition |
| Audit trace | No | Reproducibility and enforcement evidence |

Runtime answers may use only claims selected in the deterministic `AnswerPlan`. The composer cannot introduce a new claim or evidence identifier.

## 3. Runtime Pipeline

1. Resolve jurisdiction, procedure, lot, buyer, supplier, and intent.
2. Load immutable source manifests and verify content hashes.
3. Resolve evidence records to known source manifests.
4. Admit low-risk deterministic claims automatically when structural checks pass.
5. Require reviewer identity and timestamp for consequential claims.
6. Exclude pending, rejected, conflicting, and superseded claims.
7. Build an `AnswerPlan` containing scope, selected claims, required signals, prohibited assertions, and output contract.
8. Send only the plan, admitted claims, and their evidence to GPT-5.6.
9. Validate output schema, claim admission, evidence grounding, source integrity, scope isolation, completeness, hygiene, trace completeness, and latency.
10. If any live-composition step fails, discard it and compose deterministically from the same plan.
11. Return reader output and persist the audit trace separately.

The implemented public Chile case also validates an `EvidenceDeltaEvent`. The
event must name every claim that consumes newly added evidence, reproduce the
current claim's exact evidence set, and prove that the prior evidence set is a
strict subset. Unlisted consumers make the delta invalid. This provides the
first code-owned dependency boundary for incremental reevaluation.

## 4. Procurement Governance

### Automatic admission

Low-risk claims may be promoted when they are direct, deterministic representations of an explicit source field. Examples include dates, named participants, listed documents, published amounts, and explicit scores.

### Human review

The following remain ineligible until reviewed:

- Winner and exclusion conclusions.
- Causal explanations of loss.
- Legal, administrative, or technical compliance.
- Official-versus-simulated score interpretation.
- Bid/no-bid or other consequential recommendations.

Reviewing document presence does not establish document validity. Non-award does not establish exclusion. A simulation must never be labelled official.

### Conflict and supersession

New evidence creates a new claim revision. It never mutates an existing claim in place. Contradictory claims remain blocked, and supersession retains the old claim and its evidence for audit.

## 5. Composition Boundary

`src/cli/codex-run.ts` is the Build Week live-model boundary. It invokes ChatGPT-authenticated Codex with `gpt-5.6-terra`, a read-only sandbox, and a strict JSON Schema. Application code creates the exact input contract before the model run and validates the candidate afterward. The trace records the Codex session ID, model, composition surface, gates, and timing.

`composeWithOpenAI` is retained as an optional Responses API adapter for deployments with separate API billing. It is not required for the hackathon demo and returns no unvalidated prose.

The deterministic composer is a production behavior, not a test mock. It provides complete structured output for award explanations, opening comparisons, compliance evidence, and case overviews whenever live composition is invalid or unavailable.

The public UI exposes the resulting composition mode. Snapshot data, simulation status, pending review, and insufficient evidence are visible states.

## 6. Validation Gates

| Gate | Failure code | Enforcement |
| --- | --- | --- |
| Output schema | `INVALID_OUTPUT_SCHEMA` | Fallback |
| Claim admission | `UNPROMOTED_OR_UNSELECTED_CLAIM` | Fallback |
| Evidence grounding | `UNKNOWN_EVIDENCE` | Fallback |
| Source integrity | `BROKEN_SOURCE_LINK` | Block or fallback |
| Scope isolation | `SCOPE_CONTAMINATION` | Block or fallback |
| Answer completeness | `MISSING_EXPECTED_CLAIM` | Fallback |
| Output hygiene | `INTERNAL_CONTENT_LEAKAGE` | Block and fallback |
| Trace completeness | `INCOMPLETE_TRACE` | Operational failure |
| Latency budget | `LATENCY_BUDGET_EXCEEDED` | Record and degrade |

Reader output never contains system prompts, hidden policies, secrets, or internal trace content. The trace records model, mode, contract version, scope, sources, evidence, claims, validation results, fallback reason, and timings.

## 7. Evaluation Protocol

The repository includes 18 fixed scenarios: 12 Chile, 3 TED, and 3 Contracts Finder. Each declares the question, fixture, expected claim IDs, and expected status. The deterministic suite is the reproducible baseline; live GPT-5.6 repetitions can be layered on without changing expected assertions.

Eight one-property fault injections verify enforcement:

1. Missing expected claim.
2. Wrong procedure routing.
3. Missing trace field.
4. Missing answer signal.
5. Internal-content leakage.
6. Unknown evidence reference.
7. Evidence linked to a missing source manifest.
8. Latency over budget.

Acceptance targets are zero unsupported reader-facing claims, zero cross-procedure contamination, 100% detection of the defined fault injections, 100% deterministic fallback success, and less than 500 ms deterministic harness runtime in the benchmark environment.

Contract preservation is not evidence of upstream factual quality. Before replacing synthetic fixtures, every displayed golden-case claim must be manually checked against its exact public source. Consequential claims require 100% reviewer agreement; general benchmark factual accuracy targets at least 95%.

## 8. Build Week Delivery

The implemented vertical slice covers the harness contracts, synthetic jurisdiction fixtures, live GPT-5.6 boundary, deterministic fallback, workbench, benchmark, and fault-injection suite.

The next implementation gates are:

1. Replace the Chile fixture with an authorized public snapshot and complete manual labels.
2. Add live connector adapters while retaining immutable snapshot fallback.
3. Persist manifests, evidence, claim revisions, and traces in PostgreSQL/object storage.
4. Add a reviewer identity boundary and durable approval workflow.
5. Repeat all 18 live scenarios three times and publish stability, completeness, refusal, and latency results.
6. Run the harness-versus-prompt-only ablation with identical data and model settings.
7. Record the three-minute demo from the deployed, tested build.

## 9. References and Licensing

- Joongho Ahn and Moonsoo Kim, *From Prompts to Contracts: Harness Engineering for Auditable Enterprise LLM Agents*, arXiv:2607.08028v1, July 9, 2026.
- Reference baseline: `hammerbaki/enterprise-llm-agent-harness`, tag `public-baseline-v0.5.16.4`, commit `e8e60fb8ea6e34d4caa53f00187e760b67bd973a`.
- Reference software license: MIT. Reference data, documentation, and evaluations: CC BY 4.0.

No reference implementation source was copied into TenderGraph. Any future reuse must record the exact file, upstream commit, applicable license, and local modifications in `THIRD_PARTY_NOTICES.md`.
