-- Private storage bucket for pet photos. Every object must live under a
-- folder named after its owner's auth.uid(), e.g. `<uid>/<pet_id>.jpg` —
-- the policies below enforce that no user can read or write into another
-- user's folder. storage.objects already has RLS enabled by Supabase, so
-- we only need to add policies, not enable it ourselves.

insert into storage.buckets (id, name, public)
values ('pet-photos', 'pet-photos', false)
on conflict (id) do nothing;

create policy "pet_photos_select_own"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'pet-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "pet_photos_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'pet-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "pet_photos_update_own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'pet-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'pet-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "pet_photos_delete_own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'pet-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
