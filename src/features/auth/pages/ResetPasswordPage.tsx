import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ROUTES } from '@/config/routes.config';
import { updatePassword } from '@/lib/supabase/queries/auth';
import { getAuthErrorMessage } from '@/features/auth/lib/getAuthErrorMessage';

const MIN_PASSWORD_LENGTH = 8;

/**
 * Reached via the recovery link in either the welcome email (first
 * access, set your password) or the password-reset email — Supabase
 * treats both as the same "recovery" flow, so one screen covers both.
 */
export function ResetPasswordPage() {
  const { t } = useTranslation(['auth', 'errors']);
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(t('auth:resetPassword.passwordTooShort'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('auth:resetPassword.passwordMismatch'));
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await updatePassword(password);
      setDone(true);
    } catch (err) {
      setError(getAuthErrorMessage(err, t));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background-light px-16 py-32">
      <div className="w-full max-w-sm">
        <div className="mb-24 flex flex-col items-center gap-8 text-center">
          <Icon icon={Lock} size="xl" color="primary" />
          <h1 className="text-2xl font-semibold text-foreground-light">{t('auth:resetPassword.title')}</h1>
          {!done ? <p className="text-sm text-neutral-600">{t('auth:resetPassword.description')}</p> : null}
        </div>
        <Card>
          {done ? (
            <div className="flex flex-col items-center gap-16 text-center">
              <div className="flex flex-col items-center gap-8">
                <h2 className="text-lg font-semibold text-foreground-light">{t('auth:resetPassword.successTitle')}</h2>
                <p className="text-sm text-neutral-600">{t('auth:resetPassword.successDescription')}</p>
              </div>
              <Button fullWidth onClick={() => navigate(ROUTES.home, { replace: true })}>
                {t('auth:resetPassword.continue')}
              </Button>
            </div>
          ) : (
            <form className="flex flex-col gap-16" onSubmit={handleSubmit}>
              <Input
                label={t('auth:resetPassword.passwordLabel')}
                type="password"
                placeholder={t('auth:resetPassword.passwordPlaceholder')}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                required
              />
              <Input
                label={t('auth:resetPassword.confirmPasswordLabel')}
                type="password"
                placeholder={t('auth:resetPassword.confirmPasswordPlaceholder')}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                required
              />
              {error ? (
                <p role="alert" className="text-sm text-danger-600">
                  {error}
                </p>
              ) : null}
              <Button type="submit" loading={submitting} fullWidth>
                {t('auth:resetPassword.submit')}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
