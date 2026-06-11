# Ankommen AI — Deployment Guide

Self-hosted production deployment on a VPS with Docker.

## Prerequisites

- Ubuntu 22.04+ VPS (4GB RAM minimum)
- Docker & Docker Compose
- Domain with DNS pointing to VPS
- SSL via Caddy or nginx + Let's Encrypt

## 1. Clone and configure

```bash
git clone <repo> /opt/ankommen
cd /opt/ankommen
cp .env.example .env
# Edit .env with production secrets
```

## 2. Start infrastructure

```bash
cd docker
docker compose up -d postgres redis minio
```

## 3. Database setup

```bash
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

## 4. Run ingest worker (RAG seed)

```bash
pnpm --filter @ankommen/ingest start
```

## 5. Build and run API

```bash
pnpm --filter @ankommen/api build
docker build -f docker/Dockerfile.api -t ankommen-api ..
docker run -d --env-file ../.env -p 3001:3001 --network host ankommen-api
```

Or use PM2:

```bash
cd services/api && pnpm start
```

## 6. Deploy web (Vercel or VPS)

**Vercel (recommended for web):**
- Root: `apps/web`
- Env: `NEXT_PUBLIC_API_URL`, `NEXTAUTH_*`, `GOOGLE_*`

**VPS:**
```bash
pnpm --filter @ankommen/web build
pnpm --filter @ankommen/web start
```

## 7. Admin dashboard

Port 3002 — protect with VPN or IP allowlist in production.

## 8. Mobile builds

```bash
cd apps/mobile
eas build --platform all
```

Configure `APPLE_IAP_SECRET` and `GOOGLE_PLAY_BILLING_KEY` for in-app purchases.

## 9. Telegram Mini App

1. Create bot via @BotFather
2. Set `TELEGRAM_BOT_TOKEN`
3. Build: `pnpm --filter @ankommen/telegram build`
4. Host `dist/` and set Web App URL in BotFather

## 10. Farcaster Mini App

1. Register app at Warpcast developer portal
2. Set `FARCASTER_APP_KEY`
3. Build and host `apps/farcaster/dist`

## Backups

Nightly cron (see `scripts/backup.sh`):

```bash
0 2 * * * /opt/ankommen/scripts/backup.sh
```

## Monitoring

- API health: `GET /health/ready`
- Logs: Docker logs or PM2
- Optional: PostHog self-hosted for analytics

## Environment variables

See `.env.example` for full list. Critical production values:

- `JWT_SECRET` — min 32 random chars
- `NEXTAUTH_SECRET` — min 32 random chars
- `DATABASE_URL` — production Postgres
- `OPENAI_API_KEY` — for AI + embeddings
- `STRIPE_*` — for subscriptions
