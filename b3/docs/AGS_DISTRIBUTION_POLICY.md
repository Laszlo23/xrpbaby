# AGS distribution policy (draft)

> **Status:** Draft for community + legal review — not a binding offer.

## Objectives

- Reward **verified humans** and **consistent contributors** without creating unregistered securities offerings in any jurisdiction.
- Keep **caps** enforced in code (`perTxAgsCap`, `monthlyAgsCap`, `maxRecipientsPerTick` in `ops/agents.json`).

## Eligibility signals (stacked)

1. **On-chain** — indexed `ChainMintEvent` rows for transparency; `leaderboard-updater` summarizes aggregates.
2. **Engagement** — `PointLedger` task `daily-checkin-onchain` (and related tasks) as a **non-financial** loyalty signal.
3. **Strapi community profile** — wallet-linked profile required for distributor recipients where configured.

## Operational rules

- **Dry-run first** — new distributor policies ship with `ECON_LIVE=0` until reviewed.
- **Kill-switch** — `AGENTS_PAUSED=1` halts all agent ticks.
- **No guarantees** — distribution amounts, schedules, and programs can change; document changes in release notes.

## Compliance

- Consult counsel before tying AGS to **paid mint**, **raffles**, or **investment** messaging in any region.
