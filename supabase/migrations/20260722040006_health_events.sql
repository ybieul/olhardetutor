-- health_events: vaccines, deworming, flea treatment, consultations and
-- medication tracked for a pet.

create type public.health_event_type as enum (
  'vaccine',
  'deworming',
  'flea',
  'consultation',
  'medication'
);

create table public.health_events (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets (id) on delete cascade,
  type public.health_event_type not null,
  date date not null,
  description text,
  next_date date,
  reminder_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.health_events is 'Vaccines, deworming, flea treatment, consultations and medication for a pet.';

create index health_events_pet_id_idx on public.health_events (pet_id);

alter table public.health_events enable row level security;

create policy "health_events_select_own"
  on public.health_events for select
  to authenticated
  using (public.owns_pet(pet_id));

create policy "health_events_insert_own"
  on public.health_events for insert
  to authenticated
  with check (public.owns_pet(pet_id));

create policy "health_events_update_own"
  on public.health_events for update
  to authenticated
  using (public.owns_pet(pet_id))
  with check (public.owns_pet(pet_id));

create policy "health_events_delete_own"
  on public.health_events for delete
  to authenticated
  using (public.owns_pet(pet_id));

grant select, insert, update, delete on public.health_events to authenticated;

create trigger set_updated_at
  before update on public.health_events
  for each row
  execute function public.set_updated_at();
