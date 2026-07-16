# Demo Video Official-Rules Remediation

| Field | Value |
| --- | --- |
| Remediation date | 2026-07-16 |
| Video | `public/tendergraph-build-week-demo.mp4` |
| SHA-256 | `a80fdee4d8e3852057ae7a2365b42c2df605089f7a54e9a16d898f507a407feb` |
| Runtime | 148.083 seconds |
| Format | H.264, 1920x1080, 30 fps; AAC mono, 48 kHz |
| Audio | -17.9 LUFS integrated; -1.9 dBFS true peak |
| New browser Session ID | `019f698f-55a0-7801-8461-dbb0fa9c2c13` |
| Browser gates | 15/15 |

## Closed Findings

### VRR-002 - Real procurement display names

- **Status:** resolved in the submission presentation.
- The public-facing route `?submission=public` replaces the real buyer and all
  eight supplier display names with stable aliases.
- The procedure ID, scores, evidence IDs, page/section locators, parser version,
  content hashes, decision-stage boundary, and validation results remain intact.
- The interface explicitly states that display names are anonymized and that
  hashes refer to the frozen underlying evidence.
- The underlying fixture and source records are not mutated.
- The public workbench capture and the newly recorded live Codex segment both
  use this route. The correction case remains visibly synthetic.

### VRR-003 - Static final proof slide

- **Status:** resolved.
- The former 28-second static close is split into two scenes.
- `01:55-02:09` shows contract tests, deterministic scenarios, live smoke runs,
  and the enforcement ablation.
- `02:09-02:29` shows five dated Build Week commits and three retained Codex
  runtime Session IDs while the narration explains the Codex collaboration and
  the human-owned product and truth-boundary decisions.

## Verification

- TypeScript: passed.
- Tests: 32/32 passed, including two display-redaction contract tests.
- Renderer shell syntax and capture-script syntax: passed.
- New live capture: observed click, running state, completed state, full Session
  ID, and 15/15 gates in 33 frames.
- Visual contact-sheet review: public static scenes and the live scene contain
  aliases; the final collaboration scene is legible at 1920x1080.
- Duration check: passed with 31.917 seconds of margin below three minutes.
- Audio stream and loudness check: passed.
- Production build and deployment: passed at
  `https://openaihack-iv46gogcf-amawta.vercel.app`.
- Canonical and immutable anonymized routes: HTTP 200.
- Hosted video SHA-256: exact match with the local final MP4.

## Remaining External Requirement

VRR-001 remains open only for the account-bound publication step. The exact MP4
is deployed and hash-matched; it must still be uploaded to YouTube with Public
visibility, verified while signed out, and linked from Devpost.
