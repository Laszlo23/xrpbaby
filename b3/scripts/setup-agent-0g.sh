#!/usr/bin/env bash
# Full 0G agent inference + orchestration setup for b3.
# Wallet-funded LLM via 0G Compute Router (preferred) or Direct CLI fallback.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEPLOY_ENV="$ROOT/deploy/.env"
APP_ENV="$ROOT/app/.env"
CONTRACTS_ENV="$ROOT/contracts/.env"
LOCAL_DB_URL="postgresql://buildingculture:buildingculture@127.0.0.1:55432/buildingculture?schema=public"

redact() { sed 's/=.*/=***/'; }

upsert_env() {
  local file="$1" key="$2" value="$3"
  if grep -q "^${key}=" "$file" 2>/dev/null; then
    if [[ "$(uname)" == Darwin ]]; then
      sed -i '' "s|^${key}=.*|${key}=${value}|" "$file"
    else
      sed -i "s|^${key}=.*|${key}=${value}|" "$file"
    fi
  else
    echo "${key}=${value}" >> "$file"
  fi
}

echo "==> 0G agent setup (b3)"
echo "    deploy env: $DEPLOY_ENV"

if [[ ! -f "$DEPLOY_ENV" ]]; then
  cp "$ROOT/deploy/.env.example" "$DEPLOY_ENV"
  echo "    created deploy/.env from example — edit secrets before production"
fi

# --- Agent orchestration defaults ---
upsert_env "$DEPLOY_ENV" "AGENT_LLM_ALLOW_OPENAI_FALLBACK" "0"
upsert_env "$DEPLOY_ENV" "GROVE_LLM_ENABLED" "1"
upsert_env "$DEPLOY_ENV" "OG_COMPUTE_NETWORK" "mainnet"
upsert_env "$DEPLOY_ENV" "OG_COMPUTE_MODEL" "zai-org/GLM-5-FP8"
upsert_env "$DEPLOY_ENV" "OG_COMPUTE_USD_PER_1K_TOKENS" "0.0003"
upsert_env "$DEPLOY_ENV" "AGENT_REPO_ROOT" "/opt/buildingculture"
upsert_env "$DEPLOY_ENV" "REPO_ROOT" "/opt/buildingculture"
upsert_env "$DEPLOY_ENV" "OG_0G_RPC_URL" "https://evmrpc.0g.ai"

# Router API key: env var > deploy/.env > .secrets/og-router-api-key
if [[ -z "${OG_COMPUTE_ROUTER_API_KEY:-}" ]] && ! grep -q '^OG_COMPUTE_ROUTER_API_KEY=.\+' "$DEPLOY_ENV" 2>/dev/null; then
  if [[ -f "$ROOT/.secrets/og-router-api-key" ]]; then
    KEY="$(tr -d '[:space:]' < "$ROOT/.secrets/og-router-api-key")"
    upsert_env "$DEPLOY_ENV" "OG_COMPUTE_ROUTER_API_KEY" "$KEY"
    echo "    loaded OG_COMPUTE_ROUTER_API_KEY from .secrets/og-router-api-key"
  fi
fi

if [[ -n "${OG_COMPUTE_ROUTER_API_KEY:-}" ]]; then
  upsert_env "$DEPLOY_ENV" "OG_COMPUTE_ROUTER_API_KEY" "$OG_COMPUTE_ROUTER_API_KEY"
fi

# --- Optional: 0G Direct (wallet) via 0g-compute-cli when no Router sk- key ---
if ! grep -q '^OG_COMPUTE_ROUTER_API_KEY=.\+' "$DEPLOY_ENV" 2>/dev/null; then
  if command -v 0g-compute-cli >/dev/null 2>&1; then
    if [[ -f "$CONTRACTS_ENV" ]] || [[ -n "${PRIVATE_KEY:-}" ]]; then
      echo "==> 0G Direct: wallet-funded inference (non-interactive)"
      node "$ROOT/scripts/setup-agent-0g-direct.mjs" || {
        echo "    Direct setup failed — use Router key from https://pc.0g.ai"
      }
    fi
  fi
fi

# --- Sync app env ---
"$ROOT/scripts/sync-deploy-env.sh"

# --- Local Postgres + migrations (orchestration tables) ---
echo "==> Local Postgres + prisma migrate"
if bash "$ROOT/scripts/start-local-db.sh" 2>/dev/null; then
  echo "    local db ready"
else
  echo "    local db start skipped — trying migrate with deploy DATABASE_URL"
  cd "$ROOT/app"
  DATABASE_URL="${DATABASE_URL:-$LOCAL_DB_URL}" npx prisma migrate deploy || {
    echo "    warn: migrate failed — run on prod: cd app && npx prisma migrate deploy"
  }
fi

# --- Build agent-runtime ---
echo "==> Building @bc/agent-runtime"
npm run build -w @bc/bcd-orchestration -w @bc/agent-runtime --prefix "$ROOT"

# --- Probe inference ---
echo "==> Probing 0G inference"
set -a
# shellcheck disable=SC1090
source "$DEPLOY_ENV"
set +a
node "$ROOT/scripts/probe-og-inference.mjs" || {
  echo ""
  echo "Manual step required:"
  echo "  1. Open https://pc.0g.ai → connect wallet → Deposit 0G"
  echo "  2. Dashboard → API Keys → Create → copy sk- key"
  echo "  3. echo 'sk-...' > $ROOT/.secrets/og-router-api-key"
  echo "  4. Re-run: bash scripts/setup-agent-0g.sh"
  exit 1
}

echo ""
echo "==> Setup complete. Active inference env (redacted):"
grep -E '^(OG_COMPUTE|GROVE_LLM|AGENT_LLM|AGENTS_PAUSED)=' "$DEPLOY_ENV" | redact
