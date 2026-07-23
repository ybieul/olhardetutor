// Handles "esqueci minha senha" from the client. Routed through here
// instead of calling supabase.auth.resetPasswordForEmail() directly so
// the email is sent via our own localized templates (matching the
// buyer's profile locale) and is rate-limited. Runs with service_role —
// never exposed to the frontend.
//
// Deploy with: supabase functions deploy request-password-reset --no-verify-jwt
// (anyone can be signed out when they need this, so it can't require a
// session; the rate limit below is what keeps it from being abused.)

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { renderEmail, type EmailLocale } from '../_shared/email/renderTemplate.ts';
import { getEmailProvider } from '../_shared/email/provider.ts';

const RATE_LIMIT_WINDOW_MINUTES = 15;
const RATE_LIMIT_MAX_ATTEMPTS = 3;

function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

type RequestPasswordResetPayload = {
  email?: string;
};

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  let payload: RequestPasswordResetPayload;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const email = payload.email?.trim().toLowerCase();
  if (!email) {
    return jsonResponse({ error: 'Missing email' }, 400);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60_000).toISOString();
  const { count, error: countError } = await adminClient
    .from('password_reset_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('email', email)
    .gte('requested_at', windowStart);

  if (countError) {
    return jsonResponse({ error: `Rate limit check failed: ${countError.message}` }, 500);
  }

  // Recorded unconditionally — even a request that turns out to be
  // rate-limited or for a non-existent account is exactly the signal the
  // limit exists to count.
  await adminClient.from('password_reset_attempts').insert({ email });

  if ((count ?? 0) >= RATE_LIMIT_MAX_ATTEMPTS) {
    return jsonResponse({ error: 'Too many requests. Please try again later.' }, 429);
  }

  // Resolve the user + their locale without ever revealing whether the
  // account exists — the response is identical either way.
  const redirectTo = `${Deno.env.get('APP_URL') ?? ''}/reset-password`;
  const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: { redirectTo },
  });

  if (!linkError && linkData.user) {
    const { data: profile } = await adminClient
      .from('profiles')
      .select('locale, display_name')
      .eq('id', linkData.user.id)
      .maybeSingle();

    const locale: EmailLocale = profile?.locale === 'en' ? 'en' : 'pt-BR';

    const { subject, html, text } = renderEmail(locale, 'passwordReset', {
      name: profile?.display_name ?? email,
      ctaUrl: linkData.properties.action_link,
    });

    try {
      await getEmailProvider().send({ to: email, subject, html, text });
    } catch (err) {
      console.error('Failed to send password reset email:', err);
    }
  }
  // If linkError (no such account), deliberately do nothing further —
  // still falls through to the same success response below.

  return jsonResponse({ success: true }, 200);
});
