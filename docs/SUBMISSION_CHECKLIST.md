# Build Week Submission Checklist

This is an operational checklist derived from the supplied Official Rules. The Hackathon Website and current Official Rules remain authoritative.

## Dates

- [ ] Register by **July 21, 2026 at 5:00 PM Pacific Time**.
- [ ] Submit by **July 21, 2026 at 5:00 PM Pacific Time**.
- [ ] If needed, request promotional credits by **July 17, 2026 at 12:00 PM Pacific Time**, subject to availability and approval.
- [ ] Keep the working project available to judges without charge or restriction through **August 5, 2026 at 5:00 PM Pacific Time**.

## Entrant and ownership

- [ ] Confirm every team member is eligible in their country/territory and has no disqualifying conflict.
- [ ] Appoint one eligible team representative for the Devpost entry.
- [x] Confirm the repository is original team work and contains no Arquimed code, client data, secrets, or unlicensed assets (`0` exact source-file hash matches; placeholder-only secret scan).
- [x] Record the prior-project boundary in `docs/BUILD_WEEK_PROVENANCE.md`.
- [x] Attribute the paper, open-source packages, and public ChileCompra material in `THIRD_PARTY_NOTICES.md`.
- [x] Recheck every third-party API, dataset, font, icon, and media license before submission (`131` packages, `0` unknown licenses).

## Required project evidence

- [x] Working project uses Codex and GPT-5.6 Terra.
- [x] Project fits **Work & Productivity**.
- [x] Dated Git commits distinguish new Build Week work.
- [x] Runtime Codex session IDs are preserved in `artifacts/evals/codex-smoke.json`.
- [x] Impact-discovery Codex session IDs are preserved in `artifacts/evals/impact-smoke.json`.
- [x] Run `/feedback` in the primary Codex development thread and record that session ID in README and Devpost.
- [x] Keep timestamped Codex session evidence in `artifacts/evals/codex-smoke.json` and `artifacts/submission/live-codex-run-anonymized.json`.

## Repository and testing

- [x] Reauthenticate GitHub, create the repository, add the remote, and push `main`.
- [x] Make the repository public with the Apache-2.0 license, or share the private repository with `testing@devpost.com` and `build-week-event@openai.com`.
- [x] README explains installation, testing, Codex collaboration, product decisions, runtime use of GPT-5.6, and fallback behavior.
- [x] Judges can test https://openaihack.vercel.app without rebuilding or authentication.
- [x] Local live-Codex and plugin instructions are documented.
- [x] Redeploy the final video and confirm its hosted hash is accessible without login; recheck it through the judging period.
- [x] Run the final command set for the new freeze candidate: typecheck, 44 tests, deterministic eval, ablation, Codex composition smoke, Codex impact smoke, build, and dependency audit.

## Devpost fields

- [ ] Select **Work & Productivity**.
- [ ] Paste and proofread the English description from `docs/DEVPOST_SUBMISSION.md`.
- [x] Prepare the final repository URL in `docs/DEVPOST_FORM_COPY.md`.
- [x] Prepare the final hosted demo URL and testing instructions in `docs/DEVPOST_FORM_COPY.md`.
- [x] Prepare the primary `/feedback` Codex session ID in `docs/DEVPOST_FORM_COPY.md`.
- [ ] Verify all team members and the authorized representative are correct.

## Video

- [x] Render the 2:37 dynamic operational demo with opportunity selection, human investment approval, amendment-driven replanning, live composition, ingestion, impact discovery, correction flows, English TTS, burned captions, and no duplicate selectable subtitle track at `public/tendergraph-build-week-chat-first-demo.mp4`.
- [x] Keep the video under three minutes.
- [x] Show what was built and how Codex and GPT-5.6 were used.
- [x] Anonymize real buyer and supplier display names while preserving scores, scope, evidence anchors, and hashes.
- [x] Show dated Build Week commits and retained Codex Session IDs in the closing chapter.
- [x] Upload publicly to YouTube and record the verified URL in the submission documents.
- [x] Use no music or unlicensed third-party footage.
- [x] Use English narration throughout.
- [x] Prepare YouTube title, description, chapters, thumbnail, and settings in `docs/YOUTUBE_UPLOAD.md`.

## Final freeze

- [x] Replace every active submission placeholder; historical logs retain their original state.
- [ ] Verify the Devpost draft before the deadline; no substantive edits are guaranteed after submission closes.
- [x] Tag the deployed submission commit and preserve its production deployment.
- [ ] Export final screenshots, video, test report, Codex smoke report, and Devpost confirmation.
