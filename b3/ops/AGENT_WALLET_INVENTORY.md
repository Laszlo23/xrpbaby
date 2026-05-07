# Agent wallet inventory (addresses only)

This file is **non-secret**: it tracks public wallet addresses used by agent ops.

Do **not** add seed phrases or private keys. Secrets should live outside the repo (see `ops/AGENT_KEYS.md`).

## Networks

- Base (8453)

## Canonical treasury Safe (Base)

- `0xCe03F6E734cC48393Ce41b257E998c68b521EB5c`

## Hot ops wallet (Base)

- Address:`0x59F6310f3D0eD4520Efba7Bc1c770A87aD333e0a`
- Float cap (ETH):
- Refill threshold (ETH):

## Per-agent wallets (optional)

| Agent id | Purpose | Address (Base) | Notes |
| --- | --- | --- | --- |
| operator | Phase 0 ops / reads |  | funded ~0.05 ETH for Phase 0 |
| ags-distributor-1 | ECON live mint+transfer signer |  | only fund when `ECON_LIVE=true` |

