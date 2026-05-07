# Observability

## Frontend (`b3/frontend`)

- **Sentry** — initialized when `VITE_SENTRY_DSN` is set (see `src/lib/sentry.ts`). Use environment-specific DSNs; never commit DSNs with org secrets in public forks.

## Agent runtime (`@bc/agent-runtime`)

- Primary audit trail: Postgres `AgentActionLog` (surfaced on `/agent-fleet`).
- **Datadog** — forward logs by running the worker under `DD_LOGS_INJECTION=true` with your Datadog Agent, or ship structured JSON to stdout and ingest via log drain. The Datadog MCP can query once the integration is live in your org.

## Alerts

- `slack-digest` — daily summary of ledger actions.
- `treasury-guardian` — low native balance on configured EOAs.
- `raffle-watcher` — phase / commitment changes on the raffle contract.
