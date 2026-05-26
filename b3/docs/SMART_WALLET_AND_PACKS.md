# Smart wallet, Culture packs, and points

Unified app (`b3/app`) flow: **Privy** embedded smart wallet on **Base**, **Stripe** USD packs → **Culture Points** ledger, **Culture Layer Identity** mint on-chain.

## Privy dashboard checklist

1. Create app at [dashboard.privy.io](https://dashboard.privy.io)
2. Enable **Embedded wallets** and **Smart wallets** (Base)
3. Enable **Export wallet** (user self-custody)
4. Allowed domains: production + `http://localhost:5173`
5. Copy **App ID** → `VITE_PRIVY_APP_ID` and `PRIVY_APP_ID`
6. Copy **App secret** → `PRIVY_APP_SECRET` (server only)

## Environment

| Variable | Scope | Purpose |
|----------|--------|---------|
| `VITE_PRIVY_APP_ID` | client | PrivyProvider |
| `VITE_PRIVY_CLIENT_ID` | client | Optional app client |
| `PRIVY_APP_ID` | server | Verify access tokens |
| `PRIVY_APP_SECRET` | server | Verify access tokens |
| `STRIPE_SECRET_KEY` | server | Checkout Sessions |
| `STRIPE_WEBHOOK_SECRET` | server | `checkout.session.completed` |
| `VITE_PLATFORM_ORIGIN` | client/server | Stripe redirect URLs |
| `VITE_POINTS_REDEEM_ENABLED` | client | `1` to show redeem UI (still gated on liquidity) |

Without `VITE_PRIVY_APP_ID`, the app falls back to legacy wagmi connectors (MetaMask, World, etc.).

## Routes

| Path | Description |
|------|-------------|
| `/wallet` | Address, export key, links |
| `/wallet/packs` | Seven USD tiers → Stripe Checkout |
| `/pass` | Culture ID mint (uses connected Base wallet) |

## Pack catalog

Defined in [`app/src/lib/packs.ts`](../app/src/lib/packs.ts):

| Slug | USD | Culture Points (approx.) |
|------|-----|--------------------------|
| `pack_07` | 0.70 | 70 |
| `pack_7` | 7 | 800 |
| `pack_77` | 77 | 9,000 |
| `pack_777` | 777 | 95,000 |
| `pack_7777` | 7,777 | 1,000,000 |
| `pack_77777` | 77,777 | 11,000,000 |
| `pack_7777777` | 7,777,777 | 1,200,000,000 |

High tiers may grant `supporter_badge` and `identity_mint_credit` in `RewardGrant`.

## Stripe webhook

Point your Stripe webhook to:

```text
POST https://<your-app>/api/webhooks/stripe
```

Events: `checkout.session.completed`

Idempotency: `PackPurchase.stripeSessionId` is unique; replays do not double-credit.

Local testing: `stripe listen --forward-to localhost:5173/api/webhooks/stripe`

## Culture ID mint

Contract: `0x3634dD45BDdbEf2Aa1f4BEf50A97e4b844004863` on Base (`8453`). Users pay `mintPrice` in ETH from their Privy wallet. See [IDENTITY_MINT_PRICE.md](./IDENTITY_MINT_PRICE.md).

## Points → BCD (future)

Culture Points live in Postgres `PointLedger`. Redemption is **disabled** until `VITE_POINTS_REDEEM_ENABLED=1` and on-chain BCD liquidity meets policy in [`app/src/lib/redemption-policy.ts`](../app/src/lib/redemption-policy.ts). Use `AirdropCampaign` + Merkle when tokenomics are ready.

## Legal copy

Points are **loyalty credits**, not securities or deposits. Pack purchases are non-refundable. Redemption subject to program rules and liquidity.
