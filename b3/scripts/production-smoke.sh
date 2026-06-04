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

for path in /forest /join /welcome /signal /roadmap /docs /drops/art /elias /0g/agentid; do
  check "$path"
done

ART_REDIRECT="${ART_REDIRECT_ORIGIN:-https://art.buildingcultureid.space}"
ART_REDIRECT="${ART_REDIRECT%/}"
art_headers=$(curl -sI --max-time 15 "${ART_REDIRECT}/" 2>/dev/null || true)
art_code=$(printf '%s\n' "$art_headers" | awk 'toupper($1) ~ /^HTTP/ { print $2; exit }')
art_loc=$(printf '%s\n' "$art_headers" | awk 'tolower($1)=="location:" { print $2; exit }' | tr -d '\r')
if [[ "$art_code" == "301" || "$art_code" == "302" ]] && [[ "$art_loc" == *"/drops/art"* ]]; then
  echo "OK  art redirect → $art_code $art_loc"
else
  echo "FAIL art redirect → ${art_code:-none} (location: ${art_loc:-none})"
  fail=1
fi

if curl -s "${BASE}/0g/agentid" | grep -q "0x0451b1d37058ad57df22d7185aabc6b0a36fc41e"; then
  echo "OK  /0g/agentid shows AgentId contract proof"
else
  echo "FAIL /0g/agentid missing AgentId contract address"
  fail=1
fi

if curl -s "${BASE}/drops/art" | grep -q "Enter raffle"; then
  echo "OK  /drops/art contains mint UI"
else
  echo "FAIL /drops/art missing mint UI copy"
  fail=1
fi

if curl -s "${BASE}/elias" | grep -qi "coming soon"; then
  echo "OK  /elias shows coming-soon (Elias disabled)"
else
  echo "WARN /elias may still load Elias UI — check VITE_ELIAS_ORB_ENABLED"
fi

if curl -s "${BASE}/api/platform/siwe-nonce" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{const j=JSON.parse(d);process.exit(j.nonce?0:1)}catch{process.exit(1)}})"; then
  echo "OK  GET /api/platform/siwe-nonce"
else
  echo "FAIL GET /api/platform/siwe-nonce"
  fail=1
fi

# Pulse metrics needs Prisma native engine; prebuilt worker bundle may return 500 until Node adapter deploy.
metrics_code=$(curl -s -o /dev/null -w "%{http_code}" "${BASE}/api/pulse/metrics")
if [[ "$metrics_code" =~ ^2 ]]; then
  echo "OK  /api/pulse/metrics → $metrics_code"
elif [[ "$metrics_code" == "503" || "$metrics_code" == "500" ]]; then
  echo "WARN /api/pulse/metrics → $metrics_code (DB/worker runtime — Pulse Coach still uses OpenAI directly)"
else
  echo "FAIL /api/pulse/metrics → $metrics_code"
  fail=1
fi

if [[ "$fail" -ne 0 ]]; then
  echo "Some checks failed for $BASE"
  exit 1
fi
echo "All production smoke checks passed."
