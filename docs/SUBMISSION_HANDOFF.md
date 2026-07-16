# Submission Handoff

This file contains the remaining account-bound steps after the verified local
freeze and Vercel deployment. It does not mark an external action complete
before its confirmation exists.

## Verified freeze

- Prior application freeze evidence commit: `cca2dcc` (`main`)
- Production: https://openaihack.vercel.app
- Immutable deployment: https://openaihack-iv46gogcf-amawta.vercel.app
- Anonymized presentation: https://openaihack.vercel.app/?submission=public
- Video: https://openaihack.vercel.app/tendergraph-build-week-demo.mp4
- Video SHA-256: `a80fdee4d8e3852057ae7a2365b42c2df605089f7a54e9a16d898f507a407feb`
- Video remediation evidence: `logs/video-official-rules-remediation-2026-07-16.md`
- Primary project thread Session ID: `019f615b-8a9a-7be1-bc50-65059c70d511`
- `/feedback` state: **not submitted yet**; run `/feedback` in that primary thread before using the ID in Devpost.

## GitHub publication

Authenticate the account that should own the submission repository:

```bash
gh auth login -h github.com
gh auth status
```

Then create and push the public Apache-2.0 repository:

```bash
gh repo create tendergraph --public --source . --remote origin --push \
  --description "Auditable procurement intelligence with Codex and GPT-5.6"
```

Replace `TODO_AFTER_GITHUB_REAUTH` in `docs/DEVPOST_SUBMISSION.md` with the
resulting repository URL. If the repository must be private, share it with both
judging accounts named in the Official Rules instead.

## YouTube publication

Upload `public/tendergraph-build-week-demo.mp4` using the title, description,
chapters, thumbnail, and settings in `docs/YOUTUBE_UPLOAD.md`. Verify that the
video is public and playable while signed out, then replace
`TODO_PUBLIC_YOUTUBE_URL` in `docs/DEVPOST_SUBMISSION.md`.

## Codex feedback

In the primary project thread, enter:

```text
/feedback
```

Complete the feedback flow and confirm that it identifies Session ID
`019f615b-8a9a-7be1-bc50-65059c70d511`. Only then replace
`TODO_PRIMARY_PROJECT_THREAD_FEEDBACK_ID` in `docs/DEVPOST_SUBMISSION.md`.

## Devpost

1. Select **Work & Productivity**.
2. Paste the English copy and testing instructions from `docs/DEVPOST_SUBMISSION.md`.
3. Add the public GitHub, Vercel, and YouTube URLs plus the confirmed `/feedback` Session ID.
4. Confirm entrant eligibility, team members, and the authorized representative.
5. Submit before July 21, 2026 at 5:00 PM Pacific Time and preserve the confirmation.

## Offline export

Create a portable archive containing submission copy, media, evidence, compliance
inventory, and a complete Git bundle:

```bash
scripts/export-submission-package.sh
```

The script writes a hash-verified ZIP under `/tmp` by default and does not add the
large duplicate archive to Git.
