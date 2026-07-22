-- pets: one row per pet, owned by exactly one user. The root of ownership
-- for every other pet-scoped table that follows.

create type public.pet_species as enum ('dog', 'cat');
create type public.pet_life_stage as enum ('puppy', 'adult', 'senior');

create table public.pets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  species public.pet_species not null,
  life_stage public.pet_life_stage not null,
  breed text,
  birth_date date,
  initial_weight numeric(5, 2) check (initial_weight > 0),
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.pets is 'Pets registered by a tutor — the root of ownership for all other pet data.';

create index pets_user_id_idx on public.pets (user_id);

alter table public.pets enable row level security;

create policy "pets_select_own"
  on public.pets for select
  to authenticated
  using (user_id = auth.uid());

create policy "pets_insert_own"
  on public.pets for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "pets_update_own"
  on public.pets for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "pets_delete_own"
  on public.pets for delete
  to authenticated
  using (user_id = auth.uid());

grant select, insert, update, delete on public.pets to authenticated;

create trigger set_updated_at
  before update on public.pets
  for each row
  execute function public.set_updated_at();

-- Shared ownership check reused by every table below that references
-- pet_id instead of holding user_id directly. Left as `security invoker`
-- (the default): pets' own RLS already scopes the underlying lookup, so
-- this is defense-in-depth rather than a bypass.
create or replace function public.owns_pet(p_pet_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.pets
    where pets.id = p_pet_id
      and pets.user_id = auth.uid()
  );
$$;

comment on function public.owns_pet(uuid) is
  'True if the currently authenticated user owns the given pet. Used by RLS policies on pet-scoped tables.';

grant execute on function public.owns_pet(uuid) to authenticated;
