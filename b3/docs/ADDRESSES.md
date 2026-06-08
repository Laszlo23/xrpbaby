# Contract & protocol addresses

Canonical registry for Building Culture (`b3`).  
**Source of truth:** deployment JSON under each package; this file is a human-readable index.

Last updated from repo state: **2026-06-04** — see [CONTRACTS_AUDIT.md](./CONTRACTS_AUDIT.md) for latest bytecode audit.

| Network | Chain ID | Explorer |
|---------|----------|----------|
| Base mainnet | `8453` | https://basescan.org |
| BNB Smart Chain | `56` | https://bscscan.com |
| Base Sepolia | `84532` | https://sepolia.basescan.org |
| 0G Galileo testnet | `16602` | https://chainscan-galileo.0g.ai |
| 0G Chain mainnet | `16661` | https://chainscan.0g.ai |

**Deployer (many Base deploys):** `0x2CCf1076A9DCA4d656A156d6036Cc2066c596AF5`

---

## Ecosystem satellites (URLs)

| Product | URL | Notes |
|---------|-----|--------|
| BCDAI | [bcdai.buildingcultureid.space](https://bcdai.buildingcultureid.space/) | AI trading terminal; Cloud Run backend — see [BCDAI_ECOSYSTEM.md](./BCDAI_ECOSYSTEM.md) |
| WohnAI | [wohnai.buildingcultureid.space](https://wohnai.buildingcultureid.space/) | AI real estate agent |
| Ankommen AI | [ankommen.buildingcultureid.space](https://ankommen.buildingcultureid.space/) | Austria newcomer companion (beta); interim proxy to ankommen.ai |
| KinderStimme (For Kids) | [forkids.buildingcultureid.space](https://forkids.buildingcultureid.space/) | OCPP child protection protocol (beta); interim proxy to kinderstimme.at |
| BC Studio | [app.buildingcultureid.space/studio](https://app.buildingcultureid.space/studio) | Community AI app builder (beta) |
| Community apps | `{slug}.buildingcultureid.space` | Published BC Studio projects — see [BC_STUDIO.md](./BC_STUDIO.md) |

---

## Base mainnet (`8453`) — unified app & culture contracts

From [`contracts/deployments/8453.json`](../contracts/deployments/8453.json) and [`app/.env.example`](../app/.env.example).

| Contract | Address | Role |
|----------|---------|------|
| BuildingCultureCoin (BCC) | `0xb890a5289f789f1346032ccc1847939e855fab07` | **Canonical** platform token (`bcc-8453.json`) |
| BuildingCultureDollar (BCD, legacy) | `0xda64dceb00b88ee1b8f6168beb58f5a2a7226b72` | First deploy; `BCDGenesisClaim` still mints BCD |
| BCDGenesisClaim | `0x2bae6b04d0d1c8016cc863509395b68eb0021f58` | Genesis claim |
| RaffleTicketCampaign | `0xb1a88bf677400c23430b643a07229af832130ad8` | Raffle tickets (blockhash entropy; use VRF variant for production) |
| AgentShareCampaign | `0x130e320a386b1ff0228492ddd65c380131ba86e9` | Agent share campaign |
| CulturePulseAnchor | `0x503f8ad17c0fcdd84fbdbf7f51b41b39b02ebbae` | Daily culture digest anchor (not asset PoR) |

**Not in `8453.json` (configure via env only):** DailyCheckIn, GenesisVaultPass tiers, BCDFixedPriceSale, thirdweb Marketplace V3 — set `VITE_*` in deploy env. See deployment file `note` field.

### DailyCheckIn (UTC-day streak)

Deploy on Base (gas-only `checkIn()`):

```bash
cd contracts
source .env   # PRIVATE_KEY, optional BASE_RPC_URL
forge script script/DeployDailyCheckIn.s.sol:DeployDailyCheckInScript \
  --rpc-url "$BASE_RPC_URL" --broadcast --verify
```

Then set **both** (same address):

- `VITE_DAILY_CHECKIN_ADDRESS=0x…` (browser / wagmi)
- `DAILY_CHECKIN_CONTRACT_ADDRESS=0x…` (server tx verification in `postCompleteDailyChainCheckIn`)

Profile **Daily & quests** and **Points ledger** call `checkIn()` → SIWE → task `daily-checkin-onchain` in Postgres + local profile XP via `claimDaily`.

---

## Base mainnet (`8453`) — Culture Layer identity

| Contract | Address | Role |
|----------|---------|------|
| CultureLayerIdentity | `0x3634dD45BDdbEf2Aa1f4BEf50A97e4b844004863` | `.culture` name NFTs; `mintPrice` ~$1.11 USD in ETH |

Docs: [IDENTITY_MINT_PRICE.md](./IDENTITY_MINT_PRICE.md), [IDENTITY_RESOLUTION.md](./IDENTITY_RESOLUTION.md)

---

## Base mainnet (`8453`) — BCC market token

From [`contracts/deployments/bcc-8453.json`](../contracts/deployments/bcc-8453.json). Docs: [BCC_TOKEN.md](./BCC_TOKEN.md)

| Contract / token | Address | Role |
|------------------|---------|------|
| BCC (ERC-20) | `0xb890a5289f789f1346032ccc1847939e855fab07` | Fair-launch market token; 11.11% pay-with-BCC discount |
| MockBccUsdOracle | `0x46C96e0A459ea441873FA8c3077f42b5e1E9cB4f` | BCC/USD pricing for v2 mints |
| CultureLayerIdentityV2 | `0x9942095ab0a9512e432aeacd623e929cfb474058` | Identity mint + `mintWithBcc` |
| BuildingCultureHubV2 | `0x97FDaEaFDbEF34918CFD223549C3d1e98E95c7c3` | Art tickets + `mintTicketsWithBcc` |
| BuildingCultureTicketV2 | `0x4F92e47Ab0f6f233Ffe76b2c3ddbF2729719C8D6` | Ticket NFT for hub v2 |
| BccTwapOracle | *(not deployed)* | Production TWAP oracle — see deploy scripts |
| PrimaryShareSaleBcc | *(not deployed)* | Places shares + `buyWholeSharesWithBcc` |

Uniswap: `https://app.uniswap.org/swap?outputCurrency=0xB890a5289F789f1346032Ccc1847939e855FAb07&chain=base`

---

## BNB Smart Chain (`56`) — Culture Layer identity

From [`apps/identity/contracts/deployments/56.json`](../apps/identity/contracts/deployments/56.json).  
Deploy: `b3/scripts/deploy-identity-bsc.sh` (requires `PRIVATE_KEY` in `apps/identity/.env`).

| Contract | Address | Role |
|----------|---------|------|
| CultureLayerIdentity | *(pending deploy)* | `.culture` name NFTs; `mintPrice` ~$1.11 USD in BNB |

After deploy, set `VITE_IDENTITY_BSC_CONTRACT_ADDRESS` and update `deployments/56.json` + this table.

---

## Base mainnet (`8453`) — Places / REOC (`places.buildingcultureid.space`)

From [`apps/places/deployments/base-mainnet.json`](../apps/places/deployments/base-mainnet.json).  
Site: https://places.buildingcultureid.space

| Contract | Address | Role |
|----------|---------|------|
| PropertyRegistry | `0x5aca19274B17B97e38da9eA851d91F0CC59DafBf` | Property IDs & doc commitments |
| PropertyShareFactory | `0x4CA708ca735bBA49D7B2383071EA7FA1B7BDC614` | Deploy share tokens per property |
| ComplianceRegistry | `0xa655c0B0037699433F0692356a3A142956103B7a` | KYC / allowlist (turn off `kycBypass` in prod) |
| PurchaseEscrow | `0xCB3b78bA96AA64b7327c9d95c8DEab10678c85Ad` | Purchase escrow (ETH path) |
| PurchaseEscrowERC20 | `0x0Ea9948A36c16Dcc6ce1695011646a1f6128dFd0` | Purchase escrow (ERC-20) |
| WETH9 | `0x4412Afca8021F233aE6a41cEFD06b27759C0E9A9` | Wrapped ETH for AMM |
| OgFactory | `0xFf5d617DF0ff0A9B8969906c696CbAc1eCe6518b` | AMM pair factory |
| OgRouter | `0x753634Af9E86b26e5394f39496a1097C6f19B868` | Secondary trading router |
| MockPriceOracle | `0x84431A9e5c0dEb8160Ab5D03aC2A9BCDb79Cc6Ff` | **Non-production** — migrate per [oracle-migration-mainnet.md](../apps/places/docs/oracle-migration-mainnet.md) |
| BinaryPredictionMarket | `0x7D0E418d1a0e73a73C18F146a660346e2C113046` | Testnet-style admin resolution only |
| PropertyShareProof | `0x9D81A95188939C1f708f9E43921C490f4Ef4e064` | Holding certificate NFT |
| OgStaking | `0x3145f34A6CC6Ae34d9112f50885aEe826062ACbB` | Native ETH staking |
| PlatformSettlementToken | `0x6bF5638a07B8A0b0D80A3B6Ab69440B83BBAf3D0` | Protocol settlement ERC-20 |
| PrimaryShareSaleERC20_Property1 | `0xE37446E10a28eB2B188B02C6c8dF5d8e3b3d3b32` | Fixed-price primary sale (property 1) |
| SimpleLendingPool | `0x0000000000000000000000000000000000000000` | **Not deployed** on mainnet |

**Governance / treasury Safe (Places web env):** `0xCe03F6E734cC48393Ce41b257E998c68b521EB5c`

**Chainlink-aligned modules (deploy when ready):** `ChainlinkPriceOracle`, `PropertyReserveFeed`, `PropertyShareDTA`, `ChainlinkAceAdapter` — see [DeployChainlinkModules.s.sol](../apps/places/script/DeployChainlinkModules.s.sol). CCIP pilot config: [ccip-pilot.json](../apps/places/deployments/ccip-pilot.json) (empty until partner setup).

---

## Base mainnet (`8453`) — primary sale payment token (Places)

From [`apps/places/web/src/data/primary-sales.json`](../apps/places/web/src/data/primary-sales.json).

| Token | Address | Notes |
|-------|---------|--------|
| USDC (Base) | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` | Payment token for property 1 primary sale |

Per-property share token addresses are created by `PropertyShareFactory` — query onchain or via Places UI for each `propertyId`.

---

## Base mainnet (`8453`) — Art / Building Culture Hub (optional lane)

From [`apps/art/contracts/broadcast/Deploy.s.sol/8453/`](../apps/art/contracts/broadcast/Deploy.s.sol/8453/) (not wired into unified app deploy JSON).

| Contract | Address | Role |
|----------|---------|------|
| BuildingCultureTicket | `0x2f10aAF159aeCf78d76a610b87210BF81775b62F` | Ticket ERC-721 |
| BuildingCultureHub | `0x698672950e7e43f52ca819cb4df67ffade5a6dac` | Hub / editions / draws |

---

## Base mainnet (`8453`) — env-only (not in committed deploy manifests)

Set in production `.env` / deploy host — **not** checked into git.

| Env variable | Purpose |
|--------------|---------|
| `VITE_MARKETPLACE_CONTRACT_ADDRESS` | thirdweb Marketplace V3 (NFT secondary market in unified app) |
| `VITE_MARKETPLACE_NETWORK` | Usually `base` (8453) |
| `COMPLIANCE_REGISTRY_ADDRESS` | Same as Places ComplianceRegistry (server / KYC relay) |
| `PROPERTY_RESERVE_FEED_ADDRESS` | After PoR feed deploy |
| `CHAINLINK_ACE_COMPLIANCE_ADDRESS` | After ACE partner sandbox |

---

## Base Sepolia (`84532`) — culture contracts (testnet)

From [`contracts/deployments/84532.json`](../contracts/deployments/84532.json).

| Contract | Address |
|----------|---------|
| BuildingCultureDollar | `0x11c57fd49daf5f3b3e89c9c6d7c06849957fe552` |
| BCDGenesisClaim | `0x7192b8d144ac6904ed3b9a381011b4af7e58b2cb` |
| CulturePulseAnchor | `0x64f0009581a7007cc31040664e5d2d635f6a84fd` |

---

## 0G Galileo testnet (`16602`) — Places (legacy / QA)

From [`apps/places/deployments/testnet.json`](../apps/places/deployments/testnet.json).

| Contract | Address |
|----------|---------|
| PropertyRegistry | `0xc7749bcfdc8d06fc246be556f4ead75ac7e1320c` |
| PropertyShareFactory | `0x54f15b19e23d920aaf91bab343b5972c6d340d24` |
| ComplianceRegistry | `0x502ce9FB1814cb03843967EC5E0D8F6AA3A3C2e1` |
| WETH9 | `0x54e1cfe67f727c32a90ea6fe7b5f7614fd4c09c0` |
| OgFactory | `0xEd2aF0e6417CaCC15DF755E80Afb94Ad35Aca1B2` |
| OgRouter | `0xbe345d1c11e3b55d4091f3031322be3ef4e62273` |
| BinaryPredictionMarket | `0x4369d653dec1ffda40fea02ba6fc3c4fd912c9a8` |

---

## 0G Chain mainnet (`16661`) — Agent ID (hackathon)

From [0G_HACKATHON_SUBMISSION.md](./0G_HACKATHON_SUBMISSION.md). RPC: `https://evmrpc.0g.ai`

| Contract | Address | Role |
|----------|---------|------|
| AgentId (ERC-721) | `0x0451b1d37058ad57df22d7185aabc6b0a36fc41e` | Ownable Agent ID primitive |

| Transaction | Hash |
|-------------|------|
| Deploy | `0x4629018662bf4f8f1cf6438c749d56307c1fcb4aa79e044f8692c31c88572d3e` |
| Mint #1 | `0xf920a643320272e067b137e11b85f07afe40e4dfb820e3de3754d68dc945d7d9` |

In-app proof: `/0g/agentid` (`app/src/routes/0g.agentid.tsx`).

---

## Machine-readable copy

Same data as JSON: [`ADDRESSES.json`](./ADDRESSES.json)

---

## How to refresh this file

1. Update the deployment JSON after each mainnet deploy.
2. Regenerate SDK types if using `packages/contracts-sdk` (`deploymentAddresses8453` in generated code).
3. For Places web, run:  
   `python3 apps/places/scripts/sync_web_env.py apps/places/deployments/base-mainnet.json`

Do **not** commit `.env` files — only `.env.example` templates.
