-- Optional: sample announcement for /community (after community_schema.sql).
INSERT INTO platform_posts (title, body, published_at)
SELECT
  'Welcome to the investor loop',
  'This is a sample post. Replace with real updates or insert via SQL. Tasks and referrals are off-chain demo features.',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM platform_posts LIMIT 1);
