# Paper Adoption Audit

## Source reviewed

- Paper: *From Prompts to Contracts: Harness Engineering for Auditable Enterprise LLM Agents*
- arXiv identifier: `2607.08028v1`
- Reviewed local files: `2607.08028v1.pdf` and `2607.08028v1-1.pdf`
- SHA-256 for both files: `d90ad4ee4e445512e930a291fee7d10ec43c662e7a920eccafd6740cd6f8eb64`
- Result: the two PDFs are byte-identical.

## Contract mapping

| Paper contract | TenderGraph implementation | Status |
| --- | --- | --- |
| Registered source manifests | `SourceManifestSchema` records scope, locator, hashes, status, runtime policy, issuer, selection rule, and retrieval mode | Implemented |
| Evidence records | `EvidenceRecordSchema` binds extracted text, hash, locator, parser, and source manifest | Implemented |
| Runtime-eligible promoted claims | Claim status, risk tier, promotion reason, reviewer, review timestamp, and `isRuntimeEligible` | Implemented |
| Entity routing | Explicit fixture ID resolves a bounded procedure/lot scope; scope isolation is validated | Bounded adaptation |
| Deterministic answer plan | `buildAnswerPlan` owns intent, selected claims, required signals, prohibited assertions, and output contract | Implemented |
| Replaceable composition boundary | Deterministic composer, optional Responses API composer, and ChatGPT-authenticated Codex composer share the same contract | Implemented |
| Invalid live-output recovery | Invalid, unavailable, or timed-out model composition is discarded and replaced deterministically | Implemented |
| Reader/audit separation | Structured reader answer is separate from an immutable trace; internal identifiers are blocked from prose | Implemented |
| Stage-by-stage trace | Six ordered stages record routing, source state, selected claims, plan, composition, and output validation artifacts | Implemented |
| Source eligibility gate | Used evidence must resolve to an eligible `claim_authority` source | Implemented |
| Domain language gate | Unbounded bid/no-bid instructions and synthetic official-decision language are blocked in model-composed prose | Implemented adaptation |
| Reader-facing source links | Evidence inspector renders the selected anchor and its stored manifest URL; a multi-link answer package is not implemented | Bounded adaptation |
| Follow-up filter | The procurement output uses review gaps and evidence inspection rather than generated follow-up questions | Deliberate adaptation |
| Maintained wiki context | No wiki layer is used; fixtures and promoted claims are small enough to remain the direct authority/context package | Deliberate omission |
| Incremental source update | Evidence delta events identify affected, invalidated, superseded, replacement, and unchanged claims | TenderGraph extension |
| Raw model-output retention | Rejected/raw candidates are deleted; the retained candidate record contains only hash, character count, and schema-validity status | Implemented |

## Experimental evidence

| Paper experiment | Current TenderGraph evidence | Claim boundary |
| --- | --- | --- |
| Fixed scenarios | 23 deterministic scenarios plus 30 unit/adversarial tests | Contract preservation only; not factual-accuracy proof |
| Fault injection | Eight controlled mutations; harness admits `0/8`, schema-only admits `8/8` | Enforcement sensitivity against schema-only admission |
| Live composition boundary | Two Codex/GPT-5.6 Terra smoke runs | Proves the Codex boundary works; not model substitution |
| RQ2 model substitution | Not replicated | Do not claim multi-model robustness or the paper's 270-run result |
| RQ3 enforcement-layer ablation | Not replicated | Current ablation is not prompt-only vs external guardrail with a held-fixed live model |
| Runtime-interface benchmark | Deterministic latency gate and per-run timing | No cache/prewarm comparison or latency distribution claim |

## Review conclusion

TenderGraph adopts the paper's central engineering mechanism where it matters: source authority, claim admission, deterministic planning, replaceable composition, validation, recovery, and an auditable process trace are application-owned runtime code. The implementation is not a reproduction of the paper's empirical study. Submission material must keep the current deterministic ablation, two-run Codex smoke, and paper RQ2/RQ3 results clearly separate.
