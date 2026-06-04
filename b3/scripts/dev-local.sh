#!/usr/bin/env bash
# One-shot local stack: Postgres, migrations, market env, trading worker, Vite app.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Postgres + migrations"
npm run db:start
npm run db:migrate

echo "==> Market / thirdweb env"
npm run market:env 2>/dev/null || true

echo "==> Places compliance registry (app/.env)"
APP_ENV="$ROOT/app/.env"
if ! grep -qE '^COMPLIANCE_REGISTRY_ADDRESS=' "$APP_ENV" 2>/dev/null; then
  printf '\nCOMPLIANCE_REGISTRY_ADDRESS=0xa655c0B0037699433F0692356a3A142956103B7a\n' >>"$APP_ENV"
fi
if ! grep -qE '^VITE_PLACES_SITE_URL=' "$APP_ENV" 2>/dev/null; then
  printf 'VITE_PLACES_SITE_URL=https://buildingculture.capital\n' >>"$APP_ENV"
fi

echo "==> Local app origins + NODE_ENV (app/.env)"
APP_ENV="$ROOT/app/.env"
if grep -qE '^NODE_ENV=production' "$APP_ENV" 2>/dev/null; then
  if [[ "$(uname)" == "Darwin" ]]; then
    sed -i '' 's/^NODE_ENV=production/# NODE_ENV=production (use Vite default for local dev)/' "$APP_ENV"
  else
    sed -i 's/^NODE_ENV=production/# NODE_ENV=production (use Vite default for local dev)/' "$APP_ENV"
  fi
fi
for key in PUBLIC_APP_ORIGIN VITE_APP_ORIGIN VITE_PLATFORM_ORIGIN; do
  if grep -qE "^${key}=" "$APP_ENV" 2>/dev/null; then
    if [[ "$(uname)" == "Darwin" ]]; then
      sed -i '' "s|^${key}=.*|${key}=http://localhost:5173|" "$APP_ENV"
    else
      sed -i "s|^${key}=.*|${key}=http://localhost:5173|" "$APP_ENV"
    fi
  fi
done

echo "==> Trading agent (background :8765)"
lsof -ti :8765 | xargs kill -9 2>/dev/null || true
bash "$ROOT/scripts/dev-trading-agent.sh" &
TRADING_PID=$!
sleep 2
if ! curl -sf -m 5 http://127.0.0.1:8765/health >/dev/null; then
  echo "warn: trading agent not healthy yet — check logs"
fi

echo "==> Stopping anything on :5173"
lsof -ti :5173 | xargs kill -9 2>/dev/null || true
sleep 1

echo ""
echo "Local URLs:"
echo "  App        http://localhost:5173"
echo "  Forest     http://localhost:5173/forest"
echo "  Marketplace http://localhost:5173/marketplace"
echo "  Pass/mint  http://localhost:5173/pass"
echo "  Market API http://localhost:5173/api/market/health"
echo "  Trading    http://localhost:5173/api/trading/health"
echo ""
echo "Healthcheck: npm run dev:healthcheck"
echo "Trading PID: $TRADING_PID (kill with: kill $TRADING_PID)"
echo ""

cd "$ROOT/app"
exec npm run dev
