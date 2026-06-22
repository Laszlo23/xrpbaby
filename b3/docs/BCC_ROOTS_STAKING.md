# Culture Roots — treasury BCC staking (operator runbook)

> **Status:** Operations draft — align emission budget and program terms with counsel before public commitments.

## Overview

**Culture Roots** is a treasury-funded BCC lock-up program. Rewards are **pre-funded BCC transfers** from protocol allocation — not inflationary mint. See [`BCC_TOKEN.md`](./BCC_TOKEN.md) and [`TREASURY_POLICY.md`](./TREASURY_POLICY.md).

| Item | Value |
|------|--------|
| Contract | `BccRootsStaking` — [`contracts/src/bcc/BccRootsStaking.sol`](../contracts/src/bcc/BccRootsStaking.sol) |
| **Mainnet deploy** | `0x42355c509743a92EBD6F2F7259D4f677Eca18b4d` — [tx `0xd82b…2c10`](https://basescan.org/tx/0xd82bd7e3941ade8125cc5e9ec9e0667c897fe751184a4317a01910fb96cd2c10) (2026-06-10) |
| Sepolia (testnet) | `0x5b73C5498c1E3b4dbA84de0F1833c4a029d90519` |
| BCC token (Base) | `0xb890a5289f789f1346032ccc1847939e855fab07` |
| Protocol Safe | `0x0D106D512Ac28cc29E625b22C6628989013c4C6B` |
| Treasury seed wallet (Aerodrome ops) | `0x502ce9…` — see [`BCC_AERODROME_LIQUIDITY.md`](./BCC_AERODROME_LIQUIDITY.md) |

Registry: [`contracts/deployments/bcc-8453.json`](../contracts/deployments/bcc-8453.json).

**Culture Power:** When `CULTURE_POWER_ENABLED=1`, Roots stake tier feeds the unified weekly BCC multiplier (see [`CULTURE_POWER.md`](./CULTURE_POWER.md)) instead of a separate staking-only boost.

## Unlock budget (confirm before countdown goes live)

Fill this table after counsel + treasury sign-off. **Do not publish emission numbers until confirmed.**

| Field | Placeholder | Notes |
|-------|-------------|--------|
| Unlock source wallet | `TBD` | Safe or vesting wallet that receives ~30% allocation |
| Total unlock budget (BCC) | `TBD` | Wei or human-readable; counsel-approved |
| Year-1 emission cap | `TBD` | Recommend 20–30% of unlock budget |
| Weekly keeper cap | `BCC_ROOTS_WEEKLY_CAP_WEI` env | Hard stop for `bcc:roots-rewards-keeper` |
| Unlock target date | `VITE_BCC_ROOTS_UNLOCK_AT` | ISO-8601; drives Root Season countdown UI |

### Illustrative emission schedule (replace before mainnet)

| Week | Pool focus | Max BCC (example) | Funded by |
|------|------------|-------------------|-----------|
| 1–4 | Seedling only | ops sets per cap | Treasury hot wallet or Safe |
| 5–8 | Seedling + Builder Grove | ops sets per cap | Same |
| 9+ | All tiers | ops sets per cap | Same |

Publish the **final** schedule on `/mission` and `/roots` when counsel approves.

## Pool tiers

| `poolId` | Name | Min lock | Weight | Eligibility |
|----------|------|----------|--------|-------------|
| 0 | Seedling | 30 days | 1.0× | Open |
| 1 | Builder Grove | 90 days | 1.3× | ≥500 Culture Points, genesis pass, or Builder Voice gold |
| 2 | Elder Canopy | 180 days | 1.5× | `founding` / `elder` supporter tier |

Boost checks: `GET /api/roots/boost?address=0x…` (off-chain; SIWE for points tasks).

## Deploy

```bash
# Base Sepolia (testnet drill)
CHAIN_ID=84532 npm run deploy:bcc-roots

# Base mainnet (after counsel approves emission schedule)
CHAIN_ID=8453 npm run deploy:bcc-roots
```

Manual forge (alternative):

```bash
cd contracts

# Base Sepolia (testnet)
BCC_TOKEN_ADDRESS=0xb890a5289f789f1346032ccc1847939e855fab07 \
ADMIN_ADDRESS=0xYourSafeOrAdmin \
PRIVATE_KEY=0x... \
forge script script/DeployBccRootsStaking.s.sol \
  --rpc-url $BASE_SEPOLIA_RPC --broadcast --chain-id 84532

# Base mainnet (unlock window)
BCC_TOKEN_ADDRESS=0xb890a5289f789f1346032ccc1847939e855fab07 \
ADMIN_ADDRESS=0x0D106D512Ac28cc29E625b22C6628989013c4C6B \
PRIVATE_KEY=0x... \
forge script script/DeployBccRootsStaking.s.sol \
  --rpc-url $BASE_RPC --broadcast --chain-id 8453
```

After deploy:

1. Record address in `contracts/deployments/bcc-8453.json` → `contracts.BccRootsStaking`
2. Set `VITE_BCC_ROOTS_STAKING_ADDRESS` in `app/.env` and `deploy/.env`
3. Run `npm run sync:vite-env` from repo root if applicable
4. Grant `REWARD_ROLE` on the contract to the Safe (or ops hot wallet used by keeper)

## Fund rewards (keeper)

Dry-run (default):

```bash
cd app
npm run bcc:roots-rewards-keeper
```

Live:

```bash
BCC_ROOTS_REWARDS_KEEPER_DRY_RUN=0 \
BCC_TREASURY_ONCHAIN=1 \
BCC_ROOTS_STAKING_ADDRESS=0x... \
BCC_ROOTS_POOL_ID=0 \
BCC_ROOTS_REWARD_AMOUNT_WEI=... \
BCC_ROOTS_REWARD_DURATION_SEC=604800 \
BCC_ROOTS_WEEKLY_CAP_WEI=... \
npm run bcc:roots-rewards-keeper
```

The keeper calls `notifyRewardAmount(poolId, amount, duration)` after approving BCC spend.

**Safe workflow:** multisig approves weekly `notifyRewardAmount` txs directly when not using hot wallet.

## Pause / incident

- Contract: `pause()` / `unpause()` — `DEFAULT_ADMIN_ROLE` (Safe)
- App: hide stake CTAs when `VITE_BCC_ROOTS_ENABLED=0`
- Treasury: stop keeper; log in treasury ops log per [`TREASURY_POLICY.md`](./TREASURY_POLICY.md)

## Comms guardrails

**Use:** treasury participation, builder allocation, protocol reward stream  
**Avoid:** guaranteed APY, passive income, investment returns

Mirror honesty copy on `/mission` — BCC is coordination & access, not a profit promise.

## App surfaces

| Path | Role |
|------|------|
| `/roots` | Stake, claim, unstake, pool picker |
| `/mission` | Root Season countdown + `CultureRootsPanel` |
| `/profile` | Staked summary + boost eligibility |
| `/forest` | Grow your roots module |
| `/liquidity` | Cross-link vs LP gauge staking |

Points task: `bcc-roots-stake` (+50) on first verified stake.
