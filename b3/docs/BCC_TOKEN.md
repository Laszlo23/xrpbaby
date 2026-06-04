# BCC token (Building Culture Capital)

Market token on **Base** (`8453`), fair launch. Holders pay with **BCC** for an **11.11% discount** on priced features.

| Constant | Value |
|----------|--------|
| Token | `0xb890a5289f789f1346032ccc1847939e855fab07` |
| Chain | Base `8453` |
| Uniswap | [Buy BCC on Uniswap](https://app.uniswap.org/swap?outputCurrency=0xB890a5289F789f1346032Ccc1847939e855FAb07&chain=base) |
| Discount | `1111` bps → pay **8889/10000** of list price |

Shared kit: [`packages/bcc-kit`](../packages/bcc-kit) (`@bc/bcc-kit`).

## Buy BCC modal (all apps)

Button-only floating **Buy BCC** pill opens a modal with **On Base** (Uniswap) and **From Solana** (Jumper / deBridge / Rango). Mounted in:

- `b3/app` — [`BuyBccModal.tsx`](../app/src/components/bcc/BuyBccModal.tsx)
- `apps/places/web`, `apps/identity`, `apps/art`, `apps/signal`, `apps/eco`, `apps/hub` — `@bc/bcc-kit/react`
- `apps/founding/frontend` — Expo `BuyBccButton` + `Linking.openURL`

## On-chain discount rails (Base)

Legacy contracts are **native/ single-token only**; BCC rails are **v2 deployments**:

| Surface | V2 contract | Pay function |
|---------|-------------|--------------|
| Identity `/pass` | `CultureLayerIdentityV2` | `mintWithBcc(handle, tldId)` |
| Art tickets | `BuildingCultureHubV2` | `mintTicketsWithBcc(editionId, qty)` |
| Places shares | `PrimaryShareSaleBcc` | `buyWholeSharesWithBcc(wholeShares)` |

Pricing via `IBccUsdOracle.bccAmountForUsd(usdE6)` then apply `8889/10000`.

### Oracle

- **Production:** `BccTwapOracle` — Uniswap V3 TWAP (BCC/WETH pool) + Chainlink ETH/USD
- **Bootstrap:** `MockBccUsdOracle` — owner-set rate until pool address is known

Deploy:

```bash
# Mock (no pool yet)
BCC_WEI_PER_USD_E6=1000000000000000 PRIVATE_KEY=... ./scripts/deploy-bcc-oracle.sh

# TWAP (set pool)
BCC_WETH_POOL_ADDRESS=0x... ETH_USD_FEED=0x71041dddad35915F74ccc6ae32f57871161a48649 \
  PRIVATE_KEY=... ./scripts/deploy-bcc-oracle.sh
```

Identity V2:

```bash
cd apps/identity/contracts
BCC_TOKEN_ADDRESS=0xb890... BCC_ORACLE_ADDRESS=0x... \
  forge script script/DeployV2.s.sol --rpc-url $BASE_RPC --broadcast --chain-id 8453
```

Deployment registry: [`contracts/deployments/bcc-8453.json`](../contracts/deployments/bcc-8453.json).

## App env vars

```bash
VITE_BCC_TOKEN_ADDRESS=0xb890a5289f789f1346032ccc1847939e855fab07
VITE_BCC_UNISWAP_URL=https://app.uniswap.org/swap?outputCurrency=0xB890...&chain=base
VITE_BCC_DISCOUNT_BPS=1111
VITE_BCC_ORACLE_ADDRESS=
VITE_IDENTITY_V2_CONTRACT_ADDRESS=
VITE_ART_HUB_V2_CONTRACT_ADDRESS=
VITE_PLACES_BCC_SALE_ADDRESS=
```

## Culture packs → BCC settlement

Stripe checkout stays **USD**. On `checkout.session.completed`, the app enqueues a **`BccSettlement`** row (Postgres) with `bccOwedWei` + `bonusBccWei` (11.11% benefit).

**Operational dependency:** treasury must buy/mint BCC via on-ramp or market maker, then mark settlement `credited`. See [`enqueue-bcc-settlement.ts`](../app/src/server/wallet/enqueue-bcc-settlement.ts).

## Solana wallets

BCC is still on Base; Solana users bridge via aggregators. See [BCC_SOLANA_AND_ARBITRAGE.md](./BCC_SOLANA_AND_ARBITRAGE.md) and `GET /api/market/bcc/solana-route`.

## BSC / BNB identity

BCC exists only on Base. BSC identity mint remains **ETH/BNB native**; no BCC discount there.
