#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_DIR="${OUTPUT_DIR:-$ROOT_DIR/artifacts/submission}"
WORK_DIR="${WORK_DIR:-/tmp/tendergraph-chat-first-render}"
CAPTURE_DIR="${CAPTURE_DIR:-/tmp/tendergraph-chat-first-capture}"
CAPTURE_MANIFEST="${CAPTURE_MANIFEST:-$CAPTURE_DIR/capture.json}"
CAPTURE_VIDEO="${CAPTURE_VIDEO:-$CAPTURE_DIR/chat-first-system.webm}"
PIPER_PYTHON="${PIPER_PYTHON:-/tmp/tendergraph-piper-venv/bin/python}"
VOICE_MODEL="${VOICE_MODEL:-/tmp/tendergraph-video-tools/en_US-lessac-medium.onnx}"
FINAL_VIDEO="${VIDEO_OUTPUT:-$ROOT_DIR/public/tendergraph-build-week-chat-first-demo.mp4}"

for command in ffmpeg ffprobe magick node; do
  command -v "$command" >/dev/null || {
    echo "Missing required command: $command" >&2
    exit 1
  }
done

if [[ ! -x "$PIPER_PYTHON" || ! -f "$VOICE_MODEL" ]]; then
  echo "Piper 1.4 and en_US-lessac-medium are required." >&2
  echo "Set PIPER_PYTHON and VOICE_MODEL to local paths." >&2
  exit 1
fi

for required in \
  "$CAPTURE_MANIFEST" \
  "$CAPTURE_VIDEO" \
  "$CAPTURE_DIR/public-chat-first.png" \
  "$CAPTURE_DIR/public-evidence.png" \
  "$CAPTURE_DIR/codex-trace.png" \
  "$CAPTURE_DIR/document-ingestion.png" \
  "$CAPTURE_DIR/public-impact.png" \
  "$CAPTURE_DIR/correction-diff.png" \
  "$CAPTURE_DIR/correction-impact.png"; do
  if [[ ! -s "$required" ]]; then
    echo "Missing capture artifact: $required" >&2
    exit 1
  fi
done

capture_contract="$(node -e 'const x=require(process.argv[1]);process.stdout.write(x.contract)' "$CAPTURE_MANIFEST")"
capture_presentation="$(node -e 'const x=require(process.argv[1]);process.stdout.write(x.presentation)' "$CAPTURE_MANIFEST")"
if [[ "$capture_contract" != "tendergraph-chat-first-capture.v2" ]]; then
  echo "Unexpected capture contract: $capture_contract" >&2
  exit 1
fi
if [[ "$capture_presentation" != "public_anonymized" ]]; then
  echo "The video capture must use the anonymized public presentation." >&2
  exit 1
fi

marker() {
  node -e \
    'const x=require(process.argv[1]);const v=x.markers[process.argv[2]];if(typeof v!=="number")process.exit(2);process.stdout.write((v/1000).toFixed(3))' \
    "$CAPTURE_MANIFEST" "$1"
}

codex_session="$(node -e 'const x=require(process.argv[1]);process.stdout.write(x.composition.codexSessionId)' "$CAPTURE_MANIFEST")"
public_impact_session="$(node -e 'const x=require(process.argv[1]);process.stdout.write(x.publicImpact.codexSessionId)' "$CAPTURE_MANIFEST")"
correction_impact_session="$(node -e 'const x=require(process.argv[1]);process.stdout.write(x.correctionImpact.codexSessionId)' "$CAPTURE_MANIFEST")"
smoke_session_one="$(node -e 'const x=require(process.argv[1]);process.stdout.write(x.runs[0].codexSessionId)' "$ROOT_DIR/artifacts/evals/codex-smoke.json")"
smoke_session_two="$(node -e 'const x=require(process.argv[1]);process.stdout.write(x.runs[1].codexSessionId)' "$ROOT_DIR/artifacts/evals/codex-smoke.json")"

commit_one="$(git -C "$ROOT_DIR" log -1 --date=short --format='%h  %ad  %s')"
commit_two="$(git -C "$ROOT_DIR" log -2 --date=short --format='%h  %ad  %s' | sed -n '2p')"
commit_three="$(git -C "$ROOT_DIR" log -3 --date=short --format='%h  %ad  %s' | sed -n '3p')"
commit_four="$(git -C "$ROOT_DIR" log -4 --date=short --format='%h  %ad  %s' | sed -n '4p')"
commit_five="$(git -C "$ROOT_DIR" log -5 --date=short --format='%h  %ad  %s' | sed -n '5p')"

