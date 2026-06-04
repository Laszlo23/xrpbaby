# Smart wallet, Culture packs, and points

Unified app (`b3/app`) flow: **Privy** embedded smart wallet on **Base** and **BNB Smart Chain**, **Stripe** USD packs → **Culture Points** ledger (chain-agnostic), **Culture Layer Identity** mint on the active network.

## Privy dashboard checklist

1. Create app at [dashboard.privy.io](https://dashboard.privy.io)
2. Enable **Embedded wallets** and **Smart wallets** for **Base** and **BNB Smart Chain (56)**
3. Enable **Export wallet** (user self-custody)
4. Allowed domains: production origins below **plus** all ecosystem satellites:
   - `0x.buildingculture.capital` (auth hub)
   - `buildingcultureid.space`, `*.buildingcultureid.space`
   - `buildingculture.capital`, `*.buildingculture.capital`
   - `http://localhost:5173` and local dev ports
5. Copy **App ID** → `VITE_PRIVY_APP_ID` / `NEXT_PUBLIC_PRIVY_APP_ID` and `PRIVY_APP_ID`
6. Copy **App secret** → `PRIVY_APP_SECRET` (server only)

Confirm smart-wallet support for chain `56` in the Privy dashboard if BSC mint/export fails (embedded EOA works on BSC either way).

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
| `VITE_IDENTITY_CHAIN_ID` | client | Base identity chain (default `8453`) |
| `VITE_IDENTITY_CONTRACT_ADDRESS` | client | Base CultureLayerIdentity |
| `VITE_IDENTITY_BSC_CHAIN_ID` | client | BSC chain (default `56`) |
| `VITE_IDENTITY_BSC_CONTRACT_ADDRESS` | client | BSC CultureLayerIdentity (after deploy) |
| `VITE_BSC_RPC_URL` | client | Optional BSC RPC override |

Without `VITE_PRIVY_APP_ID`, the app falls back to legacy wagmi connectors (MetaMask, World, etc.).

## Culture Auth Layer (`@bc/culture-auth`)

Shared package at [`packages/culture-auth`](../packages/culture-auth). All web apps mount `CultureAuthProvider` with the **same Privy App ID** and POST member sync to the central API.

| App | Provider | Member sync target |
|-----|----------|-------------------|
| `b3/app` (0x) | Built-in Privy + hub routes | `POST /api/wallet/sync` (local) |
| `apps/identity`, `apps/art` | `@bc/culture-auth` (Farcaster mini falls back to injected) | `https://0x.buildingculture.capital/api/wallet/sync` |
| `apps/places/web` | Aligned Privy config + `CultureMemberSync` | Central API |
| `signal`, `eco`, `hub` | `CultureAuthProvider` | Central API |

Satellite env (Vite):

```bash
VITE_PRIVY_APP_ID=cmo4s85vq00z80cl47cz0qm2j
VITE_PLATFORM_ORIGIN=https://0x.buildingculture.capital
```

Places (Next):

```bash
NEXT_PUBLIC_PRIVY_APP_ID=cmo4s85vq00z80cl47cz0qm2j
NEXT_PUBLIC_PLATFORM_ORIGIN=https://0x.buildingculture.capital
```

## Cross-domain auth hub

Browser cookies do **not** sync across `buildingcultureid.space` and `buildingculture.capital`. Use the auth hub on **`0x.buildingculture.capital`**:

| Flow | URL |
|------|-----|
| Login | `/auth/login?returnUrl=https://art.buildingcultureid.space/` |
| Logout | `/auth/logout?returnUrl=https://buildingcultureid.space/` |

Satellite apps use `CultureSignInButton` or `useCultureWallet().signIn()` — redirects through the hub when cross-origin, inline Privy when same origin.

Server endpoints:

- `POST /api/wallet/sync` — link `privyUserId` + wallet → Postgres `Member`
- `POST /api/wallet/logout` — validates token, acks logout (client clears Privy session on hub)

Same email/OAuth on any domain yields the **same embedded wallet address** and one `Member` record.

## Routes (0x app)

| Path | Description |
|------|-------------|
| `/auth/login` | Auth hub — Privy login, redirect to `returnUrl` |
| `/auth/logout` | Auth hub — sign out, redirect to `returnUrl` |
| `/wallet` | Address, export key, network selector |
| `/wallet/packs` | Seven USD tiers → Stripe Checkout |
| `/pass` | Culture ID mint on Base or BNB Chain |

Active network is stored in `localStorage` (`culture_active_network`) and synced via wagmi `switchChain`.

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

Checkout metadata includes `preferredNetwork` (`base` | `bsc`) for analytics.

## Stripe webhook

Point your Stripe webhook to:

```text
POST https://<your-app>/api/webhooks/stripe
```

Events: `checkout.session.completed`

Idempotency: `PackPurchase.stripeSessionId` is unique; replays do not double-credit.

Local testing: `stripe listen --forward-to localhost:5173/api/webhooks/stripe`

## Culture ID mint

| Network | Contract | Explorer |
|---------|----------|----------|
| Base (`8453`) | `0x3634dD45BDdbEf2Aa1f4BEf50A97e4b844004863` | basescan.org |
| BNB Chain (`56`) | set `VITE_IDENTITY_BSC_CONTRACT_ADDRESS` | bscscan.com |

Users pay `mintPrice` in ETH or BNB from their Privy wallet. Same wallet address works on both chains; mints are **per chain** (separate contracts). See [IDENTITY_MINT_PRICE.md](./IDENTITY_MINT_PRICE.md).

Deploy BSC contract: `b3/scripts/deploy-identity-bsc.sh`

## Points → BCC (future)

Culture Points live in Postgres `PointLedger`. Redemption is **disabled** until `VITE_POINTS_REDEEM_ENABLED=1` and on-chain BCC liquidity meets policy in [`app/src/lib/redemption-policy.ts`](../app/src/lib/redemption-policy.ts). Use `AirdropCampaign` + Merkle when tokenomics are ready.

`VITE_BCD_CHAIN_ID` remains Base-only unless BCC is deployed on BSC.

## Legal copy

Points are **loyalty credits**, not securities or deposits. Pack purchases are non-refundable. Redemption subject to program rules and liquidity.
