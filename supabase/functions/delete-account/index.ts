// Deletes the calling user's account and every row/file they own.
// Runs entirely server-side with the service_role key, which is injected
// automatically into every edge function's environment by Supabase — it
// is never present in any frontend build. See docs/SECURITY.md.
//
// Deploy with: supabase functions deploy delete-account
// Invoke from the client with: supabase.functions.invoke('delete-account')

import { createClient } from 'jsr:@supabase/supabase-js@2';

const PET_PHOTOS_BUCKET = 'pet-photos';

function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return jsonResponse({ error: 'Missing Authorization header' }, 401);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  // Scoped to the caller's own session — used only to find out who they
  // are. A user can only ever delete themselves; there is no "target
  // user id" parameter to spoof.
  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error: userError,
  } = await callerClient.auth.getUser();

  if (userError || !user) {
    return jsonResponse({ error: 'Invalid session' }, 401);
  }

  // Admin client — service_role, only ever used inside this function.
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  // Storage objects aren't covered by the FK cascade below, so they're
  // removed explicitly. Every object lives under `${user.id}/...` per
  // the storage policies in supabase/migrations/.
  const { data: files, error: listError } = await adminClient.storage.from(PET_PHOTOS_BUCKET).list(user.id);
  if (listError) {
    return jsonResponse({ error: `Failed to list storage objects: ${listError.message}` }, 500);
  }
  if (files && files.length > 0) {
    const paths = files.map((file) => `${user.id}/${file.name}`);
    const { error: removeError } = await adminClient.storage.from(PET_PHOTOS_BUCKET).remove(paths);
    if (removeError) {
      return jsonResponse({ error: `Failed to remove storage objects: ${removeError.message}` }, 500);
    }
  }

  // Deleting the auth user cascades to profiles/pets/checkins/
  // weight_history/health_events/alerts via ON DELETE CASCADE.
  const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);
  if (deleteError) {
    return jsonResponse({ error: `Failed to delete account: ${deleteError.message}` }, 500);
  }

  return jsonResponse({ success: true }, 200);
});
