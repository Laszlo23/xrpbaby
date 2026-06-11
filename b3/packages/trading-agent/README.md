# BC Trading Agent (sugar-sdk)

Python service wrapping [Velodrome sugar-sdk v0.4.2](https://github.com/velodrome-finance/sugar-sdk) for **Aerodrome on Base** — better pool discovery, quotes, and unsigned swap txs than ad-hoc router calls.

**Internal worker** for the BUILDCHAIN app (`TRADING_AGENT_URL`). **BCDAI** and fleet agents call **`/api/trading/*`** on the app (x402 + attribution), not this port directly.

## Install

```bash
cd packages/trading-agent
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
# sugar-sdk is pinned in requirements.txt (v0.4.2)
export PYTHONPATH=.
```

## Environment

| Variable | Default | Notes |
|----------|---------|--------|
| `SUGAR_RPC_URI_8453` | `https://mainnet.base.org` | Base RPC (rate-limited public OK for dev) |
| `TRADING_AGENT_PORT` | `8765` | HTTP server |
| `TRADING_AGENT_PAPER_MODE` | `1` | `0` enables `/swap/preview` unsigned txs |
| `BCC_TOKEN_ADDRESS` | `0xb890…` | BCC on Base |

## Run HTTP API

```bash
export SUGAR_RPC_URI_8453=https://mainnet.base.org
PYTHONPATH=. python -m trading_agent.server
# → http://127.0.0.1:8765/health
```

### Endpoints

- `GET /health`
- `POST /quote` — body: `{ from_token, to_token, amount, use_decimals?, wallet? }`
- `GET /quote/bcc?eth_amount=0.01` — ETH → BCC
- `GET /pools?token=0xb890…&limit=10`
- `POST /swap/preview` — unsigned txs (requires `TRADING_AGENT_PAPER_MODE=0`)

## CLI

```bash
python -m trading_agent quote --from-token eth --to-token 0xb890a5289f789f1346032ccc1847939e855fab07 --amount 0.01
python -m trading_agent quote-bcc --amount 0.01
python -m trading_agent pools --limit 5
```

## Agent runtime

Fleet handlers `trading-sugar-1` / `trading-arbitrage-1` call the **platform API** (`PUBLIC_APP_ORIGIN` + `TRADING_AGENT_INTERNAL_SECRET`). The Python server is only the app sidecar.

```bash
# terminal 1 — worker (app proxies here)
PYTHONPATH=. python -m trading_agent.server

# terminal 2 — app + fleet
export PUBLIC_APP_ORIGIN=http://127.0.0.1:5173
export TRADING_AGENT_INTERNAL_SECRET=dev-secret
export TRADING_AGENT_URL=http://127.0.0.1:8765
npm run tick -w @bc/agent-runtime
```

See [docs/TRADING_AGENT_SUGAR.md](../../docs/TRADING_AGENT_SUGAR.md).

## Safety

Sugar SDK **never holds private keys**. Swap previews return unsigned `{from,to,data,value}` — sign with Privy, Safe, or cast externally.
