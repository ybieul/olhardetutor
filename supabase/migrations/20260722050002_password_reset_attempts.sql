-- Tracks password-reset requests per email so
-- supabase/functions/request-password-reset/ can enforce a basic rate
-- limit (a fixed count within a rolling time window). Same rationale as
-- webhook_events: service_role only, RLS enabled with zero policies.

create table public.password_reset_attempts (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  requested_at timestamptz not null default now()
);

comment on table public.password_reset_attempts is
  'Rate-limit ledger for password reset requests. service_role only — no RLS policy grants access to authenticated/anon.';

alter table public.password_reset_attempts enable row level security;

create index password_reset_attempts_email_requested_at_idx on public.password_reset_attempts (email, requested_at);
