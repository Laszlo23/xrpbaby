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
STRICT_SMOKE="${STRICT_SMOKE:-1}"

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

for path in / /forest /join /welcome /signal /roadmap /docs /drops/art /elias /0g/agentid /grant-proof /voice /plan /ops/attribution; do
  check "$path"
done

if curl -s "${BASE}/" | grep -q "talentapp:project_verification"; then
  echo "OK  / homepage has talentapp:project_verification meta"
else
  echo "FAIL / homepage missing talentapp:project_verification meta (Talent Protocol grant)"
  fail=1
fi

home_html=$(curl -s "${BASE}/")
if echo "$home_html" | grep -qiE 'rel=["'\'']icon["'\'']'; then
  echo "OK  / homepage has favicon link"
else
  echo "FAIL / homepage missing favicon link"
  fail=1
fi

if echo "$home_html" | grep -qi 'property="og:image"'; then
  echo "OK  / homepage has og:image meta"
else
  echo "FAIL / homepage missing og:image meta"
  fail=1
fi

if echo "$home_html" | grep -qi 'name="twitter:card"'; then
  echo "OK  / homepage has twitter:card meta"
else
  echo "WARN / homepage missing twitter:card meta"
fi

for og_path in / /plan /grant-proof; do
  og_html=$(curl -s "${BASE}${og_path}")
  if echo "$og_html" | grep -qi 'og:image'; then
    echo "OK  ${og_path} has og:image"
  else
    echo "WARN ${og_path} missing og:image in HTML"
  fi
done

check "/og-default.png"

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

check_json_ok() {
  local path="$1"
  local allow_unreachable="${2:-0}"
  local data
  if ! data=$(curl -s --max-time 20 "${BASE}${path}"); then
    echo "FAIL ${path} → request_failed"
    fail=1
    return
  fi
  if [[ "$allow_unreachable" == "1" ]]; then
    if printf "%s" "$data" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{const j=JSON.parse(d);if(j&&j.ok)process.exit(0);if(j&&j.reachable===false)process.exit(2);process.exit(1)}catch{process.exit(1)}})"; then
      echo "OK  ${path} → ok:true"
      return
    else
      local rc=$?
      if [[ "$rc" -eq 2 ]]; then
        echo "WARN ${path} → reachable:false (upstream trading agent offline)"
        return
      fi
      echo "FAIL ${path} → ok:false_or_invalid_json"
      fail=1
      return
    fi
  fi
  if printf "%s" "$data" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{const j=JSON.parse(d);process.exit(j && j.ok ? 0 : 1)}catch{process.exit(1)}})"; then
    echo "OK  ${path} → ok:true"
  else
    echo "FAIL ${path} → ok:false_or_invalid_json"
    fail=1
  fi
}

metrics_code=$(curl -s -o /dev/null -w "%{http_code}" "${BASE}/api/pulse/metrics")
if [[ "$metrics_code" =~ ^2 ]]; then
  echo "OK  /api/pulse/metrics → $metrics_code"
elif [[ "$STRICT_SMOKE" == "0" ]] && [[ "$metrics_code" == "503" || "$metrics_code" == "500" ]]; then
  echo "WARN /api/pulse/metrics → $metrics_code (strict mode disabled)"
else
  echo "FAIL /api/pulse/metrics → $metrics_code"
  fail=1
fi

check_json_ok "/api/market/bcc"
check_json_ok "/api/market/health"
check_json_ok "/api/trading/health" "1"
check_json_ok "/api/marketing/grove/tick"
check_json_ok "/api/marketing/social-campaign/tick"
check_json_ok "/api/market/bcc/bnb-route"
check_json_ok "/api/identity/check-bnb?label=test"

if curl -s "${BASE}/api/platform/funnel-baseline" | node -e "
let d='';
process.stdin.on('data',c=>d+=c);
process.stdin.on('end',()=>{
  try {
    const j=JSON.parse(d);
    process.exit(j.ok && j.windows?.last7d?.funnel ? 0 : 1);
  } catch { process.exit(1); }
});
"; then
  echo "OK  GET /api/platform/funnel-baseline"
else
  echo "WARN GET /api/platform/funnel-baseline → missing or no DB"
fi

if curl -s "${BASE}/api/platform/attribution-dashboard" | node -e "
let d='';
process.stdin.on('data',c=>d+=c);
process.stdin.on('end',()=>{
  try {
    const j=JSON.parse(d);
    process.exit(j.ok && j.windows ? 0 : 1);
  } catch { process.exit(1); }
});
"; then
  echo "OK  GET /api/platform/attribution-dashboard"
