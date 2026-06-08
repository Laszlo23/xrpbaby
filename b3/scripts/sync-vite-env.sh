#!/usr/bin/env bash
# Sync VITE_* client vars + mirror pairs between deploy/.env and app/.env.
# deploy/.env is canonical for production; app/.env is updated for local dev + docker bake.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEPLOY_ENV="$ROOT/deploy/.env"
APP_ENV="$ROOT/app/.env"

if [[ ! -f "$DEPLOY_ENV" ]]; then
  echo "error: missing $DEPLOY_ENV"
  exit 1
fi

read_kv() {
  local file="$1"
  local key="$2"
  grep -E "^${key}=" "$file" 2>/dev/null | head -1 | cut -d= -f2- || true
}

set_kv() {
  local file="$1"
  local key="$2"
  local val="$3"
  [[ -f "$file" ]] || return 0
  [[ -n "$val" ]] || return 0
  local escaped="${val//\\/\\\\}"
  escaped="${escaped//|/\\|}"
  if grep -qE "^${key}=" "$file" 2>/dev/null; then
    if [[ "$(uname)" == "Darwin" ]]; then
      sed -i '' "s|^${key}=.*|${key}=${escaped}|" "$file"
    else
      sed -i "s|^${key}=.*|${key}=${escaped}|" "$file"
    fi
  elif grep -qE "^# ${key}=" "$file" 2>/dev/null; then
    if [[ "$(uname)" == "Darwin" ]]; then
      sed -i '' "s|^# ${key}=.*|${key}=${escaped}|" "$file"
    else
      sed -i "s|^# ${key}=.*|${key}=${escaped}|" "$file"
    fi
  else
    printf '\n%s=%s\n' "$key" "$val" >>"$file"
  fi
}

mirror_pair() {
  local primary_key="$1"
  local mirror_key="$2"
  local primary_val mirror_val
  primary_val="$(read_kv "$DEPLOY_ENV" "$primary_key")"
  mirror_val="$(read_kv "$DEPLOY_ENV" "$mirror_key")"
  if [[ -n "$primary_val" && -z "$mirror_val" ]]; then
    set_kv "$DEPLOY_ENV" "$mirror_key" "$primary_val"
    mirror_val="$primary_val"
  elif [[ -n "$mirror_val" && -z "$primary_val" ]]; then
    set_kv "$DEPLOY_ENV" "$primary_key" "$mirror_val"
    primary_val="$mirror_val"
  fi
  for DEST in "$DEPLOY_ENV" "$APP_ENV"; do
    if [[ -n "$primary_val" ]]; then
      set_kv "$DEST" "$primary_key" "$primary_val"
    fi
    if [[ -n "$mirror_val" ]]; then
      set_kv "$DEST" "$mirror_key" "$mirror_val"
    fi
  done
}

echo "==> Sync VITE_* from deploy/.env → app/.env"
cp "$DEPLOY_ENV" "$APP_ENV"
echo "    copied deploy/.env → app/.env"

ORIGIN="$(read_kv "$DEPLOY_ENV" PUBLIC_APP_ORIGIN)"
ORIGIN="${ORIGIN:-https://app.buildingcultureid.space}"
BOT_USER="$(read_kv "$DEPLOY_ENV" TELEGRAM_BOT_USERNAME)"

echo "==> Telegram + TON client vars"
set_kv "$DEPLOY_ENV" TELEGRAM_MINIAPP_URL "${ORIGIN}/tg"
set_kv "$APP_ENV" TELEGRAM_MINIAPP_URL "${ORIGIN}/tg"
set_kv "$DEPLOY_ENV" VITE_TELEGRAM_MINIAPP_URL "${ORIGIN}/tg"
set_kv "$APP_ENV" VITE_TELEGRAM_MINIAPP_URL "${ORIGIN}/tg"
set_kv "$DEPLOY_ENV" VITE_TONCONNECT_MANIFEST_URL "${ORIGIN}/tonconnect-manifest.json"
set_kv "$APP_ENV" VITE_TONCONNECT_MANIFEST_URL "${ORIGIN}/tonconnect-manifest.json"
if [[ -z "$(read_kv "$DEPLOY_ENV" VITE_TON_NETWORK)" ]]; then
  set_kv "$DEPLOY_ENV" VITE_TON_NETWORK "mainnet"
  set_kv "$APP_ENV" VITE_TON_NETWORK "mainnet"
fi
if [[ -n "$BOT_USER" ]]; then
  set_kv "$DEPLOY_ENV" VITE_TELEGRAM_TWA_RETURN_URL "https://t.me/${BOT_USER}"
  set_kv "$APP_ENV" VITE_TELEGRAM_TWA_RETURN_URL "https://t.me/${BOT_USER}"
elif [[ -z "$(read_kv "$DEPLOY_ENV" VITE_TELEGRAM_TWA_RETURN_URL)" ]]; then
  set_kv "$DEPLOY_ENV" VITE_TELEGRAM_TWA_RETURN_URL "https://t.me/buildingcultureappbot"
  set_kv "$APP_ENV" VITE_TELEGRAM_TWA_RETURN_URL "https://t.me/buildingcultureappbot"
fi
if [[ -z "$(read_kv "$APP_ENV" VITE_TELEGRAM_DEV_USER_ID)" ]]; then
  set_kv "$APP_ENV" VITE_TELEGRAM_DEV_USER_ID "123456789"
fi

