-- profiles: one row per authenticated user, keyed 1:1 to auth.users.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  locale text not null default 'pt-BR' check (locale in ('pt-BR', 'en')),
  country text,
  display_name text,
  onboarding_completed boolean not null default false,
  tour_completed jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'One row per authenticated user — app-level profile data.';

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles_delete_own"
  on public.profiles for delete
  to authenticated
  using (id = auth.uid());

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;

create trigger set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

-- Auto-provision a profile row whenever a new user signs up, so the app
-- never has to special-case "no profile yet" right after auth.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

comment on function public.handle_new_user() is
  'Trigger function: creates a public.profiles row for every new auth.users row. security definer is required to write into public.profiles from the auth schema trigger context; search_path is pinned to prevent hijacking.';

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
