# Agent operations — BUILDCHAIN Strapi CMS

This document is for **humans and automation** (Cursor agents, CI, scripts) that manage content and configuration without guessing.

## What this service is

- **Strapi 5** admin at `{HOST}:{PORT}/admin` (default `http://localhost:1337/admin`).
- **Content API** at `/api/*` for the Next/TanStack frontend (`../frontend`).
- **SQLite** by default (`.tmp/data.db`); Postgres optional for production.
- **First boot** runs `src/bootstrap.js`: imports seed data once (see `data/data.json`), grants **Public** role read access to listed types, and ensures permissions for roadmap, site narrative, and community profiles.

## Quick commands

| Command | Purpose |
|--------|---------|
| `npm install` | Dependencies |
| `npm run bootstrap` | Create `.env` with random secrets if missing (`scripts/bootstrap-local-env.js`) |
| `npm run develop` | Dev server + admin |
| `npm run build` then `npm run start` | Production |
| `STRAPI_URL=http://127.0.0.1:1337 node scripts/agent-smoke.mjs` | Verify API responds |

## Environment variables

| Variable | Role |
|----------|------|
| `HOST`, `PORT` | Bind address (default `0.0.0.0:1337`) |
| `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET` | Required Strapi secrets |
| `COMMUNITY_PROFILE_JWT_SECRET` | Signs wallet session JWTs for profile routes (defaults to `JWT_SECRET`) |
| `DATABASE_*` / `DATABASE_URL` | Override SQLite → Postgres |
| `CORS_ORIGIN` | Comma-separated browser origins (must include your frontend origin in dev and prod) |

**Frontend pairing:** the Node app that serves the frontend should set **`STRAPI_URL`** to a URL reachable from the server (e.g. `http://strapi:1337` in Docker). The browser uses a **same-origin proxy** for `community-profiles` only; other Strapi reads still use **`VITE_STRAPI_URL`** unless you add more proxies later.

## Machine-readable API inventory

See **`data/api-inventory.json`** — content-type UIDs, REST collection names, single vs collection types, and **community-profile custom routes** (wallet nonce, JWT profile CRUD).

## Authentication models

1. **Public (no token)** — `find` / `findOne` on types listed in `api-inventory.json` after bootstrap. Use for read-only automation against published content.

2. **Admin API token (recommended for agents)** — Strapi admin → **Settings → API Tokens → Create new token** → type **Full access** (or **Read-only** if you only ingest). Send as:
   ```http
   Authorization: Bearer <token>
   ```
   Store as `STRAPI_API_TOKEN` in CI or local env. Use for creating/updating articles, roadmap items, site narrative, uploads.

3. **Wallet JWT (community profiles only)** — Not the Strapi admin token. Obtained via `POST /api/community-profiles/wallet/nonce` then `…/verify`. Sent as `Authorization: Bearer <wallet-jwt>` to `/api/community-profiles/my-profile` routes. Documented in inventory JSON under `customRoutes`.

## REST patterns (Strapi 5)

- **Collection:** `GET /api/{collection}?populate=*&filters[field][$eq]=value`
- **Single type:** `GET /api/{singular-api-id}` e.g. `GET /api/site-narrative`
- **Create (token):** `POST /api/{collection}` with body `{ "data": { … } }`
- **Update (token):** `PUT /api/{collection}/{documentId}` (Strapi 5 document id)

**Publishing:** Types with `draftAndPublish: true` (e.g. **roadmap-item**, **article**) must be **published** in Admin or include publication fields via API or public list stays empty.

## Content types (summary)

| API path | Kind | Notes |
|----------|------|--------|
| `/api/articles` | Collection | Blog posts, blocks, cover media |
| `/api/authors`, `/api/categories` | Collection | Supporting |
| `/api/global`, `/api/about` | Single | Site-wide / about page |
| `/api/roadmap-items` | Collection | Roadmap cards (`sortOrder`, phases) |
| `/api/site-narrative` | Single | Hero tagline, CTA for marketing shell |
| `/api/community-profiles` | Collection | Universal profiles + custom wallet routes |

Schemas live under `src/api/*/content-types/*/schema.json`.

## Safe automation checklist

1. Run `npm run bootstrap` if `.env` is missing.
2. Start Strapi (`npm run develop` or production `start`).
3. Confirm Content API: `node scripts/agent-smoke.mjs`.
4. Create **API Token** in admin; export `STRAPI_API_TOKEN` for write automation.
5. Ensure **`CORS_ORIGIN`** includes every frontend origin that calls Strapi **directly** (community profile reads through the frontend proxy still need Strapi reachable server-side).
6. For roadmap/articles, verify entries are **Published** after edits.

## Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| Empty roadmap/blog on site | Draft content not published, or `VITE_STRAPI_URL` wrong on client |
| CORS error from browser | Add origin to `CORS_ORIGIN` |
| Frontend “fetch failed” on profile | Server `STRAPI_URL` unreachable from Node; fix Docker network / env |
| Permission denied on GET | Re-run bootstrap logic or manually enable Public **find** for that type in Admin → Users & Permissions |

## Related repos paths

- Frontend Strapi helpers: `../frontend/src/lib/strapi-roadmap.ts`, `../frontend/src/lib/community-profile/`
- Deploy script reference: `../scripts/deploy-ssh.sh`
