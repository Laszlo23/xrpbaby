# Deployment heatmap

Living risk map for [Building Culture](https://app.buildingcultureid.space) releases. Machine-readable source: [`app/e2e/route-matrix.json`](../app/e2e/route-matrix.json).

## How to read risk

| Risk | Meaning | Deploy gate |
|------|---------|-------------|
| **green** | E2E + console gate pass; fallbacks in place | Ship |
| **amber** | Works but env-dependent or partial loading UX | Ship with manual QA row |
| **red** | Console errors, silent failures, or missing e2e | Block deploy |

## P0 trust funnel (must be green)

```text
/ → /join → /forest?welcome=1 → /play → /profile → /pass → /credentials
```

| Route | Loading | Errors | Dopamine | Risk |
|-------|---------|--------|----------|------|
| `/` | Hero Suspense skeleton | Router default | Hero CTAs, proof ticker | green |
| `/welcome` | Static | Router default | 3-step tour | green |
| `/join` | Wallet spinner | Toast + inline | Post-SIWE redirect | amber |
| `/forest` | `loadState` machine | Section boundary | PostJoin pack, quest ring | green |
| `/play` | Section spinners | 5× section boundary | Spin well, milestones | green |
| `/profile` | Partial | Section boundary | XP bar, weekly BCC | amber |
| `/pass` | Mint spinner | Toast | Mint success | amber |
| `/credentials` | AsyncSection | Section boundary | Progress + claim | green |
| `/ecosystem` | Static | Router default | Claim ID CTA | green |

## Automated gates

```bash
cd app && npm run test:smoke    # Playwright + global console/pageerror gate
./scripts/production-smoke.sh https://app.buildingcultureid.space
```

Playwright uses [`e2e/fixtures/skip-onboarding.ts`](../app/e2e/fixtures/skip-onboarding.ts) (onboarding skip + [`no-console-errors`](../app/e2e/fixtures/no-console-errors.ts)).

Allowlisted noise: [`e2e/console-allowlist.ts`](../app/e2e/console-allowlist.ts).

## P1 product routes

See `route-matrix.json` for `/agent-os`, `/signal`, `/chronicles`, `/hq`, `/triple-333`, `/marketplace`, `/id/$name`.

## Click heatmap (production)

Growth Intelligence at `/intelligence` (requires `VITE_GI_ENABLED=1`). Funnel path shortcuts include P0 routes in the dashboard UI.

## Update ritual (each release)

1. Run `npm run test:smoke` locally or in CI.
2. If new console noise is benign, add regex to `console-allowlist.ts`.
3. Update `route-matrix.json` `risk` column for changed routes.
4. Run `./scripts/production-smoke.sh` against staging/production.
5. Tick dopamine rows in [`MANUAL_QA_CHECKLIST.md`](../app/MANUAL_QA_CHECKLIST.md).
