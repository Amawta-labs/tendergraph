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
- [ ] Confirm the repository is original team work and contains no Arquimed code, client data, secrets, or unlicensed assets.
- [x] Record the prior-project boundary in `docs/BUILD_WEEK_PROVENANCE.md`.
- [x] Attribute the paper, open-source packages, and public ChileCompra material in `THIRD_PARTY_NOTICES.md`.
- [ ] Recheck every third-party API, dataset, font, icon, and media license before submission.

## Required project evidence

- [x] Working project uses Codex and GPT-5.6 Terra.
- [x] Project fits **Work & Productivity**.
- [x] Dated Git commits distinguish new Build Week work.
- [x] Runtime Codex session IDs are preserved in `artifacts/evals/codex-smoke.json`.
- [ ] Run `/feedback` in the primary Codex development thread and record that session ID in README and Devpost.
- [ ] Keep timestamped Codex logs/session history available if Devpost requests evidence.

## Repository and testing

- [ ] Reauthenticate GitHub, create the repository, add the remote, and push `main`.
- [ ] Make the repository public with the Apache-2.0 license, or share the private repository with `testing@devpost.com` and `build-week-event@openai.com`.
- [x] README explains installation, testing, Codex collaboration, product decisions, runtime use of GPT-5.6, and fallback behavior.
- [x] Judges can test https://openaihack.vercel.app without rebuilding or authentication.
- [x] Local live-Codex and plugin instructions are documented.
- [x] Confirm the final hosted URL is accessible without login; recheck it before submission and through the judging period.
- [ ] Run the final command set on the submitted commit: typecheck, tests, deterministic eval, ablation, Codex smoke, build, and dependency audit.

## Devpost fields

- [ ] Select **Work & Productivity**.
- [ ] Paste and proofread the English description from `docs/DEVPOST_SUBMISSION.md`.
- [ ] Add the final repository URL.
- [ ] Add the final hosted demo URL and testing instructions.
- [ ] Add the primary `/feedback` Codex session ID.
- [ ] Verify all team members and the authorized representative are correct.

## Video

- [x] Render a clear 2:09 demo with English audio at `public/tendergraph-build-week-demo.mp4`.
- [x] Keep the video under three minutes.
- [x] Show what was built and how Codex and GPT-5.6 were used.
- [ ] Upload publicly to YouTube and add the URL to Devpost.
- [x] Use no music or unlicensed third-party footage.
- [x] Use English narration throughout.
- [x] Prepare YouTube title, description, chapters, thumbnail, and settings in `docs/YOUTUBE_UPLOAD.md`.

## Final freeze

- [ ] Replace every `TODO_` marker in submission documents.
- [ ] Verify the Devpost draft before the deadline; no substantive edits are guaranteed after submission closes.
- [ ] Tag the submitted commit and preserve its deployment.
- [ ] Export final screenshots, video, test report, Codex smoke report, and Devpost confirmation.
