# Demo Video Official-Rules Review

| Field | Value |
| --- | --- |
| Review date | 2026-07-16 |
| Video | `public/tendergraph-build-week-demo.mp4` |
| SHA-256 | `fdfc61d959786b1685cdf2ad5bd84594a41ffcd39189e3f854e392c23e89dc9c` |
| Runtime | 143.433 seconds |
| Format | H.264, 1920x1080, 30 fps; AAC mono, 48 kHz |
| Audio | -17.8 LUFS integrated; -1.5 dBFS true peak |
| Overall file verdict | Pass with one trademark review item |
| Overall submission verdict | Not yet compliant: public YouTube URL is missing |

## Required Video Elements

| Requirement | Verdict | Evidence |
| --- | --- | --- |
| Less than three minutes | Pass | 143.433 seconds, leaving 36.567 seconds of margin |
| Clear demonstration with audio | Pass | Six narrated chapters; visible product state, evidence view, live state transition, correction, diff, and evaluation proof |
| Explain what was built | Pass | Opening narration defines TenderGraph and the procurement problem; subsequent chapters demonstrate the evidence compiler and controlled reevaluation |
| Explain how Codex was used | Pass | Narration and screen show a ChatGPT-authenticated Codex run, full Session ID, 15 code-owned gates, two additional smoke sessions, and development-collaboration roles |
| Explain how GPT-5.6 was used | Pass | Narration explicitly identifies GPT-5.6 Terra as bounded structured composition from selected claim contracts |
| Show the project working | Pass | Recorded localhost sequence shows `Run audit`, `Running audit`, accepted result, 15/15 gates, six trace stages, and Session ID `019f6923-3056-7a32-b3c6-2ee17797f93d` |
| Publicly visible on YouTube | Fail, external | The MP4 is hosted on Vercel but `TODO_PUBLIC_YOUTUBE_URL` remains unresolved; Vercel does not satisfy the rule |
| No unauthorized music or footage | Pass | Renderer supplies Piper speech only; there is no music input or third-party footage |
| English or English translation | Pass | Narration and submission-facing UI are English; a Spanish source-section locator remains as evidence metadata, not untranslated explanatory copy |

## Judging-Criteria Read

| Criterion | Assessment | Video evidence |
| --- | --- | --- |
| Technological Implementation | Strong | Real Codex execution, bounded GPT-5.6 role, 15 gates, 30 tests, 23 scenarios, enforcement ablation, and three Session IDs |
| Design | Strong | Coherent dense workbench, evidence inspector, explicit public/synthetic states, live feedback, trace, and diff |
| Potential Impact | Strong | Concrete bidder/procurement audience and questions: who was recommended, why others lost, what proves it, and what changed |
| Quality of Idea | Strong | Auditable decision compiler plus claim-level evidence-delta contracts is differentiated from a generic tender chatbot |

## Residual Risks

### VRR-001 - YouTube publication is mandatory

- **Severity:** blocker for submission, not a defect in the MP4.
- **Finding:** the rules require a public YouTube video and a link in Devpost. The current Vercel-hosted copy is only a transfer/testing asset.
- **Action:** upload this exact hash to YouTube, set visibility to Public, verify playback while signed out, then record the URL in `docs/DEVPOST_SUBMISSION.md` and Devpost.

### VRR-002 - Real procurement evidence contains third-party trade names

- **Severity:** review before publication.
- **Finding:** no third-party logos or branded footage appear, but factual evidence and UI text display `University of Chile` and supplier names such as Comercial Hagelin and Metalurgica Silcosil. A strict reading of the rule's trademark clause could include word marks, even though the use is factual and source-attributed.
- **Action:** obtain a written clarification from Devpost/OpenAI or use a submission-video redaction that preserves scores, evidence structure, procedure ID, and the public/synthetic boundary while replacing buyer and supplier display names. This is a rules-risk decision, not a claim that the current nominative use is unlawful.

### VRR-003 - Final proof slide is static for approximately 28 seconds

- **Severity:** scoring opportunity, not compliance failure.
- **Finding:** the narration covers Codex collaboration, but the final chapter shows a static metrics/session slide rather than dated commits or development-session activity.
- **Action:** optional. Replacing 8-12 seconds of the hold with Git history or Codex session evidence would strengthen the Technological Implementation score without changing the story.

## Final Decision

The **video file is clear, under three minutes, narrated, and explicitly covers the product, Codex, and GPT-5.6**. It is materially suitable for submission. The submission does not satisfy the video rule until the exact file is public on YouTube. Before that upload, the entrant should make an explicit decision on the factual third-party names visible in the public procurement case.
