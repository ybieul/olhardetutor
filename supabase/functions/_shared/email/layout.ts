// Shared branded HTML shell for every transactional email. Content
// (heading/body/cta/footer) is already-localized plain text coming from
// templates/<locale>/*.json — this file only owns markup and styling.
//
// Colors intentionally mirror src/config/theme/colors.ts (primary
// #F4900C, dark #1A1A2E, background #FDF6EC) for brand consistency, but
// are duplicated here as literal values on purpose: this Deno runtime
// can't import the Vite/React app's TypeScript config.

const COLORS = {
  primary: '#F4900C',
  dark: '#1A1A2E',
  background: '#FDF6EC',
  white: '#FFFFFF',
  bodyText: '#47475C',
  mutedText: '#82829A',
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

type RenderLayoutInput = {
  brandName: string;
  heading: string;
  body: string;
  ctaLabel: string;
  ctaUrl?: string;
  footer: string;
};

export function renderEmailLayout({ brandName, heading, body, ctaLabel, ctaUrl, footer }: RenderLayoutInput): string {
  const button = ctaUrl
    ? `
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top: 8px;">
                <tr>
                  <td style="border-radius: 8px; background-color: ${COLORS.primary};">
                    <a href="${escapeHtml(ctaUrl)}" style="display: inline-block; padding: 12px 24px; color: ${COLORS.white}; font-size: 16px; font-weight: bold; text-decoration: none;">
                      ${escapeHtml(ctaLabel)}
                    </a>
                  </td>
                </tr>
              </table>`
    : '';

  return `<!doctype html>
<html>
  <body style="margin: 0; padding: 0; background-color: ${COLORS.background}; font-family: Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${COLORS.background}; padding: 32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color: ${COLORS.white}; border-radius: 12px; overflow: hidden;">
            <tr>
              <td style="background-color: ${COLORS.dark}; padding: 24px; text-align: center;">
                <span style="color: ${COLORS.background}; font-size: 20px; font-weight: bold;">${escapeHtml(brandName)}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 32px;">
                <h1 style="margin: 0 0 16px; color: ${COLORS.dark}; font-size: 22px;">${escapeHtml(heading)}</h1>
                <p style="margin: 0 0 24px; color: ${COLORS.bodyText}; font-size: 16px; line-height: 1.5;">${escapeHtml(body)}</p>
                ${button}
                <p style="margin: 24px 0 0; color: ${COLORS.mutedText}; font-size: 13px; line-height: 1.5;">${escapeHtml(footer)}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export { escapeHtml };
