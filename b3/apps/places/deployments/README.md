# Deployments (Base mainnet)

Production traffic uses **Base** (chain id **8453**). Fund the deployer with **ETH on Base** (not testnet tokens).

## 1. Fund the deployer

Set `PRIVATE_KEY` in the repo root **`.env`** (see [`foundry.toml`](../foundry.toml) `dotenv`). The corresponding address must hold enough **ETH on Base** for a large `DeployAll` broadcast. Use a dedicated RPC (Alchemy, Infura) if the public endpoint rate-limits.

## 2. Deploy the full stack on Base

`script/DeployAll.s.sol` deploys registry, compliance, share factory, WETH, AMM, oracles, markets, proof NFT, and staking.

**Required for production metadata:** set **`NFT_BASE_URI`** to a public HTTPS base URL ending in `/` (e.g. `https://your.domain/api/nft/`) so `PropertyShareProof.tokenURI` resolves to your app’s `GET /api/nft/[tokenId]`.

**Do not** set `KYC_BYPASS_ON_DEPLOY` on mainnet unless you intentionally want open compliance bypass.

Convenience script (5s delay before broadcast):

```bash
export NFT_BASE_URI=https://your.domain/api/nft/
# optional: export BASE_RPC_URL=https://...  (Alchemy/Infura on Base)
./scripts/deploy-base-mainnet.sh
```

Or:

```bash
export NFT_BASE_URI=https://your.domain/api/nft/
forge script script/DeployAll.s.sol:DeployAllScript \
  --rpc-url https://mainnet.base.org \
  --broadcast \
  --slow
```

Copy logged addresses into [`base-mainnet.json`](base-mainnet.json) (schema matches [`testnet.example.json`](testnet.example.json)). Set `deployedAt` and `deployer` for your records.

### Optional: community guestbook

Not part of `DeployAll`. Deploy with the same key and Base RPC:

```bash
forge script script/DeployGuestbook.s.sol:DeployGuestbookScript \
  --rpc-url https://mainnet.base.org \
  --broadcast
```

Set `NEXT_PUBLIC_BASE_GUESTBOOK` in `web/.env.local` from the script output.

## 3. Seed properties + share tokens

Export addresses from your deployment:

```bash
export PROPERTY_REGISTRY=0x...    # from base-mainnet.json
export PROPERTY_SHARE_FACTORY=0x...
export TREASURY_ADDRESS=0x...     # optional; defaults to deployer
```

**Empty registry — seven demo properties:**

```bash
forge script script/SeedSevenProperties.s.sol:SeedSevenPropertiesScript \
  --rpc-url https://mainnet.base.org \
  --broadcast
```

**Or** use `SeedThreeProperties` / `SeedFourMoreProperties` as appropriate (see script comments). Do not re-seed duplicate external refs.

### Token supply caps

[`script/SeedTokenSupply.sol`](../script/SeedTokenSupply.sol) can set share supply caps — see script headers. Pricing for primary sales is issuer-specific ([`docs/primary-sale.md`](../docs/primary-sale.md)).

## 4. Bootstrap AMM liquidity (optional)

After treasury holds shares and ETH, add **WETH + share** liquidity so Trade quotes work. Env vars match the Bootstrap script (`OG_ROUTER`, `OG_WETH`, etc. — native asset is **ETH**, wrapped via `WETH9`):

```bash
export PRIVATE_KEY=0x...
export OG_ROUTER=0x...
export OG_WETH=0x...
export COMPLIANCE_REGISTRY=0x...
export PROPERTY_SHARE_FACTORY=0x...
export BOOTSTRAP_WETH_WEI=1000000000000000000
export BOOTSTRAP_SHARE_WEI=1000000000000000000
export START_PROPERTY_ID=1
export END_PROPERTY_ID=3

forge script script/BootstrapLiquidity.s.sol:BootstrapLiquidityScript \
  --rpc-url https://mainnet.base.org \
  --broadcast
```

Alternatively use the **Pool** page (wrap ETH → approve → add liquidity).

## 5. Staking rewards

Fund a reward epoch on [`OgStaking`](../src/staking/OgStaking.sol) with **ETH** (`msg.value`) per your ops plan.

## 6. Primary sale + settlement (optional)

Issuer primary flows: [`docs/primary-sale.md`](../docs/primary-sale.md). On Base, prefer **ERC-20** checkout (`PrimaryShareSaleERC20`, `PlatformSettlementToken`, `PurchaseEscrowERC20`) — see section 6 in the previous internal doc or run:

- [`scripts/deploy-base-settlement.sh`](../scripts/deploy-base-settlement.sh) + [`scripts/merge_settlement_from_broadcast.py`](../scripts/merge_settlement_from_broadcast.py)

Add sale rows to [`web/src/data/primary-sales.json`](../web/src/data/primary-sales.json) so the Trade UI can surface Primary.

## 7. Sync the web app

```bash
python3 scripts/sync_web_env.py deployments/base-mainnet.json >> web/.env.local
cd web && npm install && npm run dev
```

Optional: add `siteUrl` to `base-mainnet.json` for `NEXT_PUBLIC_SITE_URL` (NFT `external_url`).

### Docker

`NEXT_PUBLIC_*` is inlined at **image build** time. Use repo-root **`.env`** per [`.env.docker.example`](../.env.docker.example), then `docker compose build`. Runtime env does not replace client bundle values.

### Contract verification

Use `forge verify-contract` with `BASESCAN_API_KEY` when publishing source.

---

## Governance: Safe multisig on Base

Set **`NEXT_PUBLIC_BASE_GOVERNANCE_SAFE`** to your protocol Safe. The app surfaces it on `/contracts` for transparency.

**Role handoff:** deployer EOA usually starts as admin on `AccessControl` contracts. Grant the same roles to the **Safe**, then revoke from the EOA. See [docs/multisig-base-roles.md](../docs/multisig-base-roles.md) for a concrete checklist and optional `cast` patterns.

---

## Trust before scaling TVL

External **audit**, **bug bounty**, monitoring, and **legal** review for offerings should gate production capital. See [docs/trust-and-launch-gates.md](../docs/trust-and-launch-gates.md).

---

## Security

Do not commit `.env` or `.env.local` with real keys. Keep example JSON files as templates only.

---

## Legacy: 0G Galileo testnet

Historical scripts pointed at `https://evmrpc-testnet.0g.ai`. The product UI is **Base-only** by default. For archived env layout see [`testnet.example.json`](testnet.example.json). Optional Wagmi second chain: `NEXT_PUBLIC_ENABLE_LEGACY_TESTNET=1` in `web/.env.local` (internal QA only).
