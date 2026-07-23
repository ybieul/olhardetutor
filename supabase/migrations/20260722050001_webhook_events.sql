-- Idempotency ledger for inbound webhooks (Kirvano purchases, and any
-- future provider). A unique constraint on (source, external_id) is what
-- guarantees "reprocessar o mesmo evento não duplica conta" holds even
-- under concurrent retries — see supabase/functions/kirvano-webhook/.
--
-- This table has no legitimate `authenticated`/`anon` use case: it's only
-- ever written by edge functions running with the service_role key, which
-- always bypasses RLS. RLS is still enabled (per CLAUDE.md, every table
-- gets it) with zero policies attached — that's a deliberate default-deny,
-- not an oversight.

create table public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  external_id text not null,
  event_type text not null,
  payload jsonb not null,
  processed_at timestamptz not null default now(),
  unique (source, external_id)
);

comment on table public.webhook_events is
  'Idempotency ledger for inbound webhooks. service_role only — no RLS policy grants access to authenticated/anon.';

alter table public.webhook_events enable row level security;

create index webhook_events_source_external_id_idx on public.webhook_events (source, external_id);
