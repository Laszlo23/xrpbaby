# Cash Sprint — Amplify copy (Telegram / X / Farcaster)

Paste and post after deploy. Grove Telegram chat is configured (`GROVE_TELEGRAM_CHAT_ID`).

---

## Post 1 — Grant proof + BCID (Base discovery)

```
Shipped on Base: Building Culture — soulbound BCID identity, BCC, Places RWA, grant verifier.

Verify in 5 min (71+ checks):
https://app.buildingcultureid.space/grant-proof

BCID docs (DAO pilots open):
https://app.buildingcultureid.space/docs/bcid

0G Agent ID:
https://app.buildingcultureid.space/0g/agentid
```

---

## Post 2 — Culture packs (USD revenue)

```
Culture Points packs are live — from $0.70 Starter to Patron tiers.

https://app.buildingcultureid.space/wallet/packs

Sign in with email (no Farcaster required) → buy points → mint your .culture name on Base.
```

---

## Post 3 — Research Agent (x402)

```
Research Agent API — paid Web3/ecosystem briefs via x402 on Base (~$0.05/query).

https://app.buildingcultureid.space/agent-os

API: GET /api/agents/research?q=your+question
Grant Agent: 100 BCC for grant application drafts.
```

---

## Grove tick (optional cron)

```bash
curl -s "https://app.buildingcultureid.space/api/marketing/grove/tick" | head
```

Use Grove admin secret if required in your deploy config.
