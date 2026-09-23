import { supabase } from '@/lib/supabase/client';
import { getCurrentUserId } from '@/lib/supabase/currentUser';
import type { Tables, TablesInsert } from '@/lib/supabase/types';

export type Pet = Tables<'pets'>;
export type UpsertPetInput = Omit<TablesInsert<'pets'>, 'user_id'> & { id?: string };

/** Every pet belonging to the signed-in user — RLS scopes this automatically. */
export async function getPets(): Promise<Pet[]> {
  const { data, error } = await supabase.from('pets').select('*').order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function getPet(petId: string): Promise<Pet | null> {
  const { data, error } = await supabase.from('pets').select('*').eq('id', petId).maybeSingle();
  if (error) throw error;
  return data;
}

/** Creates a pet when `id` is omitted, or updates it in place when present. */
export async function upsertPet(input: UpsertPetInput): Promise<Pet> {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('pets')
    .upsert({ ...input, user_id: userId })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function deletePet(petId: string): Promise<void> {
  const { error } = await supabase.from('pets').delete().eq('id', petId);
  if (error) throw error;
}

const PET_PHOTOS_BUCKET = 'pet-photos';
const MAX_PET_PHOTO_BYTES = 5 * 1024 * 1024;

/**
 * Uploads a pet photo under the signed-in user's own storage folder (the
 * bucket's RLS policies only allow reading/writing inside `<uid>/...` —
 * see supabase/migrations/20260722040008_storage_pet_photos.sql) and
 * returns the storage path to persist on `pets.photo_url`.
 *
 * Named "onboarding-*" because it's uploaded before the pet row exists
 * (so there's no pet id yet to key it by); the path is stable once
 * attached to the pet and never needs to move. Pass `previousPath` when
 * replacing an existing photo so the old file doesn't linger as an orphan.
 *
 * Throws a plain Error on an invalid file — the caller already maps any
 * failure here to a generic, i18n-driven message (never this message
 * itself, per CLAUDE.md).
 */
export async function uploadPetPhoto(file: File, previousPath?: string | null): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Invalid file type: expected an image');
  }
  if (file.size > MAX_PET_PHOTO_BYTES) {
    throw new Error('File too large: max 5MB');
  }

  const userId = await getCurrentUserId();
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${userId}/onboarding-${Date.now()}.${extension}`;

  const { error } = await supabase.storage.from(PET_PHOTOS_BUCKET).upload(path, file, { upsert: true });
  if (error) throw error;

  if (previousPath && previousPath !== path) {
    try {
      await supabase.storage.from(PET_PHOTOS_BUCKET).remove([previousPath]);
    } catch {
      // Best-effort cleanup — a stray orphan file isn't worth failing the upload over.
    }
  }

  return path;
}

/** Resolves a temporary, signed URL for a private pet-photos storage path. */
export async function getPetPhotoUrl(path: string, expiresInSeconds = 3600): Promise<string> {
  const { data, error } = await supabase.storage.from(PET_PHOTOS_BUCKET).createSignedUrl(path, expiresInSeconds);
  if (error) throw error;
  return data.signedUrl;
}
