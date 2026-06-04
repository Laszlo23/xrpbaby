# Trading agent — rentable Aerodrome API (sugar-sdk + x402)

**Winner pattern:** agents rent quotes per call via **x402** on the BUILDCHAIN app; a Python worker runs sugar-sdk; revenue settles to your treasury. BCDAI and other bots call **`/api/trading/*`**, not a raw port.

## Architecture

```
Autonomous agent / BCDAI
        │  GET + x-payment (x402)
        ▼
app.buildingcultureid.space/api/trading/quote
        │  settlePayment (Thirdweb)
        ▼
packages/trading-agent (Python, sugar-sdk v0.4.2)
        │  Aerodrome on Base (8453)
        ▼
On-chain pools + unsigned swap calldata
```

| Layer | Role |
|-------|------|
| **Discovery** | `/.well-known/agent.json` + `GET /api/trading/manifest` |
| **Monetization** | x402 per SKU (quote / pools / swap-preview) |
| **Execution** | Unsigned txs only — renter signs with their wallet |
| **Ops** | `TRADING_AGENT_INTERNAL_SECRET` for fleet ticks (no x402) |

## SKUs (defaults)

| SKU | Path | Default price |
|-----|------|----------------|
| Quote | `GET /api/trading/quote?from_token=eth&to_token=usdc&amount=0.01` | $0.05 |
| Quote BCC | `GET /api/trading/quote-bcc?eth_amount=0.01` (Aerodrome ETH→USDC + Uniswap BCC link) | $0.05 |
| Pools | `GET /api/trading/pools?token=aero&limit=10` | $0.03 |
| Swap preview | `GET /api/trading/swap-preview?from_token=…&to_token=…&amount=…&wallet=0x…` | $0.15 |
| Health / manifest | free | — |

Env: `X402_TRADING_QUOTE_PRICE`, `X402_TRADING_POOLS_PRICE`, `X402_TRADING_SWAP_PRICE` (+ shared `THIRDWEB_SECRET_KEY`, `X402_SERVER_WALLET_ADDRESS`).

## Run locally (full stack)

**Terminal 1 — Postgres + migrations** (fixes Prisma `postgres:5432` errors on bare-metal dev)

```bash
cd b3 && npm run db:start
# Ensure app/.env DATABASE_URL uses 127.0.0.1:55432 (see scripts/start-local-db.sh)
```

**Terminal 2 — Python worker** (Alchemy RPC from `apps/identity/.env` when set; warms token cache on boot)

```bash
bash b3/scripts/dev-trading-agent.sh
```

**Terminal 3 — app**

```bash
cd b3/app
# .env: TRADING_AGENT_URL=http://127.0.0.1:8765
#       TRADING_AGENT_INTERNAL_SECRET=dev-secret
#       DATABASE_URL=postgresql://buildingculture:…@127.0.0.1:55432/buildingculture
#       THIRDWEB_SECRET_KEY=...  X402_SERVER_WALLET_ADDRESS=0x...  (paid x402 only)
npm run dev
```

Or one shot from repo root: `bash b3/scripts/dev-platform.sh` (Postgres + app) plus trading worker in another terminal.

**Verify**

```bash
SECRET=dev-secret
curl -s http://localhost:5173/api/trading/health | jq
curl -s -H "x-trading-internal-secret: $SECRET" \
  "http://localhost:5173/api/trading/quote?from_token=eth&to_token=usdc&amount=0.01" | jq
curl -s -H "x-trading-internal-secret: $SECRET" \
  "http://localhost:5173/api/trading/quote-bcc?eth_amount=0.01" | jq
curl -s -H "x-trading-internal-secret: $SECRET" \
  "http://localhost:5173/api/trading/pools?token=aero&limit=3" | jq
```

BCC is not on Aerodrome; `quote-bcc` returns an ETH→USDC Aerodrome quote plus `buyBccUrl` for Uniswap. First quote after cold start can take ~60s; worker warmup preloads tokens when using `dev-trading-agent.sh`.

Public page: `/trading-agent`

## BCDAI integration

Point BCDAI at:

- Manifest: `https://app.buildingcultureid.space/api/trading/manifest`
- Paid quotes: `GET /api/trading/quote` with x402 headers (same as premium feed)
- Optional: `GET /api/trading/swap-preview` for unsigned txs → Privy sign

Add `https://bcdai.buildingcultureid.space` to `X402_CORS_ORIGINS` if browser clients pay from BCDAI origin.

## Agent runtime

`trading-sugar-1` in `ops/agents.json` calls the platform API when `TRADING_AGENT_INTERNAL_SECRET` + `PUBLIC_APP_ORIGIN` are set.

## Production checklist

- [ ] Dedicated Base RPC in `SUGAR_RPC_URI_8453`
- [ ] Trading worker on Cloud Run / VPS (port 8765 internal)
- [ ] `TRADING_AGENT_URL` on app deploy
- [ ] x402 facilitator env on app (same as premium feed)
- [ ] Register `/.well-known/agent.json` on Marker / 8004scan
- [ ] Set `TRADING_AGENT_PAPER_MODE=0` only when swap previews are approved

## Related

- [BCD_AGENT_MONETIZATION.md](./BCD_AGENT_MONETIZATION.md)
- [BCDAI_ECOSYSTEM.md](./BCDAI_ECOSYSTEM.md)
- [packages/trading-agent/README.md](../packages/trading-agent/README.md)
