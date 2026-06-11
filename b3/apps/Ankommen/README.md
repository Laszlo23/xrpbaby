# Ankommen AI

AI companion for newcomers in Austria — housing, benefits, documents, jobs, healthcare, and more.

**Powered by Building Culture** — Technology. Community. Impact.

## Architecture

Monorepo (pnpm + Turborepo):

| Package | Description |
|---------|-------------|
| `apps/web` | Next.js web app + PWA |
| `apps/admin` | Admin dashboard |
| `apps/mobile` | Expo React Native (iOS/Android) |
| `apps/telegram` | Telegram Mini App |
| `apps/farcaster` | Farcaster Mini App |
| `services/api` | Fastify REST API |
| `packages/database` | Prisma + PostgreSQL + pgvector |
| `packages/ai` | Agent orchestrator + RAG |
| `packages/ui` | Shared design system |
| `packages/api-client` | Typed API client |
| `packages/i18n` | 14-language messages |
| `workers/ingest` | Knowledge base ingestion |
| `legacy/` | Original Lovable TanStack prototype |

## Quick start

```bash
# Install
pnpm install

# Start Postgres, Redis, MinIO
cd docker && docker compose up -d && cd ..

# Setup database
cp .env.example .env
pnpm db:generate
pnpm db:migrate
pnpm db:seed

# Run API + Web
pnpm --filter @ankommen/api dev
pnpm --filter @ankommen/web dev
```

- Web: http://localhost:3000
- API: http://localhost:3001
- Admin: http://localhost:3002

## Prototype

The original Lovable UI prototype is preserved in `legacy/` for reference.

## Deployment

See [docs/deployment.md](docs/deployment.md).

## Legal

Ankommen AI provides guidance only — not legal, financial, or medical advice.
