#!/usr/bin/env bash
# Ensure thirdweb marketplace vars are present in app/.env and deploy/.env (idempotent).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DESTS=("$ROOT/app/.env" "$ROOT/deploy/.env")
CONTRACTS_ENV="$ROOT/contracts/.env"
DEPLOY_ENV="$ROOT/deploy/.env"

# Prefer explicit source, then contracts/.env (canonical thirdweb deploy vars), then deploy/.env, then app/.env
if [[ -n "${MARKET_ENV_SOURCE:-}" ]]; then
  SRC="$MARKET_ENV_SOURCE"
elif [[ -f "$CONTRACTS_ENV" ]] && grep -qE '^THIRDWEB_MARKETPLACE_CONTRACT_ADDRESS=' "$CONTRACTS_ENV" 2>/dev/null; then
  SRC="$CONTRACTS_ENV"
elif [[ -f "$DEPLOY_ENV" ]] && grep -qE '^THIRDWEB_MARKETPLACE_CONTRACT_ADDRESS=' "$DEPLOY_ENV" 2>/dev/null; then
  SRC="$DEPLOY_ENV"
else
  SRC="${DESTS[0]}"
fi

if [[ ! -f "$SRC" ]]; then
  echo "error: missing $SRC — copy app/.env.example and/or set contracts/.env"
  exit 1
fi
read_kv() {
  local key="$1"
  grep -E "^${key}=" "$SRC" 2>/dev/null | head -1 | cut -d= -f2- || true
}

set_kv() {
  local dest="$1"
  local key="$2"
  local val="$3"
  if [[ -z "$val" ]] || [[ ! -f "$dest" ]]; then
    return
  fi
  if grep -qE "^${key}=" "$dest" 2>/dev/null; then
    if [[ "$(uname)" == "Darwin" ]]; then
      sed -i '' "s|^${key}=.*|${key}=${val}|" "$dest"
    else
      sed -i "s|^${key}=.*|${key}=${val}|" "$dest"
    fi
  elif grep -qE "^# ${key}=" "$dest" 2>/dev/null; then
    if [[ "$(uname)" == "Darwin" ]]; then
      sed -i '' "s|^# ${key}=.*|${key}=${val}|" "$dest"
    else
      sed -i "s|^# ${key}=.*|${key}=${val}|" "$dest"
    fi
  else
    printf '\n%s=%s\n' "$key" "$val" >>"$dest"
  fi
}

CLIENT_ID="$(read_kv THIRDWEB_CLIENT_ID)"
SECRET="$(read_kv THIRDWEB_SECRET_KEY)"
MARKET="$(read_kv THIRDWEB_MARKETPLACE_CONTRACT_ADDRESS)"
VAULT="$(read_kv THIRDWEB_VAULT_ID)"

# Canonical Base mainnet Marketplace V3 (docs/ADDRESSES.json) when source has no deploy record
if [[ -z "$MARKET" ]]; then
  MARKET="0x3af9EB7784C1843BD8385D1F41dE78d4B83AEcf4"
fi

for DEST in "${DESTS[@]}"; do
  if [[ ! -f "$DEST" ]]; then
    echo "skip: missing $(basename "$(dirname "$DEST")")/$(basename "$DEST")"
    continue
  fi
  set_kv "$DEST" VITE_THIRDWEB_CLIENT_ID "$CLIENT_ID"
  set_kv "$DEST" THIRDWEB_CLIENT_ID "$CLIENT_ID"
  set_kv "$DEST" THIRDWEB_SECRET_KEY "$SECRET"
  set_kv "$DEST" VITE_MARKETPLACE_CONTRACT_ADDRESS "$MARKET"
  set_kv "$DEST" THIRDWEB_MARKETPLACE_CONTRACT_ADDRESS "$MARKET"
  set_kv "$DEST" MARKETPLACE_CONTRACT_ADDRESS "$MARKET"
  set_kv "$DEST" VITE_MARKETPLACE_NETWORK "base"
  set_kv "$DEST" VITE_VAULT_ID "$VAULT"

  # Featured collection: Culture Layer identity ERC-721 (listings filter collection=pit still works when PIT unset)
  if ! grep -qE '^VITE_PIT_NFT_CONTRACT_ADDRESS=' "$DEST" 2>/dev/null; then
    IDENTITY="$(grep -E '^VITE_IDENTITY_CONTRACT_ADDRESS=' "$DEST" 2>/dev/null | cut -d= -f2- || true)"
    if [[ -n "$IDENTITY" ]]; then
      set_kv "$DEST" VITE_PIT_NFT_CONTRACT_ADDRESS "$IDENTITY"
    fi
  fi
  echo "==> Market env synced into $(basename "$(dirname "$DEST")")/$(basename "$DEST") from $(basename "$SRC")"
done

echo "    Restart: npm run dev (app) — VITE_MARKETPLACE_CONTRACT_ADDRESS + THIRDWEB_*"
