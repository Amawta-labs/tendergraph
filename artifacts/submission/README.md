# Submission Media

## Primary video

- File: `../../public/tendergraph-build-week-chat-first-demo.mp4`
- Hosted copy: `https://openaihack.vercel.app/tendergraph-build-week-chat-first-demo.mp4`
- Hosted hash verified against the local file on 2026-07-18
- Duration: 137.267 seconds
- Video: H.264, 1920x1080, 30 fps
- Audio: AAC, mono, 48 kHz
- Integrated loudness: -19.1 LUFS
- True peak: -2.8 dBFS
- SHA-256: `d559ccb1a44091b8a4779bc03e33af25359039665516f03069710209fb7fc954`

The eight narrated chapters cover the problem, evidence-bound answers, a live
Codex/GPT-5.6 composition, document ingestion, automatic impact discovery, a
corrective-resolution benchmark, verified enforcement, and the judging
criteria. The capture contains three fresh authenticated Codex runs:

- Composition: `019f73bb-ecaa-7f41-b2e9-0561fff2df38`
- Public impact: `019f73bc-407f-7ad1-8ce5-7c67611da649`
- Correction impact: `019f73bc-9b0c-7fb0-b6ee-81f3e3eec8d4`

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