rm -rf "$WORK_DIR"
mkdir -p "$WORK_DIR" "$OUTPUT_DIR" "$(dirname "$FINAL_VIDEO")"

magick -size 1920x1080 xc:'#f5f7f6' \
  -fill '#071411' -draw 'rectangle 0,0 310,1080' \
  -font /usr/share/fonts/noto/NotoSans-Bold.ttf -pointsize 42 -fill white \
  -annotate +46+82 'TenderGraph' \
  -font /usr/share/fonts/noto/NotoSans-Regular.ttf -pointsize 20 -fill '#89a098' \
  -annotate +46+125 'VERIFIED BUILD WEEK RESULTS' \
  -font /usr/share/fonts/noto/NotoSans-Bold.ttf -pointsize 58 -fill '#151a18' \
  -annotate +380+118 'A working system, not a prompt demo' \
  -font /usr/share/fonts/noto/NotoSans-Regular.ttf -pointsize 25 -fill '#66716c' \
  -annotate +384+168 'Code-owned contracts around GPT-5.6 and Codex' \
  -fill white -stroke '#dce2df' -strokewidth 2 \
  -draw 'roundrectangle 380,235 760,455 7,7' \
  -draw 'roundrectangle 790,235 1170,455 7,7' \
  -draw 'roundrectangle 1200,235 1580,455 7,7' \
  -draw 'roundrectangle 380,490 760,710 7,7' \
  -draw 'roundrectangle 790,490 1170,710 7,7' \
  -draw 'roundrectangle 1200,490 1580,710 7,7' \
  -stroke none -font /usr/share/fonts/noto/NotoSans-Bold.ttf -pointsize 58 -fill '#087a4d' \
  -annotate +450+345 '44/44' -annotate +860+345 '23/23' -annotate +1275+345 '15/15' \
  -annotate +458+600 '6/6' -annotate +855+600 '0/8' -annotate +1260+600 '3 LIVE' \
  -font /usr/share/fonts/noto/NotoSans-Regular.ttf -pointsize 20 -fill '#66716c' \
  -annotate +455+402 'contract tests' \
  -annotate +855+402 'golden scenarios' \
  -annotate +1260+402 'composition gates' \
  -annotate +455+657 'impact gates' \
  -annotate +855+657 'faults admitted' \
  -annotate +1260+657 'new Codex runs' \
  -font /usr/share/fonts/noto/NotoSans-Bold.ttf -pointsize 27 -fill '#151a18' \
  -annotate +380+800 'Retained runtime evidence' \
  -font /usr/share/fonts/noto/NotoSansMono-Regular.ttf -pointsize 16 -fill '#087a4d' \
  -annotate +380+846 "composition:       $codex_session" \
  -annotate +380+884 "public impact:     $public_impact_session" \
  -annotate +380+922 "correction impact: $correction_impact_session" \
  -font /usr/share/fonts/noto/NotoSans-Regular.ttf -pointsize 20 -fill '#66716c' \
  -annotate +380+1000 'All model output remains subordinate to source, claim, and authority contracts.' \
  "$WORK_DIR/proof.png"

magick -size 1920x1080 xc:'#f5f7f6' \
  -fill '#071411' -draw 'rectangle 0,0 310,1080' \
  -font /usr/share/fonts/noto/NotoSans-Bold.ttf -pointsize 42 -fill white \
  -annotate +46+82 'TenderGraph' \
  -font /usr/share/fonts/noto/NotoSans-Regular.ttf -pointsize 20 -fill '#89a098' \
  -annotate +46+125 'WHY THIS CAN WIN' \
  -font /usr/share/fonts/noto/NotoSans-Bold.ttf -pointsize 55 -fill '#151a18' \
  -annotate +380+115 'Frontier reasoning with operational control' \
  -font /usr/share/fonts/noto/NotoSans-Bold.ttf -pointsize 25 -fill '#087a4d' \
  -annotate +390+238 'TECHNOLOGICAL IMPLEMENTATION' \
  -annotate +1050+238 'COMPLETE PRODUCT DESIGN' \
  -annotate +390+485 'CREDIBLE UNIVERSAL IMPACT' \
  -annotate +1050+485 'DIFFERENTIATED IDEA' \
  -font /usr/share/fonts/noto/NotoSans-Regular.ttf -pointsize 22 -fill '#39433f' \
  -annotate +390+280 'Codex and GPT-5.6 execute inside' \
  -annotate +390+314 'typed, adversarially tested contracts.' \
  -annotate +1050+280 'Chat-first workflow, evidence inspector,' \
  -annotate +1050+314 'document ingestion, diffs, and trace.' \
  -annotate +390+527 'Every jurisdiction publishes changing' \
  -annotate +390+561 'tender documents and award records.' \
  -annotate +1050+527 'A procurement decision-state compiler,' \
  -annotate +1050+561 'not another document chatbot.' \
  -stroke '#dce2df' -strokewidth 2 \
  -draw 'line 380,385 1580,385' -draw 'line 380,635 1580,635' \
  -stroke none -font /usr/share/fonts/noto/NotoSans-Bold.ttf -pointsize 26 -fill '#151a18' \
  -annotate +380+725 'Inspectable Build Week history' \
  -font /usr/share/fonts/noto/NotoSansMono-Regular.ttf -pointsize 17 -fill '#087a4d' \
  -annotate +380+770 "$commit_one" \
  -annotate +380+808 "$commit_two" \
  -annotate +380+846 "$commit_three" \
  -annotate +380+884 "$commit_four" \
  -annotate +380+922 "$commit_five" \
  -font /usr/share/fonts/noto/NotoSans-Regular.ttf -pointsize 21 -fill '#66716c' \
  -annotate +380+1000 'Evidence changes. Claims are re-evaluated. Human authority remains explicit.' \
  "$WORK_DIR/closing.png"

