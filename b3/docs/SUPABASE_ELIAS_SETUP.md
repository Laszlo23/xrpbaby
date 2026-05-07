# Supabase setup for Elias (concierge + orb)

The TanStack server uses **`SUPABASE_URL`** + **`SUPABASE_SERVICE_ROLE_KEY`** (never expose the service role to the browser). Client code only talks through server functions.

## 1. Create or pick a project

In [Supabase Dashboard](https://supabase.com/dashboard), open your project (or create one).

## 2. Apply the schema

**Option A — SQL Editor (fastest while you’re logged in)**

1. Open **SQL** → **New query**.
2. Paste the full script from [`frontend/scripts/apply-elias-supabase-all.sql`](../frontend/scripts/apply-elias-supabase-all.sql).
3. Click **Run**. You should see success for extensions, tables, RLS, seed rows, and `thread_kind` / `schema_version`.

**Option B — split migrations**

Run in order:

1. [`frontend/supabase/migrations/001_elias_concierge.sql`](../frontend/supabase/migrations/001_elias_concierge.sql)
2. [`frontend/supabase/migrations/002_elias_thread_kind_prefs.sql`](../frontend/supabase/migrations/002_elias_thread_kind_prefs.sql)

If `001` already ran earlier, only run `002` for orb support.

## 3. Copy API keys into `.env`

1. **Project Settings** → **API**.
2. Copy **Project URL** → set `SUPABASE_URL` in `frontend/.env` (server-side; same file as other secrets for local dev).
3. Under **Project API keys**, copy **`service_role`** (secret) → `SUPABASE_SERVICE_ROLE_KEY`.

Example (values fake):

```bash
SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Restart `npm run dev` after saving.

## 4. Verify Elias

1. Open the app with **`VITE_ELIAS_ORB_ENABLED=1`** if you use the orb.
2. Open **Elias orb** or **`/elias`** — chat should persist threads instead of `supabase_or_unknown_session`.
3. For model replies, set **`OPENAI_API_KEY`** and/or **`ANTHROPIC_API_KEY`** in `frontend/.env`. If both are set, OpenAI is used by default; set **`ELIAS_LLM_PROVIDER=anthropic`** to use Claude. See `frontend/.env.example`.

## Security notes

- Never commit `.env` or paste the **service_role** key into `VITE_*` or client bundles.
- If an API key was ever committed to git, **rotate** it in Dashboard → API → regenerate.
- RLS is enabled on Elias tables with **no anon policies** by design; only the service-role server client is used today.

## Optional: Supabase CLI

If you use `supabase link` and local CLI, you can apply files from `frontend/supabase/migrations/` with `supabase db push` — only after linking the same project.
