# RWA analytics readiness

Checklist for turning on user-behavior analysis after ST-IMMO properties are on-chain.

## Prerequisites

- [ ] `nextPropertyId === 9` (8 registered properties)
- [ ] OG1–OG8 share tokens deployed (`tokenByPropertyId` non-zero)
- [ ] REOC metadata live: `GET /places/api/reoc/{1..8}` returns 200
- [ ] Catalog audit green: `node apps/places/scripts/audit-property-catalog.mjs`
- [ ] `kycBypass === false` on ComplianceRegistry (production)

## Enable Places client events

Set in Places web env (see `web/.env.local.example`):

```bash
NEXT_PUBLIC_ANALYTICS_ENABLED=1
```

Events emitted (via `web/src/lib/analytics.ts`):

| Event | Trigger |
|-------|---------|
| `rwa_marketplace_view` | Marketplace mount |
| `rwa_property_view` | Property detail mount |
| `rwa_trade_click` | Trade CTA on property detail |
| `rwa_invest_click` | Primary invest CTA |
| `rwa_listing_submit` | List wizard submit (existing) |

Wire vendor in privacy-aligned handler listening for `bc:analytics` / `bc:pageview` custom events, or forward to unified app `POST /api/platform/analytics`.

## Unified platform (members / points)

Requires `DATABASE_URL` on the main app. Activity flows through `ActivityEvent` in Prisma — see `app/prisma/schema.prisma`.

## Ops scripts

```bash
# Catalog + REOC validation
node apps/places/scripts/audit-property-catalog.mjs
node apps/places/scripts/validate-reoc-metadata.mjs

# Mainnet completion (fund deployer on Base first)
bash apps/places/scripts/rwa-mainnet-ops.sh
```

## Honest scope

- Analytics readiness ≠ zero bugs; use grant-proof + manual QA matrix.
- Chainlink profile D: PoR/NAV modules deploy via `DeployChainlinkModules.s.sol` — not “ACE certified” until partner evidence.
