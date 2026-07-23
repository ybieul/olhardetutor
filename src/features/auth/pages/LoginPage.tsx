import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ROUTES } from '@/config/routes.config';
import { signInWithPassword } from '@/lib/supabase/queries/auth';
import { getAuthErrorMessage } from '@/features/auth/lib/getAuthErrorMessage';

export function LoginPage() {
  const { t } = useTranslation(['auth', 'errors']);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signInWithPassword(email, password);
      navigate(ROUTES.home, { replace: true });
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
          <Icon icon={LogIn} size="xl" color="primary" />
          <h1 className="text-2xl font-semibold text-foreground-light">{t('auth:login.title')}</h1>
        </div>
        <Card>
          <form className="flex flex-col gap-16" onSubmit={handleSubmit}>
            <Input
              label={t('auth:login.emailLabel')}
              type="email"
              placeholder={t('auth:login.emailPlaceholder')}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
            <Input
              label={t('auth:login.passwordLabel')}
              type="password"
              placeholder={t('auth:login.passwordPlaceholder')}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
            {error ? (
              <p role="alert" className="text-sm text-danger-600">
                {error}
              </p>
            ) : null}
            <Button type="submit" loading={submitting} fullWidth>
              {t('auth:login.submit')}
            </Button>
          </form>
        </Card>
        <div className="mt-16 text-center">
          <Link to={ROUTES.forgotPassword} className="text-sm font-medium text-primary-600 hover:underline">
            {t('auth:login.forgotPassword')}
          </Link>
        </div>
      </div>
    </div>
  );
}
