# Agent wallet inventory (addresses only)

This file is **non-secret**: it tracks public wallet addresses used by agent ops.

Do **not** add seed phrases or private keys. Secrets should live outside the repo (see `ops/AGENT_KEYS.md`).

## Networks

- Base (8453)
- Solana mainnet

## Alchemy CLI Agent Wallet (session signer)

Privy embedded wallet connected via `alchemy wallet connect --mode session`. Keys stay with Alchemy/Privy; the CLI signs through an approved session (renew before expiry). **Not** the treasury Safe or deployer EOA.

| Chain | Address | Notes |
| --- | --- | --- |
| EVM (Base) | `0x7ff3943d368c0ec6b0476766463e6002538b93ab` | Fund with ETH on Base for `alchemy evm send` / contract calls |
| Solana | `32weqCQJ2VgdQE79yUtU1QYmvrE7kMTEWL8FRzi2uho2` | Paired session wallet; fund SOL for Solana txs |

CLI instance name: `b3-cursor`. Default Alchemy app: **Account Kit Quickstart** (`3wp65rj1tqiadm39`).

```bash
alchemy wallet status --verify
alchemy wallet address
alchemy evm data balance 0x7ff3943d368c0ec6b0476766463e6002538b93ab -n base-mainnet
alchemy solana rpc getBalance 32weqCQJ2VgdQE79yUtU1QYmvrE7kMTEWL8FRzi2uho2 -n solana-mainnet
cd alchemy-demo && npm run demo   # or from repo root: npm run alchemy:demo
```

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

