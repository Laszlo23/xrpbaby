# BCC × Balancer — DAO strategy

> **Status:** Operations draft — align pool seeding, incentive budgets, and governance messaging with counsel before public commitments.

## Purpose

Building Culture is transitioning toward **DAO-style community governance** while keeping **$BCC as a utility token** (Culture Points redemption, discounts, Roots rewards). **Balancer on Base** is the third liquidity leg and optional **on-chain vote-escrow surface**—not a replacement for Uniswap primary depth or Aerodrome secondary gauges.

Canonical treasury: Safe `0x0D106D512Ac28cc29E625b22C6628989013c4C6B` ([`TREASURY_POLICY.md`](./TREASURY_POLICY.md)).

## Venue comparison (Base)

| Venue | Role today | DAO fit | Incentives |
|-------|------------|---------|------------|
| **Uniswap V3** | Primary BCC depth, in-app swap routing | Keep primary; do not migrate TVL away | LP fees only |
| **Aerodrome** | Secondary BCC/WETH, gauge staking | Community LP + AERO emissions when eligible | Gauge AERO |
| **Balancer** | **New:** Safe-owned BCC/WETH pool | Treasury-controlled liquidity + gauge bribes / veBAL upside | BPT gauge + optional veBPT lock |

**Why add Balancer:** Managed/weighted pools let the **multisig own pool policy** (weights, fees) while LPs stake **BPT in a gauge** for DAO-funded BCC rewards or external BAL emissions if veBAL voters allocate weight.

**Why not replace Uniswap:** Fragmenting thin liquidity raises slippage and weakens the redemption TVL gate ([`redemption-policy.ts`](../app/src/lib/redemption-policy.ts)). Seed Balancer **modestly** after Uniswap TVL is stable; coordinate with [`BCC_AERODROME_LIQUIDITY.md`](./BCC_AERODROME_LIQUIDITY.md).

## Pool type choice

| Type | When to use | Owner controls |
|------|-------------|----------------|
| **80/20 Weighted** (recommended v1) | Simple DAO treasury BCC/WETH leg | Swap fee; fixed weights |
| **Managed** | Treasury wants scheduled weight shifts (e.g. gradual BCC reduction) | Gradual reweight + fee manager |
| **LBP** | **Out of scope** — fair launch for a *new* token; not used for BCC utility |

Prefer **Balancer V3** on Base when creating new pools (hooks, GraphQL `protocolVersionIn: [3]`). Record addresses in [`contracts/deployments/bcc-8453.json`](../contracts/deployments/bcc-8453.json).

## Incentive economics

1. **Treasury BCC bribes (predictable)** — DAO Safe funds a gauge incentive epoch; LPs stake BPT and claim via Balancer Base streamer (`get_rewards()`). Budget from counsel-approved slice, not Roots reward wallet.
2. **veBAL vote campaign (upside)** — veBAL holders direct weekly **BAL emissions** to gauges. Requires community outreach; emissions are **not guaranteed** for new pools.
3. **veBPT / Vote Escrow Launchpad (optional, Phase 2)** — Lock **BCC/WETH BPT** (not raw BCC) for time-weighted **on-chain** votes on fee params and emission caps. See [`BCC_DAO_GOVERNANCE.md`](./BCC_DAO_GOVERNANCE.md).

## BCC voting model (no new governance token)

| Layer | Mechanism | Token |
|-------|-----------|--------|
| **Utility** | Culture Points → BCC, discounts, tickets | BCC (transferable utility) |
| **Off-chain proposals** | Snapshot space weighted by Roots tier + Culture Power + BCID gates | No new token |
| **On-chain params (later)** | ve-style lock on **Balancer BPT** | Locked LP position, not a new ERC20 |

Near-term: [`BCC_DAO_GOVERNANCE.md`](./BCC_DAO_GOVERNANCE.md) + `GET /api/dao/voting-weight?address=` for transparent weight breakdown.

**Counsel checkpoint:** Do not market BCC as a “governance token” or promise profit from voting until counsel approves copy. Business plan already flags securities risk for governance-token framing.

## Liquidity fragmentation guardrails

1. Uniswap remains **primary** in app copy and trading agent routing.
2. Target Balancer seed **≤ secondary Aerodrome slice** until combined TVL &gt; $500k redemption gate.
3. Run `npm run balancer:resolve` after any pool goes live on DexScreener.
4. Publish treasury moves per [`TREASURY_POLICY.md`](./TREASURY_POLICY.md).

## App integration (summary)

When `VITE_BCC_BALANCER_ENABLED=1` and pool/BPT env vars are set:

- `/liquidity` shows Balancer deposit + gauge cards
- `GET /api/market/bcc` includes `balancer` block + DexScreener TVL
- Culture Power LP tier accepts **Aerodrome LP or Balancer BPT** (max balance wins)

Operator steps: [`BCC_BALANCER_LIQUIDITY.md`](./BCC_BALANCER_LIQUIDITY.md).

## Success criteria

- Safe-owned Balancer pool live on Base with recorded addresses
- Gauge registered; at least one documented incentive epoch
- App surfaces Balancer; Culture Power recognizes BPT holders
- Snapshot voting weights documented; counsel sign-off before public governance launch

## References

- Balancer docs (indexed): pool types, gauges, veBAL, Vote Escrow Launchpad
- [`DAO_PARTNERSHIP_BRIEF.md`](./protocol/DAO_PARTNERSHIP_BRIEF.md) — BCID + Snapshot gating
- [`BCC_ROOTS_STAKING.md`](./BCC_ROOTS_STAKING.md) — stake tiers for vote weight
- [`CULTURE_POWER.md`](./CULTURE_POWER.md) — LP tier for Power multiplier
