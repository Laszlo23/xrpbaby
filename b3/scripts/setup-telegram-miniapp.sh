#!/usr/bin/env bash
# Configure Telegram bot menu button → Building Culture Mini App (/tg).
# Requires TELEGRAM_BOT_TOKEN from @BotFather (https://t.me/BotFather).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP_ENV="$ROOT/app/.env"
DEPLOY_ENV="$ROOT/deploy/.env"

read_env_kv() {
  local file="$1"
  local key="$2"
  grep -E "^${key}=" "$file" 2>/dev/null | head -1 | cut -d= -f2- || true
}

set_env_kv() {
  local file="$1"
  local key="$2"
  local val="$3"
  [[ -f "$file" ]] || return 0
  if grep -qE "^${key}=" "$file" 2>/dev/null; then
    if [[ "$(uname)" == "Darwin" ]]; then
      sed -i '' "s|^${key}=.*|${key}=${val}|" "$file"
    else
      sed -i "s|^${key}=.*|${key}=${val}|" "$file"
    fi
  elif grep -qE "^# ${key}=" "$file" 2>/dev/null; then
    if [[ "$(uname)" == "Darwin" ]]; then
      sed -i '' "s|^# ${key}=.*|${key}=${val}|" "$file"
    else
      sed -i "s|^# ${key}=.*|${key}=${val}|" "$file"
    fi
  else
    printf '\n%s=%s\n' "$key" "$val" >>"$file"
  fi
}

TOKEN="${TELEGRAM_BOT_TOKEN:-}"
if [[ -z "$TOKEN" && -f "$APP_ENV" ]]; then
  TOKEN="$(read_env_kv "$APP_ENV" TELEGRAM_BOT_TOKEN)"
fi

MINIAPP_URL="${TELEGRAM_MINIAPP_URL:-}"
if [[ -z "$MINIAPP_URL" && -f "$APP_ENV" ]]; then
  MINIAPP_URL="$(read_env_kv "$APP_ENV" TELEGRAM_MINIAPP_URL)"
fi
MINIAPP_URL="${MINIAPP_URL:-https://app.buildingcultureid.space/tg}"

MENU_TEXT="${TELEGRAM_MENU_BUTTON_TEXT:-Open Building Culture}"

if [[ -z "$TOKEN" ]]; then
  cat <<'EOF'
Telegram Mini App setup needs a bot token.

1) Open https://t.me/BotFather
2) Send /newbot (or pick an existing bot via /mybots)
3) Copy the HTTP API token BotFather gives you
4) Re-run:

   TELEGRAM_BOT_TOKEN='<token>' npm run tg:setup

Optional: point at local tunnel (HTTPS required inside Telegram):

   TELEGRAM_BOT_TOKEN='...' TELEGRAM_MINIAPP_URL='https://<your-tunnel>.trycloudflare.com/tg' npm run tg:setup

Local browser testing (no Telegram): open http://localhost:5173/tg/dev after npm run dev
EOF
  exit 1
fi

if [[ ! "$MINIAPP_URL" =~ ^https:// ]]; then
  echo "error: TELEGRAM_MINIAPP_URL must be HTTPS (Telegram requirement): $MINIAPP_URL"
  exit 1
fi

api() {
  local method="$1"
  shift
  curl -sf -m 30 "https://api.telegram.org/bot${TOKEN}/${method}" "$@"
}

echo "==> Verifying bot token (getMe)"
ME_JSON="$(api getMe)"
BOT_USERNAME="$(printf '%s' "$ME_JSON" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("result",{}).get("username",""))' 2>/dev/null || true)"
if [[ -z "$BOT_USERNAME" ]]; then
  echo "error: getMe failed — check TELEGRAM_BOT_TOKEN"
  echo "$ME_JSON"
  exit 1
fi
echo "    Bot: @${BOT_USERNAME}"

echo "==> Setting menu button → Mini App"
api setChatMenuButton \
  -H 'Content-Type: application/json' \
  -d "$(python3 - <<PY
import json
print(json.dumps({
  "menu_button": {
    "type": "web_app",
    "text": "$MENU_TEXT",
    "web_app": {"url": "$MINIAPP_URL"},
  }
}))
PY
)" >/dev/null

echo "==> Persisting env (app/.env + deploy/.env)"
for DEST in "$APP_ENV" "$DEPLOY_ENV"; do
  set_env_kv "$DEST" TELEGRAM_BOT_TOKEN "$TOKEN"
  set_env_kv "$DEST" TELEGRAM_MINIAPP_URL "$MINIAPP_URL"
  set_env_kv "$DEST" TELEGRAM_INITDATA_MAX_AGE_SEC "3600"
  set_env_kv "$DEST" TELEGRAM_BOT_USERNAME "$BOT_USERNAME"
  set_env_kv "$DEST" VITE_TELEGRAM_MINIAPP_URL "$MINIAPP_URL"
  set_env_kv "$DEST" VITE_TONCONNECT_MANIFEST_URL "${MINIAPP_URL%/tg}/tonconnect-manifest.json"
  set_env_kv "$DEST" VITE_TELEGRAM_TWA_RETURN_URL "https://t.me/${BOT_USERNAME}"
  set_env_kv "$DEST" VITE_TON_NETWORK "mainnet"
  if [[ -f "$DEST" ]]; then
    echo "    updated $(basename "$(dirname "$DEST")")/$(basename "$DEST")"
  fi
done

if ! grep -qE '^VITE_TELEGRAM_DEV_USER_ID=' "$APP_ENV" 2>/dev/null; then
  set_env_kv "$APP_ENV" VITE_TELEGRAM_DEV_USER_ID "123456789"
fi

MINIAPP_DOMAIN="$(python3 - <<PY
from urllib.parse import urlparse
print(urlparse("$MINIAPP_URL").hostname or "")
PY
)"

cat <<EOF

==> Telegram Mini App installed

Open in Telegram:
  https://t.me/${BOT_USERNAME}
  → tap the menu button (“${MENU_TEXT}”)

Mini App URL:
  ${MINIAPP_URL}

REQUIRED in @BotFather (or initData stays empty on phone):
  1) /setdomain → pick @${BOT_USERNAME} → enter: ${MINIAPP_DOMAIN}
  2) /mybots → @${BOT_USERNAME} → Bot Settings → Configure Mini App
     → set URL: ${MINIAPP_URL}

Production auth: restart/redeploy app so TELEGRAM_BOT_TOKEN is live on the server.

Local checks:
  http://localhost:5173/tg/dev     — API dev console
  http://localhost:5173/tg         — UI (dev auth via VITE_TELEGRAM_DEV_USER_ID)

Docs: docs/TELEGRAM_MINIAPP_SETUP.md · docs/TELEGRAM_MINIAPP_GO_LIVE.md
EOF