echo "==> Farcaster / Neynar mirrors (server ↔ VITE_)"
mirror_pair "NEYNAR_CLIENT_ID" "VITE_NEYNAR_CLIENT_ID"
mirror_pair "NEYNAR_TARGET_CAST" "VITE_FARCASTER_TARGET_CAST_URL"
mirror_pair "FARCASTER_TARGET_CAST_URL" "VITE_FARCASTER_TARGET_CAST_URL"
mirror_pair "FARCASTER_FOLLOW_URL" "VITE_FARCASTER_FOLLOW_URL"
mirror_pair "NEYNAR_FOLLOW_PROFILE_URL" "VITE_FARCASTER_FOLLOW_URL"

if [[ -z "$(read_kv "$DEPLOY_ENV" VITE_FARCASTER_FOLLOW_URL)" ]]; then
  set_kv "$DEPLOY_ENV" VITE_FARCASTER_FOLLOW_URL "https://farcaster.xyz/0xleonardo"
  set_kv "$DEPLOY_ENV" FARCASTER_FOLLOW_URL "https://farcaster.xyz/0xleonardo"
  set_kv "$APP_ENV" VITE_FARCASTER_FOLLOW_URL "https://farcaster.xyz/0xleonardo"
  set_kv "$APP_ENV" FARCASTER_FOLLOW_URL "https://farcaster.xyz/0xleonardo"
fi

if [[ -z "$(read_kv "$DEPLOY_ENV" VITE_COMMUNITY_X_URL)" ]]; then
  set_kv "$DEPLOY_ENV" VITE_COMMUNITY_X_URL "https://x.com/buildingcultu3"
  set_kv "$APP_ENV" VITE_COMMUNITY_X_URL "https://x.com/buildingcultu3"
fi
if [[ -z "$(read_kv "$DEPLOY_ENV" VITE_COMMUNITY_TELEGRAM_URL)" ]]; then
  set_kv "$DEPLOY_ENV" VITE_COMMUNITY_TELEGRAM_URL "https://t.me/+4zFH7-2tyW0yOTBk"
  set_kv "$APP_ENV" VITE_COMMUNITY_TELEGRAM_URL "https://t.me/+4zFH7-2tyW0yOTBk"
fi

echo "==> Origins"
set_kv "$DEPLOY_ENV" VITE_PLATFORM_ORIGIN "$ORIGIN"
set_kv "$DEPLOY_ENV" VITE_APP_ORIGIN "$ORIGIN"
set_kv "$APP_ENV" VITE_PLATFORM_ORIGIN "$ORIGIN"
set_kv "$APP_ENV" VITE_APP_ORIGIN "$ORIGIN"

echo "==> Marketplace (thirdweb)"
bash "$ROOT/scripts/sync-market-env.sh" >/dev/null

echo "==> Stripe (culture packs — when keys present)"
mirror_pair "STRIPE_PUBLISHABLE_KEY" "VITE_STRIPE_PUBLISHABLE_KEY"
for key in STRIPE_SECRET_KEY STRIPE_WEBHOOK_SECRET VITE_STRIPE_PUBLISHABLE_KEY; do
  val="$(read_kv "$DEPLOY_ENV" "$key")"
  if [[ -n "$val" ]]; then
    set_kv "$APP_ENV" "$key" "$val"
  fi
done

echo "==> Places REOC (when contract addresses present)"
PLACES_SITE="$(read_kv "$DEPLOY_ENV" VITE_PLACES_SITE_URL)"
PLACES_SITE="${PLACES_SITE:-https://places.buildingcultureid.space}"
for key in VITE_PLACES_SITE_URL VITE_PLACES_INVEST_PATH VITE_PLACES_TRADE_PATH VITE_PLACES_TRANSPARENCY_PATH; do
  val="$(read_kv "$DEPLOY_ENV" "$key")"
  if [[ -n "$val" ]]; then
    set_kv "$DEPLOY_ENV" "$key" "$val"
    set_kv "$APP_ENV" "$key" "$val"
  fi
done
if [[ -z "$(read_kv "$DEPLOY_ENV" VITE_PLACES_SITE_URL)" ]]; then
  set_kv "$DEPLOY_ENV" VITE_PLACES_SITE_URL "$PLACES_SITE"
  set_kv "$APP_ENV" VITE_PLACES_SITE_URL "$PLACES_SITE"
fi
if [[ -z "$(read_kv "$DEPLOY_ENV" VITE_PLACES_INVEST_PATH)" ]]; then
  set_kv "$DEPLOY_ENV" VITE_PLACES_INVEST_PATH "/invest"
  set_kv "$APP_ENV" VITE_PLACES_INVEST_PATH "/invest"
fi
if [[ -z "$(read_kv "$DEPLOY_ENV" VITE_PLACES_TRADE_PATH)" ]]; then
  set_kv "$DEPLOY_ENV" VITE_PLACES_TRADE_PATH "/trade"
  set_kv "$APP_ENV" VITE_PLACES_TRADE_PATH "/trade"
fi
for key in COMPLIANCE_REGISTRY_ADDRESS PROPERTY_RESERVE_FEED_ADDRESS CHAINLINK_ACE_COMPLIANCE_ADDRESS; do
  val="$(read_kv "$DEPLOY_ENV" "$key")"
  if [[ -n "$val" ]]; then
    set_kv "$APP_ENV" "$key" "$val"
  fi
done

echo "==> Done. Rebuild/redeploy for production VITE_* changes:"
echo "    npm run deploy:grove   # or bash scripts/deploy-grove.sh"
echo "    node app/scripts/audit-vite-env.mjs"
