# BUILDCHAIN Market API

Agent- and app-facing JSON under `/api/market/*` for BCC, thirdweb marketplace listings, and Culture Layer identity sample mints.

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/market/manifest` | Discovery + cross-links to trading |
| GET | `/api/market/config` | Contract addresses, fees, feature flags |
| GET | `/api/market/listings?limit=50&collection=pit` | Marketplace V3 listings (server-side thirdweb) |
| GET | `/api/market/bcc` | BCC token + Uniswap + trading quote link |
| GET | `/api/market/sample-mint?handle=…&tld=.culture` | Sample identity NFT: metadata + unsigned `mint` tx |
| GET | `/api/market/health` | Aggregate status |

## Sample identity mint

Culture Layer Identity on Base (`VITE_IDENTITY_CONTRACT_ADDRESS`). Default handle: `buildchain-demo.culture`.

```bash
curl -s "http://localhost:5173/api/market/sample-mint?handle=buildchain-demo&tld=.culture" | jq
```

Response includes `metadata`, `transaction` (to/data/value), and `deeplinks.pass` for the wallet UI.

**On-chain mint (operator wallet):**

```bash
cd b3/app
npx tsx scripts/sample-identity-mint.ts
# live:
DRY_RUN=0 MINTER_PRIVATE_KEY=0x… HANDLE=myunique npx tsx scripts/sample-identity-mint.ts
```

Pick an **available** handle; taken names return `409` with `status: "minted"`.

## Batch premium names (punk.culture, etc.)

Check availability and mint the best still-free handles across `.culture`, `.build`, `.home`, `.eco`, `.capital`, `.city`:

```bash
cd app
npx tsx scripts/mint-premium-identities.ts
# only punk.* :
HANDLES=punk npx tsx scripts/mint-premium-identities.ts
# mint list from file:
NAMES_FILE=scripts/premium-names-available.txt DRY_RUN=0 MINTER_PRIVATE_KEY=0x… npx tsx scripts/mint-premium-identities.ts
```

Each mint costs on-chain `mintPrice` (~0.00037 ETH on Base today). Fund the minter with **~0.0004 ETH × count** before `DRY_RUN=0`.

Profiles: `http://localhost:5173/id/punk.culture` · gateway: `/n/punk.culture`

## Local setup (one command)

From repo root, sync thirdweb marketplace vars from `contracts/.env` into `app/.env`, then restart the app:

```bash
npm run market:env
cd app && npm run dev
```

## Env

| Variable | Role |
|----------|------|
| `VITE_MARKETPLACE_CONTRACT_ADDRESS` | thirdweb Marketplace V3 |
| `THIRDWEB_MARKETPLACE_CONTRACT_ADDRESS` | Server fallback (same address) |
| `VITE_MARKETPLACE_NETWORK` | `base` or `base-sepolia` |
| `VITE_THIRDWEB_CLIENT_ID` / `THIRDWEB_CLIENT_ID` or `THIRDWEB_SECRET_KEY` | Listings fetch |
| `VITE_PIT_NFT_CONTRACT_ADDRESS` | Featured collection filter (`collection=pit`) |
| `VITE_IDENTITY_CONTRACT_ADDRESS` | Sample mint calldata |
| `VITE_BCC_TOKEN_ADDRESS` | BCC market config |

## Related

- [TRADING_AGENT_SUGAR.md](./TRADING_AGENT_SUGAR.md)
- [BCC_TOKEN.md](./BCC_TOKEN.md)
- UI: `/marketplace`, `/pass`
