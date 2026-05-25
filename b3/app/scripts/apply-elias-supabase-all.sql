-- =============================================================================
-- Elias (Concierge + Orb) — one-shot apply in Supabase SQL Editor
-- Supabase Dashboard → SQL → New query → paste → Run
-- Safe on fresh DB; re-running skips existing tables; ALTER is IF NOT EXISTS style.
-- =============================================================================

create extension if not exists "pgcrypto";

create table if not exists elias_guest_sessions (
  id uuid primary key default gen_random_uuid(),
  external_session_key text not null unique,
  wallet_address text,
  created_at timestamptz not null default now()
);

create table if not exists elias_threads (
  id uuid primary key default gen_random_uuid(),
  guest_session_id uuid not null references elias_guest_sessions (id) on delete cascade,
  graph_state text not null default 'collect_prefs'
    check (graph_state in (
      'collect_prefs',
      'draft_plan',
      'await_user_approval',
      'compose_partner_emails',
      'completed'
    )),
  updated_at timestamptz not null default now()
);

create table if not exists elias_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references elias_threads (id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists elias_messages_thread_id_created_at on elias_messages (thread_id, created_at);

create table if not exists elias_preference_profiles (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references elias_threads (id) on delete cascade,
  prefs jsonb not null default '{}',
  updated_at timestamptz not null default now(),
  unique (thread_id)
);

create table if not exists elias_plans (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references elias_threads (id) on delete cascade,
  version int not null default 1,
  itinerary jsonb not null default '{}',
  status text not null default 'draft'
    check (status in ('draft', 'pending_approval', 'approved', 'partner_outreach', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists elias_plans_thread_id on elias_plans (thread_id);

create table if not exists elias_partner_offers (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  title text not null,
  body text,
  partner_email text,
  metadata jsonb default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists elias_approval_requests (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references elias_plans (id) on delete cascade,
  snapshot jsonb not null,
  decision text check (decision is null or decision in ('approved', 'rejected')),
  decided_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists elias_outbound_jobs (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references elias_plans (id) on delete cascade,
  to_email text not null,
  subject text not null,
  body_text text not null,
  status text not null default 'queued'
    check (status in ('queued', 'sent', 'failed', 'cancelled')),
  idempotency_key text not null unique,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create index if not exists elias_outbound_jobs_plan_id on elias_outbound_jobs (plan_id);
create index if not exists elias_outbound_jobs_status on elias_outbound_jobs (status);

alter table elias_guest_sessions enable row level security;
alter table elias_threads enable row level security;
alter table elias_messages enable row level security;
alter table elias_preference_profiles enable row level security;
alter table elias_plans enable row level security;
alter table elias_partner_offers enable row level security;
alter table elias_approval_requests enable row level security;
alter table elias_outbound_jobs enable row level security;

insert into elias_partner_offers (category, title, body, partner_email, metadata)
select v.category, v.title, v.body, v.partner_email, v.metadata::jsonb
from (
  values
    ('restaurant', 'Private cellar dinner — Vienna old town', 'Seasonal tasting menu, wine pairing, 8pm seating.', 'partner-dining@example.com', '{"vibe":"romantic","priceBand":"€€€"}'),
    ('gallery', 'After-hours contemporary tour', 'Curator-led private viewing, 90 minutes.', 'art@example.com', '{"vibe":"art_collector","priceBand":"€€"}'),
    ('wellness', 'Thermal day pass + massage', 'Historic spa circuit + 50min massage.', 'spa@example.com', '{"vibe":"wellness","priceBand":"€€"}'),
    ('experience', 'Secret night route', 'Hidden bars + live music — discreet itinerary.', 'night@example.com', '{"vibe":"night","priceBand":"€€€"}')
) as v(category, title, body, partner_email, metadata)
where not exists (select 1 from elias_partner_offers limit 1);

-- ---- Orb / ecosystem_guide threads (migration 002) ----

alter table elias_threads add column if not exists thread_kind text not null default 'concierge';

alter table elias_preference_profiles add column if not exists schema_version smallint not null default 1;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'elias_threads_thread_kind_chk'
  ) then
    alter table elias_threads
      add constraint elias_threads_thread_kind_chk
      check (thread_kind in ('concierge', 'ecosystem_guide'));
  end if;
end $$;

-- ---- Corpus + touchpoints indexing (migration 003) ----

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

alter table elias_corpus_chunks enable row level security;
alter table elias_touchpoints enable row level security;

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
