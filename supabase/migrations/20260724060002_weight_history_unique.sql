-- B-15: without this, registering weight twice for the same pet on the
-- same day silently created two rows instead of updating one, corrupting
-- "current weight" (picks the latest by insertion order, not truth) and
-- duplicating the point on the weight chart. addWeightEntry() now upserts
-- on this constraint — same pattern already used by checkins(pet_id, date).

alter table public.weight_history
  add constraint weight_history_pet_id_date_unique unique (pet_id, date);
