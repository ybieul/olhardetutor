-- RLS isolation proof: user A must never be able to read, modify, or
-- delete user B's data, and no table must be reachable without
-- authentication. Run with:
--   supabase test db supabase/tests/rls_isolation.sql
--
-- This runs inside a transaction that's rolled back automatically by
-- `supabase test db`, so it never leaves fixture data behind.

begin;

create extension if not exists pgtap;

select plan(24);

-- ── Fixtures ─────────────────────────────────────────────────────────
-- Two users, one pet each, and one row in every pet-scoped table for
-- user A's pet. Inserted as the migration-owning role, before any RLS
-- context switch below.

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
)
values
  (
    '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'user-a@example.com', crypt('password', gen_salt('bf')),
    now(), '{}'::jsonb, '{}'::jsonb, now(), now()
  ),
  (
    '22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'user-b@example.com', crypt('password', gen_salt('bf')),
    now(), '{}'::jsonb, '{}'::jsonb, now(), now()
  );

-- profiles rows for both users are auto-created by on_auth_user_created.

insert into public.pets (id, user_id, name, species, life_stage)
values
  ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Rex', 'dog', 'adult'),
  ('bbbbbbbb-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'Mia', 'cat', 'adult');

insert into public.checkins (pet_id, date, feeding, water, sleep, activity, stool_status, urine_status, behavior)
values ('aaaaaaaa-0000-0000-0000-000000000001', current_date, 3, 3, 3, 3, 'normal', 'normal', 3);

insert into public.weight_history (pet_id, date, weight_kg)
values ('aaaaaaaa-0000-0000-0000-000000000001', current_date, 12.5);

insert into public.health_events (pet_id, type, date)
values ('aaaaaaaa-0000-0000-0000-000000000001', 'vaccine', current_date);

insert into public.alerts (pet_id, date, level, description)
values ('aaaaaaaa-0000-0000-0000-000000000001', current_date, 'observe', 'Routine test alert');

-- ── As user A ────────────────────────────────────────────────────────

select set_config('request.jwt.claims', json_build_object('sub', '11111111-1111-1111-1111-111111111111', 'role', 'authenticated')::text, true);
set local role authenticated;

select is(
  (select count(*) from public.pets)::int, 1,
  'user A sees exactly 1 pet (their own)'
);

select is(
  (select count(*) from public.pets where id = 'bbbbbbbb-0000-0000-0000-000000000001')::int, 0,
  'user A cannot see user B''s pet by id'
);

select is(
  (select count(*) from public.checkins)::int, 1,
  'user A sees exactly 1 checkin (their own pet''s)'
);

select is(
  (select count(*) from public.weight_history)::int, 1,
  'user A sees exactly 1 weight_history row'
);

select is(
  (select count(*) from public.health_events)::int, 1,
  'user A sees exactly 1 health_events row'
);

select is(
  (select count(*) from public.alerts)::int, 1,
  'user A sees exactly 1 alerts row'
);

select is(
  (select count(*) from public.profiles)::int, 1,
  'user A sees exactly 1 profile (their own)'
);

select is(
  (select id from public.profiles limit 1), '11111111-1111-1111-1111-111111111111'::uuid,
  'the one profile user A sees is their own'
);

-- UPDATE/DELETE against another user's row must silently affect 0 rows,
-- not error — RLS filters them out of the USING clause entirely.
with updated as (
  update public.pets set name = 'Hijacked' where id = 'bbbbbbbb-0000-0000-0000-000000000001'
  returning 1
)
select is((select count(*) from updated)::int, 0, 'user A cannot UPDATE user B''s pet');

with deleted as (
  delete from public.pets where id = 'bbbbbbbb-0000-0000-0000-000000000001'
  returning 1
)
select is((select count(*) from deleted)::int, 0, 'user A cannot DELETE user B''s pet');

-- INSERT that references another user's pet_id must be rejected outright
-- by the WITH CHECK clause (owns_pet fails), not just silently dropped.
select throws_ok(
  $$ insert into public.checkins (pet_id, date, feeding, water, sleep, activity, stool_status, urine_status, behavior)
     values ('bbbbbbbb-0000-0000-0000-000000000001', current_date, 3, 3, 3, 3, 'normal', 'normal', 3) $$,
  '42501',
  null,
  'user A cannot INSERT a checkin against user B''s pet_id'
);

-- Like the pets UPDATE above, this is filtered out by USING before it
-- ever reaches a row to modify — 0 rows affected, not an error.
with updated as (
  update public.profiles set display_name = 'Hijacked' where id = '22222222-2222-2222-2222-222222222222'
  returning 1
)
select is((select count(*) from updated)::int, 0, 'user A cannot UPDATE user B''s profile row');

-- A second checkin for the same pet on the same day must be rejected by
-- the unique(pet_id, date) constraint — not an RLS check, but part of the
-- same "migrations apply and behave correctly" guarantee.
select throws_ok(
  $$ insert into public.checkins (pet_id, date, feeding, water, sleep, activity, stool_status, urine_status, behavior)
     values ('aaaaaaaa-0000-0000-0000-000000000001', current_date, 4, 4, 4, 4, 'normal', 'normal', 4) $$,
  '23505',
  null,
  'a second checkin for the same pet on the same day is rejected'
);

-- ── As user B ────────────────────────────────────────────────────────

select set_config('request.jwt.claims', json_build_object('sub', '22222222-2222-2222-2222-222222222222', 'role', 'authenticated')::text, true);
set local role authenticated;

select is(
  (select count(*) from public.pets)::int, 1,
  'user B sees exactly 1 pet (their own)'
);

select is(
  (select name from public.pets limit 1), 'Mia',
  'user B''s visible pet is unmodified (user A''s update attempt did not go through)'
);

select is(
  (select count(*) from public.checkins)::int, 0,
  'user B sees 0 checkins (all check-ins belong to user A''s pet)'
);

select is(
  (select count(*) from public.weight_history)::int, 0,
  'user B sees 0 weight_history rows'
);

select is(
  (select count(*) from public.health_events)::int, 0,
  'user B sees 0 health_events rows'
);

select is(
  (select count(*) from public.alerts)::int, 0,
  'user B sees 0 alerts rows'
);

select is(
  (select display_name from public.profiles where id = '22222222-2222-2222-2222-222222222222'),
  null,
  'user B''s own profile was not modified by user A''s attempted update'
);

-- ── As an unauthenticated (anon) request ────────────────────────────
-- No policy is scoped `to anon` anywhere, and anon was never GRANTed
-- privileges on these tables either, so both SELECT and INSERT must be
-- rejected outright.

reset role;
select set_config('request.jwt.claims', '', true);
set local role anon;

select throws_ok(
  $$ select * from public.pets $$,
  '42501',
  null,
  'anonymous SELECT on pets is rejected (no grant, no policy)'
);

select throws_ok(
  $$ select * from public.profiles $$,
  '42501',
  null,
  'anonymous SELECT on profiles is rejected (no grant, no policy)'
);

select throws_ok(
  $$ insert into public.pets (user_id, name, species, life_stage)
     values ('11111111-1111-1111-1111-111111111111', 'Ghost', 'dog', 'adult') $$,
  '42501',
  null,
  'anonymous INSERT on pets is rejected (no grant, no policy)'
);

select throws_ok(
  $$ select * from public.checkins $$,
  '42501',
  null,
  'anonymous SELECT on checkins is rejected (no grant, no policy)'
);

select * from finish();

rollback;
