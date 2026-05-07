# Strapi backend (B3)

CMS/API for the B3 frontend. Local development uses **SQLite** by default (`DATABASE_CLIENT=sqlite`, database file `.tmp/data.db`).

**Automation / AI agents:** read [**AGENTS.md**](./AGENTS.md), **`data/api-inventory.json`**, and run **`npm run agent:smoke`** when Strapi is up.

## Quick start (local)

From this directory:

```bash
npm install
npm run bootstrap    # creates .env with random secrets if .env is missing
npm run develop
```

- **Admin:** http://localhost:1337/admin — create the first admin user on first launch.
- **API:** http://localhost:1337/api

If you prefer to manage secrets yourself, copy `.env.example` to `.env` and replace the placeholder values.

### Frontend pointing at this API

In `../frontend`, set (or rely on the default in code):

```bash
# frontend/.env.local
VITE_STRAPI_URL=http://127.0.0.1:1337
```

See also `../frontend/.env.example`.

### CORS

Allowed browser origins come from `CORS_ORIGIN` (comma-separated). Defaults include Vite dev (`5173`) and preview (`4173`). Adjust if your app runs on another port.

### Community profile API

Optional `COMMUNITY_PROFILE_JWT_SECRET` signs wallet session JWTs for profile routes. If omitted, `JWT_SECRET` is used.

---

### Other scripts

| Script | Purpose |
|--------|---------|
| `npm run develop` | Dev server with auto-reload |
| `npm run build` | Build admin panel for production |
| `npm run start` | Production mode (after `build`) |
| `npm run seed:example` | Legacy seed script (bootstrap on first `develop` is preferred) |
| `npm run agent:smoke` | HTTP smoke test against Content API (`STRAPI_URL`, optional `STRAPI_API_TOKEN`) |

---

### Learn more

- [Strapi CLI](https://docs.strapi.io/dev-docs/cli)
- [Deployment](https://docs.strapi.io/dev-docs/deployment)
