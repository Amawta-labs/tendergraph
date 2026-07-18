# Submission Media

## Primary video

- File: `../../public/tendergraph-build-week-demo.mp4`
- Hosted copy: `https://openaihack.vercel.app/tendergraph-build-week-demo.mp4` (redeploy verification pending)
- Duration: 177.200 seconds
- Video: H.264, 1920x1080
- Audio: AAC, mono, 48 kHz
- Integrated loudness: -17.7 LUFS
- True peak: -1.7 dBFS
- SHA-256: `65ad5cc7a51c36b884b6064db070ee36aa57d39d4e0b01afb07c7820932bd080`

The video contains eight narrated chapters: product/problem, public evidence
chain, Codex runtime and validation gates, document ingestion and automatic
impact discovery, correction benchmark, supersession diff, verification
metrics, and Codex collaboration evidence. The runtime
chapter contains a real authenticated localhost click, running state, completed
answer, 15/15 gates, and full Codex Session ID. The public presentation replaces
buyer and supplier display names with stable aliases while preserving scope,
scores, evidence anchors, and hashes. It contains no music or third-party brand
footage.

The verified live browser segment is retained as
`live-codex-run-anonymized.mp4` with SHA-256
`c3f9b316ec89aeaa20316e2aac69488c6897f56dfb5d275e893474585bea86a8`.

## Still images

- `public-workbench.png`: public Chile evaluation workbench.
- `impact-discovery.png`: anonymized multi-format ingestion and shadow impact proposal.
- `correction-diff.png`: visibly synthetic correction benchmark.
- `verification-evidence.png`: test, evaluation, and Codex session evidence.
- `codex-collaboration.png`: dated commits and retained Codex Session IDs.

## Reproduction

First run `scripts/capture-live-codex-demo.mjs` against an authenticated localhost
workbench with Firefox Marionette enabled. Then run
`scripts/render-submission-video.sh` with `LIVE_CAPTURE_DIR`, `DEMO_URL`,
`PIPER_BIN`, and `VOICE_MODEL` pointing to the verified capture, localhost demo,
Piper 1.2 binary, and English voice. The renderer rejects a capture that did not
observe both running and completed states, creates all scenes, masters the audio,
encodes H.264/AAC, and rejects videos without audio or with a duration of 180
seconds or longer.
