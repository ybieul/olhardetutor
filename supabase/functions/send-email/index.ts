// Standalone, directly-invokable localized-email endpoint. kirvano-webhook
// and request-password-reset import the same rendering/provider logic
// from ../_shared/email/ directly (no extra network hop needed since
// they already run with service_role trust) — this HTTP endpoint exists
// for anything that wants to trigger an email out-of-process, e.g. a
// future cron-driven reminder.
//
// Deploy with: supabase functions deploy send-email
// Gated by the service_role key — never callable with a normal user session.

import { renderEmail, type EmailLocale, type EmailType } from '../_shared/email/renderTemplate.ts';
import { getEmailProvider } from '../_shared/email/provider.ts';

const ALLOWED_LOCALES: EmailLocale[] = ['pt-BR', 'en'];
const ALLOWED_TYPES: EmailType[] = ['welcome', 'passwordReset'];

function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

type SendEmailPayload = {
  to?: string;
  locale?: string;
  type?: string;
  variables?: Record<string, string>;
};

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const authHeader = req.headers.get('Authorization') ?? '';
  if (authHeader !== `Bearer ${serviceRoleKey}`) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  let payload: SendEmailPayload;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const { to, locale, type, variables } = payload;
  if (
    !to ||
    !locale ||
    !type ||
    !ALLOWED_LOCALES.includes(locale as EmailLocale) ||
    !ALLOWED_TYPES.includes(type as EmailType)
  ) {
    return jsonResponse({ error: 'Missing or invalid to/locale/type' }, 400);
  }

  const { subject, html, text } = renderEmail(locale as EmailLocale, type as EmailType, variables ?? {});

  try {
    await getEmailProvider().send({ to, subject, html, text });
  } catch (err) {
    return jsonResponse({ error: `Failed to send email: ${err instanceof Error ? err.message : String(err)}` }, 502);
  }

  return jsonResponse({ success: true }, 200);
});
