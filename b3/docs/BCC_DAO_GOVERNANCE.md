# BCC DAO governance — voting weight (no new token)

> **Status:** Draft — **counsel sign-off required** before public Snapshot space, governance marketing, or veBPT lock program.

## Principles

1. **$BCC stays utility** — Culture Points redemption, discounts, Roots rewards. Voting weight is derived from **participation signals**, not a separate governance token sale.
2. **Off-chain first** — Snapshot (or Commonwealth) for proposals; on-chain execution via Safe + documented txs.
3. **Transparent weights** — Public API exposes how weight is computed per wallet.
4. **BCID optional gates** — Proposal creation or voting may require `bcid-builder` or `dao-member` credentials ([`DAO_PARTNERSHIP_BRIEF.md`](./protocol/DAO_PARTNERSHIP_BRIEF.md)).

## Voting weight formula (v1 draft)

```
voteWeight = rootsWeight × powerFactor × lpFactor
```

| Input | Source | Default weight |
|-------|--------|----------------|
| **Roots tier** | On-chain `BccRootsStaking` pool 0/1/2 | Seedling 1.0×, Builder Grove 1.3×, Elder Canopy 1.5× |
| **Culture Power** | `GET /api/member/culture-power?address=` | `effectiveMultiplierBps / 10000` (0.8×–2.0× when enabled) |
| **LP commitment** | Aerodrome LP or Balancer BPT ≥ min balance | 1.0× base; +0.1× if lpTier ≥ 2 |

When Culture Power is disabled, `powerFactor = 1.0`. When not staked in Roots, `rootsWeight = 0.25` (observer quorum) or **0** for binding votes — **confirm with counsel**.

### Public API

```
GET /api/dao/voting-weight?address=0x...
```

Response includes `voteWeight`, component breakdown, and `counselRequired: true` flag until governance is publicly launched.

### Snapshot setup (after counsel)

1. Create Snapshot space linked to protocol Safe as execution multisig.
2. Strategies (pick one path):
   - **Phase A — Manual merkle:** Run `npm run dao:voting-export` before each proposal; upload weights to Snapshot custom strategy or IPFS merkle root.
   - **Phase B — Contract strategy:** Deploy read-only adapter calling Roots + off-chain Power oracle (future).
3. Gate proposals: require BCID credential check via `/api/bcid/resolve?did=` or wallet lookup.
4. Document proposal template: title, IPFS description, Safe tx payload, counsel disclaimer.

## On-chain path — veBPT (Phase 2, optional)

Use Balancer **Vote Escrow Launchpad** on **BCC/WETH BPT** (not raw BCC):

- Lockers receive time-weighted vote power for **on-chain params only** (swap fee, incentive budget caps).
- Separates **utility BCC** from **governance commitment** (locked LP).
- Deploy only after counsel + audit; reference Balancer launchpad docs.

## What is explicitly out of scope

- Liquidity Bootstrapping Pool for a new governance token
- Promising returns from voting or gauge participation
- Enabling public governance UI before counsel approval

## Operator scripts

```bash
# Export voting weights CSV for Snapshot merkle / manual review
npm run dao:voting-export

# Single wallet check
curl -s "https://app.buildingcultureid.space/api/dao/voting-weight?address=0xYourWallet"
```

## Related docs

- [`BCC_BALANCER_DAO_STRATEGY.md`](./BCC_BALANCER_DAO_STRATEGY.md)
- [`BCC_ROOTS_STAKING.md`](./BCC_ROOTS_STAKING.md)
- [`CULTURE_POWER.md`](./CULTURE_POWER.md)
- [`TREASURY_POLICY.md`](./TREASURY_POLICY.md)
