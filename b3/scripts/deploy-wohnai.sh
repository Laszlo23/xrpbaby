#!/usr/bin/env bash
# Deploy WohnAI (realagent) to production VPS — fixes wohnai.buildingcultureid.space 502.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REALAGENT="${REALAGENT_DIR:-$HOME/realagent}"
TARGET="${1:-root@187.124.18.204}"

if [[ ! -d "$REALAGENT/deploy" ]]; then
  echo "error: WohnAI repo not found at $REALAGENT"
  echo "Set REALAGENT_DIR or clone realagent next to b3."
  exit 1
fi

echo "==> Deploy WohnAI to $TARGET via $REALAGENT/deploy/push-to-server.sh"
bash "$REALAGENT/deploy/push-to-server.sh" "$TARGET"

echo "==> Verify WohnAI upstream on port 3010"
ssh -i "${SSH_KEY:-$HOME/.ssh/id_ed25519_wgsdex}" -o IdentitiesOnly=yes "$TARGET" \
  "curl -sf -o /dev/null -w '%{http_code}' http://127.0.0.1:3010/ || echo FAIL"

echo "==> Verify public URL"
curl -sfI --max-time 20 "https://wohnai.buildingcultureid.space/" | head -1 || true
