# Stripe culture packs — activation checklist

Webhook URL: `https://app.buildingcultureid.space/api/webhooks/stripe`

## 1. Stripe Dashboard

1. Developers → API keys → copy **Secret key** and **Publishable key**
2. Developers → Webhooks → Add endpoint:
   - URL: `https://app.buildingcultureid.space/api/webhooks/stripe`
   - Events: `checkout.session.completed`
3. Copy **Signing secret** (`whsec_...`)

## 2. deploy/.env (then rebuild + redeploy)

```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

## 3. Verify

```bash
npm run cash-sprint:prep https://app.buildingcultureid.space
```

- Open `/wallet/packs`
- Buy **Starter ($0.70)** with test card in Stripe test mode first, then live

## 4. Go-to-market

- `/join` — Culture packs CTA (after sign-in)
- [CASH_SPRINT_AMPLIFY.md](./CASH_SPRINT_AMPLIFY.md) Post 2
- Grove Telegram channel

Pack catalog: [app/src/lib/packs.ts](../app/src/lib/packs.ts)
