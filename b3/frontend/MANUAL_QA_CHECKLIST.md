# Manual QA matrix

Quick pass before release. Adjust URLs and env for your deployment.

| Flow               | What to verify                                                                                                                                                                           |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Wallet             | Connect / disconnect; `NetworkGuard` matches marketplace chain (`VITE_MARKETPLACE_NETWORK`).                                                                                             |
| Marketplace        | Listings load; OBC filter if env set; listing detail + buy path behaves when gated.                                                                                                      |
| Profile            | Portfolio (Insight), XP/quests, Strapi community panel when `VITE_STRAPI_URL` is set.                                                                                                    |
| Points             | With `DATABASE_URL`: balance loads; SIWE connect bonus; Farcaster tasks require `NEYNAR_API_KEY` + verified wallet on Farcaster. Without DB: graceful “database not configured” message. |
| Campaign           | Mint/share helpers; Warpcast compose opens with expected text.                                                                                                                           |
| Roadmap / Strapi   | Loader fallback when CMS is down or unset.                                                                                                                                               |
| x402               | `/api/x402/premium` GET + OPTIONS; `X402_NETWORK` and settlement matches deployment.                                                                                                     |
| Farcaster Mini App | `/.well-known/farcaster.json` returns `miniapp` JSON; links open in Warpcast; `sdk.actions.ready()` runs in Mini App context.                                                            |
