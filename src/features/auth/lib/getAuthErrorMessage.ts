import type { TFunction } from 'i18next';

/**
 * Maps a Supabase Auth error to a translated message from errors.json.
 * Never surfaces Supabase's own (English-only) error text directly — see
 * CLAUDE.md, "Todo texto vem de src/i18n/locales".
 */
export function getAuthErrorMessage(error: unknown, t: TFunction<'errors'>): string {
  const code = hasErrorCode(error) ? error.code : undefined;
  const message = hasErrorMessage(error) ? error.message.toLowerCase() : '';

  // Namespace-prefixed explicitly (`errors:...`) so this resolves correctly
  // regardless of which namespace is first/default on the caller's `t` —
  // relying on TFunction<'errors'>'s default alone silently no-ops when
  // the caller's useTranslation() lists another namespace first.
  if (code === 'invalid_credentials' || message.includes('invalid login credentials')) {
    return t('errors:auth.invalidCredentials');
  }
  if (code === 'email_not_confirmed' || message.includes('email not confirmed')) {
    return t('errors:auth.emailNotConfirmed');
  }
  if (code === 'user_not_found') {
    return t('errors:auth.userNotFound');
  }
  if (code === 'weak_password' || message.includes('password')) {
    return t('errors:auth.weakPassword');
  }
  if (code === 'over_request_rate_limit' || code === 'over_email_send_rate_limit' || message.includes('rate limit')) {
    return t('errors:auth.tooManyRequests');
  }
  if (code === 'session_not_found' || message.includes('session')) {
    return t('errors:auth.sessionExpired');
  }
  if (code === 'otp_expired' || message.includes('expired') || message.includes('already used')) {
    return t('errors:auth.linkExpired');
  }

  return t('errors:auth.generic');
}

function hasErrorCode(error: unknown): error is { code: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string'
  );
}

function hasErrorMessage(error: unknown): error is { message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  );
}
