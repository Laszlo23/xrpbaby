# Domain cutover — unified platform

## Canonical front door (phase 1)

| Host | Role |
|------|------|
| `https://app.buildingcultureid.space/` | Full story landing (TanStack — ported from CRA) |
| `https://app.buildingcultureid.space/play` | RWA drops / Play home |
| `https://app.buildingcultureid.space/join` | Platform onboarding |
| `https://app.buildingcultureid.space/forest` | Community hub |
| `https://app.buildingcultureid.space/api/platform/*` | Unified waitlist + analytics + member API |

## Deprecated (post-unification)

| Legacy stack | Notes |
|--------------|-------|
| `apps/eco`, `apps/hub`, `apps/signal` SPAs | Removed; routes live in unified `app/` (`/earth`, `/guide`, `/`, `/signal`) |
| `apps/identity`, `apps/art` frontends | Removed; keep `apps/*/contracts/` for deploy scripts only |
| `onboarding/frontend` CRA build | Replaced by `app/src/components/landing/*` at `/` |
| `apps/founding/frontend` | Replaced by `app/` landing + `/forest` |
| `buildingculturelanding-main` FastAPI + Mongo | Waitlist now `POST /api/platform/waitlist` (Postgres) |
| nginx `bc_landing` static root | Single `bc_platform` upstream for all paths |

## 301 redirects (phase 6)

| Legacy | Target |
|--------|--------|
| Legacy app host | `https://app.buildingcultureid.space/forest` or matching path |
| Legacy home host | `https://home.buildingcultureid.space/` |
| Legacy eco host | `https://eco.buildingcultureid.space/earth` |
| `miniapp.buildingcultureid.space` | `/forest/quests` |
| `mini.buildingcultureid.space` | `/pass` |

## Checklist

- [ ] Copy `deploy/.env.example` → `deploy/.env`; set `CORS_ORIGIN`, `SIWE_ALLOWED_DOMAINS`, Strapi secrets
- [ ] `./scripts/sync-deploy-env.sh` then `./app/scripts/docker-build.sh`
- [ ] `cd deploy && docker compose build && docker compose up -d`
- [ ] Strapi: admin user, `npm run ensure:local` in cms (roadmap + API token)
- [ ] Nginx: `infra/nginx-unified-entry.example.conf` — app → `:3000`, api → `:1337`
- [ ] `export DEPLOY_HOST=user@vps && ./scripts/deploy-full-stack.sh` (optional rsync deploy)
- [ ] `./scripts/production-smoke.sh https://your-public-origin`
- [ ] `./scripts/install-pulse-cron.sh` on VPS
- [ ] Purge CDN after nginx changes

## Impact satellites (beta — interim proxy)

| Host | Upstream (interim) | Nginx template |
|------|-------------------|----------------|
| `https://ankommen.buildingcultureid.space/` | `ankommen.ai` | [infra/nginx-ankommen-buildingculture.example.conf](../infra/nginx-ankommen-buildingculture.example.conf) |
| `https://forkids.buildingcultureid.space/` | `kinderstimme.at` | [infra/nginx-forkids-buildingculture.example.conf](../infra/nginx-forkids-buildingculture.example.conf) |

Add both hosts to `CORS_ORIGIN` and `SIWE_ALLOWED_DOMAINS` in production `deploy/.env` before go-live.

See also [CROSS_DOMAIN_UNIFIED_ENTRY.md](./CROSS_DOMAIN_UNIFIED_ENTRY.md) and [infra/nginx-unified-entry.example.conf](../infra/nginx-unified-entry.example.conf).
