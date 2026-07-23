import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { KeyRound } from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ROUTES } from '@/config/routes.config';
import { requestPasswordReset } from '@/lib/supabase/queries/auth';
import { getAuthErrorMessage } from '@/features/auth/lib/getAuthErrorMessage';

export function ForgotPasswordPage() {
  const { t } = useTranslation(['auth', 'errors']);

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
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
          <Icon icon={KeyRound} size="xl" color="primary" />
          <h1 className="text-2xl font-semibold text-foreground-light">{t('auth:forgotPassword.title')}</h1>
          {!sent ? <p className="text-sm text-neutral-600">{t('auth:forgotPassword.description')}</p> : null}
        </div>
        <Card>
          {sent ? (
            <div className="flex flex-col items-center gap-8 text-center">
              <h2 className="text-lg font-semibold text-foreground-light">{t('auth:forgotPassword.successTitle')}</h2>
              <p className="text-sm text-neutral-600">{t('auth:forgotPassword.successDescription')}</p>
            </div>
          ) : (
            <form className="flex flex-col gap-16" onSubmit={handleSubmit}>
              <Input
                label={t('auth:forgotPassword.emailLabel')}
                type="email"
                placeholder={t('auth:forgotPassword.emailPlaceholder')}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
              {error ? (
                <p role="alert" className="text-sm text-danger-600">
                  {error}
                </p>
              ) : null}
              <Button type="submit" loading={submitting} fullWidth>
                {t('auth:forgotPassword.submit')}
              </Button>
            </form>
          )}
        </Card>
        <div className="mt-16 text-center">
          <Link to={ROUTES.login} className="text-sm font-medium text-primary-600 hover:underline">
            {t('auth:forgotPassword.backToLogin')}
          </Link>
        </div>
      </div>
    </div>
  );
}
