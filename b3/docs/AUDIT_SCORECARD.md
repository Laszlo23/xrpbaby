# Audit Scorecard

Generated: 2026-06-17T23:58:02.112Z
Origin: https://app.buildingcultureid.space

| Pass | Warn | Fail |
|------|------|------|
| 73 | 4 | 7 |

## Checks

| Status | Label | Detail |
|--------|-------|--------|
| pass | Deploy environment (phases 0–2) | phase_0_2=ready |
| pass | Base mainnet contract bytecode | checks_ok=21 |
| pass | Resources audit (local + HTTP) | no_hard_failures |
| pass | Smoke: / | / → 200 |
| pass | Smoke: /forest | /forest → 200 |
| pass | Smoke: /join | /join → 200 |
| pass | Smoke: /creators | /creators → 200 |
| pass | Smoke: /welcome | /welcome → 200 |
| pass | Smoke: /signal | /signal → 200 |
| pass | Smoke: /roadmap | /roadmap → 200 |
| pass | Smoke: /docs | /docs → 200 |
| pass | Smoke: /drops/art | /drops/art → 200 |
| pass | Smoke: /elias | /elias → 200 |
| pass | Smoke: /0g/agentid | /0g/agentid → 200 |
| pass | Smoke: /grant-proof | /grant-proof → 200 |
| pass | Smoke: /voice | /voice → 200 |
| pass | Smoke: /plan | /plan → 200 |
| pass | Smoke: /ops/attribution | /ops/attribution → 200 |
| pass | Smoke: /agent-os | /agent-os → 200 |
| pass | Smoke: /demo/atlas/creators | /demo/atlas/creators → 200 |
| pass | Smoke: / homepage has talentapp:project_verification meta | / homepage has talentapp:project_verification meta |
| pass | Smoke: / homepage has favicon link | / homepage has favicon link |
| pass | Smoke: / homepage has og:image meta | / homepage has og:image meta |
| pass | Smoke: / homepage has twitter:card meta | / homepage has twitter:card meta |
| pass | Smoke: / has og:image | / has og:image |
| pass | Smoke: /plan has og:image | /plan has og:image |
| pass | Smoke: /grant-proof has og:image | /grant-proof has og:image |
| pass | Smoke: /og-default.png | /og-default.png → 200 |
| pass | Smoke: art redirect | art redirect → 301 https://app.buildingcultureid.space/drops/art |
| pass | Smoke: /0g/agentid shows AgentId contract proof | /0g/agentid shows AgentId contract proof |
| pass | Smoke: /agent-os shows Research Agent panel | /agent-os shows Research Agent panel |
| pass | Smoke: /id/laszlo.culture shows founder showcase metrics | /id/laszlo.culture shows founder showcase metrics |
| fail | Smoke: /api/identity/graph-demo missing ok:true | /api/identity/graph-demo missing ok:true |
| warn | Smoke: /id/laszlo.culture missing Identity Graph section (enrichment may be empty) | /id/laszlo.culture missing Identity Graph section (enrichment may be empty) |
| pass | Smoke: GET /api/agent-os/overview | GET /api/agent-os/overview → 200 |
| fail | Smoke: GET /api/agents/research | GET /api/agents/research → 503 (expected 402 or 2xx) |
| pass | Smoke: /drops/art contains mint UI | /drops/art contains mint UI |
| pass | Smoke: /elias shows coming-soon (Elias disabled) | /elias shows coming-soon (Elias disabled) |
| pass | Smoke: GET /api/platform/siwe-nonce | GET /api/platform/siwe-nonce |
| pass | Smoke: /api/pulse/metrics | /api/pulse/metrics → 200 |
| pass | Smoke: /api/market/bcc | /api/market/bcc → ok:true |
| pass | Smoke: /api/market/health | /api/market/health → ok:true |
| warn | Smoke: /api/trading/health | /api/trading/health → reachable:false (upstream trading agent offline) |
| pass | Smoke: /api/marketing/grove/tick | /api/marketing/grove/tick → ok:true |
| pass | Smoke: /api/marketing/social-campaign/tick | /api/marketing/social-campaign/tick → ok:true |
| pass | Smoke: /api/market/bcc/bnb-route | /api/market/bcc/bnb-route → ok:true |
| pass | Smoke: /api/identity/check-bnb?label=test | /api/identity/check-bnb?label=test → ok:true |
| pass | Smoke: GET /api/platform/funnel-baseline | GET /api/platform/funnel-baseline |
| pass | Smoke: GET /api/platform/attribution-dashboard | GET /api/platform/attribution-dashboard |
| pass | Smoke: canonical redirect miniapp.buildingcultureid.space | canonical redirect miniapp.buildingcultureid.space → 301 https://app.buildingcultureid.space/forest/quests |
| pass | Smoke: canonical redirect mini.buildingcultureid.space | canonical redirect mini.buildingcultureid.space → 301 https://app.buildingcultureid.space/pass |
| pass | Smoke: /places/meta/rwa-share-icon.svg | /places/meta/rwa-share-icon.svg → 200 |
| pass | Smoke: GET /places/api/reoc/1 | GET /places/api/reoc/1 → valid REOC JSON |
| pass | Smoke: GET /places/api/reoc/999 | GET /places/api/reoc/999 → 404 |
| pass | Smoke: /manifest.webmanifest | /manifest.webmanifest → valid PWA manifest |
| pass | Smoke: /sw.js | /sw.js → 200 |
| pass | Smoke: /icons/icon-192.png | /icons/icon-192.png → 200 |
| pass | Smoke: /icons/icon-512.png | /icons/icon-512.png → 200 |
| pass | Smoke: /join has web app manifest link | /join has web app manifest link |
| pass | Smoke: /tg | /tg → 200 |
| pass | Smoke: /tonconnect-manifest.json | /tonconnect-manifest.json → valid TON Connect manifest (PNG icon) |
| pass | Smoke: /meta/tonconnect-icon.png | /meta/tonconnect-icon.png → 200 |
| pass | Smoke: GET /api/tg/me | GET /api/tg/me → 401 missing_init_data (TELEGRAM_BOT_TOKEN live) |
| pass | Smoke: GET /api/tg/home | GET /api/tg/home → 401 missing_init_data (TELEGRAM_BOT_TOKEN live) |
| pass | Smoke: GET /api/tg/tasks | GET /api/tg/tasks → 401 missing_init_data (TELEGRAM_BOT_TOKEN live) |
| pass | Smoke: GET /api/tg/leaderboard | GET /api/tg/leaderboard → 401 missing_init_data (TELEGRAM_BOT_TOKEN live) |
| pass | Smoke: GET /api/tg/quests | GET /api/tg/quests → 401 missing_init_data (TELEGRAM_BOT_TOKEN live) |
| pass | Smoke: POST /api/tg/auth | POST /api/tg/auth → 401 missing_init_data (TELEGRAM_BOT_TOKEN live) |
| pass | Smoke: Telegram bot menu | Telegram bot menu → opens /tg |
| pass | Smoke: GET /api/webhooks/quidli | GET /api/webhooks/quidli → quidli-connect configured |
| pass | Smoke: GET /api/marketing/quidli/status | GET /api/marketing/quidli/status |
| pass | Smoke: Grove Telegram outbound | Grove Telegram outbound → configured |
| fail | Production smoke suite | exit_code=1 |
| fail | P0 API reliability endpoints | see proof-bundles/reliability-latest.json |
| fail | Growth audit (smoke + Telegram) | exit_code=1 |
| warn | Critical flow Playwright specs | run npm run audit:gate locally or in CI |
| pass | Backtest suite |  |
| fail | Security scan (npm audit + gitleaks) |  |
| pass | Slither static analysis |  |
| pass | All Foundry test suites |  |
| pass | App unit tests |  |
| warn | App Playwright e2e | skipped (--skip-e2e) |
| pass | Workspace package tests |  |
| fail | Grant verify orchestrator | exit_code=1 |

Refresh: `npm run audit:gate -- --write-scorecard`
