# BCC on BNB Chain + cross-chain bridge

Canonical **one** BCC token on Base (`0xB890a5289F789f1346032Ccc1847939e855FAb07` on chain `8453`). BNB Chain users receive **wBCC** — a wrapped 1:1 representation backed by locked canonical BCC.

## Policy

| Rule | Detail |
|------|--------|
| Single supply | Bridging locks canonical Base BCC; relayer mints wBCC 1:1 on BSC |
| wBCC ticker | Explicit `Wrapped Building Culture Capital` / `wBCC` — not the legacy `BccOFT` (`0x81cC…`) |
| Fair-launch pool | Base: Uniswap. BSC: PancakeSwap wBCC/WBNB after wBCC deploy |
| Discount rails | `mintWithBcc` and v2 pay rails stay on **Base** |
| Identity | Culture Layer `.culture` on Base + Space ID `.bnb` on profile |

## Phase 1 — Custom relayer bridge (current)

### Contracts

| Contract | Chain | Role |
|----------|-------|------|
| `BccBridgeVault` | Base 8453 | Locks canonical BCC, emits `Locked` |
| `WrappedBCC` | BSC 56 | Mint/burn wBCC via `BRIDGE_ROLE` relayer |

Deploy:

```bash
cd contracts

# Base vault
forge script script/DeployBccBridge.s.sol:DeployBccBridge \
  --rpc-url $BASE_RPC --broadcast --chain-id 8453

# BSC wBCC
forge script script/DeployBccBridge.s.sol:DeployWrappedBCC \
  --rpc-url $BSC_RPC --broadcast --chain-id 56

# Wire relayer hot wallet
BCC_BRIDGE_VAULT=0x... WBCC_ADDRESS=0x... BRIDGE_RELAYER_ADDRESS=0x... \
  forge script script/DeployBccBridge.s.sol:WireBccBridge \
  --rpc-url $BASE_RPC --broadcast --chain-id 8453
# Repeat WireBccBridge on BSC for wBCC.setBridge
```

Registry: [`contracts/deployments/bcc-56.json`](../contracts/deployments/bcc-56.json)

### Relayer service

```bash
# Env: BRIDGE_RELAYER_PRIVATE_KEY, BASE_RPC_URL, BSC_RPC_URL,
#      BCC_BRIDGE_VAULT, WBCC_ADDRESS
node scripts/bcc-bridge-relayer.mjs
```

Flow:

1. User `vault.lock(to, amount, 56)` on Base
2. Relayer watches `Locked` → `wBCC.bridgeMint(to, amount, nonce)` on BSC
3. User `wBCC.bridgeBurn(amount, 8453)` on BSC
4. Relayer watches `BridgeBurned` → `vault.registerBurn` + `vault.unlock` on Base

Idempotency: nonce replay protection on vault unlock; relayer keeps processed tx set in memory (restart-safe via on-chain `processedUnlocks`).

### App env

```bash
VITE_BRIDGE_MODE=relayer
VITE_BCC_BRIDGE_VAULT=0x...
VITE_WBCC_BSC_ADDRESS=0x...
# Fair launch + rewards (after deploy):
VITE_BCC_FAIR_LAUNCH_SALE=0x...
VITE_CULTURE_PASS_BCC_REWARDS=0x...
VITE_WBCC_ROOTS_STAKING_ADDRESS=0x...
```

### UI

- `/bridge/bcc` — lock BCC → wBCC / burn wBCC → BCC
- `/bcc/dashboard` — supply, vault locks, burns, staking TVL
- `/bcc/fair-launch` — BSC fixed-price wBCC sale
- `/pass` — Culture Pass BCC merkle claims

## Phase 2 — LayerZero OFT migration

Legacy MVP (deprecated for production):

| Contract | Address |
|----------|---------|
| `BccOFTAdapter` Base | `0xd323e5b266FA7A13C9c572ad5c7b7f996846EFc0` |
| `BccOFT` BSC | `0x81cCda83704985FcB88e1174Da4367eEa40871C4` |

Migration checklist: `forge script script/MigrateBccLayerZero.s.sol:MigrateBccLayerZero`

After LZ deploy:

```bash
VITE_BRIDGE_MODE=layerzero
VITE_BCC_OFT_ADAPTER_ADDRESS=0x...
VITE_BCC_BSC_OFT_ADDRESS=0x...
```

## Phase 1 — BNB → Base (aggregators, live)

- Kit: [`packages/bcc-kit/src/bnb.ts`](../packages/bcc-kit/src/bnb.ts)
- API: `GET /api/market/bcc/bnb-route?bnb=0.1`
- UI: Buy BCC modal **From BNB** tab

## Liquidity

```bash
npm run pancakeswap:seed -- --dry-run
# Update script for wBCC address after deploy
```

## Security

See [BCC_BRIDGE_SECURITY.md](./BCC_BRIDGE_SECURITY.md). Multisig owns contracts; relayer holds `BRIDGE_ROLE` only.

## API index

| Endpoint | Purpose |
|----------|---------|
| `GET /api/bcc/metrics` | Supply, vault, wBCC, burns, staking TVL |
| `GET /api/market/bcc` | Market + liquidity snapshot |