declare -a NARRATION=(
  "Public procurement decisions are scattered across notices, evaluation tables, supplier files, and later amendments. Teams still reconstruct who was recommended, why others lost, and what changed. TenderGraph turns that fragmented record into an auditable decision state, built with Codex and GPT five point six."
  "Most AI products stop at summarization. Here, every answer is assembled from promoted claims bound to exact evidence. The chat stays usable while the inspector exposes source, page, quoted text, parser, authority, URL, and content hash. A commission recommendation is never misrepresented as a signed contract."
  "Now I run the question through a ChatGPT-authenticated Codex session, with no API key. GPT five point six composes only from the admitted claim contract. The trace retains the model and full session identifier, while fifteen code-owned gates reject invention, evidence swaps, scope contamination, leakage, and incomplete output."
  "Next I attach the official PDF. TenderGraph extracts eight hashed evidence anchors without granting them authority. Codex then compares a later public selection record with every active claim and finds one material corroboration. Six independent gates validate scope, the complete claim partition, evidence identity, action semantics, and shadow authority. Nothing changes until human review."
  "The harder test is a later corrective resolution. TenderGraph identifies two supersessions: the original winner and loss explanation are replaced, while the award rule remains unchanged. The result matches the versioned reference exactly and still cannot promote itself into official truth."
  "This is not generic retrieval augmented generation. TenderGraph maintains a decision graph across source versions, evidence dependencies, reviewed claims, and explicit supersession. The same contracts already run across Chilean, European, and United Kingdom tender structures and common procurement document formats."
  "The repository proves the enforcement layer: forty-four contract and adversarial tests, twenty-three golden scenarios, fifteen composition gates, six impact gates, and zero of eight injected faults admitted. The new capture retains three fresh Codex session identifiers for composition and impact discovery."
  "Codex accelerated implementation, source verification, testing, and this complete product redesign. The idea is deliberately different: not a chatbot that summarizes a tender, but an auditable procurement decision compiler that shows what changed, why it changed, and which evidence earns trust."
)

declare -a SCENE_KIND=(
  "still"
  "still"
  "clip"
  "clip"
  "clip"
  "still"
  "still"
  "still"
)

declare -a SCENE_SOURCE=(
  "$CAPTURE_DIR/public-chat-first.png"
  "$CAPTURE_DIR/public-evidence.png"
  "$CAPTURE_VIDEO"
  "$CAPTURE_VIDEO"
  "$CAPTURE_VIDEO"
  "$CAPTURE_DIR/correction-impact.png"
  "$WORK_DIR/proof.png"
  "$WORK_DIR/closing.png"
)

declare -a CLIP_START=(
  "0"
  "0"
  "$(marker codexRunStarted)"
  "$(marker documentAttached)"
  "$(marker correctionReady)"
  "0"
  "0"
  "0"
)

declare -a CLIP_END=(
  "0"
  "0"
  "$(marker documentAttached)"
  "$(marker correctionReady)"
  "$(marker captureCompleted)"
  "0"
  "0"
  "0"
)

