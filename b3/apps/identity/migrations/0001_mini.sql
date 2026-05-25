CREATE TABLE IF NOT EXISTS mini_user (
  fid INTEGER PRIMARY KEY,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS mini_task_completion (
  fid INTEGER NOT NULL,
  task_id TEXT NOT NULL,
  completed_at TEXT NOT NULL,
  proof TEXT,
  PRIMARY KEY (fid, task_id)
);

CREATE INDEX IF NOT EXISTS idx_mini_user_xp ON mini_user (xp DESC);
