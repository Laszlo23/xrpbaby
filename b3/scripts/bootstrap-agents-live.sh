#!/usr/bin/env bash
# Launch agents on OpenAI while 0G bridge/funding is blocked.
# Revenue path: Grove + social-scout (traffic) + x402-monetizer (MRR probe).
# Keeps ECON_LIVE=0 until VERIFY_GATE.md is complete.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEPLOY_ENV="$ROOT/deploy/.env"

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

echo "==> Agent bootstrap (OpenAI LLM, growth + x402)"
[[ -f "$DEPLOY_ENV" ]] || cp "$ROOT/deploy/.env.example" "$DEPLOY_ENV"

upsert_env "$DEPLOY_ENV" "AGENT_BOOTSTRAP_MODE" "1"
upsert_env "$DEPLOY_ENV" "AGENT_LLM_PROVIDER" "auto"
upsert_env "$DEPLOY_ENV" "AGENT_LLM_ALLOW_OPENAI_FALLBACK" "1"
upsert_env "$DEPLOY_ENV" "GROVE_LLM_ENABLED" "1"
upsert_env "$DEPLOY_ENV" "AGENTS_PAUSED" "0"
# On-chain AGS mint stays off until VERIFY_GATE.md
upsert_env "$DEPLOY_ENV" "ECON_LIVE" "0"

"$ROOT/scripts/sync-deploy-env.sh"

echo "==> Building agent-runtime"
npm run build -w @bc/bcd-orchestration -w @bc/agent-runtime --prefix "$ROOT"

echo "==> Probing OpenAI inference"
set -a
# shellcheck disable=SC1090
source "$DEPLOY_ENV"
set +a
node "$ROOT/scripts/probe-openai-inference.mjs" || {
  echo ""
  echo "⚠ OpenAI probe failed — Grove still posts rule-based copy; CEO/social LLM tasks need billing or 0G."
  echo "  Fix: add OpenAI credits OR send ~2.5 native 0G to deployer wallet + npm run setup:agent-0g"
}

echo ""
echo "==> Bootstrap ready. Redeploy agent-runtime + web stack to pick up env."
echo "    Monitor: /agent-fleet on app host"
echo "    Revenue: x402 GET /api/x402/premium · Grove tick · social-scout"
echo "    Flip to 0G later: AGENT_BOOTSTRAP_MODE=0 AGENT_LLM_PROVIDER=0g + npm run setup:agent-0g"
