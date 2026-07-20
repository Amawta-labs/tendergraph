# Submission Media

## Primary video

- File: `../../public/tendergraph-build-week-chat-first-demo.mp4`
- Hosted copy: `https://openaihack.vercel.app/tendergraph-build-week-chat-first-demo.mp4`
- Public YouTube URL: `https://www.youtube.com/watch?v=G0XekMloa4c`
- Deployment status: public on YouTube; final hosted copy pending repository sync
- English subtitles:
  `tendergraph-build-week-chat-first-demo.en.srt`, burned into the picture and
  provided separately for upload; the MP4 has no selectable subtitle track
- Duration: 140.133 seconds
- Video: H.264, 1920x1080, 30 fps
- Audio: AAC, mono, 48 kHz
- Integrated loudness: -19.1 LUFS
- True peak: -3.6 dBFS
- SHA-256: `ecf41f57aee84332a2ead51d21872567edfed770d9389b1bb57fad25c4930e79`
- Subtitle SHA-256:
  `8a2ab4e0bfd1b918aae773c95c0d9958b1c246ec8ea74a58b43b05e34c3b7c84`

## Devpost media

Upload the five 1920x1080 images under `devpost-media/` in filename order.
Their public titles and captions are maintained in
`../../docs/DEVPOST_FORM_COPY.md`.

The eight narrated chapters cover the enterprise authority risk,
evidence-bound answers, a live Codex/GPT-5.6 composition, document ingestion,
automatic impact discovery, a corrective-resolution benchmark, verified
enforcement, and the judging criteria. The capture contains three fresh
authenticated Codex runs:

- Composition: `019f8055-e5c2-7e82-9b46-b25a50ca3e26`
- Public impact: `019f8056-4e75-7631-ad74-4be23b3ea56e`
- Correction impact: `019f8056-a7f0-7cf0-bdb4-d839208acf17`

The public presentation replaces buyer and supplier display names with stable
aliases while preserving scope, scores, evidence anchors, hashes, and
decision-stage boundaries. The correction benchmark is visibly synthetic. The
video contains no music or third-party brand footage.

## Chat-first still images

- `chat-first-workbench.png`: complete public workbench.
- `chat-first-evidence.png`: addressable evidence inspector.
- `chat-first-codex-trace.png`: model, live mode, Session ID, and 15 gates.
- `chat-first-ingestion.png`: official PDF with eight extracted anchors.
- `chat-first-public-impact.png`: one shadow corroboration proposal.
- `chat-first-correction-impact.png`: two shadow supersession proposals.
- `chat-first-verification.png`: current tests, gates, and fresh Session IDs.
- `chat-first-closing.png`: judging criteria and dated Build Week history.
- `chat-first-capture.json`: machine-readable capture contract and markers.

## Reproduction

Start the authenticated local workbench, then run:

```bash
node scripts/capture-live-codex-demo.mjs \
  --url http://localhost:3001 \
  --output-dir /tmp/tendergraph-chat-first-capture-v3

CAPTURE_DIR=/tmp/tendergraph-chat-first-capture \
PIPER_PYTHON=/path/to/piper-python \
VOICE_MODEL=/path/to/en_US-lessac-medium.onnx \
  scripts/render-submission-video.sh
```

The capturer rejects missing live Codex composition, Session IDs, validation
gates, or expected impact proposals. Its v3 contract also retains six active
chapter ranges. The renderer rejects a non-anonymized capture, frozen-frame
padding, missing audio, and a runtime of 180 seconds or longer.
