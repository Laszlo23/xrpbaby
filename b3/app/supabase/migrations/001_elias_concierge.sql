-- Elias Concierge — apply in Supabase SQL editor or supabase db push.
-- Orb / ecosystem mode also needs `002_elias_thread_kind_prefs.sql` (`thread_kind` + prefs schema_version).
-- Requires pgcrypto for gen_random_uuid.

create extension if not exists "pgcrypto";

-- Anonymous guest identifier from BUILDCHAIN client (stored in localStorage).
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

-- Row Level Security: enable for defense-in-depth when using anon/authenticated clients.
-- Server-side flows use the **service role** key which bypasses RLS.

alter table elias_guest_sessions enable row level security;
alter table elias_threads enable row level security;
alter table elias_messages enable row level security;
alter table elias_preference_profiles enable row level security;
alter table elias_plans enable row level security;
alter table elias_partner_offers enable row level security;
alter table elias_approval_requests enable row level security;
alter table elias_outbound_jobs enable row level security;

-- No policies by default — only service role (BUILDCHAIN server) accesses these tables in MVP.
-- When enabling Supabase Auth for guests, add policies mapping rows to auth.uid().

-- Seed demo partner offers (idempotent-ish: skip if rows exist)
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
