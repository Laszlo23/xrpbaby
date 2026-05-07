# Agent fleet — Phase 0 → Phase 1

## Phase 0 (dry chain, ledger live)

1. **Postgres** — apply migration `frontend/prisma/migrations/20260503230000_agent_action_log/` (or `npm --prefix frontend run db:push` in dev).
2. **Env file** on VPS: `/etc/bc-agent-tick.env`

   ```env
   DATABASE_URL=postgresql://…
   STRAPI_URL=https://your-strapi.example
   STRAPI_API_TOKEN=…5b509ef4abf240ebe09162bc5223ef2ea989a302d198fda56fa6e88c9c71aa637ecb1650a227dc5adc27d7a3c8edd3967e82e426f3bfea2a8adc9cc3c551b6ca7e8e6a06313d3613044dd37db16d0bc88d2a8824c36168fa6d14355cab5b14ecd0f7bbca184ddfe4189e8533bd17ec764d88ea523bdce3bcf68d0a931b1c7b0c
   AGENT_BASE_RPC_URL=https://mainnet.base.org
   AGENTS_PAUSED=false
   ECON_LIVE=false
   ```

3. **Install timer** — `chmod +x b3/scripts/install-agents-on-server.sh && DEPLOY_HOST=… ./b3/scripts/install-agents-on-server.sh`
4. **Fund wallets on Base (8453)** — run `node b3/scripts/generate-agent-wallets.mjs` and copy the printed addresses (never commit keys). Fund the **operator** with ~**0.05 ETH** for Phase 0 reads/ops. The **ags-distributor** wallet only needs ETH after `ECON_LIVE=true`; budget ≈ `(mintPriceWei + gas) * maxRecipientsPerTick` per tick.

   Funding should follow the Safe → HotOps runbook in `docs/AGENT_FUNDING_RUNBOOK.md` and be recorded (non-secret) in `ops/SAFE_REFILL_LOG.md`.
   Track public addresses in `ops/AGENT_WALLET_INVENTORY.md`.
5. **Watch** — `/agent-fleet` (dashboard) and `GET /api/agents/status`
6. **24h dry run** — keep `ECON_LIVE=false`, confirm ledger rows show `dryRun: true` and `txHash` null for `chain.ags_mint_transfer` (`mode: econ_live_false`). Then follow **Phase 1 flip** below.

## Phase 1 flip (live mint + transfer)

1. Set `ECON_LIVE=true` and `AGENT_AGS_DISTRIBUTOR_PRIVATE_KEY=0x…` in `/etc/bc-agent-tick.env`.
2. Keep `perTxAgsCap` and `monthlyAgsCap` low in `ops/agents.json`.
3. `sudo systemctl restart bc-agent-tick.service` once manually to smoke-test, then rely on timer.
4. Monitor `agsMonthlyOkCount` on `/agent-fleet`.

## Kill switch

`AGENTS_PAUSED=true` → next tick logs `_system` / `runtime.paused` and skips all agents.

## Ledger snapshots

Weekly:

```bash
sudo -u postgres pg_dump "$DATABASE_URL" -t '"AgentActionLog"' | gzip > "/var/lib/bc-agent-ledger-snapshots/agent_action_log-$(date -u +%F).sql.gz"
```

Adjust role/db name for your hosting.
