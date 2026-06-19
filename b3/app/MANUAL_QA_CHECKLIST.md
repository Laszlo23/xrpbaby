# Manual QA matrix

Quick pass before release. Adjust URLs and env for your deployment.

**Canonical host:** `https://app.buildingcultureid.space`

## Unified platform (critical paths)

| Flow        | What to verify                                                                        |
| ----------- | ------------------------------------------------------------------------------------- |
| Landing `/` | Full scroll story; hero CTAs "Join free" / "See what we build"; waitlist email submit |
| `/join`     | Intent pick; wallet connect; SIWE sign → redirects to `/forest`                       |
| `/forest`   | Hub hero; stats card; Culture pulse link; module grid; no bottom nav                  |
| `/play`     | Drops sections; bottom nav Play active; tagline banner visible                        |
| `/welcome`  | Redirects to `/`                                                                      |
| Domain      | `PUBLIC_APP_ORIGIN` matches canonical; Farcaster `homeUrl` ends with `/`              |
| Shell       | Bottom nav hidden on `/`, `/join`, `/forest`; visible on `/play`                      |

## Dopamine moments (trust funnel)

| Moment           | Trigger             | Expected feedback                         |
| ---------------- | ------------------- | ----------------------------------------- |
| Post-join        | `/forest?welcome=1` | PostJoinPackPrompt + "Your first 3 steps" |
| Spin well        | `/play`             | toast.success with Culture Points         |
| Quest claim      | `/forest/quests`    | toast + progress ring update              |
| Culture ID mint  | `/pass`             | success toast + identity display          |
| Credential claim | `/credentials`      | inline success / toast                    |
| Weekly BCC       | profile / points    | quote → claim success                     |
| Chronicle mint   | `/chronicles/$id`   | mint confirmed toast                      |

## Core product

| Flow               | What to verify                                                                                                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Wallet             | Connect / disconnect; `NetworkGuard` matches marketplace chain (`VITE_MARKETPLACE_NETWORK`).                                                                                               |
| Marketplace        | Listings load; OBC filter if env set; listing detail + buy path behaves when gated.                                                                                                        |
| Profile            | Portfolio (Insight), XP/quests, Strapi community panel when `VITE_STRAPI_URL` is set.                                                                                                      |
| Points             | With `DATABASE_URL`: balance loads; SIWE connect bonus; Farcaster tasks require `NEYNAR_API_KEY` + verified wallet on Farcaster. Without DB: graceful “database not configured” message.   |
| Points → BCC       | With `POINTS_REDEEM_ENABLED=1` + rate + TVL gate: quote loads; redeem deducts points (treasury dry-run or testnet); insufficient balance / daily cap errors; synthetic TG wallet rejected. |
| Campaign           | Mint/share helpers; Warpcast compose opens with expected text.                                                                                                                             |
| Roadmap / Strapi   | Loader fallback when CMS is down or unset.                                                                                                                                                 |
| x402               | `/api/x402/premium` GET + OPTIONS; `X402_NETWORK` and settlement matches deployment.                                                                                                       |
| Farcaster Mini App | `/.well-known/farcaster.json` returns `miniapp` JSON; `homeUrl` is story landing `/`; links open in Warpcast; `sdk.actions.ready()` runs in Mini App context.                              |
| Culture Pulse      | `/signal` feed loads; metrics API status &lt; 500; comment requires wallet/SIWE.                                                                                                           |

## RWA / Places (ST-IMMO catalog)

| Flow            | What to verify                                                                                                                      |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Catalog audit   | `node apps/places/scripts/audit-property-catalog.mjs` exits 0                                                                       |
| REOC metadata   | `node apps/places/scripts/validate-reoc-metadata.mjs` exits 0; `/places/api/reoc/1` returns JSON with `image` + `documents`         |
| Registry        | On-chain `nextPropertyId === 9`; OG1–OG8 share tokens (property 8 may pending gas — see `deployments/base-mainnet.json`)            |
| Properties grid | `/places/properties` shows live token addresses (not demo fallback banner)                                                          |
| RWA icon        | `https://app.buildingcultureid.space/places/meta/rwa-share-icon.svg` loads                                                          |
| Analytics       | With `NEXT_PUBLIC_ANALYTICS_ENABLED=1`, property view emits `rwa_property_view` (see `apps/places/docs/RWA_ANALYTICS_READINESS.md`) |

## Automated gates

```bash
cd app && npm run test:unit && npm run test:smoke
./scripts/production-smoke.sh https://app.buildingcultureid.space
```

See [docs/DEPLOY_HEATMAP.md](../docs/DEPLOY_HEATMAP.md), [e2e/README.md](e2e/README.md) and [docs/MISSING_AND_FIXES.md](../docs/MISSING_AND_FIXES.md).
