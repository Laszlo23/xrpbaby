#!/usr/bin/env bash
# Production smoke against a live origin (default PUBLIC_APP_ORIGIN from deploy/.env).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -f deploy/.env ]]; then
  set -a
  # shellcheck disable=SC1091
  source deploy/.env
  set +a
fi

BASE="${1:-${PUBLIC_APP_ORIGIN:-https://app.buildingcultureid.space}}"
BASE="${BASE%/}"

echo "Production smoke: $BASE"
fail=0

check() {
  local path="$1"
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" "${BASE}${path}")
  if [[ "$code" =~ ^[23] ]]; then
    echo "OK  $path → $code"
  else
    echo "FAIL $path → $code"
    fail=1
  fi
}

for path in /forest /join /welcome /signal /roadmap /docs /api/pulse/metrics; do
  check "$path"
done

if curl -s "${BASE}/api/platform/siwe-nonce" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{const j=JSON.parse(d);process.exit(j.nonce?0:1)}catch{process.exit(1)}})"; then
  echo "OK  GET /api/platform/siwe-nonce"
else
  echo "FAIL GET /api/platform/siwe-nonce"
  fail=1
fi

if [[ "$fail" -ne 0 ]]; then
  echo "Some checks failed for $BASE"
  exit 1
fi
echo "All production smoke checks passed."
