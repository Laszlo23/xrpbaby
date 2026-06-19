# Culture Layer identity mint price

Product pricing uses a **77-mint tier ladder** in USD, paid in the chain native token via `CultureLayerIdentity.mintPrice`.

| Chain | Native | Chain ID |
|-------|--------|----------|
| Base | ETH | `8453` |
| BNB Smart Chain | BNB | `56` |

## Ladder (USD)

| Tier | Mint # range | USD price |
|------|--------------|-----------|
| 0 | 1–77 | $0.07 |
| 1 | 78–154 | $0.56 |
| 2 | 155–231 | $1.05 |
| … | +77 each | +$0.49 per tier ($0.07 × 7) |
| cap | ~1233+ | $7.77 |

Formula: `min(7.77, 0.07 + floor(totalMinted / 77) × 0.49)`

Culture Points on mint: **77 CP** base, **+7 CP** bonus for mints in tier 0 (first 77 names).

## On-chain (Base mainnet)

| Field | Value |
|-------|--------|
| Contract | `0x3634dD45BDdbEf2Aa1f4BEf50A97e4b844004863` |
| Chain | Base mainnet (`8453`) |
| `totalMinted()` | Read live — tier index source |
| Tier 0 wei (@ $3,000/ETH) | ~`23333333333333` (0.0000233 ETH) |

Read live price and supply:

```bash
cast call 0x3634dD45BDdbEf2Aa1f4BEf50A97e4b844004863 "totalMinted()(uint256)" --rpc-url https://mainnet.base.org
cast call 0x3634dD45BDdbEf2Aa1f4BEf50A97e4b844004863 "mintPrice()(uint256)" --rpc-url https://mainnet.base.org
```

## Sync ladder to chain

The contract uses a single `mintPrice` — owner must update when the tier changes.

**Dry-run (recommended first):**

```bash
node scripts/sync-identity-mint-ladder.mjs
```

**Broadcast (owner key required):**

```bash
DRY_RUN=0 PRIVATE_KEY=0x... node scripts/sync-identity-mint-ladder.mjs
```

Or manual wei calc:

```bash
node scripts/identity-mint-price-wei.mjs --usd 0.07
./scripts/set-identity-mint-price-onchain.sh
```

CEO orchestrator queues `sync_identity_mint_price` every 6h; probe via `GET /api/ops/identity-ladder-sync`.

## App helpers

- Tier math: `app/src/lib/identity/mint-ladder.ts`
- Display: `app/src/lib/identity/mint-price.ts`
- Handle policy: `app/src/lib/identity/handle-policy.ts` (1–3 reserved, 4+ promo)
- Referral server: `app/src/server/identity/referral-codes.ts`
- Mint CP credit: `app/src/server/points/culture-id-mint-credit.ts` (on identity sync after mint)

Surfaces: `/pass`, `/forest` IdentityMintBand, SearchMint live preview, products/culture-id.

## Referral-gated promo mint

Promo mint on `/pass` requires a valid referral code (launch code: `BUILD77`). Each wallet may redeem **once**.

| Rule | Detail |
|------|--------|
| Handle length | 4+ alphanumeric for promo; 1–3 letters reserved (team / DAO) |
| Launch code | `BUILD77` (seeded in DB; override via `IDENTITY_LAUNCH_REFERRAL_CODE`) |
| Per-minter codes | 7 codes issued after first mint sync; +7 when batch exhausted |
| Referrer reward | Locked BCC via `RewardGrant` (`identity_referral_bcc_locked`) — no on-chain claim yet |

Env:

- `IDENTITY_LAUNCH_REFERRAL_CODE=BUILD77`
- `IDENTITY_REFERRAL_BCC_WEI=770000000000000000` (0.77 BCC locked per referral)
- `IDENTITY_REFERRAL_LAUNCH_OWNER` — optional treasury wallet for launch code ownership

### Manual ops checklist

1. Run `sync-identity-mint-ladder.mjs` with `DRY_RUN=0` for tier-0 on-chain price (~$0.07).
2. Apply migration `20260618230000_identity_referral_codes` (seeds `BUILD77`).
3. Test mint on Base test wallet with 4+ char name + `BUILD77` at `/pass?ref=BUILD77`.
4. Confirm sync credits mint CP + referral tasks; referrer sees locked BCC on `/pass`.
