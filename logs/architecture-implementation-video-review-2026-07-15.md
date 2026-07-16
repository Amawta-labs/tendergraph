# Architecture, Implementation, and Video Review Log

| Field | Value |
| --- | --- |
| Date | 2026-07-15 |
| Scope | `PREPROJECT_TENDERGRAPH.md`, harness contract, current runtime, fixtures, evals, submission copy, and rendered demo video |
| Video | `public/tendergraph-build-week-demo.mp4` |
| Video SHA-256 | `94d49260310b081e92f5995f22b014a9993f89e29b2d93492e8b681c4e588383` |
| Reviewers | Root consolidation; cumplimiento; frontier_product; paper_rigor |
| Method | Independent document, implementation, and frame-level video reviews followed by evidence reconciliation |

## Executive Verdict

The codebase implements a credible **auditable harness vertical slice**: explicit source and claim authority, a bounded Codex composition boundary, deterministic fallback, code-owned gates, immutable local traces, a public hash-verified case, and validated evidence-delta contracts.

It does **not** yet implement the broader target architecture described in the pre-project: live connectors, document ingestion, specialist agents, durable workflows, PostgreSQL/object storage, lifecycle routes, reviewer workflow, or automatic dependency-aware reevaluation. The rendered video is technically valid as a narrated pitch reel, but it is not a complete product demonstration because all six scenes are static screenshots.

Submission language must distinguish:

- **Implemented:** harness and fixture-bound analysis.
- **Partial:** predeclared evidence-delta validation and local Codex execution.
- **Planned:** document-to-claim ingestion and automatic incremental reevaluation.

## Findings

### Blockers

#### ARV-001 - Submission identifiers remain unresolved

- **Evidence:** `docs/DEVPOST_SUBMISSION.md:8-12` contains TODO values for repository, YouTube, and `/feedback`; `git remote -v` returns no remote.
- **Impact:** the current implementation and this review cannot yet be tested from the required judging repository or public YouTube entry.
- **Action:** publish the repository, upload the final video publicly to YouTube, add the primary `/feedback` session ID, and tag the tested commit.

### Critical

#### ARV-002 - The video does not demonstrate a live Codex run

- **Evidence:** `scripts/render-submission-video.sh:27-57` captures PNG screenshots; `:93-129` loops those stills with a zoom effect. The guion requires clicking `Run audit` at `docs/VIDEO_SCRIPT.md:28`.
- **Video interval:** `00:40.98-01:09.33`.
- **Observed:** a preloaded `Codex 5.6` / `15/15` result; no cursor, click, loading state, state transition, session ID reveal, or completed request.
- **Impact:** judges may treat the file as a presentation of claims rather than a clear demo of how Codex and GPT-5.6 are used.
- **Action:** replace this segment with a real localhost recording: click `Run audit`, show the running state, then show `Codex 5.6`, session ID, trace ID, and `15/15` gates.

### High

#### ARV-003 - Automatic incremental reevaluation is overclaimed

- **Architecture promise:** add a document, hash/classify/parse it, discover affected dependencies, rerun dependent agents, audit, persist, and show the diff (`PREPROJECT_TENDERGRAPH.md:152-164`, `:401-414`).
- **Implementation:** `affectedClaims` is authored in fixture JSON. `evaluateEvidenceDelta` validates the declared changes and computes unchanged claims (`src/lib/harness/evidence-delta.ts:15-135`).
- **Video interval:** `01:09.33-01:44.93` shows the premodelled correction and its diff.
- **Impact:** “computes/identifies affected claims” implies automatic discovery that does not exist.
- **Accurate wording:** “validates and visualizes a predeclared evidence-impact contract, including explicit supersession and unchanged claims.”

#### ARV-004 - “Copied exactly from reviewed evidence” is false

- **Video narration/source:** `docs/VIDEO_SCRIPT.md:24` and `scripts/render-submission-video.sh:104`.
- **Implementation:** the body must equal `claim.statement`, not `evidence.extractedText` (`src/lib/harness/gates.ts:120-135`). Several public claims summarize or combine evidence.
- **Impact:** this overstates the epistemic guarantee and is directly falsifiable from repository fixtures.
- **Accurate wording:** “Every factual finding is an admitted claim bound to reviewed evidence; section bodies reproduce admitted claim text verbatim.”

#### ARV-005 - The target architecture is written as current product behavior

- **Claimed:** lifecycle routes, specialist agents, connectors, durable workflow, PostgreSQL, object storage, SSE, and case APIs (`PREPROJECT_TENDERGRAPH.md:105-186`, `:273-386`).
- **Implemented:** one workbench page, three harness/Codex/trace API surfaces, fixtures, and a file-backed local trace adapter (`src/app`, `src/lib/harness`).
- **Impact:** readers cannot reliably separate Build Week implementation from long-term product architecture.
- **Action:** label the pre-project as target architecture and add a dated “current vertical slice” matrix at the beginning.

