#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_DIR="${OUTPUT_DIR:-$ROOT_DIR/artifacts/submission}"
WORK_DIR="${WORK_DIR:-/tmp/tendergraph-submission-video}"
PIPER_BIN="${PIPER_BIN:-/tmp/tendergraph-video-tools/piper/piper}"
VOICE_MODEL="${VOICE_MODEL:-/tmp/tendergraph-video-tools/en_US-lessac-medium.onnx}"
DEMO_URL="${DEMO_URL:-https://openaihack.vercel.app}"
LIVE_CAPTURE_DIR="${LIVE_CAPTURE_DIR:-}"
LIVE_CODEX_VIDEO="${LIVE_CODEX_VIDEO:-$OUTPUT_DIR/live-codex-run-anonymized.mp4}"
LIVE_CODEX_MANIFEST="${LIVE_CODEX_MANIFEST:-$OUTPUT_DIR/live-codex-run-anonymized.json}"

if [[ ! -x "$PIPER_BIN" || ! -f "$VOICE_MODEL" ]]; then
  echo "Piper and its voice model are required. Set PIPER_BIN and VOICE_MODEL." >&2
  exit 1
fi

for command in firefox ffmpeg ffprobe magick node; do
  command -v "$command" >/dev/null || {
    echo "Missing required command: $command" >&2
    exit 1
  }
done

mkdir -p "$OUTPUT_DIR"

if [[ ! -f "$LIVE_CODEX_VIDEO" ]]; then
  if [[ -z "$LIVE_CAPTURE_DIR" || ! -f "$LIVE_CAPTURE_DIR/capture.json" ]]; then
    echo "A verified live browser capture is required. Set LIVE_CAPTURE_DIR or LIVE_CODEX_VIDEO." >&2
    exit 1
  fi
  capture_complete="$(node -e 'const c=require(process.argv[1]); process.stdout.write(String(c.completed && c.sawRunningState))' "$LIVE_CAPTURE_DIR/capture.json")"
  capture_interval="$(node -e 'const c=require(process.argv[1]); process.stdout.write(String(c.intervalMs))' "$LIVE_CAPTURE_DIR/capture.json")"
  if [[ "$capture_complete" != "true" ]]; then
    echo "Live capture did not prove both running and completed states." >&2
    exit 1
  fi
  capture_rate="$(awk -v value="$capture_interval" 'BEGIN { printf "%.6f", 1000 / value }')"
  ffmpeg -hide_banner -loglevel error -y \
    -framerate "$capture_rate" -i "$LIVE_CAPTURE_DIR/frame-%05d.png" \
    -vf 'fps=30,scale=1920:1080:flags=lanczos,format=yuv420p' \
    -c:v libx264 -preset medium -crf 20 \
    "$LIVE_CODEX_VIDEO"
fi

if [[ ! -f "$LIVE_CODEX_MANIFEST" ]]; then
  echo "A live browser manifest is required. Set LIVE_CODEX_MANIFEST." >&2
  exit 1
fi
live_capture_url="$(node -e 'const r=require(process.argv[1]); process.stdout.write(r.url)' "$LIVE_CODEX_MANIFEST")"
if [[ "$live_capture_url" != *"submission=public"* ]]; then
  echo "The live browser segment must use the anonymized submission view." >&2
  exit 1
fi
if [[ -z "${BROWSER_CODEX_SESSION:-}" ]]; then
  BROWSER_CODEX_SESSION="$(node -e 'const r=require(process.argv[1]); process.stdout.write(r.codexSessionId)' "$LIVE_CODEX_MANIFEST")"
fi
smoke_sessions="$(node -e 'const r=require(process.argv[1]); process.stdout.write(r.runs.map(x => x.codexSessionId).join("\n"))' "$ROOT_DIR/artifacts/evals/codex-smoke.json")"
smoke_session_one="$(printf '%s\n' "$smoke_sessions" | sed -n '1p')"
smoke_session_two="$(printf '%s\n' "$smoke_sessions" | sed -n '2p')"
commit_one="$(git -C "$ROOT_DIR" log -1 --date=short --format='%h  %ad  %s')"
commit_two="$(git -C "$ROOT_DIR" log -2 --date=short --format='%h  %ad  %s' | sed -n '2p')"
commit_three="$(git -C "$ROOT_DIR" log -3 --date=short --format='%h  %ad  %s' | sed -n '3p')"
commit_four="$(git -C "$ROOT_DIR" log -4 --date=short --format='%h  %ad  %s' | sed -n '4p')"
commit_five="$(git -C "$ROOT_DIR" log -5 --date=short --format='%h  %ad  %s' | sed -n '5p')"

