# BCD monetization with agent identity (Marker-style)

This doc locks **which SKUs agents should sell first**, how **x402** is configured, where **`/.well-known/agent.json`** lives, and how **attribution** query params reach PostHog.

## 1) SKU choices (execute in this order)

| Priority | SKU | What it is | Where it lives |
|----------|-----|------------|----------------|
| **Primary** | **Paid agent-readable feed** | JSON drop teasers sold per request via HTTP 402 + `x-payment` | [`GET /api/x402/premium`](/b3/frontend/src/routes/api/x402/premium.tsx), handler [`x402-premium.ts`](/b3/frontend/src/server/x402-premium.ts) |
| **Secondary** | **BCD acquisition funnel** | Same ERC-20 as the app; fixed-price sale + fees to protocol | [`/presale`](/b3/frontend/src/routes/presale.tsx) → opens **Get BCD** modal (`BCDFixedPriceSale`) |
| **Tertiary** | **Marketplace volume** | Platform fee via Thirdweb Marketplace V3 | Env `VITE_MARKETPLACE_*` · [`marketplace-config.ts`](/b3/frontend/src/lib/marketplace-config.ts) |

**Do not** add a separate “copy presale token” purely for agents; monetization flows through the rows above.

## 2) x402 configuration (server)

Required for settlement (see [.env.example](/b3/frontend/.env.example) comments):

- `THIRDWEB_SECRET_KEY` — server client for facilitator (`getThirdwebServerClient`)
- `X402_SERVER_WALLET_ADDRESS` — facilitator server wallet (`0x` + 40 hex)
- `X402_PAY_TO` — optional treasury/recipient (`0x` + 40 hex); omit only if facilitator default is acceptable
- `X402_PRICE` — e.g. `$0.25` (default handler fallback `$0.01`)
- `X402_NETWORK` — `base`, `base-sepolia`, or `arbitrum-sepolia` ([`x402-network.ts`](/b3/frontend/src/lib/x402-network.ts))
- `X402_PUBLIC_ORIGIN` — **recommended in production**: canonical HTTPS origin so `resourceUrl` matches what payers sign (reverse proxy safe; see [`resolveX402ResourceUrl`](/b3/frontend/src/lib/x402-resource-url.ts))
- `PUBLIC_APP_ORIGIN` — canonical app URL (also used for CORS on OPTIONS)
- Optional: `X402_CORS_ORIGINS`, `X402_ALLOW_ANY_ORIGIN` (avoid in prod)

Autonomous callers use **GET** `/api/x402/premium` with payment headers documented in Thirdweb x402 flows.

## 3) Agent card (`/.well-known/agent.json`)

Served dynamically from [`buildchain-agent-card.ts`](/b3/frontend/src/server/buildchain-agent-card.ts). It lists capabilities, deeplinks (presale, campaign, marketplace), and the **x402 resource path** relative to [`getServerPublicOrigin()`](/b3/frontend/src/lib/app-origin.ts).

Register this URL with external directories (Marker, 8004scan, etc.) as the machine-readable offer surface.

## 4) Attribution (agent → funnel analytics)

Landing and SPA navigations parse optional query params and persist them for the session (`buildchain_marketing_attribution`):

- `agent_ref` — short handle or id (e.g. Farcaster handle, Marker key); sanitized `[a-zA-Z0-9_.-]{1,64}`
- `utm_source`, `utm_medium`, `utm_campaign` — standard UTM, max 128 chars

PostHog **`landing_view`** merges URL + session (`buildchain_marketing_attribution`) into `agent_ref` / UTMs plus `pathname` / `search`. **`wallet_connected`**, **`mint_clicked`**, **`mint_confirmed`**, and **`share_clicked`** attach the same persisted attribution when `VITE_POSTHOG_KEY` is set ([`analytics.ts`](/b3/frontend/src/lib/analytics.ts)).

**Example deeplinks for partners**

- Presale funnel: `https://<origin>/presale?agent_ref=fixr&utm_source=agent`
- Campaign (wallet ref unchanged): existing `?ref=0x…` on `/campaign` via [`campaign.tsx`](/b3/frontend/src/routes/campaign.tsx)

## 5) Fleet narrative

Product copy for the eleven-agent story remains in [`bcd-agent-fleet.ts`](/b3/frontend/src/lib/bcd-agent-fleet.ts); this doc is **ops + integration** only.
