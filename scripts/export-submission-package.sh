#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HEAD_SHORT="$(git -C "$ROOT_DIR" rev-parse --short HEAD)"
OUTPUT="${1:-/tmp/tendergraph-submission-handoff-$HEAD_SHORT.zip}"
WORK_DIR="$(mktemp -d /tmp/tendergraph-submission-handoff.XXXXXX)"
PACKAGE_DIR="$WORK_DIR/tendergraph-submission"

cleanup() {
  rm -rf "$WORK_DIR"
}
trap cleanup EXIT

mkdir -p \
  "$PACKAGE_DIR/docs" \
  "$PACKAGE_DIR/media" \
  "$PACKAGE_DIR/evidence" \
  "$PACKAGE_DIR/compliance"

cp "$ROOT_DIR/README.md" "$ROOT_DIR/LICENSE" "$ROOT_DIR/THIRD_PARTY_NOTICES.md" "$PACKAGE_DIR/"
cp \
  "$ROOT_DIR/docs/DEVPOST_SUBMISSION.md" \
  "$ROOT_DIR/docs/DEVPOST_FORM_COPY.md" \
  "$ROOT_DIR/docs/YOUTUBE_UPLOAD.md" \
  "$ROOT_DIR/docs/SUBMISSION_CHECKLIST.md" \
  "$ROOT_DIR/docs/BUILD_WEEK_PROVENANCE.md" \
  "$ROOT_DIR/docs/SUBMISSION_HANDOFF.md" \
  "$PACKAGE_DIR/docs/"
cp \
  "$ROOT_DIR/public/tendergraph-build-week-demo.mp4" \
  "$ROOT_DIR/artifacts/submission/public-workbench.png" \
  "$ROOT_DIR/artifacts/submission/correction-diff.png" \
  "$ROOT_DIR/artifacts/submission/verification-evidence.png" \
  "$ROOT_DIR/artifacts/submission/codex-collaboration.png" \
  "$ROOT_DIR/artifacts/submission/live-codex-run-anonymized.mp4" \
  "$PACKAGE_DIR/media/"
cp \
  "$ROOT_DIR/artifacts/evals/codex-smoke.json" \
  "$ROOT_DIR/artifacts/submission/codex-feedback.json" \
  "$ROOT_DIR/artifacts/submission/live-codex-run-anonymized.json" \
  "$ROOT_DIR/logs/submission-freeze-2026-07-16.json" \
  "$ROOT_DIR/logs/architecture-video-remediation-2026-07-16.json" \
  "$ROOT_DIR/logs/architecture-video-remediation-2026-07-16.md" \
  "$ROOT_DIR/logs/video-official-rules-remediation-2026-07-16.json" \
  "$ROOT_DIR/logs/video-official-rules-remediation-2026-07-16.md" \
  "$ROOT_DIR/logs/submission-readiness-audit-2026-07-17.json" \
  "$ROOT_DIR/logs/submission-readiness-audit-2026-07-17.md" \
  "$ROOT_DIR/logs/devpost-copy-claim-audit-2026-07-17.json" \
  "$ROOT_DIR/logs/devpost-copy-claim-audit-2026-07-17.md" \
  "$PACKAGE_DIR/evidence/"
cp "$ROOT_DIR/artifacts/compliance/dependency-licenses.json" "$PACKAGE_DIR/compliance/"

git -C "$ROOT_DIR" bundle create "$PACKAGE_DIR/tendergraph-repository.bundle" main

(
  cd "$PACKAGE_DIR"
  find . -type f ! -name MANIFEST.sha256 -print0 | sort -z | xargs -0 sha256sum > MANIFEST.sha256
)

mkdir -p "$(dirname "$OUTPUT")"
rm -f "$OUTPUT"
(
  cd "$WORK_DIR"
  zip -q -r "$OUTPUT" tendergraph-submission
)

unzip -tq "$OUTPUT" >/dev/null
printf '{"event":"tendergraph.submission_package.created","commit":"%s","output":"%s","sha256":"%s"}\n' \
  "$(git -C "$ROOT_DIR" rev-parse HEAD)" \
  "$OUTPUT" \
  "$(sha256sum "$OUTPUT" | awk '{print $1}')"
