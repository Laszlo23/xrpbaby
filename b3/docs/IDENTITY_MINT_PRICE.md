# Culture Layer identity mint price

Product price: **~$1.11 USD**, paid in the chain native token via `CultureLayerIdentity.mintPrice`.

| Chain | Native | Chain ID |
|-------|--------|----------|
| Base | ETH | `8453` |
| BNB Smart Chain | BNB | `56` |

## On-chain (Base mainnet)

| Field | Value |
|-------|--------|
| Contract | `0x3634dD45BDdbEf2Aa1f4BEf50A97e4b844004863` |
| Chain | Base mainnet (`8453`) |
| Target wei (at $3,000/ETH) | `370000000000000` (0.00037 ETH) |

Read live price:

```bash
cast call 0x3634dD45BDdbEf2Aa1f4BEf50A97e4b844004863 "mintPrice()(uint256)" --rpc-url https://mainnet.base.org
```

## On-chain (BNB Smart Chain)

After deploy, set `VITE_IDENTITY_BSC_CONTRACT_ADDRESS` and read:

```bash
cast call <BSC_CONTRACT> "mintPrice()(uint256)" --rpc-url https://bsc-dataseed.binance.org
```

Example target at $600/BNB: `1850000000000000` wei (0.00185 BNB). Compute with:

```bash
node scripts/identity-mint-price-wei.mjs --native bnb --bnb-usd 600
```

Deploy: `b3/scripts/deploy-identity-bsc.sh`

## Update price when spot moves

```bash
# ETH (Base)
node scripts/identity-mint-price-wei.mjs
# BNB (BSC)
node scripts/identity-mint-price-wei.mjs --native bnb --bnb-usd 600

# Owner key in apps/identity/.env as PRIVATE_KEY
./scripts/set-identity-mint-price-onchain.sh   # Base
# BSC: forge script script/SetMintPrice.s.sol with BSC_RPC_URL
```

## Copy in the app

Shared helpers: `app/src/lib/identity/mint-price.ts` (and `apps/identity/src/lib/mint-price.ts` for the mini app).

Surfaces: `/pass`, `/forest` band, landing ecosystem tiles, Farcaster manifest description, terms, SearchMint live preview. Network selector switches ETH vs BNB formatting.
