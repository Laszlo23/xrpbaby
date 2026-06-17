#!/usr/bin/env bash
# Smoke Web3.bio identity graph integration (local or deployed origin).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/app"

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

BASE="${1:-http://127.0.0.1:3000}"
BASE="${BASE%/}"
DEMO_IDENTITY="${VITE_LANDING_GRAPH_IDENTITY:-laszloleonardo.eth}"

echo "Identity graph smoke: $BASE"
fail=0

check_json() {
  local path="$1"
  local code
  code=$(curl -s -o /tmp/bc-graph-smoke.json -w "%{http_code}" "${BASE}${path}")
  if [[ "$code" =~ ^2 ]]; then
    echo "OK  $path → $code"
  else
    echo "FAIL $path → $code"
    fail=1
  fi
}

check_json "/api/identity/graph-demo?identity=${DEMO_IDENTITY}"
check_json "/api/identity/graph?identity=${DEMO_IDENTITY}"

if command -v node >/dev/null 2>&1; then
  node -e "
    const fs = require('fs');
    const data = JSON.parse(fs.readFileSync('/tmp/bc-graph-smoke.json', 'utf8'));
    const nodes = data?.graph?.graph?.length ?? 0;
    if (data.ok && nodes > 0) {
      console.log('OK  graph-demo returned', nodes, 'linked identities');
    } else if (data.ok) {
      console.log('WARN graph-demo ok but empty graph (Web3.bio rate limit or identity has no links)');
    } else {
      console.log('FAIL graph-demo payload missing ok:true');
      process.exit(1);
    }
  " || fail=1
fi

if [[ -n "${WEB3BIO_API_KEY:-}" ]]; then
  echo "OK  WEB3BIO_API_KEY is set (wallet trust signals enabled)"
else
  echo "WARN WEB3BIO_API_KEY not set — profile graph works; wallet credentials require a key"
fi

if [[ "$fail" -ne 0 ]]; then
  exit 1
fi

echo "Identity graph smoke passed."
