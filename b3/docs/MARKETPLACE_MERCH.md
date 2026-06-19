# Marketplace merch drop

Limited-edition Building Culture t-shirts — ladder pricing, dual checkout (Stripe + x402 USDC), batch fulfillment, and QR label claims.

## Product rules

| Rule | Default | Env override |
|------|---------|--------------|
| Designs | 4 tees (`bc-tshirt-1` … `bc-tshirt-4`) | Catalog in `app/src/content/marketplace-merch.ts` |
| Sizes | S, M, L, XL | — |
| Edition cap | 77 units per design | `MERCH_EDITION_CAP` |
| Ladder base | $7.70 unit #1 | `MERCH_BASE_USD` |
| Ladder step | +$0.77 per unit | `MERCH_STEP_USD` |
| Production target | $2,500 gross validation | `MERCH_PRODUCTION_TARGET_USD` |

Ladder math lives in `app/src/lib/marketplace/merch-ladder.ts`. At default settings, 77 units gross ≈ $2,854 — above the $2,500 production target.

## Revenue split (per order)

| Bucket | Bps | Notes |
|--------|-----|-------|
| Production pool | 5500 | Held in DB ledger until batch `funded` |
| Platform | 2500 | `TREASURY_SAFE_ADDRESS` |
| Creator | 2000 | `MERCH_CREATOR_WALLET` |

Split computed in `app/src/lib/marketplace/merch-revenue.ts` and stored on each `MerchOrder.revenueSplit`.

## Checkout flow

1. Buyer picks design + size + shipping on `/marketplace/merch/$slug`.
2. `POST /api/marketplace/merch/checkout` **reserves** the next serial with `reservedUntil` (default 30 min). `soldCount` increments only on **confirmed payment**.
3. **Stripe** — session with `metadata.type=merch`; webhook validates session id, amount, and wallet before marking paid. `checkout.session.expired` cancels pending reservations.
4. **x402** — `GET /api/marketplace/merch/pay?orderId=…&wallet=…` settles USDC on Base (wallet must match order).

Availability = `editionCap - activeSlots` where active slots = paid + claimed + non-expired `pending_payment`.

## Batch fulfillment

When **paid** order count reaches `editionCap`:

1. `MerchDrop.status` → `funded`
2. Each paid buyer credited `merch-edition-complete` (7 CP) once
3. CEO task `fulfill_merch_batch` with size breakdown + CSV (addresses, claim codes)
4. Ops view: `/marketplace/merch/ops` (requires `OPS_DASHBOARD_SECRET`)
5. Optional Phase 2: `MERCH_POD_WEBHOOK_URL` POST on task run

## QR claim (physical → digital)

- Label QR encodes `https://{origin}/merch/claim/{claimCode}`
- Buyer connects checkout wallet + SIWE → `POST /api/merch/claim`
- Issues `limited-merch-holder` credential + `merch-holder-claim` task (15 CP)
- Merch-holder channel: `MERCH_HOLDER_CHANNEL_URL`

**Label print spec:** 2×2 cm minimum, error correction H.

## Security & ops

| Surface | Protection |
|---------|------------|
| `POST /api/merch/claim` | SIWE + rate limit (10/min) |
| `POST /api/marketplace/merch/checkout` | Privy wallet match (when configured) + rate limit (15/min) |
| `GET /api/marketplace/merch/pay` | Wallet query param must match order |
| `GET /api/marketplace/merch/dashboard` | `OPS_DASHBOARD_SECRET` |
| Public catalog | No raw `claimCode` — ops dashboard only |

## BCC holder discount (optional)

Set `MERCH_BCC_HOLDER_DISCOUNT_BPS=777` (7.77%) — wallets holding ≥1,000 BCC on Base get discounted ladder price at checkout.

## Env checklist

```bash
MERCH_EDITION_CAP=77
MERCH_BASE_USD=7.70
MERCH_STEP_USD=0.77
MERCH_RESERVE_TTL_MINUTES=30
MERCH_BCC_HOLDER_DISCOUNT_BPS=777   # optional
MERCH_CREATOR_WALLET=0x...
MERCH_PRODUCTION_TARGET_USD=2500
MERCH_HOLDER_CHANNEL_URL=https://...
MERCH_POD_WEBHOOK_URL=          # optional Phase 2
OPS_DASHBOARD_SECRET=...        # required for merch ops
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
VITE_THIRDWEB_CLIENT_ID=...     # x402
SERVICE_REVENUE_WALLET=...      # x402 pay-to fallback
```

## Seed & migrate

```bash
cd app
npx prisma migrate deploy
npx tsx prisma/seed-merch.ts
npx tsx prisma/seed-credentials.ts   # adds limited-merch-holder
```

## Tests

```bash
cd app
npm run test:unit   # includes merch-ladder, revenue, bcc-discount, orders, claim, stripe metadata
npx playwright test e2e/marketplace-merch.spec.ts
```

## Manual QA checklist

- [ ] Hub `/marketplace/merch` — 4 designs, sold-out badge when cap reached
- [ ] Product page — size picker, wallet connect CTA, ladder price
- [ ] Stripe checkout — success shows order id + claim link; cancel shows banner
- [ ] x402 checkout — USDC on Base; receipt link on claim page
- [ ] BCC discount — strikethrough price when holder wallet connected (if env set)
- [ ] Claim `/merch/claim/{code}` — SIWE, Culture ID guidance, credential + 15 CP
- [ ] Profile credentials — edition serial on `limited-merch-holder`; merch orders panel with x402 tx
- [ ] Ops `/marketplace/merch/ops` — 403 without secret; CSV export with claim codes
- [ ] Stripe webhook — expired session releases reservation; completed validates amount/wallet
- [ ] Batch trigger — fires only when paid count = 77; edition-complete 7 CP credited

## Key files

| Area | Path |
|------|------|
| Catalog | `app/src/content/marketplace-merch.ts` |
| Ladder | `app/src/lib/marketplace/merch-ladder.ts` |
| Orders | `app/src/server/marketplace/merch-orders.ts` |
| Checkout API | `app/src/server/marketplace/merch-checkout.ts` |
| Claim | `app/src/server/marketplace/merch-claim.ts` |
| UI hub | `app/src/routes/marketplace/merch/` |
| Claim page | `app/src/routes/merch/claim/$code.tsx` |
