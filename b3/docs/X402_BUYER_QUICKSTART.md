# x402 buyer quickstart (first paid transaction)

This guide is for builders/agents who want to buy paid Building Culture API outputs quickly.

Primary paid lane: rentable trading quote access via x402.

## What you get

- Paid quote access from the trading endpoint.
- Agent-readable responses.
- Machine-readable offer metadata from `/.well-known/agent.json`.

## Pre-check (operator)

Before sharing with buyers, confirm:

- `X402_PUBLIC_ORIGIN` and `PUBLIC_APP_ORIGIN` are production-correct.
- `X402_PAY_TO` points to treasury recipient.
- Endpoint health passes (`REA-5` gate).
- Price is set (`X402_PRICE`) and intentionally published.

Reference: `docs/BCD_AGENT_MONETIZATION.md`.

## Buyer flow (high-level)

1. Discover offer at:
   - `https://app.buildingcultureid.space/.well-known/agent.json`
2. Choose paid resource:
   - trading quote endpoint (primary)
3. Send request with required x402 payment headers.
4. Receive paid response payload.

## Minimal request skeleton

Use your x402-compatible client and send a request to the paid endpoint.

```bash
curl -X GET "https://app.buildingcultureid.space/api/trading/quote?pair=BCC-ETH" \
  -H "Accept: application/json" \
  -H "x-payment: <payment-proof>"
```

Note: header structure depends on your x402 client/facilitator setup.

## Attribution link format (for partners)

Use this pattern for traffic/source attribution:

```text
https://app.buildingcultureid.space/presale?agent_ref=<partner>&utm_source=agent&utm_medium=x402&utm_campaign=<campaign>
```

Keep `agent_ref` short and stable per partner.

## First-transaction checklist (seller side)

- [ ] Confirm request reached paid endpoint.
- [ ] Confirm payment validation succeeded.
- [ ] Confirm response was served.
- [ ] Confirm revenue event recorded in logs.
- [ ] Confirm treasury destination (`X402_PAY_TO`) received expected settlement path.
- [ ] Post proof in `REA-10` issue comment.

## Common failure points

| Symptom | Likely cause | Fix |
|--------|--------------|-----|
| 402 loop / no success | invalid payment header or mismatched resource URL | confirm `X402_PUBLIC_ORIGIN` and signed resource URL |
| CORS/OPTIONS issues | origin mismatch | verify `PUBLIC_APP_ORIGIN`, `X402_CORS_ORIGINS` |
| Paid but missing settlement trace | recipient/env mismatch | verify `X402_PAY_TO`, facilitator wallet config |
| Intermittent failures | endpoint instability | resolve `REA-5` reliability gate before scaling |

## Outreach message template (copy/paste)

```text
We just opened paid agent-readable quote access via x402.
If you want deterministic pricing/quote responses for automation, use our offer card:
https://app.buildingcultureid.space/.well-known/agent.json

If useful, I can send a 5-minute integration snippet for your stack.
```

## Compounding growth rule

- Do not scale spend or outreach volume until:
  - paid path is reliable,
  - at least one external paid transaction is proven,
  - and reporting loop is active in `REA-9`.
