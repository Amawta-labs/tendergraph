# Devpost Copy Claim Audit

Date: 2026-07-17  
Copy audited: `docs/DEVPOST_FORM_COPY.md`  
Source commit: `c768b30fa63cc54b0d867a1533352ac388cad04b`  
Verdict: **Product claims verified; external publication actions pending**

| Devpost claim | Verdict | Authoritative evidence | Preserved limit |
| --- | --- | --- | --- |
| Hash-verified public Chilean evaluation | Verified | `fixtures/golden-cases/chile-real-award.json`, snapshot manifest, hash gate, readiness audit | Commission recommendation, not proof of a signed final contract |
| GPT-5.6 Terra through ChatGPT-authenticated Codex | Verified | `artifacts/evals/codex-smoke.json`, `src/cli/codex-run.ts` | Hosted demo may use deterministic composition; local credentials are not deployed |
| 2/2 live Codex smoke runs, each 15/15 | Verified | Structured Codex smoke artifact with model, Session IDs, gates, and failures | Representative boundary test, not universal model-quality evidence |
| 32/32 unit and adversarial tests | Verified | Readiness audit and repository test suite | Count applies to the audited source state |
| 23/23 deterministic scenarios | Verified | Readiness audit, scenario registry, deterministic runner | Contract coverage, not a statistical coverage benchmark |
| Harness 0/8 versus schema-only 8/8 | Verified | Readiness audit and ablation source | Enforcement sensitivity, not exhaustive fault coverage |
| Incremental supersession and unchanged complement | Verified | Correction fixture, harness tests, captured diff | Correction is synthetic; impact discovery remains human-declared |
| Public repository and hosted demo | Verified | GitHub, Vercel, and Apache-2.0 license | YouTube and Devpost publication are still account actions |

## Publication boundary

The form copy contains one intentional placeholder:
`TODO_PUBLIC_YOUTUBE_URL`. Do not replace it until the exact final MP4 is
public on YouTube and playback has been checked while signed out.

The entrant identity, team membership, authorized representative, and final
Devpost confirmation cannot be inferred from repository evidence and must be
confirmed by the entrant.
