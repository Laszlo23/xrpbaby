#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TEMPLATE="${ROOT}/docs/RUNWAY_REPORT_TEMPLATE.md"
OUT_DIR="${ROOT}/reports/runway"
STAMP="$(date -u +%Y-%m-%d)"
OUT_FILE="${OUT_DIR}/runway-report-${STAMP}.md"

mkdir -p "$OUT_DIR"

if [[ ! -f "$TEMPLATE" ]]; then
  echo "Template missing: $TEMPLATE" >&2
  exit 1
fi

if [[ -f "$OUT_FILE" ]]; then
  echo "Runway report already exists: $OUT_FILE"
  exit 0
fi

{
  echo "# Runway report — ${STAMP}"
  echo
  echo "Generated from \`docs/RUNWAY_REPORT_TEMPLATE.md\`."
  echo
  cat "$TEMPLATE"
} > "$OUT_FILE"

echo "Created runway report: $OUT_FILE"
