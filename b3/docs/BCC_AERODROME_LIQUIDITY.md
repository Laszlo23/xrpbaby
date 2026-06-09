# BCC on Aerodrome — secondary liquidity (operator runbook)

BCC primary liquidity remains **Uniswap V3 on Base**. This runbook covers the optional **Aerodrome BCC/WETH** pool for gauge staking and a second routing leg.

## Prerequisites

- Treasury / `liquidityVault` ETH (from [AgentShareCampaign](../contracts/src/AgentShareCampaign.sol) mint slice or multisig)
- Base mainnet wallet with BCC + WETH for seeding
- Aerodrome account access on Base

## Quick config (no pool on-chain yet)

```bash
cd b3
npm run aerodrome:resolve              # print env lines from DexScreener
npm run aerodrome:resolve -- --write   # apply to deploy/.env + app/.env
npm run sync:vite-env
```

Set `VITE_BCC_AERODROME_ENABLED=1` to show the **BCC/WETH deposit** link on `/liquidity` before the pool is seeded. Primary liquidity remains Uniswap (`0xbb1a…` pool on DexScreener).

**Deposit URL (create / seed pool):**  
https://aerodrome.finance/deposit?token0=0xB890a5289F789f1346032Ccc1847939e855FAb07&token1=0x4200000000000000000000000000000000000006&chain=base

## Automated seed (recommended)

Treasury wallet (`0x502ce9…`) holds ~31M BCC but needs **ETH** for the WETH side (~0.01+ ETH for a meaningful pool).

```bash
cd b3
# Fund signer with ETH; use treasury key if wallet already holds BCC:
export AERODROME_SEED_PRIVATE_KEY=0x...   # or contracts/.env PRIVATE_KEY
export AERODROME_ETH_AMOUNT=0.01          # WETH side
export AERODROME_BCC_AMOUNT=15000000      # optional — skip Uniswap swap when set

npm run aerodrome:seed
npm run aerodrome:resolve -- --write
npm run sync:vite-env
```

Deployer-only micro pool (swap ETH→BCC on Uniswap first, then `addLiquidityETH`):

```bash
AERODROME_ETH_AMOUNT=0.00035 AERODROME_SWAP_ETH=0.0003 npm run aerodrome:seed
```

## Steps (manual UI)

1. **Create pool** — Aerodrome UI → deposit **BCC** (`0xb890a5289f789f1346032ccc1847939e855fab07`) + **WETH** (`0x4200000000000000000000000000000000000006`) on Base.
2. **Record addresses** in:
   - `contracts/deployments/bcc-8453.json` → `aerodrome.pool`, `gauge`, `lpToken`
   - `deploy/.env`: `VITE_BCC_AERODROME_POOL`, `VITE_BCC_AERODROME_GAUGE`, `VITE_BCC_AERODROME_LP_TOKEN`
3. **Sync + redeploy** unified app: `npm run sync:vite-env` then production image rebuild.
4. **Gauge incentives** (optional) — apply for AERO emissions on the Aerodrome gauge when eligible.
5. **Verify**
   - `GET /api/market/bcc` → `aerodrome.routing: "aerodrome"` when DexScreener lists Aerodrome pair
   - Trading agent: `GET /pools?token=bcc` returns matched pools
   - `/liquidity` shows Aerodrome deposit + gauge CTAs

## LP proof quest

When `VITE_BCC_AERODROME_LP_TOKEN` is set, wallets with ≥0.001 LP units can claim Culture Points task `bcc-lp-proof` via SIWE on `/liquidity`.

## Treasury seeding from liquidityVault

`AgentShareCampaign` sends **5%** of each agent-share mint ETH to `liquidityVault`. Operators may manually pair that ETH with BCC on Aerodrome or Uniswap — document txs in treasury ops log; no automated router script in v1.

## Redemption gate

When combined Uniswap + Aerodrome TVL ≥ **$500k** (see `redemption-policy.ts`), ops may set:

```bash
VITE_POINTS_REDEEM_ENABLED=1
VITE_POINTS_PER_BCC_WEI=<wei per Culture Point>
```

The `/liquidity` page shows progress toward this gate via `redemption.percentToGate`.