else
  echo "WARN GET /api/platform/attribution-dashboard → missing or no DB"
fi

CANONICAL_REDIRECT_HOSTS="${CANONICAL_REDIRECT_HOSTS:-miniapp.buildingcultureid.space mini.buildingcultureid.space}"
for host in $CANONICAL_REDIRECT_HOSTS; do
  headers=$(curl -sI --max-time 15 "https://${host}/" 2>/dev/null || true)
  code=$(printf '%s\n' "$headers" | awk 'toupper($1) ~ /^HTTP/ { print $2; exit }')
  loc=$(printf '%s\n' "$headers" | awk 'tolower($1)=="location:" { print $2; exit }' | tr -d '\r')
  if [[ "$code" == "301" || "$code" == "302" ]] && [[ "$loc" == *"app.buildingcultureid.space"* ]]; then
    echo "OK  canonical redirect ${host} → $code $loc"
  else
    echo "WARN canonical redirect ${host} → ${code:-none} (apply infra/nginx-unified-entry.example.conf on VPS)"
  fi
done

echo "--- RWA REOC metadata ---"
check "/places/meta/rwa-share-icon.svg"
if curl -s "${BASE}/places/api/reoc/1" | node -e "
let d='';
process.stdin.on('data',c=>d+=c);
process.stdin.on('end',()=>{
  try {
    const j=JSON.parse(d);
    const ok =
      j.reocVersion === '1.0.0' &&
      typeof j.image === 'string' && j.image.includes('/places/meta/rwa-share-icon.svg') &&
      Array.isArray(j.documents) && j.documents.length > 0 &&
      j.token && typeof j.token.address === 'string';
    process.exit(ok ? 0 : 1);
  } catch { process.exit(1); }
});
"; then
  echo "OK  GET /places/api/reoc/1 → valid REOC JSON"
else
  echo "FAIL GET /places/api/reoc/1 → invalid or missing REOC fields"
  fail=1
fi
reoc404=$(curl -s -o /dev/null -w "%{http_code}" "${BASE}/places/api/reoc/999")
if [[ "$reoc404" == "404" ]]; then
  echo "OK  GET /places/api/reoc/999 → 404"
else
  echo "FAIL GET /places/api/reoc/999 → $reoc404 (expected 404)"
  fail=1
fi

echo "--- PWA + social points prerequisites ---"
check "/manifest.webmanifest"
check "/sw.js"
check "/icons/icon-192.png"
check "/icons/icon-512.png"

join_html=$(curl -s "${BASE}/join")
if echo "$join_html" | grep -q 'rel="manifest"'; then
  echo "OK  /join has web app manifest link"
else
  echo "FAIL /join missing manifest link"
  fail=1
fi

if curl -s "${BASE}/manifest.webmanifest" | node -e "
let d='';
process.stdin.on('data',c=>d+=c);
process.stdin.on('end',()=>{
  try {
    const j=JSON.parse(d);
    const ok = j.name && j.start_url === '/join' && Array.isArray(j.icons) && j.icons.length >= 2;
    process.exit(ok ? 0 : 1);
  } catch { process.exit(1); }
});
"; then
  echo "OK  /manifest.webmanifest → valid PWA manifest"
else
  echo "FAIL /manifest.webmanifest → invalid JSON or missing fields"
  fail=1
fi

echo "--- Telegram Mini App ---"
for path in /tg /tonconnect-manifest.json /meta/tonconnect-icon.png; do
  check "$path"
done

if curl -s "${BASE}/tonconnect-manifest.json" | node -e "
let d='';
process.stdin.on('data',c=>d+=c);
process.stdin.on('end',()=>{
  try {
    const j=JSON.parse(d);
    const ok =
      typeof j.url === 'string' && j.url.includes('/tg') &&
      typeof j.iconUrl === 'string' && /\.png$/i.test(j.iconUrl) &&
      typeof j.name === 'string';
    process.exit(ok ? 0 : 1);
  } catch { process.exit(1); }
});
"; then
  echo "OK  /tonconnect-manifest.json → valid TON Connect manifest (PNG icon)"
else
  echo "FAIL /tonconnect-manifest.json → invalid or missing required fields"
  fail=1
fi

