# BCC on BNB Chain + cross-chain bridge

Canonical **one** BCC token on Base (`0xb890…` on chain `8453`). BNB Chain users get the **same** token — not a new coin.

## Policy

| Rule | Detail |
|------|--------|
| Single supply | Bridging locks canonical Base BCC and mints 1:1 on BSC (LayerZero OFT) |
| Fair-launch pool | Base: Uniswap. BSC: PancakeSwap V3 BCC/WBNB after OFT deploy |
| Discount rails | `mintWithBcc` and v2 pay rails stay on **Base** today |
| Identity | Culture Layer `.culture` etc. on Base + **Space ID `.bnb`** linked on profile |

## Phase 1 — BNB → Base (live now)

- Kit: [`packages/bcc-kit/src/bnb.ts`](../packages/bcc-kit/src/bnb.ts)
- API: `GET /api/market/bcc/bnb-route?bnb=0.1`
- UI: Buy BCC modal **From BNB** tab, `/swap` BNB chain selector (bridge panel)

Aggregators: Jumper (LI.FI), deBridge, Rango — deliver Base BCC to the user's Base address.

## Phase 2 — Native BSC + OFT bridge

### Contracts

| Contract | Chain | Role |
|----------|-------|------|
| `BccOFTAdapter` | Base 8453 | Locks canonical BCC |
| `BccOFT` | BSC 56 | Mints/burns bridged BCC 1:1 |

Deploy:

```bash
# Base adapter
cd contracts
BCC_TOKEN_ADDRESS=0xb890a5289f789f1346032ccc1847939e855fab07 \
  forge script script/DeployBccOFT.s.sol:DeployBccOFTAdapter \
  --rpc-url $BASE_RPC --broadcast --chain-id 8453

# BSC OFT peer
forge script script/DeployBccOFT.s.sol:DeployBccOFT \
  --rpc-url $BSC_RPC --broadcast --chain-id 56
```

Registry: [`contracts/deployments/bcc-56.json`](../contracts/deployments/bcc-56.json)

Wire LayerZero peers (EID Base `30184`, BSC `30102`), then set `bridge` on both contracts.

### App env

```bash
VITE_BCC_OFT_ADAPTER_ADDRESS=0x...
VITE_BCC_BSC_OFT_ADDRESS=0x...
# Optional after pool seed:
VITE_BCC_PANCAKE_POOL=0x...
```

### Liquidity

```bash
npm run pancakeswap:seed -- --dry-run
PANCAKE_BNB_AMOUNT=0.1 npm run pancakeswap:seed
```

Treasury seeds BCC/WBNB on PancakeSwap V3. LP fee routing: treasury Safe + dev share (see [CLANKER_LAUNCH_OPTIONS.md](./CLANKER_LAUNCH_OPTIONS.md) locker intent).

### UI

- `/swap` — BNB tab: `BscBccSwapPanel` (PancakeSwap V3) when OFT configured
- `/bridge/bcc` — 1:1 Base ↔ BSC transfer

## Phase 3 — Space ID (.bnb)

- Resolve: `GET /api/identity/resolve-bnb?name=handle.bnb` or `?address=0x…`
- Check: `GET /api/identity/check-bnb?label=handle`
- Profiles at `/id/*` show linked `.bnb` when the owner wallet has a Space ID name

`.bnb` and `.culture` are **different namespaces** — the app links both to one wallet profile.

## API index

| Endpoint | Purpose |
|----------|---------|
| `/api/market/bcc/bnb-route` | BNB buy routes + estimate |
| `/api/market/bcc/solana-route` | Solana buy routes |
| `/api/identity/resolve-bnb` | Space ID forward/reverse |
| `/api/identity/check-bnb` | `.bnb` availability hint |
