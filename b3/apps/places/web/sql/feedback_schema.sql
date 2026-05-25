-- Feedback (run after web/sql/schema.sql — requires users)
CREATE TABLE IF NOT EXISTS feedback_submissions (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
  wallet_address TEXT,
  email TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  message TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback_submissions (created_at DESC);
