# Go-live command pack

Single runbook for staging and production go-live of the `b3/app` stack.

**Ecosystem checklist (phased AGENT/YOU tasks):** [ECOSYSTEM_GO_LIVE_RUNBOOK.md](./ECOSYSTEM_GO_LIVE_RUNBOOK.md)

This command pack is designed to be copy/paste safe for operators, with explicit gates before scale.

## 0) One-time operator setup

From repo root:

```bash
cd /Users/poker.vibe/xrpbaby/b3
cp deploy/.env.example deploy/.env
```

Fill `deploy/.env` with real values before any deploy:

- `DEPLOY_HOST` target should be reachable over SSH.
- `POSTGRES_PASSWORD`, `DATABASE_URL`, `STRAPI_API_TOKEN` (if Strapi-backed routes are used).
- `PUBLIC_APP_ORIGIN`, `VITE_APP_ORIGIN`, `VITE_PLATFORM_ORIGIN`.
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_MINIAPP_URL`, `TELEGRAM_INITDATA_MAX_AGE_SEC`.
- `XRPL_QUOTE_ENABLED=1`, `XRPL_EXECUTION_ENABLED=0` for launch.
- x402 vars (`THIRDWEB_SECRET_KEY`, `X402_SERVER_WALLET_ADDRESS`, `X402_PAY_TO`, `X402_PRICE`).

Safety rule: do not set `XRPL_EXECUTION_ENABLED=1` during controlled rollout.

## 1) Staging go-live (controlled)

### 1.1 Preflight gates

```bash
cd /Users/poker.vibe/xrpbaby/b3
npm ci
npm --prefix app run lint
npm --prefix app run typecheck
npm --prefix app run test:all
```

Database migration gate (staging DB):

```bash
cd /Users/poker.vibe/xrpbaby/b3/app
DATABASE_URL="postgresql://<user>:<pass>@<staging-host>:5432/<db>?schema=public" npx prisma migrate deploy
```

### 1.2 Deploy to staging host

Use app-only stack:

```bash
cd /Users/poker.vibe/xrpbaby/b3
export DEPLOY_HOST="user@<staging-ip>"
export DEPLOY_PATH="/opt/buildingculture-staging"
./scripts/sync-deploy-env.sh
./scripts/deploy-ssh.sh
```

Use full stack (web + strapi + agent + indexer) when required:

```bash
cd /Users/poker.vibe/xrpbaby/b3
export DEPLOY_HOST="user@<staging-ip>"
export DEPLOY_PATH="/opt/buildingculture-staging"
./scripts/sync-deploy-env.sh
./scripts/deploy-full-stack.sh
```

### 1.3 Staging verification

Set staging origin and run smoke:

```bash
cd /Users/poker.vibe/xrpbaby/b3
STRICT_SMOKE=1 ./scripts/production-smoke.sh "https://<staging-domain>"
```

Telegram and XRP quote-only checks:

```bash
BASE="https://<staging-domain>"
TG_INIT_DATA="<signed-init-data-from-telegram-webapp>"
curl -s -X POST "$BASE/api/tg/auth" -H "authorization: tma $TG_INIT_DATA" -H "content-type: application/json" -d '{}' | jq .
curl -s "$BASE/api/tg/me" -H "authorization: tma $TG_INIT_DATA" | jq .
curl -s "$BASE/api/tg/quests" -H "authorization: tma $TG_INIT_DATA" | jq .
curl -s "$BASE/api/tg/learn/modules" -H "authorization: tma $TG_INIT_DATA" | jq .
curl -s "$BASE/api/market/xrp-quote?base=XRP&quote=USD&amount=100&mode=learn" | jq .
```

Non-production convenience (only when `NODE_ENV != production`):

```bash
BASE="https://<staging-domain>"
curl -s -X POST "$BASE/api/tg/auth" -H "x-telegram-dev-user: 1001" -H "content-type: application/json" -d '{}' | jq .
```

Hard pass criteria:

- Smoke script passes with `STRICT_SMOKE=1`.
- `/api/market/xrp-quote` returns `ok:true`.
- `XRPL_EXECUTION_ENABLED` remains `0`.
- Telegram quest and learning endpoints return healthy JSON for an authenticated user.

## 2) Production go-live

### 2.1 Freeze + final checks

```bash
cd /Users/poker.vibe/xrpbaby/b3
git status
npm ci
npm --prefix app run lint
npm --prefix app run typecheck
npm --prefix app run test:all
```

Production migration:

```bash
cd /Users/poker.vibe/xrpbaby/b3/app
DATABASE_URL="postgresql://<user>:<pass>@<prod-host>:5432/<db>?schema=public" npx prisma migrate deploy
```

### 2.2 Deploy production

```bash
cd /Users/poker.vibe/xrpbaby/b3
export DEPLOY_HOST="user@<prod-ip>"
export DEPLOY_PATH="/opt/buildingculture"
./scripts/sync-deploy-env.sh
./scripts/deploy-ssh.sh
```

If production requires strapi + agent + indexer on the same run:

```bash
cd /Users/poker.vibe/xrpbaby/b3
export DEPLOY_HOST="user@<prod-ip>"
export DEPLOY_PATH="/opt/buildingculture"
./scripts/sync-deploy-env.sh
./scripts/deploy-full-stack.sh
```

### 2.3 Post-deploy reliability gate (must pass before growth push)

```bash
cd /Users/poker.vibe/xrpbaby/b3
STRICT_SMOKE=1 ./scripts/production-smoke.sh "https://app.buildingcultureid.space"
```

4-hour loop:

```bash
BASE="https://app.buildingcultureid.space"
curl -s "$BASE/api/pulse/metrics" | jq .
curl -s "$BASE/api/market/bcc" | jq .
curl -s "$BASE/api/market/health" | jq .
curl -s "$BASE/api/trading/health" | jq .
curl -s "$BASE/api/marketing/grove/tick" | jq .
```

Stop condition:

- If any endpoint degrades, pause campaign scale and restore service first.

## 3) Investor-proof artifact generation

Generate proof bundle immediately after production smoke passes:

```bash
cd /Users/poker.vibe/xrpbaby/b3
./scripts/collect-investor-proof.sh "https://app.buildingcultureid.space"
```

Then fill manual settlement fields in the emitted JSON:

- `externalPaidTransactionTxHash`
- `settlementRecipientAddress`
- `settlementLogReference`
- `counterparty`
- `notes`

## 4) Telegram controlled rollout evidence

Use this template after first rollout window:

- `docs/TELEGRAM_MINIAPP_TON_XRP.md`

Minimum evidence to include:

- Auth validation (`/api/tg/auth`) success ratio.
- TON wallet connected events.
- Quest claims and learning completions.
- XRP quote requests.
- Confirmation that `XRPL_EXECUTION_ENABLED=0`.

## 5) Rollback pack (fast path)

If production fails gates:

1. Pause demand-scale activity and announce owner + ETA.
2. Re-deploy previous known-good image/tag on server.
3. Re-run:

```bash
cd /Users/poker.vibe/xrpbaby/b3
STRICT_SMOKE=1 ./scripts/production-smoke.sh "https://app.buildingcultureid.space"
```

4. Resume traffic only after all reliability gates are healthy.

## 6) Operator launch checklist (final)

- `deploy/.env` verified for production values.
- `XRPL_QUOTE_ENABLED=1` and `XRPL_EXECUTION_ENABLED=0`.
- Telegram bot token set and miniapp URL correct.
- x402 payout and pricing vars set.
- Production smoke green.
- Investor proof bundle generated.
- Telegram rollout report started.
