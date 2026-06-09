# BCC token (Building Culture Capital)

Market token on **Base** (`8453`), fair launch. Holders pay with **BCC** for an **11.11% discount** on priced features.

Canonical naming policy:

- Use **BCC** for all current ecosystem and user-facing communication.
- Use **BCD** only when referring to historical contracts/runbooks that still carry legacy names.

| Constant | Value |
|----------|--------|
| Token | `0xb890a5289f789f1346032ccc1847939e855fab07` |
| Chain | Base `8453` |
| Uniswap | [Buy BCC on Uniswap](https://app.uniswap.org/swap?outputCurrency=0xB890a5289F789f1346032Ccc1847939e855FAb07&chain=base) |
| Discount | `1111` bps → pay **8889/10000** of list price |

Shared kit: [`packages/bcc-kit`](../packages/bcc-kit) (`@bc/bcc-kit`).

## Buy BCC modal (all apps)

Button-only floating **Buy BCC** pill opens a modal with **On Base** (in-app Uniswap swap) and **From Solana** (Jumper / deBridge / Rango). Mounted in:

- `b3/app` — [`BuyBccModal.tsx`](../app/src/components/bcc/BuyBccModal.tsx) embeds [`BccSwapPanel`](../app/src/components/swap/BccSwapPanel.tsx)
- Full-page swap — [`/swap`](../app/src/routes/swap.tsx)
- `apps/places/web`, `apps/identity`, `apps/art`, `apps/signal`, `apps/eco`, `apps/hub` — `@bc/bcc-kit/react` (external links; link to main app `/swap` for in-app swap)
- `apps/founding/frontend` — Expo `BuyBccButton` + `Linking.openURL`

### In-app swap (Uniswap V3 on Base)

Users swap **ETH or USDC → BCC** without leaving the app:

- Quotes: Uniswap V3 **QuoterV2** (`0x61fFE014bA17989E743c5F6cB21bF9697530B8e0`)
- Execution: **SwapRouter02** (`0x2626664c2603336E57B271c5C0b26F421741e481`)
- Shared helpers: [`packages/bcc-kit/src/swap.ts`](../packages/bcc-kit/src/swap.ts)

**Empty wallet on-ramp (Privy):** enable **Funding / On-ramp** in the [Privy Dashboard](https://dashboard.privy.io) for **Base** (`8453`). The swap panel calls `useFundWallet` with `native-currency` (ETH) or `USDC` before the Uniswap leg. Set a default funding amount that covers swap size + gas (app default: `0.02` ETH / `25` USDC).

Requires `VITE_PRIVY_APP_ID` and optional `VITE_BASE_RPC_URL` for reliable quotes.

## On-chain discount rails (Base)

Legacy contracts are **native/ single-token only**; BCC rails are **v2 deployments**:

| Surface | V2 contract | Pay function |
|---------|-------------|--------------|
| Identity `/pass` | `CultureLayerIdentityV2` | `mintWithBcc(handle, tldId)` |
| Art tickets | `BuildingCultureHubV2` | `mintTicketsWithBcc(editionId, qty)` |
| Places shares | `PrimaryShareSaleBcc` | `buyWholeSharesWithBcc(wholeShares)` |

Pricing via `IBccUsdOracle.bccAmountForUsd(usdE6)` then apply `8889/10000`.

Public narrative rule: describe BCC utility as community credits and product access value (for example, pass/ticket discount), not as speculative return language.

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

**Operational dependency:** treasury must buy BCC via on-ramp or market maker, then mark settlement `credited`. See [`enqueue-bcc-settlement.ts`](../app/src/server/wallet/enqueue-bcc-settlement.ts).

**Keeper (automated):**

```bash
cd app
# Dry-run (default)
npm run bcc:settlement-keeper
# Live
BCC_SETTLEMENT_KEEPER_DRY_RUN=0 BCC_TREASURY_ONCHAIN=1 npm run bcc:settlement-keeper
```

Shared treasury transfer: [`bcc-treasury-transfer.ts`](../app/src/server/wallet/bcc-treasury-transfer.ts) (also used by panic BCC payout and points redemption).

## Points → BCC redeem

Users redeem Culture Points for on-chain BCC via treasury transfer — see [SMART_WALLET_AND_PACKS.md](./SMART_WALLET_AND_PACKS.md).

## Solana wallets

BCC is still on Base; Solana users bridge via aggregators. See [BCC_SOLANA_AND_ARBITRAGE.md](./BCC_SOLANA_AND_ARBITRAGE.md) and `GET /api/market/bcc/solana-route`.

## BSC / BNB identity

BCC exists only on Base. BSC identity mint remains **ETH/BNB native**; no BCC discount there.
