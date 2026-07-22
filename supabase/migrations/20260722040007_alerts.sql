-- alerts: system-raised health alerts for a pet, derived from check-ins.

create type public.alert_level as enum ('observe', 'attention', 'urgent');

create table public.alerts (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets (id) on delete cascade,
  date date not null,
  level public.alert_level not null,
  description text not null,
  resolved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.alerts is 'System-raised health alerts for a pet, derived from check-ins.';

create index alerts_pet_id_idx on public.alerts (pet_id);

alter table public.alerts enable row level security;

create policy "alerts_select_own"
  on public.alerts for select
  to authenticated
  using (public.owns_pet(pet_id));

create policy "alerts_insert_own"
  on public.alerts for insert
  to authenticated
  with check (public.owns_pet(pet_id));

create policy "alerts_update_own"
  on public.alerts for update
  to authenticated
  using (public.owns_pet(pet_id))
  with check (public.owns_pet(pet_id));

create policy "alerts_delete_own"
  on public.alerts for delete
  to authenticated
  using (public.owns_pet(pet_id));

grant select, insert, update, delete on public.alerts to authenticated;

create trigger set_updated_at
  before update on public.alerts
  for each row
  execute function public.set_updated_at();
