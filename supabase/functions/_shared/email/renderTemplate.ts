import ptBRWelcome from './templates/pt-BR/welcome.json' with { type: 'json' };
import ptBRPasswordReset from './templates/pt-BR/passwordReset.json' with { type: 'json' };
import enWelcome from './templates/en/welcome.json' with { type: 'json' };
import enPasswordReset from './templates/en/passwordReset.json' with { type: 'json' };

import { renderEmailLayout } from './layout.ts';

export type EmailLocale = 'pt-BR' | 'en';
export type EmailType = 'welcome' | 'passwordReset';

type TemplateContent = {
  subject: string;
  heading: string;
  body: string;
  cta: string;
  footer: string;
};

const TEMPLATES: Record<EmailLocale, Record<EmailType, TemplateContent>> = {
  'pt-BR': { welcome: ptBRWelcome, passwordReset: ptBRPasswordReset },
  en: { welcome: enWelcome, passwordReset: enPasswordReset },
};

const BRAND_NAME = 'Olhar de Tutor';

function interpolate(template: string, variables: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => variables[key] ?? '');
}

export type RenderedEmail = {
  subject: string;
  html: string;
  text: string;
};

/**
 * Renders a localized, ready-to-send email: subject/heading/body/footer
 * come from templates/<locale>/<type>.json (interpolating `variables`),
 * wrapped in the shared branded HTML shell from layout.ts.
 */
export function renderEmail(locale: EmailLocale, type: EmailType, variables: Record<string, string>): RenderedEmail {
  const content = TEMPLATES[locale][type];

  const subject = interpolate(content.subject, variables);
  const heading = interpolate(content.heading, variables);
  const body = interpolate(content.body, variables);
  const ctaLabel = interpolate(content.cta, variables);
  const footer = interpolate(content.footer, variables);
  const ctaUrl = variables.ctaUrl;

  const html = renderEmailLayout({ brandName: BRAND_NAME, heading, body, ctaLabel, ctaUrl, footer });
  const text = [heading, body, ctaUrl ? `${ctaLabel}: ${ctaUrl}` : null, footer].filter(Boolean).join('\n\n');

  return { subject, html, text };
}