#### ARV-006 - GPT-5.6's current role is narrower than the architecture states

- **Architecture claim:** extraction, normalization, comparison, evaluation-rule interpretation, conflict detection, and incremental impact analysis (`PREPROJECT_TENDERGRAPH.md:430-445`).
- **Current runtime:** GPT receives selected claims and must copy body, evidence IDs, summary, status, gaps, and recommendation exactly; its material freedom is mostly titles/headings (`src/cli/codex-run.ts:61-72`).
- **Impact:** this may look like decorative model use if narrated as procurement reasoning.
- **Action:** describe current GPT use as bounded structured composition. Move extraction/impact analysis to roadmap unless implemented before submission.

#### ARV-007 - Hosted Codex and local Codex are visually conflated

- **Evidence:** the renderer captures `https://openaihack.vercel.app` (`scripts/render-submission-video.sh:10`, `:41-42`), but hosted Vercel cannot inherit the developer's ChatGPT login and falls back deterministically (`README.md:53-55`).
- **Impact:** the video makes a preverified artifact look like a live hosted Codex execution.
- **Action:** record the live segment on authenticated localhost, label the hosted view as replay/fallback, or say “verified prior Codex run.”

#### ARV-008 - Trace durability is overgeneralized

- **Claim:** traces are immutable and recoverable across processes (`docs/VIDEO_SCRIPT.md:48`, `docs/DEVPOST_SUBMISSION.md:36`).
- **Implementation:** local writes are immutable via `wx`; Vercel stores traces in ephemeral `/tmp` (`src/lib/harness/store.ts:13-39`).
- **Impact:** cross-process local recovery is real, deployment durability is not.
- **Accurate wording:** “immutable local traces recoverable across local processes; durable hosted storage is planned.”

### Medium

#### ARV-009 - The evidence inspector is an evidence record viewer, not an exact rendered anchor

- **Implementation:** the panel shows extracted text, page, section, parser, truncated content hash, and a general canonical URL (`src/components/workbench.tsx:46-77`).
- **Missing:** page rendering, highlighted span/region, and multi-link source package.
- **Action:** call it a stored evidence anchor package, or add rendered-page deep linking/highlighting.

#### ARV-010 - Six trace stages are synthesized after execution

- **Implementation:** `buildTraceStages` creates the six-stage record from the final fixture, plan, mode, and validation results (`src/lib/harness/trace.ts:26-109`).
- **Impact:** useful audit summary, but not an event stream proving each stage occurred over time.
- **Action:** retain the current claim “six-stage audit trace”; avoid calling it a durable workflow event log.

#### ARV-011 - `official` conflates public-source provenance with decision stage

- **Implementation:** any `public_snapshot` fallback answer receives `status: official` (`src/lib/harness/fallback.ts:34-43`).
- **Video:** the public case badge says `OFFICIAL` while the evidence only establishes a commission recommendation, not a signed contract.
- **Impact:** the banner qualifies the result, but the status badge can dominate the message.
- **Action:** use `public_snapshot`, `commission_recommendation`, or separate provenance and legal-stage fields.

#### ARV-012 - Evaluation metrics need narrower labels

- **Video interval:** `01:44.93-02:08.97`.
- **Verified:** `30/30` tests, `23/23` deterministic scenarios, `0/8` harness admissions versus `8/8` schema-only, and `2/2` Codex smoke runs with `15/15` gates.
- **Scope limitation:** most scenarios are synthetic; the ablation is schema-only, not prompt-only or the paper's RQ3; the two Codex runs are smoke evidence, not stability evidence.
- **Action:** say “23 deterministic contract scenarios” and “schema-only enforcement control.”

#### ARV-013 - Architecture acceptance metrics are largely unmeasured

- **Planned metrics:** claim precision, requirement recall, connector completion, p95 load, and first progress event (`PREPROJECT_TENDERGRAPH.md:462-490`).
- **Current evidence:** contract preservation, fault detection, deterministic latency maximum, and two live composition smokes.
- **Action:** do not translate harness pass rates into extraction accuracy or connector readiness.

### Low

#### ARV-014 - Video timing documentation does not match the render

- **Document:** `docs/VIDEO_SCRIPT.md:42-56` schedules sections through `02:45`.
- **File:** `128.970 s` total; verification and collaboration are combined from `01:44.93`.
- **Action:** rewrite the document using the real six-scene boundaries below.

#### ARV-015 - Scenario count is stale in the pre-project

