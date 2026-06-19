# 72h Cash Sprint — Operator checklist (Laszlo)

**Contact:** laszlo.bihary@gmail.com  
**Grant wallet (Base):** `0xd13e1cD3f0d2e83494EeAb8130EfD671C368FD22`

Run engineering prep first (`npm run cash-sprint:prep`), then complete these in order.

---

## 1. Grant submissions (~60 min)

Copy from [SUBMISSION_COPY_PASTE.md](./SUBMISSION_COPY_PASTE.md). Attach latest `proof-bundles/grant-verification-*.md` + `.json` (0 hard fails).

| Step | URL | Action | Log status |
|------|-----|--------|------------|
| 0G Hall | [hall.0g.ai](https://hall.0g.ai) | Post § B — Guild on 0G 2.0 | `SUBMITTED` |
| 0G Apply | [guild.0gfoundation.ai/apply](https://guild.0gfoundation.ai/apply) | Form § C + proof bundle | `SUBMITTED` |
| Chainlink | partners@chainlinklabs.com (or form on site) | Email below | `SUBMITTED` |
| Base follow-up | X or Farcaster | Post § D + `/docs/bcid` link | `POSTED` |

### Chainlink BUILD email (paste)

```
Subject: Building Culture Places — ACE/DTA pilot on Base (grant-proof attached)

Hi Chainlink team,

Building Culture ships fractional real-estate rails on Base mainnet (PropertyRegistry, ComplianceRegistry, PropertyShareFactory) with ACE adapter stubs ready for sandbox integration.

Live proof: https://app.buildingcultureid.space/grant-proof
Compliance matrix: docs/CHAINLINK_RWA_COMPLIANCE.md (in repo)
Base contracts: PropertyRegistry 0x5aca19274B17B97e38da9eA851d91F0CC59DafBf

We request ACE sandbox access + DTA technical standard pilot for property-share subscribe/redeem (profile D REOC).

Contact: Laszlo Bihary — laszlo.bihary@gmail.com
Wallet: 0xd13e1cD3f0d2e83494EeAb8130EfD671C368FD22
```

Log every submission in [proof-bundles/submission-log.txt](../proof-bundles/submission-log.txt).

---

## 2. Outreach (~30 min)

1. Production env: `OPS_DASHBOARD_SECRET`, `RESEND_API_KEY`, `OUTREACH_FROM_EMAIL=Building Culture <hello@buildingcultureid.space>`
2. Open https://app.buildingcultureid.space/ops/outreach
3. Approve & send (in order): **Guild.xyz**, **HackQuest**, **Snapshot Labs**
4. Copy forum posts from [protocol/FORUM_POST_DRAFTS.md](./protocol/FORUM_POST_DRAFTS.md) → EAS forum + Base Discord `#show-your-work`

---

## 3. Stripe packs (~20 min)

1. Stripe Dashboard → Developers → API keys → add to `deploy/.env`:
   - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `VITE_STRIPE_PUBLISHABLE_KEY`
2. Webhook endpoint: `https://app.buildingcultureid.space/api/webhooks/stripe`
3. Redeploy → test $0.70 Starter at `/wallet/packs`

---

## 4. Amplify (~15 min)

Posts in [CASH_SPRINT_AMPLIFY.md](./CASH_SPRINT_AMPLIFY.md):

- Grove Telegram (already configured)
- X/Farcaster if `GROVE_X_*` set
- Talent weekly build update

---

*Operator tasks cannot be completed by the agent — log confirmation IDs in submission-log when done.*
