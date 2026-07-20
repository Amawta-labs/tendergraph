# Submission Media

## Primary video

- File: `../../public/tendergraph-build-week-chat-first-demo.mp4`
- Hosted copy: `https://openaihack.vercel.app/tendergraph-build-week-chat-first-demo.mp4`
- Current public YouTube URL: `https://youtu.be/08tWuzAmOcs`
- Upload status: verified public through YouTube oEmbed metadata; the local and
  hosted filenames remain unchanged.
- English subtitles:
  `tendergraph-build-week-chat-first-demo.en.srt`, burned into the picture and
  provided separately for upload; the MP4 has no selectable subtitle track
- Duration: 157.380 seconds
- Video: H.264, 1920x1080, 30 fps
- Audio: AAC, mono, 48 kHz
- Integrated loudness: -19.0 LUFS
- True peak: -2.2 dBFS
- SHA-256: `e63ebf57a953b86e93abf05d9b015af474d6b683e80cfb6848e0c43999d7c387`
- Subtitle SHA-256:
  `f1033a1248ca1a924abbcc6b35a9d7bace2b306f701ce9589990b17e00752aa6`

## Devpost media

Upload the seven 1920x1080 production captures under
`devpost-media-operational/` in filename order.
Their public titles and captions are maintained in
`../../docs/DEVPOST_FORM_COPY.md`.

The eight narrated chapters cover the one-week bidding problem, seven bounded
agents, human approval, evidence-bound answers, a live Codex/GPT-5.6
composition, document ingestion, automatic impact discovery, a
corrective-resolution benchmark, and verified enforcement. The capture
contains three fresh
authenticated Codex runs:

- Composition: `019f810e-f312-75c2-a9a6-6349bc58777a`
- Public impact: `019f810f-574e-7d12-bec9-34cebbe48a22`
- Correction impact: `019f810f-c3c6-7602-9268-b608a9acdba5`

The public presentation replaces buyer and supplier display names with stable
aliases while preserving scope, scores, evidence anchors, hashes, and
decision-stage boundaries. The correction benchmark is visibly synthetic. The
video contains no music or third-party brand footage.

## Chat-first still images

- `lifecycle-workspace.png`: ranked opportunities and the seven-stage workspace.
- `lifecycle-selected.png`: bidder selection awaiting investment approval.
- `lifecycle-amendment.png`: new amendment with one changed and four unchanged requirements.
- `lifecycle-replanned.png`: two affected tasks reopened by amendment v2.
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
  --output-dir /tmp/tendergraph-chat-first-capture

CAPTURE_DIR=/tmp/tendergraph-chat-first-capture \
PIPER_PYTHON=/path/to/piper-python \
VOICE_MODEL=/path/to/en_US-lessac-medium.onnx \
  scripts/render-submission-video.sh
```

The capturer rejects missing live Codex composition, Session IDs, validation
gates, or expected impact proposals. Its v5 contract also retains six active
chapter ranges. The renderer rejects a non-anonymized capture, frozen-frame
padding, missing audio, and a runtime of 180 seconds or longer.
