# Manual QA matrix

Quick pass before release. Adjust URLs and env for your deployment.

**Canonical host:** `https://app.buildingcultureid.space`

## Unified platform (critical paths)

| Flow | What to verify |
|------|----------------|
| Landing `/` | Full scroll story; hero CTAs "Join free" / "See what we build"; waitlist email submit |
| `/join` | Intent pick; wallet connect; SIWE sign → redirects to `/forest` |
| `/forest` | Hub hero; stats card; Culture pulse link; module grid; no bottom nav |
| `/play` | Drops sections; bottom nav Play active; tagline banner visible |
| `/welcome` | Redirects to `/` |
| Domain | `PUBLIC_APP_ORIGIN` matches canonical; Farcaster `homeUrl` ends with `/` |
| Shell | Bottom nav hidden on `/`, `/join`, `/forest`; visible on `/play` |

## Core product

| Flow               | What to verify                                                                                                                                                                           |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Wallet             | Connect / disconnect; `NetworkGuard` matches marketplace chain (`VITE_MARKETPLACE_NETWORK`).                                                                                             |
| Marketplace        | Listings load; OBC filter if env set; listing detail + buy path behaves when gated.                                                                                                      |
| Profile            | Portfolio (Insight), XP/quests, Strapi community panel when `VITE_STRAPI_URL` is set.                                                                                                    |
| Points             | With `DATABASE_URL`: balance loads; SIWE connect bonus; Farcaster tasks require `NEYNAR_API_KEY` + verified wallet on Farcaster. Without DB: graceful “database not configured” message. |
| Campaign           | Mint/share helpers; Warpcast compose opens with expected text.                                                                                                                           |
| Roadmap / Strapi   | Loader fallback when CMS is down or unset.                                                                                                                                               |
| x402               | `/api/x402/premium` GET + OPTIONS; `X402_NETWORK` and settlement matches deployment.                                                                                                     |
| Farcaster Mini App | `/.well-known/farcaster.json` returns `miniapp` JSON; `homeUrl` is story landing `/`; links open in Warpcast; `sdk.actions.ready()` runs in Mini App context.                            |
| Culture Pulse      | `/signal` feed loads; metrics API status &lt; 500; comment requires wallet/SIWE.                                                                                                       |

## Automated gates

```bash
cd app && npm run test:unit && npm run test:smoke
./scripts/production-smoke.sh https://app.buildingcultureid.space
```

See [e2e/README.md](e2e/README.md) and [docs/MISSING_AND_FIXES.md](../docs/MISSING_AND_FIXES.md).
