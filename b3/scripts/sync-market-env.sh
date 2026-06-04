#!/usr/bin/env bash
# Copy thirdweb marketplace vars from apps/identity/.env into app/.env (idempotent).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${MARKET_ENV_SOURCE:-$ROOT/apps/identity/.env}"
DEST="$ROOT/app/.env"

if [[ ! -f "$SRC" ]]; then
  echo "error: missing $SRC"
  exit 1
fi
if [[ ! -f "$DEST" ]]; then
  echo "error: missing $DEST — copy app/.env.example first"
  exit 1
fi

read_kv() {
  local key="$1"
  grep -E "^${key}=" "$SRC" 2>/dev/null | head -1 | cut -d= -f2- || true
}

set_kv() {
  local key="$1"
  local val="$2"
  if [[ -z "$val" ]]; then
    return
  fi
  if grep -qE "^${key}=" "$DEST" 2>/dev/null; then
    if [[ "$(uname)" == "Darwin" ]]; then
      sed -i '' "s|^${key}=.*|${key}=${val}|" "$DEST"
    else
      sed -i "s|^${key}=.*|${key}=${val}|" "$DEST"
    fi
  else
    printf '\n%s=%s\n' "$key" "$val" >>"$DEST"
  fi
}

CLIENT_ID="$(read_kv THIRDWEB_CLIENT_ID)"
SECRET="$(read_kv THIRDWEB_SECRET_KEY)"
MARKET="$(read_kv THIRDWEB_MARKETPLACE_CONTRACT_ADDRESS)"
VAULT="$(read_kv THIRDWEB_VAULT_ID)"

set_kv VITE_THIRDWEB_CLIENT_ID "$CLIENT_ID"
set_kv THIRDWEB_SECRET_KEY "$SECRET"
set_kv VITE_MARKETPLACE_CONTRACT_ADDRESS "$MARKET"
set_kv THIRDWEB_MARKETPLACE_CONTRACT_ADDRESS "$MARKET"
set_kv VITE_MARKETPLACE_NETWORK "base"
set_kv VITE_VAULT_ID "$VAULT"

# Featured collection: Culture Layer identity ERC-721 (listings filter collection=pit still works when PIT unset)
if ! grep -qE '^VITE_PIT_NFT_CONTRACT_ADDRESS=' "$DEST" 2>/dev/null; then
  IDENTITY="$(grep -E '^VITE_IDENTITY_CONTRACT_ADDRESS=' "$DEST" 2>/dev/null | cut -d= -f2- || true)"
  if [[ -n "$IDENTITY" ]]; then
    set_kv VITE_PIT_NFT_CONTRACT_ADDRESS "$IDENTITY"
  fi
fi

echo "==> Market env synced into app/.env from $(basename "$SRC")"
echo "    VITE_MARKETPLACE_CONTRACT_ADDRESS + THIRDWEB_* (restart npm run dev)"