segment_files=()
for index in "${!NARRATION[@]}"; do
  number="$(printf '%02d' "$((index + 1))")"
  audio="$WORK_DIR/$number.wav"
  segment="$WORK_DIR/$number.mp4"
  "$PIPER_PYTHON" -m piper \
    -m "$VOICE_MODEL" \
    -f "$audio" \
    --sentence-silence 0.12 \
    -- "${NARRATION[$index]}" >/dev/null
  audio_duration="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$audio")"
  padded_duration="$(awk -v value="$audio_duration" 'BEGIN { printf "%.3f", value + 0.55 }')"
  frames="$(awk -v value="$padded_duration" 'BEGIN { printf "%d", (value * 30) + 1 }')"

  if [[ "${SCENE_KIND[$index]}" == "clip" ]]; then
    start="${CLIP_START[$index]}"
    end="${CLIP_END[$index]}"
    clip_duration="$(awk -v start="$start" -v end="$end" 'BEGIN { printf "%.3f", end - start }')"
    ffmpeg -hide_banner -loglevel error -y \
      -ss "$start" -t "$clip_duration" -i "${SCENE_SOURCE[$index]}" -i "$audio" \
      -filter_complex \
        "[0:v]scale=1920:1080:flags=lanczos,fps=30,tpad=stop_mode=clone:stop_duration=180,trim=duration=$padded_duration,setpts=PTS-STARTPTS,format=yuv420p[v];[1:a]loudnorm=I=-16:LRA=8:TP=-1.5,apad=pad_dur=0.55[a]" \
      -map '[v]' -map '[a]' -t "$padded_duration" \
      -c:v libx264 -preset medium -crf 20 -c:a aac -b:a 160k \
      "$segment"
  else
    ffmpeg -hide_banner -loglevel error -y \
      -loop 1 -i "${SCENE_SOURCE[$index]}" -i "$audio" \
      -filter_complex \
        "[0:v]scale=1920:1080,zoompan=z='min(zoom+0.00004,1.018)':d=$frames:s=1920x1080:fps=30,format=yuv420p[v];[1:a]loudnorm=I=-16:LRA=8:TP=-1.5,apad=pad_dur=0.55[a]" \
      -map '[v]' -map '[a]' -t "$padded_duration" \
      -c:v libx264 -preset medium -crf 20 -c:a aac -b:a 160k \
      "$segment"
  fi
  segment_files+=("$segment")
done

concat_file="$WORK_DIR/segments.txt"
: >"$concat_file"
for segment in "${segment_files[@]}"; do
  printf "file '%s'\n" "$segment" >>"$concat_file"
done

ffmpeg -hide_banner -loglevel error -y \
  -f concat -safe 0 -i "$concat_file" \
  -c:v libx264 -preset medium -crf 19 -pix_fmt yuv420p \
  -af 'volume=-1.0dB,alimiter=limit=0.84:level=false' \
  -c:a aac -b:a 160k -ar 48000 \
  -movflags +faststart \
  -metadata title='TenderGraph - Auditable Procurement Decision Compiler' \
  "$FINAL_VIDEO"

duration="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$FINAL_VIDEO")"
audio_streams="$(ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$FINAL_VIDEO" | wc -l)"
if ! awk -v value="$duration" 'BEGIN { exit !(value > 0 && value < 180) }'; then
  echo "Video duration is outside the required range: $duration seconds" >&2
  exit 1
fi
if [[ "$audio_streams" -lt 1 ]]; then
  echo "The rendered video has no audio stream" >&2
  exit 1
fi

cp "$CAPTURE_DIR/public-chat-first.png" "$OUTPUT_DIR/chat-first-workbench.png"
cp "$CAPTURE_DIR/public-evidence.png" "$OUTPUT_DIR/chat-first-evidence.png"
cp "$CAPTURE_DIR/codex-trace.png" "$OUTPUT_DIR/chat-first-codex-trace.png"
cp "$CAPTURE_DIR/document-ingestion.png" "$OUTPUT_DIR/chat-first-ingestion.png"
cp "$CAPTURE_DIR/public-impact.png" "$OUTPUT_DIR/chat-first-public-impact.png"
cp "$CAPTURE_DIR/correction-impact.png" "$OUTPUT_DIR/chat-first-correction-impact.png"
cp "$WORK_DIR/proof.png" "$OUTPUT_DIR/chat-first-verification.png"
cp "$WORK_DIR/closing.png" "$OUTPUT_DIR/chat-first-closing.png"
cp "$CAPTURE_MANIFEST" "$OUTPUT_DIR/chat-first-capture.json"

printf 'Rendered %s seconds with %s audio stream(s): %s\n' \
  "$duration" "$audio_streams" "$FINAL_VIDEO"
