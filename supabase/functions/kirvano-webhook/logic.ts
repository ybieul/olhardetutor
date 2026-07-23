// Pure, dependency-free logic extracted out of index.ts so it can be
// exercised directly with `deno test` — no network/DB access needed.

export type KirvanoCustomer = {
  name?: string;
  email?: string;
  phone_number?: string;
  document?: string;
  /** Not documented by Kirvano as of writing; read defensively in case it's ever populated. */
  country?: string;
};

export type KirvanoPayload = {
  event?: string;
  sale_id?: string;
  checkout_id?: string;
  token?: string;
  customer?: KirvanoCustomer;
};

export type LocaleAndCountry = { locale: 'pt-BR' | 'en'; country: string };

/**
 * Kirvano's payload doesn't reliably carry country/locale, so this is a
 * documented fallback chain: explicit field (if ever present) → E.164
 * phone country code → email TLD → configurable default.
 */
export function inferLocaleAndCountry(
  payload: KirvanoPayload,
  env: { defaultLocale?: string; defaultCountry?: string } = {},
): LocaleAndCountry {
  const defaultLocale: 'pt-BR' | 'en' = env.defaultLocale === 'en' ? 'en' : 'pt-BR';
  const defaultCountry = env.defaultCountry ?? (defaultLocale === 'pt-BR' ? 'BR' : 'US');

  const explicitCountry = payload.customer?.country?.trim();
  if (explicitCountry) {
    const normalized = explicitCountry.toUpperCase();
    return normalized === 'BR' ? { locale: 'pt-BR', country: 'BR' } : { locale: 'en', country: normalized };
  }

  const phone = payload.customer?.phone_number?.trim();
  if (phone?.startsWith('+55')) return { locale: 'pt-BR', country: 'BR' };
  if (phone?.startsWith('+1')) return { locale: 'en', country: 'US' };

  const email = payload.customer?.email?.toLowerCase();
  if (email?.endsWith('.br')) return { locale: 'pt-BR', country: 'BR' };

  return { locale: defaultLocale, country: defaultCountry };
}

export function generateTemporaryPassword(): string {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes))
    .replace(/[+/=]/g, '')
    .slice(0, 20);
}

export function isEmailAlreadyRegistered(error: { message?: string; code?: string } | null): boolean {
  if (!error) return false;
  return error.code === 'email_exists' || (error.message?.toLowerCase().includes('already been registered') ?? false);
}
