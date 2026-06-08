# Release captain 15-minute flow

Use this when you want a fast, disciplined launch window without guesswork.

Canonical public target: `https://app.buildingcultureid.space`.

## Roles (minimum)

- Release captain: runs commands and calls go/no-go.
- Scribe: records outcomes and artifacts.
- Watcher: monitors reliability endpoints during and after deploy.

## T-30 to T-10 (prep)

From repo root:

```bash
cd /Users/poker.vibe/xrpbaby/b3
git status
npm ci
npm --prefix app run lint
npm --prefix app run typecheck
npm --prefix app run test:all
```

DB migration gate:

```bash
cd /Users/poker.vibe/xrpbaby/b3/app
DATABASE_URL="postgresql://<prod-user>:<prod-pass>@<prod-host>:5432/<prod-db>?schema=public" npx prisma migrate deploy
```

Go/no-go gate A:

- All checks above are green.
- No unresolved P0/P1 incidents.

## T-10 to T+0 (deploy)

Back to repo root:

```bash
cd /Users/poker.vibe/xrpbaby/b3
export DEPLOY_HOST="user@<prod-ip>"
export DEPLOY_PATH="/opt/buildingculture"
./scripts/sync-deploy-env.sh
./scripts/deploy-ssh.sh
```

If this window includes Strapi + agent-runtime + indexer refresh:

```bash
cd /Users/poker.vibe/xrpbaby/b3
export DEPLOY_HOST="user@<prod-ip>"
export DEPLOY_PATH="/opt/buildingculture"
./scripts/sync-deploy-env.sh
./scripts/deploy-full-stack.sh
```

Go/no-go gate B:

- Deploy command exits cleanly.
- Container/app process is healthy on server.

## T+0 to T+10 (hard reliability gates)

```bash
cd /Users/poker.vibe/xrpbaby/b3
STRICT_SMOKE=1 ./scripts/production-smoke.sh "https://app.buildingcultureid.space"
```

Manual reliability sweep:

```bash
BASE="https://app.buildingcultureid.space"
curl -s "$BASE/api/pulse/metrics" | jq .
curl -s "$BASE/api/market/bcc" | jq .
curl -s "$BASE/api/market/health" | jq .
curl -s "$BASE/api/trading/health" | jq .
curl -s "$BASE/api/marketing/grove/tick" | jq .
```

Go/no-go gate C:

- Smoke returns all green.
- Endpoint sweep shows healthy JSON and no degraded service.

If gate C fails: pause growth traffic, assign incident owner, rollback to last known good release.

## T+10 to T+15 (proof + launch confirmation)

Generate investor proof bundle:

```bash
cd /Users/poker.vibe/xrpbaby/b3
./scripts/collect-investor-proof.sh "https://app.buildingcultureid.space"
```

Telegram controlled rollout checks (authenticated):

```bash
BASE="https://app.buildingcultureid.space"
TG_INIT_DATA="<signed-init-data-from-telegram-webapp>"
curl -s -X POST "$BASE/api/tg/auth" -H "authorization: tma $TG_INIT_DATA" -H "content-type: application/json" -d '{}' | jq .
curl -s "$BASE/api/tg/me" -H "authorization: tma $TG_INIT_DATA" | jq .
curl -s "$BASE/api/tg/quests" -H "authorization: tma $TG_INIT_DATA" | jq .
curl -s "$BASE/api/tg/learn/modules" -H "authorization: tma $TG_INIT_DATA" | jq .
curl -s "$BASE/api/market/xrp-quote?base=XRP&quote=USD&amount=100&mode=learn" | jq .
```

Safety confirmation:

- `XRPL_QUOTE_ENABLED=1`
- `XRPL_EXECUTION_ENABLED=0`

## Current launch policy checks

Before announcing wider growth push, confirm:

- Agent automation remains policy-controlled (`AGENTS_PAUSED` and `ECON_LIVE` aligned with rollout decision).
- Public origin remains `https://app.buildingcultureid.space`.
- Telegram bot auth and init-data validation are active.

## Rollback fast path

1. Announce temporary hold and owner.
2. Re-deploy previous known-good image/tag on prod host.
3. Re-run:

```bash
cd /Users/poker.vibe/xrpbaby/b3
STRICT_SMOKE=1 ./scripts/production-smoke.sh "https://app.buildingcultureid.space"
```

4. Resume only when all reliability gates pass.

## Ops handoff message template

Use this after each release window:

```text
Release window: <date/time UTC>
Result: GO | NO-GO
Deployed by: <name>
Commit/tag: <sha-or-tag>
Smoke: PASS | FAIL
Reliability sweep: PASS | FAIL
Telegram checks: PASS | FAIL
XRP safety (execution disabled): CONFIRMED | NOT CONFIRMED
Proof bundle: <path>
Follow-ups: <tickets/actions>
```
