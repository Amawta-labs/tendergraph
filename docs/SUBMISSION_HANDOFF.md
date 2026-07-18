# Submission Handoff

This file contains the remaining account-bound steps after the verified local
freeze and Vercel deployment. It does not mark an external action complete
before its confirmation exists.

## Verified chat-first video freeze

- Deployed video freeze: `a12286f2a408ee453cf459b08a10473dffd00089`
- Deployment ID: `dpl_wgAXqVwQAyRytc5E9FYdsT36pu95`
- Production: https://openaihack.vercel.app
- Immutable deployment: https://openaihack-9v9smulcf-amawta.vercel.app
- Anonymized presentation: https://openaihack.vercel.app/?submission=public
- Video: https://openaihack.vercel.app/tendergraph-build-week-chat-first-demo.mp4
- Local and hosted video SHA-256, verified on 2026-07-18:
  `89b9b3430f88c210fbf6ce9b16cbe8652ea6dc23bddab4f83d3945ec013dd0eb`
- Production runtime verification:
  `logs/production-runtime-verification-2026-07-17.md`
- Final requirement-by-requirement audit:
  `logs/final-submission-completion-audit-2026-07-17.md`
- Video remediation evidence: `logs/video-official-rules-remediation-2026-07-16.md`
- Submission readiness audit: `logs/submission-readiness-audit-2026-07-17.md`
- Primary project thread Session ID: `019f615b-8a9a-7be1-bc50-65059c70d511`
- `/feedback` state: **submitted with logs**; receipt preserved at
  `artifacts/submission/codex-feedback.json`.

## GitHub publication

- Repository: https://github.com/Amawta-labs/tendergraph
- Visibility: **Public**
- Default branch: `main`
- License detected by GitHub: **Apache-2.0**
- Verified presentation freeze on `origin/main`: `0591971`

## YouTube publication

Upload `public/tendergraph-build-week-chat-first-demo.mp4` using the title, description,
chapters, thumbnail, and settings in `docs/YOUTUBE_UPLOAD.md`. Verify that the
video is public and playable while signed out, then replace
`TODO_PUBLIC_YOUTUBE_URL` in `docs/DEVPOST_SUBMISSION.md`.

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
