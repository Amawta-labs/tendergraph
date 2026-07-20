# Submission Media

## Primary video

- File: `../../public/tendergraph-build-week-chat-first-demo.mp4`
- Hosted copy: `https://openaihack.vercel.app/tendergraph-build-week-chat-first-demo.mp4`
- Current public YouTube URL: `https://www.youtube.com/watch?v=G0XekMloa4c`
- Upload status: the regenerated lifecycle video still needs a new public
  YouTube upload; the local and hosted filenames are unchanged.
- English subtitles:
  `tendergraph-build-week-chat-first-demo.en.srt`, burned into the picture and
  provided separately for upload; the MP4 has no selectable subtitle track
- Duration: 144.212 seconds
- Video: H.264, 1920x1080, 30 fps
- Audio: AAC, mono, 48 kHz
- Integrated loudness: -18.7 LUFS
- True peak: -2.94 dBFS
- SHA-256: `b4d8539492e30df9eb4e2c6722adab2dca01d4bd91344943b501f27066358638`
- Subtitle SHA-256:
  `01f7aa9b8b4e02ccf1d271ca200732f0933a64c90866f563b642a52f083497b4`

## Devpost media

Upload the five 1920x1080 images under `devpost-media/` in filename order.
Their public titles and captions are maintained in
`../../docs/DEVPOST_FORM_COPY.md`.

The eight narrated chapters cover the one-week bidding problem, seven bounded
agents, human approval, evidence-bound answers, a live Codex/GPT-5.6
composition, document ingestion, automatic impact discovery, a
corrective-resolution benchmark, and verified enforcement. The capture
contains three fresh
authenticated Codex runs:

- Composition: `019f80e7-9b52-7b10-ae3d-35df0aa2b250`
- Public impact: `019f80e7-f8ff-7360-a5cc-4934d722072a`
- Correction impact: `019f80e8-525e-7c30-9382-1e073464ce6b`

The public presentation replaces buyer and supplier display names with stable
aliases while preserving scope, scores, evidence anchors, hashes, and
decision-stage boundaries. The correction benchmark is visibly synthetic. The
video contains no music or third-party brand footage.

## Chat-first still images

- `lifecycle-workspace.png`: ranked opportunities and the seven-stage workspace.
- `lifecycle-approved.png`: qualification approved with compliance still blocked.
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
  --output-dir /tmp/tendergraph-chat-first-capture-v4

CAPTURE_DIR=/tmp/tendergraph-chat-first-capture \
PIPER_PYTHON=/path/to/piper-python \
VOICE_MODEL=/path/to/en_US-lessac-medium.onnx \
  scripts/render-submission-video.sh
```

The capturer rejects missing live Codex composition, Session IDs, validation
gates, or expected impact proposals. Its v4 contract also retains six active
chapter ranges. The renderer rejects a non-anonymized capture, frozen-frame
padding, missing audio, and a runtime of 180 seconds or longer.
