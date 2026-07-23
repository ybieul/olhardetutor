// Handles Kirvano's SALE_APPROVED webhook: creates the buyer's account,
// stores their locale/country on profiles, and sends a localized welcome
// email with a link to set their password. Runs with service_role —
// never exposed to the frontend.
//
// Deploy with: supabase functions deploy kirvano-webhook --no-verify-jwt
// (--no-verify-jwt because Kirvano calls this anonymously; authenticity
// is instead checked against KIRVANO_WEBHOOK_SECRET below.)
//
// Kirvano's own payload schema isn't fully published — this is built from
// their public help-center docs (event/customer/sale_id shape) plus
// defensive handling for fields that may or may not be present
// (customer.country, a checkout-level locale). See docs/SECURITY.md for
// the exact assumptions and how to adjust them once a real payload is in
// hand.

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { renderEmail } from '../_shared/email/renderTemplate.ts';
import { getEmailProvider } from '../_shared/email/provider.ts';
import {
  generateTemporaryPassword,
  inferLocaleAndCountry,
  isEmailAlreadyRegistered,
  type KirvanoPayload,
} from './logic.ts';

function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  let payload: KirvanoPayload;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  // Kirvano's docs describe an optional "Token" configured per-webhook
  // and sent back with each call for authentication; the exact transport
  // (body field vs header) isn't specified, so both are accepted.
  const expectedSecret = Deno.env.get('KIRVANO_WEBHOOK_SECRET');
  const providedSecret =
    payload.token ?? req.headers.get('X-Kirvano-Token') ?? req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');

  if (!expectedSecret) {
    return jsonResponse({ error: 'Webhook is not configured (missing KIRVANO_WEBHOOK_SECRET)' }, 500);
  }
  if (!providedSecret || providedSecret !== expectedSecret) {
    return jsonResponse({ error: 'Invalid webhook token' }, 401);
  }

  if (payload.event !== 'SALE_APPROVED') {
    // Acknowledge every other event type so Kirvano stops retrying it —
    // we simply don't act on anything but approved sales.
    return jsonResponse({ received: true, ignored: payload.event ?? 'unknown' }, 200);
  }

  const email = payload.customer?.email?.trim().toLowerCase();
  const name = payload.customer?.name?.trim();
  const externalId = payload.sale_id ?? payload.checkout_id;

  if (!email || !externalId) {
    return jsonResponse({ error: 'Missing customer.email or sale_id/checkout_id' }, 400);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  // Fast path: this exact sale was already processed to completion. We
  // check (rather than rely solely on the insert-time unique constraint
  // below) so a *failed* attempt can still be retried — see the insert
  // comment further down for why it's recorded only on success.
  const { data: existingEvent } = await adminClient
    .from('webhook_events')
    .select('id')
    .eq('source', 'kirvano')
    .eq('external_id', externalId)
    .maybeSingle();

  if (existingEvent) {
    return jsonResponse({ received: true, duplicate: true }, 200);
  }

  const { locale, country } = inferLocaleAndCountry(payload, {
    defaultLocale: Deno.env.get('KIRVANO_DEFAULT_LOCALE'),
    defaultCountry: Deno.env.get('KIRVANO_DEFAULT_COUNTRY'),
  });

  const { data: createdUser, error: createUserError } = await adminClient.auth.admin.createUser({
    email,
    password: generateTemporaryPassword(),
    email_confirm: true,
    user_metadata: name ? { full_name: name } : undefined,
  });

  let userId: string | undefined = createdUser?.user?.id;
  let isNewUser = true;

  if (createUserError) {
    if (isEmailAlreadyRegistered(createUserError)) {
      // Returning customer (e.g. bought a second product) — resolve their
      // existing id via generateLink instead of paginating listUsers().
      isNewUser = false;
      const { data: linkData, error: lookupError } = await adminClient.auth.admin.generateLink({
        type: 'recovery',
        email,
      });
      if (lookupError || !linkData.user) {
        return jsonResponse({ error: `Failed to resolve existing user: ${lookupError?.message ?? 'not found'}` }, 500);
      }
      userId = linkData.user.id;
    } else {
      return jsonResponse({ error: `Failed to create user: ${createUserError.message}` }, 500);
    }
  }

  const { error: profileError } = await adminClient
    .from('profiles')
    .upsert({ id: userId!, locale, country, display_name: name ?? null }, { onConflict: 'id' });

  if (profileError) {
    return jsonResponse({ error: `Failed to upsert profile: ${profileError.message}` }, 500);
  }

  let emailSent = false;
  if (isNewUser) {
    const redirectTo = `${Deno.env.get('APP_URL') ?? ''}/reset-password`;
    const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: { redirectTo },
    });

    if (linkError) {
      return jsonResponse({ error: `Account created but failed to generate welcome link: ${linkError.message}` }, 500);
    }

    const { subject, html, text } = renderEmail(locale, 'welcome', {
      name: name ?? email,
      ctaUrl: linkData.properties.action_link,
    });

    try {
      await getEmailProvider().send({ to: email, subject, html, text });
      emailSent = true;
    } catch (err) {
      // Account + profile already exist — a failed email shouldn't roll
      // that back. Surface it in the response instead of throwing so the
      // event still gets recorded as processed (see below) rather than
      // being retried into a duplicate-account attempt.
      console.error('Failed to send welcome email:', err);
    }
  }

  // Recorded only once everything above has succeeded, so a genuinely
  // failed attempt (e.g. createUser or profile upsert erroring) can still
  // be retried by Kirvano instead of being permanently marked "done".
  const { error: recordEventError } = await adminClient
    .from('webhook_events')
    .insert({ source: 'kirvano', external_id: externalId, event_type: payload.event, payload });

  if (recordEventError && recordEventError.code !== '23505') {
    console.error('Failed to record webhook_events row (processing already succeeded):', recordEventError.message);
  }

  return jsonResponse({ success: true, userId, isNewUser, locale, country, emailSent }, 200);
});