rm -rf "$WORK_DIR"
mkdir -p "$WORK_DIR" "$OUTPUT_DIR"

capture() {
  local name="$1"
  local url="$2"
  local profile="$WORK_DIR/profile-$name"
  mkdir -p "$profile"
  timeout 30 firefox \
    --headless \
    --profile "$profile" \
    --window-size 1920,1080 \
    --screenshot "$WORK_DIR/$name.png" \
    "$url" >"$WORK_DIR/firefox-$name.log" 2>&1
  test -s "$WORK_DIR/$name.png"
}

capture "public" "$DEMO_URL/?submission=public"
capture "correction" "$DEMO_URL/?case=cl-correction-demo&submission=public"

magick "$WORK_DIR/public.png" \
  -crop 850x720+1020+290 +repage \
  -resize '1920x1080^' -gravity center -extent 1920x1080 \
  "$WORK_DIR/public-evidence.png"

magick "$WORK_DIR/public.png" \
  -crop 1680x650+225+110 +repage \
  -resize '1920x1080' -background '#f4f7f5' -gravity center -extent 1920x1080 \
  "$WORK_DIR/public-runtime.png"

magick "$WORK_DIR/correction.png" \
  -crop 1680x650+225+130 +repage \
  -resize '1920x1080' -background '#f4f7f5' -gravity center -extent 1920x1080 \
  "$WORK_DIR/correction-diff.png"

magick -size 1920x1080 xc:'#f4f7f5' \
  -fill '#14231f' -draw 'rectangle 0,0 330,1080' \
  -font /usr/share/fonts/noto/NotoSans-Bold.ttf -pointsize 44 -fill white \
  -annotate +54+92 'TenderGraph' \
  -font /usr/share/fonts/noto/NotoSans-Regular.ttf -pointsize 24 -fill '#a8bbb3' \
  -annotate +54+145 'BUILD WEEK EVIDENCE' \
  -font /usr/share/fonts/noto/NotoSans-Bold.ttf -pointsize 62 -fill '#17211e' \
  -annotate +410+130 'Verified, not asserted' \
  -font /usr/share/fonts/noto/NotoSans-Regular.ttf -pointsize 28 -fill '#66736e' \
  -annotate +414+184 'Code-owned contracts around GPT-5.6 Terra' \
  -fill white -stroke '#d7e0dc' -strokewidth 2 \
  -draw 'roundrectangle 410,250 815,500 8,8' \
  -draw 'roundrectangle 850,250 1255,500 8,8' \
  -draw 'roundrectangle 1290,250 1695,500 8,8' \
  -stroke none -font /usr/share/fonts/noto/NotoSans-Bold.ttf -pointsize 70 -fill '#11724f' \
  -annotate +475+375 '32/32' -annotate +925+375 '23/23' -annotate +1372+375 '2/2' \
  -font /usr/share/fonts/noto/NotoSans-Regular.ttf -pointsize 24 -fill '#66736e' \
  -annotate +475+440 'contract tests' \
  -annotate +925+440 'contract scenarios' \
  -annotate +1372+440 'live smoke runs' \
  -font /usr/share/fonts/noto/NotoSans-Bold.ttf -pointsize 34 -fill '#17211e' \
  -annotate +410+610 'Enforcement ablation' \
  -font /usr/share/fonts/noto/NotoSans-Regular.ttf -pointsize 28 -fill '#66736e' \
  -annotate +410+666 'Harness admitted 0 of 8 injected faults' \
  -annotate +410+712 'Schema-only control admitted 8 of 8' \
  -font /usr/share/fonts/noto/NotoSans-Bold.ttf -pointsize 34 -fill '#17211e' \
  -annotate +410+795 'Live runtime evidence' \
  -font /usr/share/fonts/noto/NotoSansMono-Regular.ttf -pointsize 20 -fill '#236b53' \
  -annotate +410+845 "browser:    $BROWSER_CODEX_SESSION" \
  -annotate +410+885 "public:     $smoke_session_one" \
  -annotate +410+925 "correction: $smoke_session_two" \
  -font /usr/share/fonts/noto/NotoSans-Regular.ttf -pointsize 22 -fill '#66736e' \
  -annotate +410+1000 'Validated trace schema  |  recoverable local trace ledgers' \
  "$WORK_DIR/proof.png"

