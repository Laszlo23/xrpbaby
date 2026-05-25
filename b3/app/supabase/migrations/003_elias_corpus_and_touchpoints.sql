-- =============================================================================
-- Elias — corpus + touchpoints (DB-backed indexing for orb ecosystem mode)
-- =============================================================================

create table if not exists elias_corpus_chunks (
  id text primary key,
  title text not null,
  tags text[] not null default '{}',
  body text not null,
  updated_at timestamptz not null default now()
);

create index if not exists elias_corpus_chunks_tags_gin on elias_corpus_chunks using gin (tags);

create table if not exists elias_touchpoints (
  id text primary key,
  label text not null,
  href text,
  absolute_url text,
  hint text not null,
  updated_at timestamptz not null default now()
);

-- RLS is enabled by default in the one-shot apply script; keep parity here.
alter table elias_corpus_chunks enable row level security;
alter table elias_touchpoints enable row level security;

-- Seed on fresh DB only (safe to re-run; no overwrite).
insert into elias_corpus_chunks (id, title, tags, body)
select v.id, v.title, v.tags, v.body
from (
  values
    (
      'mission_belief',
      'Why Building Culture exists',
      array['mission','culture','places','story','why','forgotten','preserve','belong'],
      'Building Culture reunites stewardship of real assets with culture.
We revive meaningful places—not as abstract portfolios, but as lived scenes:
community nights, residences, artworks, missions. Ownership is participatory:
onchain proofs, treasury clarity, missions for members. The slogan that guides us:
bring forgotten places back to life.'
    ),
    (
      'emotional_entry',
      'Belonging, not spreadsheets',
      array['emotion','narrative','rwa','community','access','culture'],
      'We position culture as emotionally legible—not “another RWA ticker.” Users join for status,
access to places, lore and collectibles tied to neighborhoods. Tokens and tickets finance and gate
experience; the protagonist is culture itself.'
    ),
    (
      'elias_role',
      'Elias — ecosystem operator',
      array['elias','ai','concierge','guide','operator','vienna'],
      'Elias is Building Culture''s AI-native operator persona. Elias concierge mode plans Vienna stays through
preference capture and partner introductions. Orb mode answers ecosystem questions grounded in curated sources.
For sensitive booking flows, Elias directs to the concierge route.'
    ),
    (
      'bcd_economy',
      'BCD tokens & quests',
      array['bcd','token','economy','xp','quest','rewards'],
      'BCD anchors in-app economies: drops, ticketing, quests. Profiles track XP locally; Genesis claim is a
distinct merkle path. Sale flows activate when deployed. Always verify contract addresses via official env.'
    ),
    (
      'drops_truth',
      'Drops & on-chain fairness',
      array['raffle','tickets','fair','onchain','pool','odds'],
      'Raffle-style pools use on-chain settlement so odds and treasury flows are publicly auditable. Users should
follow explorer links tied to deployments on Base.'
    ),
    (
      'governance_notes',
      'DAO & treasury posture',
      array['dao','safe','treasury','multisig','policy'],
      'High-impact treasury motions route through multisig safeguards described in treasury policy—not hot agents.
Elias can explain intent but cannot sign transactions.'
    )
) as v(id, title, tags, body)
where not exists (select 1 from elias_corpus_chunks limit 1);

insert into elias_touchpoints (id, label, href, absolute_url, hint)
select v.id, v.label, v.href, v.absolute_url, v.hint
from (
  values
    ('app_home', 'App home', '/', null, 'Drops, hero story, treasury of culture plays.'),
    ('mission', 'Mission & genesis', '/mission', null, 'DAO narrative, genesis BCD claim, long-horizon build.'),
    ('faq', 'FAQ', '/faq', null, 'How tickets, payouts, and on-chain pieces work.'),
    ('profile', 'Profile & XP', '/profile', null, 'Quests, daily streak framing, badges.'),
    ('marketplace', 'Marketplace', '/marketplace', null, 'Listings & secondary liquidity stories.'),
    ('campaigns', 'Drops hub', '/campaigns', null, 'Active mints / ticket pools.'),
    ('elias_concierge', 'Elias concierge (full)', '/elias', null, 'Vienna itinerary planning + partner approvals — full workflow.'),
    ('capital', 'Building Culture Capital', null, 'https://buildingculture.capital/', 'Capital / fundraise-facing narrative.'),
    ('zero_x', '0x BuildingCulture', null, 'https://0x.buildingculture.capital/', 'Token / positioning layer.'),
    ('eco', 'Building Culture Eco hub', null, 'https://eco.buildingculture.capital/', 'Ecosystem + sustainability threads.'),
    ('production_app', 'Production app', null, 'https://app.buildingculture.capital/', 'Primary shipped app hostname.')
) as v(id, label, href, absolute_url, hint)
where not exists (select 1 from elias_touchpoints limit 1);

