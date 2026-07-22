-- checkins: one daily wellness check-in per pet per day.

create type public.stool_status as enum (
  'normal',
  'soft',
  'hard',
  'diarrhea',
  'blood_or_mucus',
  'not_observed'
);

create type public.urine_status as enum (
  'normal',
  'increased_frequency',
  'decreased_frequency',
  'blood_present',
  'straining',
  'not_observed'
);

create table public.checkins (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets (id) on delete cascade,
  date date not null,
  feeding smallint not null check (feeding between 1 and 5),
  water smallint not null check (water between 1 and 5),
  sleep smallint not null check (sleep between 1 and 5),
  activity smallint not null check (activity between 1 and 5),
  stool_status public.stool_status not null,
  stool_details jsonb not null default '{}'::jsonb,
  urine_status public.urine_status not null,
  urine_details jsonb not null default '{}'::jsonb,
  behavior smallint not null check (behavior between 1 and 5),
  free_note text,
  day_score smallint check (day_score between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (pet_id, date)
);

comment on table public.checkins is 'Daily wellness check-in for a pet — at most one per pet per day.';

create index checkins_pet_id_idx on public.checkins (pet_id);

alter table public.checkins enable row level security;

create policy "checkins_select_own"
  on public.checkins for select
  to authenticated
  using (public.owns_pet(pet_id));

create policy "checkins_insert_own"
  on public.checkins for insert
  to authenticated
  with check (public.owns_pet(pet_id));

create policy "checkins_update_own"
  on public.checkins for update
  to authenticated
  using (public.owns_pet(pet_id))
  with check (public.owns_pet(pet_id));

create policy "checkins_delete_own"
  on public.checkins for delete
  to authenticated
  using (public.owns_pet(pet_id));

grant select, insert, update, delete on public.checkins to authenticated;

create trigger set_updated_at
  before update on public.checkins
  for each row
  execute function public.set_updated_at();
