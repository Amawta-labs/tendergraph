# Production Runtime Verification

- Verified at: `2026-07-17T23:19:43-04:00`
- API runtime probe commit: `e10f3f3b2812c4158676693cdf790459991b3560`
- Final presentation freeze: `0591971`
- Canonical URL: https://openaihack.vercel.app
- Immutable URL: https://openaihack-cnzwcbkdy-amawta.vercel.app

## Public PDF ingestion

- Endpoint: `POST /api/ingest`
- Fixture: `evaluation-report.pdf`
- Result: `extracted`
- Parser: `pdfjs-dist@6.1.200`
- Pages: 4
- Evidence anchors: 8
- All anchors include page locators: yes
- Authority state: `eligible_for_review`
- SHA-256:
  `8f66f0ddf76f48c645920976948e2ff43aded7f74f56f1756145712128a43124`

## Hosted impact discovery

The uploaded document returned a `shadow` proposal with two claims marked
`review`, four unchanged claims, human review required, and all six validation
gates passing.

The synthetic correction event returned two `supersede` proposals, one
unchanged claim, human review required, all six validation gates passing, and
exact reference agreement with precision and recall of 1.0.

The hosted runtime does not inherit local ChatGPT/Codex authentication. Its
process attempt exits with code 127 and the application uses the validated
deterministic fallback. Local authenticated Codex runs and their Session IDs
remain the evidence for GPT-5.6 runtime execution.

## Video parity

- Local and hosted SHA-256:
  `65ad5cc7a51c36b884b6064db070ee36aa57d39d4e0b01afb07c7820932bd080`
- Duration: 177.200 seconds
- Video: H.264, 1920x1080
- Audio: AAC, mono, 48 kHz

## Browser verification

- Public presentation loaded at 1440 x 1000 and 390 x 844.
- The ingestion and shadow impact control plane is present in both layouts.
- Browser console: 0 errors, 0 warnings.
- No incoherent content overlap was observed; golden-case navigation remains an
  intentional horizontal scroller on mobile.
- Pixel review found and remediated an overly narrow mobile reader-title column
  by stacking its status badge below the full-width heading.
- The remediated 390 x 844 production capture gives the reader heading a
  320-pixel content track and keeps the status badge on its own row.

## Remaining external actions

The exact MP4 still must be uploaded publicly to YouTube and verified while
signed out. The resulting URL must replace `TODO_PUBLIC_YOUTUBE_URL` before the
Devpost entry is submitted.