magick -size 1920x1080 xc:'#f4f7f5' \
  -fill '#14231f' -draw 'rectangle 0,0 330,1080' \
  -font /usr/share/fonts/noto/NotoSans-Bold.ttf -pointsize 44 -fill white \
  -annotate +54+92 'TenderGraph' \
  -font /usr/share/fonts/noto/NotoSans-Regular.ttf -pointsize 24 -fill '#a8bbb3' \
  -annotate +54+145 'BUILD WEEK EVIDENCE' \
  -font /usr/share/fonts/noto/NotoSans-Bold.ttf -pointsize 58 -fill '#17211e' \
  -annotate +410+130 'Codex collaboration, inspectable' \
  -font /usr/share/fonts/noto/NotoSans-Regular.ttf -pointsize 27 -fill '#66736e' \
  -annotate +414+184 'Dated implementation history and retained runtime sessions' \
  -font /usr/share/fonts/noto/NotoSans-Bold.ttf -pointsize 28 -fill '#17211e' \
  -annotate +410+270 'Build history' \
  -font /usr/share/fonts/noto/NotoSansMono-Regular.ttf -pointsize 20 -fill '#236b53' \
  -annotate +410+325 "$commit_one" \
  -annotate +410+375 "$commit_two" \
  -annotate +410+425 "$commit_three" \
  -annotate +410+475 "$commit_four" \
  -annotate +410+525 "$commit_five" \
  -fill white -stroke '#d7e0dc' -strokewidth 2 \
  -draw 'roundrectangle 410,610 1695,890 8,8' \
  -stroke none -font /usr/share/fonts/noto/NotoSans-Bold.ttf -pointsize 28 -fill '#17211e' \
  -annotate +455+670 'Retained Codex runtime sessions' \
  -font /usr/share/fonts/noto/NotoSansMono-Regular.ttf -pointsize 19 -fill '#236b53' \
  -annotate +455+730 "browser:    $BROWSER_CODEX_SESSION" \
  -annotate +455+780 "public:     $smoke_session_one" \
  -annotate +455+830 "correction: $smoke_session_two" \
  -font /usr/share/fonts/noto/NotoSans-Regular.ttf -pointsize 24 -fill '#66736e' \
  -annotate +410+980 'Codex accelerated delivery; product and truth-boundary decisions remained human-owned.' \
  "$WORK_DIR/collaboration.png"

declare -a IMAGES=(
  "$WORK_DIR/public.png"
  "$WORK_DIR/public-evidence.png"
  "$WORK_DIR/public-runtime.png"
  "$WORK_DIR/correction.png"
  "$WORK_DIR/correction-diff.png"
  "$WORK_DIR/proof.png"
  "$WORK_DIR/collaboration.png"
)

declare -a NARRATION=(
  "Procurement teams do not need another tender chatbot. They need to know who was recommended, why competitors lost, which document proves each statement, and what changes when a new resolution arrives. TenderGraph is an auditable procurement decision compiler built with Codex and GPT five point six."
  "This is a hash-verified public Chilean evaluation. TenderGraph reports the commission recommendation and preserves the boundary that this is not proof of a signed contract. Every factual finding is an admitted claim bound to reviewed evidence, and each answer section reproduces the admitted claim text verbatim. The reader view stays clean while the evidence panel retains page, section, parser version, source URL, and content hash."
  "The workbench invokes a ChatGPT-authenticated Codex session with GPT five point six Terra; it does not require an API key. Here is the real click, running state, completed answer, fifteen passed gates, and full Codex session identifier. GPT composes only from the selected claim contract. Code-owned gates reject invented text, evidence swaps, missing claims, scope contamination, false source status, leakage, and incomplete traces."
  "The core workflow is controlled reevaluation, not generic question answering. This visibly synthetic benchmark contains a versioned corrective-resolution contract. TenderGraph validates four declared affected claim versions: the original winner and loss reason are superseded by corrected claims. The award rule remains unchanged. Automatic impact discovery is the next product boundary."
  "The diff shows the exact before and after statements and evidence anchors instead of silently regenerating everything. New evidence can corroborate one claim, invalidate a claim, or create an explicit supersession. Unrelated conclusions remain stable and auditable."
  "The repository includes thirty-two adversarial and contract tests, twenty-three deterministic contract scenarios, and an enforcement ablation where the harness blocks all eight injected faults while the schema-only control admits all eight."
  "The dated repository history distinguishes the Build Week implementation. Two live Codex smoke runs and this browser run passed fifteen of fifteen gates. Codex accelerated implementation, source verification, testing, and browser review. We retained the product, governance, and truth-boundary decisions."
)

