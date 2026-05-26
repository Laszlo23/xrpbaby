# xrpbaby (Building Culture) — monorepo

This repository’s source lives in **`b3/`**.

It contains:
- A unified consumer app (drops, community hub, onchain identity)
- A real-estate tokenization stack (REOC) on Base (“Places”)
- Solidity contracts + shared packages

## Production

- **Unified app:** `https://app.buildingcultureid.space`
  - `/play` — RWA *experience* drops & raffle tickets (not property shares)
  - `/pass` — mint Culture Layer names on Base (~$1.11 in ETH)
  - `/marketplace` — ERC-721 marketplace (not fractional real estate)
  - `/places` — hub that links into Places (buildingculture.capital)
- **Places (real estate):** `https://buildingculture.capital`

## Repo map

All code is under `b3/`:

| Path | What it is |
|------|------------|
| [`b3/app/`](b3/app/) | Unified TanStack app (landing, forest, pass, marketplace, compliance API) |
| [`b3/apps/places/`](b3/apps/places/) | Places — REOC contracts + DTA/PoR/ACE adapters + Next.js |
| [`b3/contracts/`](b3/contracts/) | Culture contracts (incl. VRF raffle variant) |
| [`b3/docs/`](b3/docs/) | Runbooks and compliance docs |

## Quick start (local)

From repo root:

```bash
cd b3
npm install
npm run db:start
npm run dev:platform     # http://localhost:5173
```

Optional:

```bash
cd b3/apps/places && forge test --match-path 'test/chainlink/*'
```

## Tests

```bash
cd b3/app
npm run test:unit
NODE_OPTIONS='--max-old-space-size=8192' npx playwright test e2e/compliance-places.spec.ts

cd ../apps/places
forge test
```

## Read this first (boundaries)

- **Play `/play`**: experience/raffle lane. Use **Chainlink VRF** raffles for “provably fair” claims.
- **`/marketplace`**: NFTs only.
- **Places**: fractional **property share** tokens (REOC), compliance-gated.
- **Culture Pulse**: social digest anchoring, not asset Proof of Reserve.

## Chainlink RWA alignment

Places targets **REOC profile D**: uRWA transfer checks, DTA-style subscribe/redeem, NAV oracle adapter, PoR mint caps, and an ACE adapter hook.

- Compliance matrix: [`b3/docs/CHAINLINK_RWA_COMPLIANCE.md`](b3/docs/CHAINLINK_RWA_COMPLIANCE.md)
- Partner track: [`b3/docs/CHAINLINK_PARTNER_ONBOARDING.md`](b3/docs/CHAINLINK_PARTNER_ONBOARDING.md)

## More docs

- **All addresses:** [`b3/docs/ADDRESSES.md`](b3/docs/ADDRESSES.md) (and [`ADDRESSES.json`](b3/docs/ADDRESSES.json))
- **Smart wallet & packs:** [`b3/docs/SMART_WALLET_AND_PACKS.md`](b3/docs/SMART_WALLET_AND_PACKS.md)
- Start here: [`b3/docs/README.md`](b3/docs/README.md)

