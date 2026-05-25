# Database schema (web)

PostgreSQL DDL for optional app features when `DATABASE_URL` is set in `web/.env.local`.

## Apply order

1. **Base** — [`schema.sql`](schema.sql) — users, wallet bindings, SIWE nonces, KYC, issuer applications.
2. **Community** — [`community_schema.sql`](community_schema.sql) — profiles, referrals, tasks, announcements.
3. **Feedback** — [`feedback_schema.sql`](feedback_schema.sql) — optional feedback submissions (used by `POST /api/feedback`).
4. **LinkedIn on profiles** (if you already applied community schema) — [`add_linkedin_to_user_profiles.sql`](add_linkedin_to_user_profiles.sql).

```bash
psql "$DATABASE_URL" -f web/sql/schema.sql
psql "$DATABASE_URL" -f web/sql/community_schema.sql
psql "$DATABASE_URL" -f web/sql/feedback_schema.sql
psql "$DATABASE_URL" -f web/sql/add_linkedin_to_user_profiles.sql
# Optional sample announcement:
# psql "$DATABASE_URL" -f web/sql/seed_community_example.sql
```

## Environment

- `DATABASE_URL` — Postgres connection string (server-only). Use the same host as the app (including a Docker Compose `postgres` service) or a managed provider; the URL is not exposed to the browser.
- `SESSION_SECRET` — random string (32+ bytes) used to sign HttpOnly session cookies after SIWE sign-in. Required for `/api/profile/*` and community tasks when using cookie auth.

## Notes

- Community features degrade gracefully when `DATABASE_URL` is unset (UI shows setup hints).
- Referral and task claims are best-effort anti-abuse (points are not on-chain); tune for production.
