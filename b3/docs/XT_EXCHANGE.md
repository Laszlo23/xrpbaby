# XT Exchange integration (b3)

XT.COM spot and USDT-M futures trading exposed via the Python trading sidecar and `/api/trading/xt/*` on the TanStack app.

## Architecture

```
Client → /api/trading/xt/* (x402 or internal secret) → TRADING_AGENT_URL/cex/xt/* → XT APIs
```

- **Spot:** `https://sapi.xt.com`
- **Futures:** `https://fapi.xt.com`

See also: [TRADING_AGENT_SUGAR.md](./TRADING_AGENT_SUGAR.md), [MARKET_API.md](./MARKET_API.md).

## Environment (server-only)

Set in `app/.env` / `deploy/.env` — **never** commit keys or use `VITE_*` for secrets.

| Variable | Default | Purpose |
|----------|---------|---------|
| `XT_ACCESS_KEY` | — | XT API access key |
| `XT_SECRET_KEY` | — | XT API secret |
| `XT_SPOT_HOST` | `https://sapi.xt.com` | Spot REST base |
| `XT_FUTURES_HOST` | `https://fapi.xt.com` | Futures REST base |
| `XT_BCC_SYMBOL` | `bcc_usdt` | Symbol for arbitrage CEX leg |
| `XT_TRADING_ENABLED` | `0` | `1` allows authenticated writes |
| `XT_PAPER_MODE` | `1` | `1` blocks writes (reads still work) |
| `X402_XT_MARKET_PRICE` | `$0.03` | Public market data SKU |
| `X402_XT_ACCOUNT_PRICE` | `$0.05` | Balance/positions SKU |
| `X402_XT_TRADE_PRICE` | `$0.15` | Order/transfer/withdraw SKU |

Optional fallback: `~/.xt-exchange/credentials.json` (same format as [XtApis plugin](https://github.com/XtApis/xt-exchange-plugin)).

## API key permissions (XT.COM)

Enable in XT API Management:

- **Read** — market data, balances
- **Trade** — place/cancel orders
- **Transfer** — internal account transfers
- **Withdraw** — on-chain withdrawals

## Safety defaults

- Deploy with `XT_TRADING_ENABLED=0` and `XT_PAPER_MODE=1`.
- All writes require `confirm: true` in JSON body (or `?confirm=true` for DELETE).
- Withdrawals additionally require `ack_irreversible: true`.
- Fleet/ops may bypass x402 with `x-trading-internal-secret: $TRADING_AGENT_INTERNAL_SECRET`.

## Endpoint map

### Free

| Method | Path |
|--------|------|
| GET | `/api/trading/xt/manifest` |
| GET | `/api/trading/xt/health` |

### Spot (x402 market / account / trade)

| Method | App path | Worker path |
|--------|----------|-------------|
| GET | `/api/trading/xt/spot/ticker?symbol=` | `/cex/xt/spot/ticker` |
| GET | `/api/trading/xt/spot/ticker-24h?symbol=` | `/cex/xt/spot/ticker-24h` |
| GET | `/api/trading/xt/spot/depth?symbol=` | `/cex/xt/spot/depth` |
| GET | `/api/trading/xt/spot/klines?symbol=` | `/cex/xt/spot/klines` |
| GET | `/api/trading/xt/spot/symbol?symbol=` | `/cex/xt/spot/symbol` |
| GET | `/api/trading/xt/spot/balance` | `/cex/xt/spot/balance` |
| GET | `/api/trading/xt/spot/orders` | `/cex/xt/spot/orders` |
| GET | `/api/trading/xt/spot/history` | `/cex/xt/spot/history` |
| POST | `/api/trading/xt/spot/order` | `/cex/xt/spot/order` |
| DELETE | `/api/trading/xt/spot/order/{id}?confirm=true` | `/cex/xt/spot/order/{id}` |
| DELETE | `/api/trading/xt/spot/orders?confirm=true` | `/cex/xt/spot/orders` |
| POST | `/api/trading/xt/spot/transfer` | `/cex/xt/spot/transfer` |
| POST | `/api/trading/xt/spot/withdraw` | `/cex/xt/spot/withdraw` |

### Futures

| Method | App path | Worker path |
|--------|----------|-------------|
| GET | `/api/trading/xt/futures/ticker?symbol=` | `/cex/xt/futures/ticker` |
| GET | `/api/trading/xt/futures/depth?symbol=` | `/cex/xt/futures/depth` |
| GET | `/api/trading/xt/futures/funding-rate?symbol=` | `/cex/xt/futures/funding-rate` |
| GET | `/api/trading/xt/futures/klines?symbol=` | `/cex/xt/futures/klines` |
| GET | `/api/trading/xt/futures/account` | `/cex/xt/futures/account` |
| GET | `/api/trading/xt/futures/positions` | `/cex/xt/futures/positions` |
| GET | `/api/trading/xt/futures/orders` | `/cex/xt/futures/orders` |
| GET | `/api/trading/xt/futures/history` | `/cex/xt/futures/history` |
| POST | `/api/trading/xt/futures/open` | `/cex/xt/futures/open` |
| DELETE | `/api/trading/xt/futures/order/{id}?confirm=true` | `/cex/xt/futures/order/{id}` |

### Arbitrage (existing route)

`GET /api/trading/arbitrage-scan` now includes `cex.xtBccUsd` and `cex.spreadBpsVsDexscreener` when XT public ticker is reachable.

## Manual smoke

With trading worker running (`cd packages/trading-agent && uvicorn trading_agent.server:app --port 8765`):

```bash
# Worker health (includes xt block)
curl -s http://127.0.0.1:8765/health | jq .xt

# Public spot ticker (no API key)
curl -s "http://127.0.0.1:8765/cex/xt/spot/ticker?symbol=btc_usdt"

# App manifest (no x402)
curl -s http://localhost:5173/api/trading/xt/manifest

# App spot ticker (x402 or internal secret)
curl -s -H "x-trading-internal-secret: $TRADING_AGENT_INTERNAL_SECRET" \
  "http://localhost:5173/api/trading/xt/spot/ticker?symbol=bcc_usdt"
```

## Write examples

Spot limit buy (live — only when `XT_TRADING_ENABLED=1` and `XT_PAPER_MODE=0`):

```json
POST /api/trading/xt/spot/order
{
  "symbol": "bcc_usdt",
  "side": "BUY",
  "type": "LIMIT",
  "price": "0.01",
  "quantity": "100",
  "confirm": true
}
```

Withdraw (irreversible):

```json
POST /api/trading/xt/spot/withdraw
{
  "currency": "usdt",
  "chain": "Ethereum",
  "amount": "10",
  "address": "0x...",
  "confirm": true,
  "ack_irreversible": true
}
```

Futures open long:

```json
POST /api/trading/xt/futures/open
{
  "symbol": "btc_usdt",
  "action": "open_long",
  "qty": 1,
  "market": true,
  "confirm": true
}
```

## Discovery

- Agent card: `/.well-known/agent.json` (resources `buildchain_xt_*`)
- SKU manifest: `GET /api/trading/xt/manifest`

## Cursor operator skill

See `.agents/skills/xt-exchange/SKILL.md` for agent guidance when using BUILDCHAIN HTTP APIs from Cursor.
