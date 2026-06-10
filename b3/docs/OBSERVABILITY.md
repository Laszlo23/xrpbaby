# Observability

## App runtime (`b3/app`)

- **Sentry**: initialized when `VITE_SENTRY_DSN` is set (see `app/src/lib/sentry.ts`).
- **PostHog**: product funnel events and `agent_ref` attribution in `app/src/lib/analytics.ts`.
- **Database audit logs**:
  - `ActivityEvent` for user/product actions.
  - `AgentActionLog` for agent runtime actions (surfaced on `/agent-fleet`).

## Reliability gates (P0)

These endpoints must stay healthy before campaign scale-up:

- `GET /api/pulse/metrics`
- `GET /api/market/bcc`
- `GET /api/points/redeem/stats`
- `GET /api/market/health`
- `GET /api/trading/health`
- `GET /api/marketing/grove/tick`

## Monitoring workflow

### 1) Production smoke

Run:

```bash
./scripts/production-smoke.sh https://app.buildingcultureid.space
```

Notes:

- Default is strict mode (`STRICT_SMOKE=1`) and fails on degraded pulse metrics.
- Set `STRICT_SMOKE=0` only for temporary triage windows.

### 2) Four-hour reliability loop (ECO-001)

Automated probe (writes `proof-bundles/reliability-latest.json`, optional Slack):

```bash
npm run reliability:loop
# or with alerts:
RELIABILITY_SLACK_WEBHOOK_URL=https://hooks.slack.com/services/... npm run reliability:loop
```

Install on VPS (every 4h):

```bash
sudo DEPLOY_PATH=/opt/buildingculture bash scripts/install-reliability-cron.sh
```

Manual curl sweep:

```bash
BASE=https://app.buildingcultureid.space
curl -s "$BASE/api/pulse/metrics" | jq .
curl -s "$BASE/api/market/bcc" | jq .
curl -s "$BASE/api/market/health" | jq .
curl -s "$BASE/api/trading/health" | jq .
curl -s "$BASE/api/marketing/grove/tick" | jq .
```

Record status in active REA reliability tickets.

### 3) Agent attribution dashboard (ECO-002)

- UI: `GET /ops/attribution`
- API: `GET /api/platform/attribution-dashboard`
- Optional gate: set `OPS_DASHBOARD_SECRET` in deploy env
- Weekly export ritual: [ATTRIBUTION_WEEKLY_SNAPSHOT.md](./ATTRIBUTION_WEEKLY_SNAPSHOT.md)

## Alerts

- `slack-digest`: daily summary of ledger actions.
- `treasury-guardian`: low native balance on configured EOAs.
- `raffle-watcher`: phase/commitment changes on raffle contract.
- `grove-health`: endpoint degradation for Grove/Pulse/Market — use `npm run reliability:loop` + `RELIABILITY_SLACK_WEBHOOK_URL`

## Incident rule

If any reliability gate endpoint degrades:

1. Pause demand-scale activities.
2. Post outage owner + ETA.
3. Restore service before resuming campaigns.
