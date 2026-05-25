# BCD on Base Sepolia (84532)

## Prerequisites

- Foundry (`forge`, `cast`)
- Base Sepolia ETH on deployer
- Env vars (never commit):

```bash
export BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
export PRIVATE_KEY=0x...
# optional: export TREASURY=0x...
# optional: export GENESIS_MERKLE_ROOT=0x...  # defaults to zero root (dormant)
```

## Deploy

From repo root (BCD + Culture Pulse anchor):

```bash
export BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
export PRIVATE_KEY=0x...
npm run deploy:sepolia
```

BCD only:

```bash
./scripts/deploy-bcd-base-sepolia.sh
```

This broadcasts `DeployBCDScript`, writes [`contracts/deployments/84532.json`](../contracts/deployments/84532.json), and runs `npm run contracts:sdk`.

## Staging app env

In `app/.env`:

```
VITE_BCD_CHAIN_ID=84532
VITE_EVM_NETWORK=base-sepolia
VITE_BCD_TOKEN_ADDRESS=<from 84532.json>
VITE_BCD_GENESIS_CLAIM_ADDRESS=<from 84532.json>
VITE_PLATFORM_ORIGIN=http://localhost:5173
```

After updating the merkle root on-chain, publish eligibility JSON per [`app/.env.example`](../app/.env.example).
