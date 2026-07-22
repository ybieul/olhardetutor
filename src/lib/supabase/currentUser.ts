import { supabase } from '@/lib/supabase/client';

/** Resolves the signed-in user's id, or throws if there isn't one. */
export async function getCurrentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error('No authenticated user');
  return data.user.id;
}
