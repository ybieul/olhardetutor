import { supabase } from '@/lib/supabase/client';

export async function signInWithPassword(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Routes through the request-password-reset edge function instead of
 * `supabase.auth.resetPasswordForEmail` directly, so the email is sent
 * via our own localized templates and is rate-limited — see
 * supabase/functions/request-password-reset/.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  const { error } = await supabase.functions.invoke('request-password-reset', {
    body: { email },
  });
  if (error) throw error;
}

/** Requires an active recovery session (established by following the emailed link). */
export async function updatePassword(password: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}
