# Submission Media

## Primary video

- File: `../../public/tendergraph-build-week-demo.mp4`
- Hosted copy: redeploy this exact hash before using `https://openaihack.vercel.app/tendergraph-build-week-demo.mp4`
- Duration: 143.433 seconds
- Video: H.264, 1920x1080
- Audio: AAC, mono, 48 kHz
- Integrated loudness: -17.8 LUFS
- True peak: -1.5 dBFS
- SHA-256: `fdfc61d959786b1685cdf2ad5bd84594a41ffcd39189e3f854e392c23e89dc9c`

The video contains six narrated chapters: product/problem, public evidence chain,
Codex runtime and validation gates, correction benchmark, supersession diff, and
evaluation evidence. The runtime chapter contains a real authenticated localhost
click, running state, completed answer, 15/15 gates, and full Codex Session ID. It
contains no music or third-party brand footage.

The verified live browser segment is retained as `live-codex-run.mp4` with
SHA-256 `46a06cf9092a12a2480bf4c3fbc2ce895b7a35da8200de874c150e52eeb39bfd`.

## Still images

- `public-workbench.png`: public Chile evaluation workbench.
- `correction-diff.png`: visibly synthetic correction benchmark.
- `verification-evidence.png`: test, evaluation, and Codex session evidence.

## Reproduction

First run `scripts/capture-live-codex-demo.mjs` against an authenticated localhost
workbench with Firefox Marionette enabled. Then run
`scripts/render-submission-video.sh` with `LIVE_CAPTURE_DIR`, `DEMO_URL`,
`PIPER_BIN`, and `VOICE_MODEL` pointing to the verified capture, localhost demo,
Piper 1.2 binary, and English voice. The renderer rejects a capture that did not
observe both running and completed states, creates all scenes, masters the audio,
encodes H.264/AAC, and rejects videos without audio or at least 180 seconds long.