check_tg_api() {
  local method="$1"
  local path="$2"
  local data="${3:-}"
  local response code body
  if [[ "$method" == "POST" ]]; then
    response=$(curl -s -w $'\n%{http_code}' -X POST "${BASE}${path}" \
      -H "Content-Type: application/json" -d "${data}")
  else
    response=$(curl -s -w $'\n%{http_code}' "${BASE}${path}")
  fi
  code=$(printf '%s' "$response" | tail -n 1)
  body=$(printf '%s' "$response" | sed '$d')
  if [[ "$code" == "401" ]] && printf '%s' "$body" | grep -q "missing_init_data"; then
    echo "OK  ${method} ${path} → 401 missing_init_data (TELEGRAM_BOT_TOKEN live)"
  elif [[ "$code" == "503" ]] && printf '%s' "$body" | grep -q "telegram_not_configured"; then
    echo "FAIL ${method} ${path} → telegram_not_configured (set TELEGRAM_BOT_TOKEN on server)"
    fail=1
  else
    echo "FAIL ${method} ${path} → ${code} (expected 401 missing_init_data)"
    fail=1
  fi
}

check_tg_api GET "/api/tg/me"
check_tg_api GET "/api/tg/home"
check_tg_api GET "/api/tg/tasks"
check_tg_api GET "/api/tg/leaderboard"
check_tg_api GET "/api/tg/quests"
check_tg_api POST "/api/tg/auth" "{}"

if [[ -n "${TELEGRAM_BOT_TOKEN:-}" ]]; then
  bot_json=$(curl -sf -m 20 "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getChatMenuButton" 2>/dev/null || true)
  if printf '%s' "$bot_json" | node -e "
let d='';
process.stdin.on('data',c=>d+=c);
process.stdin.on('end',()=>{
  try {
    const j=JSON.parse(d);
    const url=j?.result?.web_app?.url || '';
    process.exit(j.ok && url.includes('/tg') ? 0 : 1);
  } catch { process.exit(1); }
});
"; then
    echo "OK  Telegram bot menu → opens /tg"
  else
    echo "WARN Telegram bot menu → not verified (run npm run tg:setup)"
  fi
else
  echo "WARN TELEGRAM_BOT_TOKEN not in env — skipped bot menu check"
fi

if curl -s "${BASE}/api/webhooks/quidli" | node -e "
let d='';
process.stdin.on('data',c=>d+=c);
process.stdin.on('end',()=>{
  try {
    const j=JSON.parse(d);
    process.exit(j.ok && j.service==='quidli-connect' && j.configured ? 0 : 1);
  } catch { process.exit(1); }
});
"; then
  echo "OK  GET /api/webhooks/quidli → quidli-connect configured"
else
  echo "WARN GET /api/webhooks/quidli → not configured (set QUIDLI_API_KEY)"
fi

if curl -s "${BASE}/api/marketing/quidli/status" | node -e "
let d='';
process.stdin.on('data',c=>d+=c);
process.stdin.on('end',()=>{
  try {
    const j=JSON.parse(d);
    process.exit(j.ok && j.service==='quidli-connect' ? 0 : 1);
  } catch { process.exit(1); }
});
"; then
  echo "OK  GET /api/marketing/quidli/status"
else
  echo "WARN GET /api/marketing/quidli/status → not reachable"
fi

grove_tick=$(curl -s "${BASE}/api/marketing/grove/tick")
if printf '%s' "$grove_tick" | node -e "
let d='';
process.stdin.on('data',c=>d+=c);
process.stdin.on('end',()=>{
  try {
    const j=JSON.parse(d);
    process.exit(j.ok && j.telegramEnabled && j.telegramConfigured ? 0 : 1);
  } catch { process.exit(1); }
});
"; then
  echo "OK  Grove Telegram outbound → configured"
else
  echo "WARN Grove Telegram outbound → not configured (set GROVE_TELEGRAM_CHAT_ID)"
fi

if [[ "$fail" -ne 0 ]]; then
  echo "Some checks failed for $BASE"
  exit 1
fi

echo "--- Link registry audit ---"
LINK_AUDIT_STRICT_SATELLITES="${LINK_AUDIT_STRICT_SATELLITES:-0}" \
  PUBLIC_APP_ORIGIN="$BASE" \
  node "$ROOT/scripts/link-audit.mjs" --origin="$BASE" || fail=1

if [[ "$fail" -ne 0 ]]; then
  echo "Some checks failed for $BASE"
  exit 1
fi
echo "All production smoke checks passed."
