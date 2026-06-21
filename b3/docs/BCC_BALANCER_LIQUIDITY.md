# BCC on Balancer — DAO treasury liquidity (operator runbook)

BCC primary liquidity remains **Uniswap V3 on Base**. This runbook covers the **Balancer BCC/WETH** pool owned by the protocol Safe, gauge registration, and LP incentives for the DAO transition.

## Prerequisites

- Protocol Safe on Base: `0xCe03F6E734cC48393Ce41b257E998c68b521EB5c`
- Counsel-approved BCC + WETH seed budget (not Culture Roots reward wallet)
- Balancer app access on Base: https://app.balancer.fi/#/base/pools
- Strategy context: [`BCC_BALANCER_DAO_STRATEGY.md`](./BCC_BALANCER_DAO_STRATEGY.md)

## Quick config (no pool on-chain yet)

```bash
cd b3
npm run balancer:resolve              # print env lines from DexScreener
npm run balancer:resolve -- --write   # apply to deploy/.env + app/.env
npm run sync:vite-env
```

Set `VITE_BCC_BALANCER_ENABLED=1` to show Balancer CTAs on `/liquidity` before the pool is seeded.

**Create pool (Balancer UI):**  
https://app.balancer.fi/#/base/pools/create

Tokens:

- **BCC** `0xb890a5289f789f1346032ccc1847939e855fab07`
- **WETH** `0x4200000000000000000000000000000000000006`

Recommended v1: **80/20 weighted**, owner = protocol Safe, swap fee 0.3–1%.

## Operator checklist (Safe transactions)

Print the full checklist:

```bash
npm run balancer:pool-checklist
```

Steps:

1. **Create pool** — Safe signs pool creation on Balancer (V3 weighted 80/20 BCC/WETH).
2. **Seed liquidity** — Safe `joinPool` with counsel-approved BCC + WETH amounts.
3. **Record addresses** — pool contract, **BPT** (LP token), pool ID if shown in UI.
4. **Register gauge** — follow Balancer Base gauge flow (`ChildChainLiquidityGaugeFactory`); record gauge address.
5. **Verify on-chain** — `npm run balancer:verify -- --pool 0x... --bpt 0x... [--gauge 0x...]`
6. **Sync env** — `npm run balancer:resolve -- --write && npm run sync:vite-env`
7. **Redeploy app** — production image rebuild so `/api/market/bcc` and `/liquidity` pick up env.

Update [`contracts/deployments/bcc-8453.json`](../contracts/deployments/bcc-8453.json) → `balancer.pool`, `bpt`, `gauge`.

## Env vars

| Key | Purpose |
|-----|---------|
| `VITE_BCC_BALANCER_ENABLED` / `BCC_BALANCER_ENABLED` | Show Balancer UI before DexScreener lists pool |
| `VITE_BCC_BALANCER_POOL` / `BCC_BALANCER_POOL` | Pool contract address |
| `VITE_BCC_BALANCER_BPT` / `BCC_BALANCER_BPT` | BPT token for LP proof + Culture Power |
| `VITE_BCC_BALANCER_GAUGE` / `BCC_BALANCER_GAUGE` | Gauge for staking BPT |

## Illustrative seed amounts (replace after counsel)

| Field | Example | Notes |
|-------|---------|--------|
| WETH side | 0.01 ETH | Match or stay below Aerodrome seed |
| BCC side | 5–15M BCC | Coordinate with treasury policy |
| Swap fee | 0.5% | Safe as fee manager where supported |

Do **not** publish these numbers until counsel + multisig sign-off.

## Gauge + LP incentives

Print incentive checklist:

```bash
npm run balancer:gauge-checklist
```

### Option A — Treasury BCC bribes (recommended v1)

1. Allocate weekly BCC budget from Safe (document in treasury ops log).
2. Fund Balancer gauge incentive / bribe mechanism for the BCC/WETH gauge on Base.
3. LPs stake BPT → claim rewards via gauge streamer (`get_rewards()` on Base).
4. Publish epoch amount + tx hash on canonical comms channel.

### Option B — veBAL vote campaign

1. Engage Balancer community to vote veBAL toward your gauge.
2. BAL emissions scale with vote share — treat as **upside**, not budget baseline.

### Option C — veBPT (Phase 2)

Deploy Vote Escrow on BPT via Balancer Vote Escrow Launchpad. See [`BCC_DAO_GOVERNANCE.md`](./BCC_DAO_GOVERNANCE.md).

## LP proof + Culture Power

When `VITE_BCC_BALANCER_BPT` is set, wallets with ≥0.001 BPT units count for:

- Culture Points task `bcc-lp-proof` on `/liquidity`
- Culture Power `lpTier` (same tiers as Aerodrome; max of both LP balances)

Aerodrome LP token env remains supported; either venue satisfies proof.

## Verify

```bash
# API
curl -s https://app.buildingcultureid.space/api/market/bcc | jq '.balancer'

# Local after env sync
curl -s http://localhost:5173/api/market/bcc | jq '.balancer, .combinedLiquidityUsd'
```

Expect:

- `balancer.poolConfigured: true` when pool env or DexScreener lists Balancer pair
- `/liquidity` — Balancer deposit + gauge cards
- `GET /api/dao/voting-weight?address=0x…` — Roots + Power breakdown (governance doc)

## Redemption gate

Combined Uniswap + Aerodrome + Balancer TVL counts toward the $500k gate when DexScreener lists all venues. See [`BCC_AERODROME_LIQUIDITY.md`](./BCC_AERODROME_LIQUIDITY.md) for redemption env.

## Treasury transparency

Document every seed, bribe, and fee change in the treasury ops log. Major moves: announce after execution per [`TREASURY_POLICY.md`](./TREASURY_POLICY.md).
