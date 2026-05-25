# Culture Layer identity mint price

Product price: **~$1.11 USD**, paid in **ETH** on Base via `CultureLayerIdentity.mintPrice`.

## On-chain (mainnet)

| Field | Value |
|-------|--------|
| Contract | `0x3634dD45BDdbEf2Aa1f4BEf50A97e4b844004863` |
| Chain | Base mainnet (`8453`) |
| Target wei (at $3,000/ETH) | `370000000000000` (0.00037 ETH) |

Read live price:

```bash
cast call 0x3634dD45BDdbEf2Aa1f4BEf50A97e4b844004863 "mintPrice()(uint256)" --rpc-url https://mainnet.base.org
```

## Update price when ETH moves

```bash
node scripts/identity-mint-price-wei.mjs   # prints MINT_PRICE_WEI
# Owner key in apps/identity/.env as PRIVATE_KEY
./scripts/set-identity-mint-price-onchain.sh
# or from apps/identity: npm run contracts:set-mint-price
```

## Copy in the app

Shared helpers: `app/src/lib/identity/mint-price.ts` (and `apps/identity/src/lib/mint-price.ts` for the mini app).

Surfaces: `/pass`, `/forest` band, landing ecosystem tiles, Farcaster manifest description, terms, SearchMint live preview.
