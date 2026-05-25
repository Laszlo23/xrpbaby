-- Elias orb / ecosystem_guide threads vs concierge; prefs schema versioning
-- Apply via Supabase SQL editor or supabase db push.

ALTER TABLE elias_threads ADD COLUMN IF NOT EXISTS thread_kind text NOT NULL DEFAULT 'concierge';

ALTER TABLE elias_preference_profiles ADD COLUMN IF NOT EXISTS schema_version smallint NOT NULL DEFAULT 1;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'elias_threads_thread_kind_chk'
  ) THEN
    ALTER TABLE elias_threads
      ADD CONSTRAINT elias_threads_thread_kind_chk
      CHECK (thread_kind IN ('concierge', 'ecosystem_guide'));
  END IF;
END $$;
