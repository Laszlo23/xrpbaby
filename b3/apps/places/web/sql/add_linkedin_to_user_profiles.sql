-- Add LinkedIn to community profiles (run after community_schema.sql).
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS linkedin TEXT;
