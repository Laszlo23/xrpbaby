-- Community / investor loop (profiles, referrals, tasks, announcements).
-- Apply after web/sql/schema.sql (requires `users` and `wallet_bindings`).

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id INTEGER PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'public')),
  display_name TEXT,
  bio TEXT,
  show_holdings BOOLEAN NOT NULL DEFAULT FALSE,
  twitter TEXT,
  discord TEXT,
  linkedin TEXT,
  farcaster TEXT,
  telegram TEXT,
  website TEXT,
  public_slug TEXT UNIQUE,
  extra_wallets JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_slug ON user_profiles (public_slug)
  WHERE public_slug IS NOT NULL;

CREATE TABLE IF NOT EXISTS referral_codes (
  user_id INTEGER PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes (code);

CREATE TABLE IF NOT EXISTS referrals (
  id SERIAL PRIMARY KEY,
  referrer_user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  referee_user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (referee_user_id)
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals (referrer_user_id);

CREATE TABLE IF NOT EXISTS task_events (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  task_id TEXT NOT NULL,
  day DATE NOT NULL DEFAULT (CURRENT_DATE),
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, task_id, day)
);

CREATE INDEX IF NOT EXISTS idx_task_events_user ON task_events (user_id, day);

CREATE TABLE IF NOT EXISTS platform_posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
