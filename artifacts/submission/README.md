# Submission Media

## Primary video

- File: `tendergraph-build-week-demo.mp4`
- Duration: 128.970 seconds
- Video: H.264, 1920x1080
- Audio: AAC, mono, 48 kHz
- Integrated loudness: -16.6 LUFS
- True peak: -1.3 dBFS
- SHA-256: `94d49260310b081e92f5995f22b014a9993f89e29b2d93492e8b681c4e588383`

The video contains six narrated chapters: product/problem, public evidence chain,
Codex runtime and validation gates, correction benchmark, supersession diff, and
evaluation evidence. It contains no music or third-party brand footage.

## Still images

- `public-workbench.png`: public Chile evaluation workbench.
- `correction-diff.png`: visibly synthetic correction benchmark.
- `verification-evidence.png`: test, evaluation, and Codex session evidence.

## Reproduction

Run `scripts/render-submission-video.sh` with `PIPER_BIN` and `VOICE_MODEL`
pointing to a local Piper 1.2 installation and an English Piper voice. The
renderer captures `https://openaihack.vercel.app`, creates all scenes, normalizes
voice audio, encodes a continuous H.264/AAC stream, and rejects videos without
audio or with a duration of 180 seconds or more.
