# Submission Media

## Primary video

- File: `../../public/tendergraph-build-week-chat-first-demo.mp4`
- Hosted copy: `https://openaihack.vercel.app/tendergraph-build-week-chat-first-demo.mp4`
- Duration: 161.600 seconds
- Video: H.264, 1920x1080, 30 fps
- Audio: AAC, mono, 48 kHz
- Integrated loudness: -17.6 LUFS
- True peak: -1.5 dBFS
- SHA-256: `89b9b3430f88c210fbf6ce9b16cbe8652ea6dc23bddab4f83d3945ec013dd0eb`

The eight narrated chapters cover the problem, evidence-bound answers, a live
Codex/GPT-5.6 composition, document ingestion, automatic impact discovery, a
corrective-resolution benchmark, verified enforcement, and the judging
criteria. The capture contains three fresh authenticated Codex runs:

- Composition: `019f739d-808a-78d1-aceb-344baf1e16f7`
- Public impact: `019f739d-b33a-7382-a906-f0750884a549`
- Correction impact: `019f739d-dda3-7133-bfa7-9be5805e97f9`

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
DEMO_URL=http://127.0.0.1:3001/?submission=public \
  node scripts/capture-live-codex-demo.mjs

CAPTURE_DIR=/tmp/tendergraph-chat-first-capture \
PIPER_PYTHON=/path/to/piper-python \
VOICE_MODEL=/path/to/en_US-lessac-medium.onnx \
  scripts/render-submission-video.sh
```

The capturer rejects missing live Codex composition, Session IDs, validation
gates, or expected impact proposals. The renderer rejects a non-anonymized
capture, missing audio, and a runtime of 180 seconds or longer.
