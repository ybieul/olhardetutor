-- weight_history: weight readings over time for a pet.

create table public.weight_history (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets (id) on delete cascade,
  date date not null,
  weight_kg numeric(5, 2) not null check (weight_kg > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.weight_history is 'Weight readings over time for a pet.';

create index weight_history_pet_id_idx on public.weight_history (pet_id);

alter table public.weight_history enable row level security;

create policy "weight_history_select_own"
  on public.weight_history for select
  to authenticated
  using (public.owns_pet(pet_id));

create policy "weight_history_insert_own"
  on public.weight_history for insert
  to authenticated
  with check (public.owns_pet(pet_id));

create policy "weight_history_update_own"
  on public.weight_history for update
  to authenticated
  using (public.owns_pet(pet_id))
  with check (public.owns_pet(pet_id));

create policy "weight_history_delete_own"
  on public.weight_history for delete
  to authenticated
  using (public.owns_pet(pet_id));

grant select, insert, update, delete on public.weight_history to authenticated;

create trigger set_updated_at
  before update on public.weight_history
  for each row
  execute function public.set_updated_at();
