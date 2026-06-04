# BCC on Solana wallets + multichain arbitrage (agents)

BCC is minted on **Base only**. Solana users acquire it via **cross-chain aggregators**, then hold/spend on Base (same contract `0xb890…`).

## User flow (Solana → BCC)

1. Open **Buy $BCC** in the app → tab **From Solana**.
2. Primary link: **Jumper** (LI.FI) — SOL or USDC on Solana → BCC on Base.
3. Alternates: deBridge, Rango, Jupiter bridge + Uniswap on Base.

API (routes + price estimate):

```bash
curl -s "http://localhost:5173/api/market/bcc/solana-route?sol=1" | jq
```

Kit (all satellite apps):

- `@bc/bcc-kit` — `buildSolanaToBccRoutes()`, `buildJumperSolToBccUrl()`
- React `BuyBccButton` / `BuyBccModal` — **On Base** | **From Solana** tabs

## Agent wallets (Alchemy CLI)

| Chain | Address |
|-------|---------|
| Base EVM | `0x7ff3943d368c0ec6b0476766463e6002538b93ab` |
| Solana | `32weqCQJ2VgdQE79yUtU1QYmvrE7kMTEWL8FRzi2uho2` |

Fund both for live multichain legs. See `ops/AGENT_WALLET_INVENTORY.md`.

## Multichain arbitrage scan (read-only)

Compares:

- BCC/USD on Base (Dexscreener)
- SOL/USD + SOL→USDC on Solana (Jupiter)
- ETH→USDC / ETH→BCC on Base (sugar-sdk / Aerodrome + Uniswap fallback)

**No auto-execution** — agents log spreads; humans or signed txs execute.

### HTTP (x402 or internal secret)

```bash
SECRET=dev-secret
curl -s -H "x-trading-internal-secret: $SECRET" \
  "http://localhost:5173/api/trading/arbitrage-scan?sol_amount=1&eth_amount=0.01&min_spread_bps=50" | jq
```

Python worker (direct):

```bash
curl -s "http://127.0.0.1:8765/arbitrage/scan?sol_amount=1&eth_amount=0.01" | jq
```

### Fleet agent

`trading-arbitrage-1` in `ops/agents.json` — handler `tradingArbitrage`, calls platform API each tick.

Env (optional):

```bash
TRADING_ARB_SOL_AMOUNT=1
TRADING_ARB_ETH_AMOUNT=0.01
TRADING_ARB_MIN_SPREAD_BPS=50
```

## Related

- [BCC_TOKEN.md](./BCC_TOKEN.md)
- [TRADING_AGENT_SUGAR.md](./TRADING_AGENT_SUGAR.md)
- [alchemy-demo/README.md](../alchemy-demo/README.md)
