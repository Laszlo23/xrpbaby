# Telegram Mini App — install & test

The mini app lives at **`/tg`** on the unified app (`app.buildingcultureid.space`).

**Full ecosystem go-live:** [ECOSYSTEM_GO_LIVE_RUNBOOK.md](./ECOSYSTEM_GO_LIVE_RUNBOOK.md) (Phase 2).

## Quick install (BotFather + script)

1. Create or select a bot in [@BotFather](https://t.me/BotFather) (`/newbot` or `/mybots`).
2. From repo root:

```bash
TELEGRAM_BOT_TOKEN='<paste-token-here>' npm run tg:setup
```

This will:

- Verify the token (`getMe`)
- Set the bot **menu button** to open the Mini App URL
- Write `TELEGRAM_BOT_TOKEN`, `TELEGRAM_MINIAPP_URL`, and `TELEGRAM_INITDATA_MAX_AGE_SEC` into `app/.env` and `deploy/.env`
- Set `VITE_TELEGRAM_DEV_USER_ID` for local browser testing

3. In [@BotFather](https://t.me/BotFather) — **required** or phones get `missing_init_data`:
   - `/setdomain` → your bot → `app.buildingcultureid.space`
   - `/mybots` → your bot → **Configure Mini App** → URL `https://app.buildingcultureid.space/tg`

4. Open your bot in Telegram (`https://t.me/<bot_username>`) and tap **Open Building Culture** (menu button — not a pasted browser link).

5. **Production:** redeploy the app so the server has `TELEGRAM_BOT_TOKEN` (auth returns `telegram_not_configured` without it).

## Manual BotFather path

If you prefer the UI:

1. `/mybots` → your bot → **Bot Settings** → **Menu Button** → **Configure menu button**
2. Set type **Web App** and URL: `https://app.buildingcultureid.space/tg`

## Local testing (without Telegram)

Telegram requires **HTTPS** for real in-app opens. For local API/UI work:

```bash
npm run dev:local   # comments NODE_ENV=production, starts Postgres + Vite
```

| URL | Purpose |
|-----|---------|
| http://localhost:5173/tg | Mini app UI (uses `VITE_TELEGRAM_DEV_USER_ID` dev bypass) |
| http://localhost:5173/tg/dev | Button console for all `/api/tg/*` endpoints |

Dev bypass: non-production servers accept header `x-telegram-dev-user: 123456789`.

## Local testing (inside Telegram)

Expose localhost over HTTPS, then point the bot at your tunnel:

```bash
# example: cloudflared quick tunnel
cloudflared tunnel --url http://localhost:5173

TELEGRAM_BOT_TOKEN='...' \
TELEGRAM_MINIAPP_URL='https://<tunnel-host>/tg' \
npm run tg:setup
```

Restart `npm run dev` after changing `.env`.

## TON wallet onboarding (inside Telegram)

1. Open **@buildingcultureappbot** → menu → Mini App.
2. Follow the **TON onboarding** steps at the top.
3. Tap **Connect TON wallet** — choose **Telegram Wallet** or Tonkeeper.
4. After connect you return to the bot automatically (`twaReturnUrl`) and **+50 XP** is claimed.
5. Complete the **learning module**, then **Create your .culture pass** for Base/EVM.

Required env (already in `app/.env`):

```bash
VITE_TONCONNECT_MANIFEST_URL=https://app.buildingcultureid.space/tonconnect-manifest.json
VITE_TELEGRAM_TWA_RETURN_URL=https://t.me/buildingcultureappbot
```

Redeploy after TON onboarding code changes.

## What to check (gap list)

| Area | Check | Missing if… |
|------|--------|-------------|
| Auth | Open bot → menu → app loads | `telegram_not_configured` on server; no `TELEGRAM_BOT_TOKEN` on deploy |
| TON | Connect wallet in `/tg` | `VITE_TONCONNECT_MANIFEST_URL` / manifest host mismatch |
| Quests | Claim after TON connect | DB down (`no_database`) or quest rules not met |
| Learning | Complete module + gratitude | Same as quests |
| XRP quote | Quote button in `/tg` | `XRPL_QUOTE_ENABLED` unset or XRPL RPC unreachable |
| Full pass | “Create your .culture pass” | Normal web `/join` flow (outside Telegram shell) |

API contract: [TELEGRAM_MINIAPP_API_CONTRACT.md](./TELEGRAM_MINIAPP_API_CONTRACT.md)

## Environment reference

```bash
TELEGRAM_BOT_TOKEN=              # @BotFather — required for real Telegram auth
TELEGRAM_MINIAPP_URL=https://app.buildingcultureid.space/tg
TELEGRAM_INITDATA_MAX_AGE_SEC=3600
VITE_TELEGRAM_DEV_USER_ID=123456789   # local dev only
VITE_TONCONNECT_MANIFEST_URL=https://app.buildingcultureid.space/tonconnect-manifest.json
XRPL_QUOTE_ENABLED=1
XRPL_EXECUTION_ENABLED=0         # quote-only until treasury gates pass
```

## Sync all `VITE_*` vars (before deploy)

`deploy/.env` is canonical. This copies it to `app/.env` and mirrors server ↔ client pairs (Telegram, TON, Farcaster, marketplace):

```bash
npm run sync:vite-env
npm run audit:vite-env   # lists missing optional vars
```

## Smoke commands

```bash
BASE=https://app.buildingcultureid.space

# Production health (needs signed init data from Telegram WebApp)
# curl -X POST "$BASE/api/tg/auth" -H "authorization: tma $TG_INIT_DATA" ...

# Local dev
curl -s -X POST http://localhost:5173/api/tg/auth \
  -H 'x-telegram-dev-user: 123456789' \
  -H 'content-type: application/json' -d '{}' | jq .
```
