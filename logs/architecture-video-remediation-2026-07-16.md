# Architecture and Video Remediation Log

| Field | Value |
| --- | --- |
| Date | 2026-07-16 |
| Parent review | `logs/architecture-implementation-video-review-2026-07-15.md` |
| Final video | `public/tendergraph-build-week-demo.mp4` |
| Video SHA-256 | `fdfc61d959786b1685cdf2ad5bd84594a41ffcd39189e3f854e392c23e89dc9c` |
| Runtime | 143.433 seconds, H.264 1920x1080, AAC mono 48 kHz |
| Audio | -17.8 LUFS integrated, -1.5 dBFS true peak |

## Resolution Summary

- **Resolved:** ARV-002 through ARV-008, ARV-011, ARV-012, ARV-014, and ARV-015.
- **Accepted and explicitly bounded:** ARV-009, ARV-010, and ARV-013.
- **Still open:** ARV-001, because the GitHub repository URL, public YouTube URL, and primary `/feedback` identifier require external publication/account actions.

## Evidence

### Live Codex demonstration

- The browser automation clicked `.run-button`, observed it disabled with the `Running audit` label, and observed a successful completed state.
- Live elapsed time: 9,171 ms.
- Codex Session ID: `019f6923-3056-7a32-b3c6-2ee17797f93d`.
- Result: 15/15 code-owned gates passed with `decisionStage=commission_recommendation`.
- Capture contract: `tendergraph-live-browser-capture.v1`; 35 frames at 400 ms intervals.
- Retained segment: `artifacts/submission/live-codex-run.mp4`, SHA-256 `46a06cf9092a12a2480bf4c3fbc2ce895b7a35da8200de874c150e52eeb39bfd`.
- Final smoke sessions: public `019f6931-199d-7070-9b6e-0142bc573fa5`; correction `019f6931-3d99-7df1-86e6-b99ce0fc370a`.

### Truth-boundary changes

- The pre-project now labels the complete design as target architecture and includes a dated current-vertical-slice matrix.
- Automatic impact discovery is no longer claimed; the implemented feature is a validated predeclared evidence-delta contract.
- The copy now says answer sections reproduce admitted claim text, not raw evidence text.
- GPT-5.6 is described as bounded structured composition in the current implementation.
- Hosted fallback/replay and authenticated local Codex execution are distinguished.
- Trace durability is scoped to recoverable local ledgers; hosted durable storage remains a production boundary.
- The answer model separates source provenance from legal decision stage. The public UI now displays `PUBLIC SNAPSHOT · COMMISSION RECOMMENDATION`.
- Metrics now say deterministic contract scenarios and schema-only enforcement control.

## Final Video Timeline

| Interval | Evidence shown |
| --- | --- |
| `00:00-00:18` | Product and hash-verified public workbench |
| `00:18-00:45` | Public evidence record and provenance boundary |
| `00:45-01:15` | Real localhost click, running state, completed Codex result, gates, and Session ID |
| `01:15-01:38` | Visibly synthetic predeclared corrective-resolution contract |
| `01:38-01:55` | Exact before/after claim diff and supersession reasons |
| `01:55-02:23` | Contract tests, deterministic scenarios, ablation, and three recorded live Session IDs |

## Remaining Submission Actions

1. Publish or share the repository with the judging accounts and replace the repository TODO.
2. Upload this exact MP4 publicly to YouTube and replace the video TODO.
3. Run `/feedback` in the primary project thread and replace its TODO.
4. Tag the final submitted commit. The hosted asset already matches the hash recorded above.
