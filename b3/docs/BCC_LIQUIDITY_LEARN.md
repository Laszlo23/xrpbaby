# BCC liquidity learn hub

Canonical user surface: **https://app.buildingcultureid.space/liquidity**

## What ships in-app

| Piece | Path / API |
|-------|------------|
| Learn track | `/liquidity` — 5-step lesson (pools, IL, Uniswap, Aerodrome, BCC utility) |
| Live stats | `GET /api/market/bcc` — DexScreener TVL, dual-pool breakdown, redemption gate % |
| Uniswap CTA | Primary swap / pool links via `@bc/bcc-kit` |
| Aerodrome CTA | Deposit + gauge links when `VITE_BCC_AERODROME_*` env set |
| Culture Points | SIWE tasks: `visit-liquidity-hub` (+20), `complete-bcc-liquidity-lesson` (+40), `bcc-lp-proof` (+75) |
| Telegram | Modules `m_bcc_liquidity_basics`, `m_aerodrome_gauges` in `/tg` learn API |

## Compliance copy

Frame rewards as **education + protocol participation**. Do not promise guaranteed returns or price targets. See [BCC_TOKEN.md](./BCC_TOKEN.md).

## Related

- [BCC_AERODROME_LIQUIDITY.md](./BCC_AERODROME_LIQUIDITY.md) — operator pool deploy
- [BCC_TOKEN.md](./BCC_TOKEN.md) — token + discount rails
- [TRADING_AGENT_SUGAR.md](./TRADING_AGENT_SUGAR.md) — Aerodrome quotes via x402