- **Evidence:** `PREPROJECT_TENDERGRAPH.md:729` says 18 fixed scenarios; current eval and submission material report 23.
- **Action:** update to 23 or remove the duplicated count from the target-architecture document.

## Architecture Coverage Matrix

| Architecture area | Current state | Evidence summary |
| --- | --- | --- |
| Next.js/React/TypeScript workbench | Implemented | Single dense workbench with cases, findings, evidence, delta, gates, and trace |
| Source manifests/evidence/claims | Implemented | Typed Zod contracts, explicit source eligibility, hashes, reviewed consequential claims |
| Public Chile case | Implemented, bounded | Two public source manifests, six evidence records, six claims; frozen snapshot |
| Codex/GPT-5.6 boundary | Implemented locally | Read-only Codex execution, structured schema, session ID, fallback |
| Output enforcement | Implemented | 15 code-owned gates and deterministic canonical fallback |
| Audit trace | Partial | Immutable local record and six synthesized stages; hosted storage is ephemeral |
| Reviewer governance | Partial | Reviewer fields and eligibility rule; no identity/auth/approval workflow |
| Incremental reevaluation | Partial | Strong validation of authored delta events; no document ingestion or impact discovery |
| Jurisdiction portability | Partial | Shared schema plus synthetic CL/EU/UK fixtures; no jurisdiction packs/adapters |
| Specialist agents | Absent | No Opportunity/Intake/Requirements/Technical/Commercial/Evaluation/Award agent workflow |
| Live connectors | Absent | No search/fetch/document/outcome implementations for CL, TED, or Contracts Finder |
| Durable orchestration | Absent | No workflow graph, retries by dependent branch, state machine, or event delivery |
| PostgreSQL/object storage | Absent | Filesystem and in-memory trace map only; `/tmp` on Vercel |
| Planned case APIs/routes | Absent | Only `/`, `/api/harness`, `/api/codex-run`, and `/api/traces/:traceId` exist |
| Dynamic ingestion/parsing | Absent | Public evidence and claims are curated fixture content |
| Product accuracy metrics | Absent | No measured extraction precision, requirement recall, or connector completion |

## Actual Video Timeline

| Interval | Visual | What it proves |
| --- | --- | --- |
| `00:00.00-00:18.44` | Public workbench screenshot | Coherent UI and public/snapshot qualification |
| `00:18.44-00:40.98` | Cropped evidence screenshot | Evidence metadata and source-link surface, not an interaction |
| `00:40.98-01:09.33` | Cropped runtime screenshot | A previously completed Codex result and gates, not a live run |
| `01:09.33-01:28.23` | Synthetic correction screenshot | Clear synthetic labeling and prepared correction state |
| `01:28.23-01:44.93` | Cropped correction diff | Before/after presentation of a predeclared supersession |
| `01:44.93-02:08.97` | Generated metrics slide | Summary of real repository artifacts, not terminal execution |

## Verification Record

- Video: H.264, `1920x1080`, 30 fps, `128.970 s`.
- Audio: AAC mono, 48 kHz, approximately `-16.6 dB` mean volume; no music.
- Video hash matches `artifacts/submission/README.md`.
- TypeScript: passed.
- Unit/adversarial tests: `30/30` passed.
- Deterministic scenarios: `23/23` passed.
- Enforcement ablation: harness admitted `0/8`; schema-only admitted `8/8`.
- Build: passed.
- Live Codex evidence: committed smoke artifact `2/2`; additional current manual smoke `15/15`.

## Recommended Submission Cut

### P0 - Before publishing

1. Replace the static Codex scene with a real authenticated localhost execution.
2. Correct the three overclaims: automatic impact discovery, verbatim evidence copying, and hosted trace durability.
3. Mark `PREPROJECT_TENDERGRAPH.md` as target architecture and link to an implementation-status matrix.
4. Resolve repository, YouTube, and `/feedback` TODOs; commit and tag the tested state.
5. Change the public status label from `OFFICIAL` to a source/stage-accurate label.

### P1 - Product depth

1. Implement one real `new document -> extraction/review -> affected claims -> diff` flow, or explicitly submit the narrower “validated evidence-delta contract” product.
2. Add durable hosted trace storage before claiming deployment-level recoverability.
3. Add a reviewer action boundary rather than static reviewer metadata.
4. Treat multi-agent lifecycle, live connectors, and full OCDS entities as roadmap until they execute in the judged experience.

## Final Assessment

- **Harness architecture:** strong and demonstrable.
- **Procurement product architecture:** coherent target, partially implemented.
- **Frontier interaction:** compelling concept, currently fixture-driven.
- **Video quality:** technically polished, evidentially insufficient as the sole live demo.
- **Submission readiness:** blocked by identifiers/publication and by correctable overclaims.
