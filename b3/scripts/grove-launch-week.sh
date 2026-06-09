#!/usr/bin/env bash
# Run Grove launch-week pillars (see docs/GROVE_LAUNCH_POSTS.md).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
"$ROOT/scripts/sync-deploy-env.sh"

DRY=()
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY=(--dry-run)
  shift
fi

PILLARS=(
  rwa_proof
  grant_proof
  forest_proof
  product_path
  bcc_utility
  agent_proof
  culture_story
)

DAY="${1:-all}"
APP_DIR="$ROOT/app"

run_one() {
  local pillar="$1"
  echo "==> Grove tick: $pillar ${DRY[*]:-}"
  node "$APP_DIR/scripts/grove-tick.mjs" "${DRY[@]}" --pillar "$pillar"
}

if [[ "$DAY" == "all" ]]; then
  for p in "${PILLARS[@]}"; do
    run_one "$p"
    sleep 2
  done
elif [[ "$DAY" =~ ^[1-7]$ ]]; then
  run_one "${PILLARS[$((DAY - 1))]}"
else
  echo "Usage: $0 [--dry-run] [day 1-7|all]"
  exit 2
fi
