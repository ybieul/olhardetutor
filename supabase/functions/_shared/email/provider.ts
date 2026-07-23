// Pluggable email delivery. Selected at runtime via the EMAIL_PROVIDER
// env var so a real provider can be plugged in later without touching
// any calling code — see docs/SECURITY.md.

export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export type EmailProvider = {
  send: (message: EmailMessage) => Promise<void>;
};

function createResendProvider(apiKey: string, fromAddress: string): EmailProvider {
  return {
    async send(message) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: message.to,
          subject: message.subject,
          html: message.html,
          text: message.text,
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Resend request failed (${response.status}): ${body}`);
      }
    },
  };
}

/**
 * Default when EMAIL_PROVIDER isn't set — never throws, never actually
 * sends. Lets the rest of the system (webhook, password reset) be
 * exercised end-to-end before a real provider key exists.
 */
function createLogProvider(): EmailProvider {
  return {
    send(message) {
      console.log(
        `[email:log-provider] to=${message.to} subject="${message.subject}" (no EMAIL_PROVIDER configured — not actually sent)`,
      );
      return Promise.resolve();
    },
  };
}

export function getEmailProvider(): EmailProvider {
  const providerName = Deno.env.get('EMAIL_PROVIDER') ?? 'log';

  if (providerName === 'resend') {
    const apiKey = Deno.env.get('RESEND_API_KEY');
    const fromAddress = Deno.env.get('EMAIL_FROM_ADDRESS');
    if (!apiKey || !fromAddress) {
      throw new Error('EMAIL_PROVIDER=resend requires RESEND_API_KEY and EMAIL_FROM_ADDRESS to be set');
    }
    return createResendProvider(apiKey, fromAddress);
  }

  // Supabase's built-in SMTP could be wired here as another branch
  // (providerName === 'supabase-smtp') using Deno's SMTP client against
  // the same connection details configured in the Supabase dashboard —
  // left out for now since Resend covers the "plug a key in later" ask
  // with zero extra dependencies.
  return createLogProvider();
}
