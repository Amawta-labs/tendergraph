# Submission Handoff

This file contains the remaining account-bound steps after the verified local
freeze and Vercel deployment. It does not mark an external action complete
before its confirmation exists.

## Prior deployed chat-first video freeze

- Deployed video freeze: `6647ba992484e51639bf5a15d041310c81d57b36`
- Deployment ID: `dpl_EpiU73rtcFag2x83z1VEnSuhKtVH`
- Production: https://openaihack.vercel.app
- Immutable deployment: https://openaihack-2hrzqw5lf-amawta.vercel.app
- Anonymized presentation: https://openaihack.vercel.app/?submission=public
- Video: https://openaihack.vercel.app/tendergraph-build-week-chat-first-demo.mp4
- Local and hosted video SHA-256, verified on 2026-07-18:
  `d559ccb1a44091b8a4779bc03e33af25359039665516f03069710209fb7fc954`
- Production runtime verification:
  `logs/production-runtime-verification-2026-07-17.md`
- Final requirement-by-requirement audit:
  `logs/final-submission-completion-audit-2026-07-17.md`
- Video remediation evidence: `logs/video-official-rules-remediation-2026-07-16.md`
- Submission readiness audit: `logs/submission-readiness-audit-2026-07-17.md`
- Primary project thread Session ID: `019f615b-8a9a-7be1-bc50-65059c70d511`
- `/feedback` state: **submitted with logs**; receipt preserved at
  `artifacts/submission/codex-feedback.json`.

## Current replacement video candidate

- File: `public/tendergraph-build-week-chat-first-demo.mp4`
- Current YouTube publication to replace: https://www.youtube.com/watch?v=G0XekMloa4c
- Upload state: **the new operational cut is rendered locally and still needs
  its public YouTube upload**
- Duration: **2:37.380**
- Video SHA-256:
  `e63ebf57a953b86e93abf05d9b015af474d6b683e80cfb6848e0c43999d7c387`
- English subtitle sidecar:
  `artifacts/submission/tendergraph-build-week-chat-first-demo.en.srt`
- Subtitle SHA-256:
  `f1033a1248ca1a924abbcc6b35a9d7bace2b306f701ce9589990b17e00752aa6`
- Captions: burned into the picture; the MP4 has no selectable subtitle track
  that could duplicate them. Use the sidecar only for the YouTube caption upload.
- Runtime evidence: fresh composition and two impact-discovery Codex sessions
  preserved in `artifacts/submission/chat-first-capture.json`.
- YouTube publication: **pending replacement upload**.
- Production asset deployment: **verified against the local SHA-256**.
- Deployment ID: `dpl_DjfNadMqm9DbdxsY6V33KdmgEYb7`
- Immutable deployment: https://openaihack-eaykrr6px-amawta.vercel.app
- Production alias: https://openaihack.vercel.app

## GitHub publication

- Repository: https://github.com/Amawta-labs/tendergraph
- Visibility: **Public**
- Default branch: `main`
- License detected by GitHub: **Apache-2.0**
- Deployed submission commit: `c57007b5a5fa146c1df6924fd8a8e217d0714764`
- Submission tag: `build-week-submission-2026-07-20`

## YouTube publication

- Public video: https://www.youtube.com/watch?v=G0XekMloa4c
- Verification: YouTube oEmbed metadata and signed-out HTTP access confirmed on
  July 20, 2026.
- Upload copy and settings: `docs/YOUTUBE_UPLOAD.md`.

## Codex feedback

- Status: **Complete**
- Confirmed Session ID: `019f615b-8a9a-7be1-bc50-65059c70d511`
- Logs included: **Yes**
- Receipt: `artifacts/submission/codex-feedback.json`

## Devpost

1. Select **Work & Productivity**.
2. Use `docs/DEVPOST_FORM_COPY.md` for field-by-field paste-ready answers and
   `docs/DEVPOST_SUBMISSION.md` for the complete verified narrative. Use
   `docs/COMMERCIAL_FRONTIER_NARRATIVE.md` when checking the market,
   differentiation, commercial wedge, and source links.
3. Add the Vercel and YouTube URLs plus the confirmed `/feedback` Session ID; the public GitHub URL is already recorded.
4. Upload the gallery images in the order and with the captions listed in
   `docs/DEVPOST_FORM_COPY.md`.
5. Confirm entrant eligibility, team members, and the authorized representative.
6. Submit before July 21, 2026 at 5:00 PM Pacific Time and preserve the confirmation.

## Offline export

Create a portable archive containing submission copy, media, evidence, compliance
inventory, and a complete Git bundle:

```bash
scripts/export-submission-package.sh
```

The script writes a hash-verified ZIP under `/tmp` by default and does not add the
large duplicate archive to Git.