segment_files=()
for index in "${!NARRATION[@]}"; do
  number="$(printf '%02d' "$((index + 1))")"
  audio="$WORK_DIR/$number.wav"
  segment="$WORK_DIR/$number.mp4"
  printf '%s\n' "${NARRATION[$index]}" | \
    "$PIPER_BIN" --model "$VOICE_MODEL" --output_file "$audio" >/dev/null
  duration="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$audio")"
  padded_duration="$(awk -v value="$duration" 'BEGIN { printf "%.3f", value + 0.6 }')"
  frames="$(awk -v value="$padded_duration" 'BEGIN { printf "%d", (value * 30) + 1 }')"
  if [[ "$index" -eq 2 ]]; then
    ffmpeg -hide_banner -loglevel error -y \
      -i "$LIVE_CODEX_VIDEO" -i "$audio" \
      -filter_complex \
        "[0:v]scale=1920:1080:flags=lanczos,fps=30,tpad=stop_mode=clone:stop_duration=180,trim=duration=$padded_duration,setpts=PTS-STARTPTS,format=yuv420p[v];[1:a]loudnorm=I=-16:LRA=11:TP=-1.5,apad=pad_dur=0.6[a]" \
      -map '[v]' -map '[a]' -t "$padded_duration" \
      -c:v libx264 -preset medium -crf 21 -c:a aac -b:a 160k \
      "$segment"
  else
    ffmpeg -hide_banner -loglevel error -y \
      -loop 1 -i "${IMAGES[$index]}" -i "$audio" \
      -filter_complex \
        "[0:v]scale=1920:1080,zoompan=z='min(zoom+0.00005,1.025)':d=$frames:s=1920x1080:fps=30,format=yuv420p[v];[1:a]loudnorm=I=-16:LRA=11:TP=-1.5,apad=pad_dur=0.6[a]" \
      -map '[v]' -map '[a]' -t "$padded_duration" \
      -c:v libx264 -preset medium -crf 21 -c:a aac -b:a 160k \
      "$segment"
  fi
  segment_files+=("$segment")
done

concat_file="$WORK_DIR/segments.txt"
: >"$concat_file"
for segment in "${segment_files[@]}"; do
  printf "file '%s'\n" "$segment" >>"$concat_file"
done

final_video="${VIDEO_OUTPUT:-$ROOT_DIR/public/tendergraph-build-week-demo.mp4}"
mkdir -p "$(dirname "$final_video")"
ffmpeg -hide_banner -loglevel error -y \
  -f concat -safe 0 -i "$concat_file" \
  -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p \
  -af 'volume=-1.2dB,alimiter=limit=0.84:level=false' \
  -c:a aac -b:a 160k -ar 48000 \
  -metadata title='TenderGraph - OpenAI Build Week Demo' \
  "$final_video"

duration="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$final_video")"
audio_streams="$(ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$final_video" | wc -l)"
if ! awk -v value="$duration" 'BEGIN { exit !(value > 0 && value < 180) }'; then
  echo "Video duration is outside the required range: $duration seconds" >&2
  exit 1
fi
if [[ "$audio_streams" -lt 1 ]]; then
  echo "The rendered video has no audio stream" >&2
  exit 1
fi

cp "$WORK_DIR/public.png" "$OUTPUT_DIR/public-workbench.png"
cp "$WORK_DIR/correction.png" "$OUTPUT_DIR/correction-diff.png"
cp "$WORK_DIR/proof.png" "$OUTPUT_DIR/verification-evidence.png"
cp "$WORK_DIR/collaboration.png" "$OUTPUT_DIR/codex-collaboration.png"

printf 'Rendered %s seconds with %s audio stream(s): %s\n' \
  "$duration" "$audio_streams" "$final_video"
