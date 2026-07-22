-- Extensions and shared helper functions used by every table migration
-- that follows. Nothing here creates application tables.

create extension if not exists pgcrypto;

-- Keeps `updated_at` current on every UPDATE. Attached per-table below.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'Trigger function: sets updated_at = now() on every row update.';
