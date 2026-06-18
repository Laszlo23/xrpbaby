# Ecosystem wallets — what to fund (and what not to)

This answers: **“Wallet compliance: unconfigured”**, **social / points tasks**, and **BCC**.

## You do not fund your wallet to “run” social tasks

Social quests (Farcaster follow, X repost, marketplace visit, etc.) **credit points to your connected wallet** in Postgres. They do not pull ETH from you for the protocol.

| Who pays | What |
|----------|------|
| **You (connected wallet)** | Gas for optional on-chain actions (identity mint, daily check-in, buying BCC, paying with BCC on v2 contracts). |
| **Platform server** | Neynar / X API keys (`NEYNAR_API_KEY`, X OAuth) — configured in `app/.env`, not your browser wallet. |
| **Protocol treasury** | Buying BCC to settle culture-pack credits, liquidity, grants — see below. |

Open quests: **Profile → Points** (`/profile`) after connecting the same wallet you use for SIWE claims.

---

## “Wallet compliance: unconfigured”

Shown on **Places** (`/places`) when the app server has no `COMPLIANCE_REGISTRY_ADDRESS`.

**Fix (operators):** in `app/.env`:

```bash
COMPLIANCE_REGISTRY_ADDRESS=0xa655c0B0037699433F0692356a3A142956103B7a
VITE_PLACES_SITE_URL=https://places.buildingcultureid.space
```

Restart `npm run dev`. After that, connected wallets show real on-chain status: `none` | `pending` | `verified` | `revoked`.

**Users:** compliance applies to **Places property shares**, not to NFT marketplace listings, culture passes, or points. If status is `none`, complete KYC on [places.buildingcultureid.space](https://places.buildingcultureid.space) (Places app).

---

## Wallets operators fund (protocol side)

| Role | Address / env | Fund with | Purpose |
|------|----------------|-----------|---------|
| **Protocol treasury (canonical)** | `0xCe03F6E734cC48393Ce41b257E998c68b521EB5c` | ETH on Base + operational BCC | Multisig Safe — reserves, BCC settlement buys, governance. See [TREASURY_POLICY.md](./TREASURY_POLICY.md). |
| **BCC settlement ops** | Same treasury (or hot ops wallet you control) | **BCC + ETH** | After Stripe culture-pack sales, treasury buys BCC and marks `BccSettlement` rows credited ([BCC_TOKEN.md](./BCC_TOKEN.md)). |
| **x402 revenue** | `X402_SERVER_WALLET_ADDRESS` / `X402_PAY_TO` | — (receives USDC/ETH) | Trading agent + premium feed payments. **Limx briefs** settle to `LIMX_AGENT_WALLET_ADDRESS` (`0xf424…584b`) via `GET /api/agents/limx`. |
| **Agent distributor** | `AGENT_AGS_DISTRIBUTOR_PRIVATE_KEY` | ETH | Only when `ECON_LIVE=1` — automated agent ticks. |
| **Deploy / mint EOA** | `PRIVATE_KEY` in `contracts/.env` | Small ETH | Deploy scripts and **optional** identity mints — **not** the treasury. |
| **Alchemy CLI Agent Wallet** | EVM `0x7ff3943d368c0ec6b0476766463e6002538b93ab` · Solana `32weqCQJ2VgdQE79yUtU1QYmvrE7kMTEWL8FRzi2uho2` | ETH on Base · SOL on Solana | CLI/agent onchain actions via `alchemy wallet connect --mode session`. Demo harness: `alchemy-demo/` (`npm run alchemy:demo`). See [ops/AGENT_WALLET_INVENTORY.md](../ops/AGENT_WALLET_INVENTORY.md). |
| **XRPL testnet intake** | `XRPL_TREASURY_INTAKE_ADDRESS` | Testnet XRP (faucet) | Diligence demo on [/investors](https://app.buildingcultureid.space/investors) — not protocol reserves. See [XRPL_TREASURY_RAIL.md](./XRPL_TREASURY_RAIL.md). |

Do **not** confuse the deployer EOA (`0x2CCf…` from forge env) with the treasury Safe or the Alchemy Agent Wallet.

---

## BCC in the ecosystem (already integrated)

| Surface | How |
|---------|-----|
| **Token** | `0xb890a5289f789f1346032ccc1847939e855fab07` on Base — `VITE_BCC_TOKEN_ADDRESS` |
| **Buy** | Floating **Buy BCC** button (Uniswap) on every app page |
| **Pay with BCC (−11.11%)** | Identity v2 `mintWithBcc`, Art Hub v2 tickets, Places `PrimaryShareSaleBcc` when addresses set |
| **Oracle** | `VITE_BCC_ORACLE_ADDRESS` — mock/TWAP for BCC-priced checkouts |
| **Market API** | `/api/market/bcc`, `/api/market/bcc/solana-route`, `/api/trading/arbitrage-scan` |
| **Agents** | `trading-bcd-treasury` persona in fleet docs |

Env already set in typical `app/.env`: BCC token, oracle, identity v2, art hub v2. Missing for full Places BCC checkout: `VITE_PLACES_BCC_SALE_ADDRESS` after deploy. Full bytecode audit: [CONTRACTS_AUDIT.md](./CONTRACTS_AUDIT.md) (`npm run contracts:audit`).

---

## Quick local checklist

```bash
cd b3
npm run market:env          # thirdweb marketplace
npm run db:start && npm run db:migrate
# app/.env: COMPLIANCE_REGISTRY_ADDRESS + NEYNAR_* + BCC VITE_* (see .env.example)
npm run dev:local
```

| Check | URL |
|-------|-----|
| Points / social quests | http://localhost:5173/profile |
| Compliance | http://localhost:5173/places (connect wallet) |
| BCC buy | Buy BCC pill (bottom of UI) |
| Pass + BCC mint | http://localhost:5173/pass |

---

## Related

- [BCC_TOKEN.md](./BCC_TOKEN.md)
- [TREASURY_POLICY.md](./TREASURY_POLICY.md)
- [ADDRESSES.md](./ADDRESSES.md)
- [MARKET_API.md](./MARKET_API.md)
