# Stripe payments — activation & API billing

Webhook URL: `https://app.buildingcultureid.space/api/webhooks/stripe`

## Surfaces

| Surface | Checkout | Webhook metadata |
|---------|----------|------------------|
| Culture packs, HQ | `POST /api/wallet/packs/checkout` | `packSlug` |
| Merch drops | `POST /api/marketplace/merch/checkout` | `type=merch` |
| API pay-per-call | `POST /api/billing/stripe/checkout` | `type=api_purchase` |
| Culture Monthly (€7/mo) | `POST /api/billing/stripe/subscribe` | `type=culture_subscription` |
| Marketplace services | `POST /api/marketplace/services/checkout` (`paymentRail: "stripe"`) | `type=service_order` |

Health: `GET /api/billing/stripe/health`  
Manifest: `GET /api/billing/stripe/manifest`  
UI: `/billing`

## 1. Stripe Dashboard

1. Developers → API keys → copy **Secret key** (and optional **Publishable key**)
2. Developers → Webhooks → Add endpoint:
   - URL: `https://app.buildingcultureid.space/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `checkout.session.expired`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`
3. Copy **Signing secret** (`whsec_...`)

## 2. Environment (`app/.env` / `deploy/.env`)

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
# Culture Monthly €7 — product prod_UkgYq7gPcfRC7q (optional price override)
# STRIPE_CULTURE_MONTHLY_PRODUCT_ID=prod_UkgYq7gPcfRC7q
# STRIPE_CULTURE_MONTHLY_PRICE_ID=price_...
# Optional — hosted Checkout does not require client publishable key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
# Optional dev banner on /wallet/packs when Stripe is off
VITE_SHOW_STRIPE_BANNER=1
```

API billing prices reuse existing `X402_*` env vars (see `src/lib/billing/stripe-api-catalog.ts`).

## 3. Local webhook forwarding

```bash
stripe listen --forward-to localhost:5173/api/webhooks/stripe
```

Use the CLI `whsec_...` as `STRIPE_WEBHOOK_SECRET` locally.

## 4. API billing flow (pay-per-call)

1. `POST /api/billing/stripe/checkout` with `{ sku, walletAddress, returnPath? }`
2. User pays on Stripe hosted Checkout
3. Webhook marks `StripeApiPurchase` as `paid` (24h expiry if unused)
4. Client calls target API with `?stripe_purchase_id=<cuid>` or header `x-stripe-purchase-id`
5. Gate consumes purchase and returns payload

Gate order on paid routes: internal secret → Stripe purchase → x402 → 402 with checkout hints.

## 5. Verify

```bash
npm run cash-sprint:prep https://app.buildingcultureid.space
```

Manual smoke checklist:

### Full payments smoke

- [ ] `/wallet` shows all payment tiles with rail labels (card, x402, smart contract)
- [ ] `/wallet/packs?pack=pack_7` highlights the Culture pack card
- [ ] Pack checkout (test card) → CP balance increases once; webhook replay does not double-credit
- [ ] Culture Monthly subscribe → CP once on signup; once on renewal invoice; not twice on checkout+invoice
- [ ] Merch claim → CP once per order; second claim returns `alreadyCredited`
- [ ] `/presale` → contract tx visible on Basescan when sale is configured
- [ ] Marketplace merch x402 + card both complete
- [ ] `/billing` API SKU card checkout → `stripe_purchase_id` consumes once

### Quick Stripe checks

- [ ] `GET /api/billing/stripe/health` → `configured: true`
- [ ] `/wallet/packs` — buy Starter with test card `4242 4242 4242 4242`
- [ ] `/billing` — buy research SKU, then `GET /api/agents/research?q=test&stripe_purchase_id=...`
- [ ] Merch Stripe checkout (if drop live)
- [ ] Marketplace service with `paymentRail: "stripe"`

## 6. Go-to-market

- `/join` — Culture packs CTA
- `/billing` — API card checkout for agents
- [CASH_SPRINT_AMPLIFY.md](./CASH_SPRINT_AMPLIFY.md)

Pack catalog: [app/src/lib/packs.ts](../app/src/lib/packs.ts)

Legacy doc alias: [STRIPE_PACKS_ACTIVATION.md](./STRIPE_PACKS_ACTIVATION.md) points here.
