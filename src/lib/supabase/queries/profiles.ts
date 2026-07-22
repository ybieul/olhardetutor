import { supabase } from '@/lib/supabase/client';
import { getCurrentUserId } from '@/lib/supabase/currentUser';
import type { Tables, TablesUpdate } from '@/lib/supabase/types';

export type Profile = Tables<'profiles'>;
export type UpdateProfileInput = Omit<TablesUpdate<'profiles'>, 'id'>;

/** The signed-in user's own profile — RLS guarantees at most one visible row. */
export async function getProfile(): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateProfile(input: UpdateProfileInput): Promise<Profile> {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase.from('profiles').update(input).eq('id', userId).select('*').single();
  if (error) throw error;
  return data;
}
