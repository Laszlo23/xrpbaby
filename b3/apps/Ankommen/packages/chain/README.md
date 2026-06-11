# Austria Chain + BCC

Local devnet for Ankommen on-chain settlement.

## Quick start

```bash
# Start Anvil (Austria Chain devnet, chain ID 7777777)
docker compose -f docker/docker-compose.yml up -d austria-chain

# Deploy BCC ERC-20 and write addresses to .env
pnpm chain:deploy
```

Requires [Foundry](https://book.getfoundry.sh/) (`forge`) on your PATH, or run deploy inside the Foundry Docker image.

Default Anvil account #0 is used as BCC treasury (mint authority).
