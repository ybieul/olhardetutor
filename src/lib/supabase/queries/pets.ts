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
