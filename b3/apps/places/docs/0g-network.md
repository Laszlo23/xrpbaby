# 0G network reference (for this repo)

Values below match the official [Deploy Smart Contracts on 0G Chain](https://docs.0g.ai/developer-hub/building-on-0g/contracts-on-0g/deploy-contracts) documentation as of project setup. **Re-verify** RPC URLs, chain IDs, and indexer endpoints in [Testnet](https://docs.0g.ai/developer-hub/testnet/testnet-overview) / [Mainnet](https://docs.0g.ai/developer-hub/mainnet/mainnet-overview) before production deployments.

## 0G Chain (EVM)

| Network | RPC URL | Chain ID | Explorer |
|--------|---------|----------|----------|
| Testnet (Galileo) | `https://evmrpc-testnet.0g.ai` | `16602` | [chainscan-galileo.0g.ai](https://chainscan-galileo.0g.ai) |
| Mainnet | `https://evmrpc.0g.ai` | `16661` | [chainscan.0g.ai](https://chainscan.0g.ai) |

- **Faucet (testnet):** [faucet.0g.ai](https://faucet.0g.ai/)
- **Compiler:** use **EVM version Cancun** (e.g. `solc --evm-version cancun`, `evm_version = "cancun"` in Foundry).

### Verification API (explorers)

- Testnet: `https://chainscan-galileo.0g.ai/open/api`
- Mainnet: `https://chainscan.0g.ai/open/api`

## 0G Storage SDKs

- **TypeScript:** `npm install @0gfoundation/0g-ts-sdk ethers` — [Storage SDK](https://docs.0g.ai/developer-hub/building-on-0g/storage/sdk)
- **Go:** `github.com/0gfoundation/0g-storage-client`
- **Starter kits:** [0g-storage-ts-starter-kit](https://github.com/0gfoundation/0g-storage-ts-starter-kit), [0g-storage-go-starter-kit](https://github.com/0gfoundation/0g-storage-go-starter-kit)

Example testnet wiring (from docs; confirm indexer URL with current network docs):

- `RPC_URL`: `https://evmrpc-testnet.0g.ai`
- Turbo indexer (example): `https://indexer-storage-testnet-turbo.0g.ai`

Standard and Turbo networks use **different indexer URLs**; pick one per deployment.

## 0G Compute

- [Compute overview](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/overview)
- [SDK / inference](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/inference)

## 0G DA / rollups

- [DA integration](https://docs.0g.ai/developer-hub/building-on-0g/da-integration)
- [Rollups and appchains](https://docs.0g.ai/developer-hub/building-on-0g/rollups-and-appchains/op-stack-on-0g-da)

## Links

- [Developer Hub](https://docs.0g.ai/developer-hub/getting-started)
- [0G deployment scripts (examples)](https://github.com/0gfoundation/0g-deployment-scripts)
- [awesome-0g](https://github.com/0gfoundation/awesome-0g)
