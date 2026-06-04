# Alchemy demo (Solana + Base EVM)

Small Node harness around the **Alchemy CLI** and your **Agent Wallet** session — same addresses as `ops/AGENT_WALLET_INVENTORY.md`.

| Chain | Address |
|-------|---------|
| Solana | `32weqCQJ2VgdQE79yUtU1QYmvrE7kMTEWL8FRzi2uho2` |
| Base EVM | `0x7ff3943d368c0ec6b0476766463e6002538b93ab` |

## One-time CLI setup

```bash
npm i -g @alchemy/cli@latest
alchemy auth login -y
alchemy app select 3wp65rj1tqiadm39   # Account Kit Quickstart (has Base + Solana RPC)
alchemy wallet connect --mode session --instance-name b3-cursor
```

## Run the demo

```bash
cd alchemy-demo
npm run demo              # Solana + Base balances, DAS NFT scan
npm run demo:solana       # Solana mainnet only
npm run demo:evm          # Base only
npm run demo:devnet       # Solana devnet balance (+ faucet hints)
```

## Direct CLI (Solana)

```bash
# Balance
alchemy solana rpc getBalance 32weqCQJ2VgdQE79yUtU1QYmvrE7kMTEWL8FRzi2uho2 -n solana-mainnet

# NFTs / tokens (DAS)
alchemy solana das getAssetsByOwner '{"ownerAddress":"32weqCQJ2VgdQE79yUtU1QYmvrE7kMTEWL8FRzi2uho2","page":1,"limit":10}' -n solana-mainnet

# Send SOL (needs funded wallet + active session)
alchemy solana send <recipient> 0.01 -n solana-mainnet --dry-run

# Devnet (testing)
alchemy solana rpc getBalance 32weqCQJ2VgdQE79yUtU1QYmvrE7kMTEWL8FRzi2uho2 -n solana-devnet
```

## Related

- [docs/ECOSYSTEM_WALLETS.md](../docs/ECOSYSTEM_WALLETS.md)
- [ops/AGENT_WALLET_INVENTORY.md](../ops/AGENT_WALLET_INVENTORY.md)
- [Alchemy CLI docs](https://www.alchemy.com/docs/alchemy-cli)
- [Agent Wallets](https://www.alchemy.com/docs/agent-wallets)
