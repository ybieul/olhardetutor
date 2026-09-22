import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import type { SupportedLanguage } from '@/config/i18n.config';
import { ROUTES } from '@/config/routes.config';
import { cn } from '@/lib/cn';
import { signOut } from '@/lib/supabase/queries/auth';
import { useLanguageStore } from '@/store/useLanguageStore';
import { TTS_SPEEDS, useTtsStore, type TtsSpeed } from '@/store/useTtsStore';
import { useTourStore } from '@/store/useTourStore';

const LANGUAGE_OPTIONS: Array<{ value: SupportedLanguage; label: string }> = [
  { value: 'pt-BR', label: 'Português' },
  { value: 'en', label: 'English' },
];

export function PreferencesSection() {
  const { t } = useTranslation('profile');
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguageStore();
  const { rate, setRate } = useTtsStore();
  const resetAllTours = useTourStore((s) => s.resetAllTours);

  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  const speedLabels: Record<TtsSpeed, string> = {
    0.7: t('preferences.audioSpeeds.slow'),
    1.0: t('preferences.audioSpeeds.normal'),
    1.3: t('preferences.audioSpeeds.fast'),
  };

  async function handleSignOut() {
    setSigningOut(true);
    setSignOutError(null);
    try {
      await signOut();
      navigate(ROUTES.login, { replace: true });
    } catch {
      setSignOutError(t('preferences.signOutError'));
      setSigningOut(false);
    }
  }

  return (
    <Card padding="md" shadow="sm">
      <div className="flex flex-col gap-16">
        <p className="font-semibold text-foreground">{t('preferences.title')}</p>

        <div className="flex flex-col gap-8">
          <p className="text-sm font-medium text-neutral-500">{t('preferences.language')}</p>
          <SegmentedControl
            label={t('preferences.language')}
            options={LANGUAGE_OPTIONS}
            value={language}
            onChange={setLanguage}
          />
        </div>

        <div className="flex flex-col gap-8">
          <p className="text-sm font-medium text-neutral-500">{t('preferences.audioSpeed')}</p>
          <div role="radiogroup" aria-label={t('preferences.audioSpeed')} className="inline-flex gap-4 rounded-md bg-neutral-100 p-4">
            {TTS_SPEEDS.map((speed) => (
              <button
                key={speed}
                type="button"
                role="radio"
                aria-checked={rate === speed}
                onClick={() => setRate(speed)}
                className={cn(
                  'rounded-sm px-16 py-8 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                  rate === speed ? 'bg-white text-primary-700 shadow-sm' : 'text-neutral-600 hover:text-neutral-900',
                )}
              >
                {speedLabels[speed]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <p className="text-sm font-medium text-neutral-500">{t('preferences.restartTours')}</p>
          <p className="text-xs text-neutral-400">{t('preferences.restartToursHint')}</p>
          <Button variant="secondary" size="sm" onClick={() => void resetAllTours()}>
            {t('preferences.restartTours')}
          </Button>
        </div>

        <div className="flex flex-col gap-8 border-t border-neutral-200 pt-16">
          <Button
            variant="secondary"
            icon={LogOut}
            loading={signingOut}
            onClick={() => void handleSignOut()}
            fullWidth
          >
            {t('preferences.signOut')}
          </Button>
          {signOutError ? (
            <p role="alert" className="text-xs text-danger-600">
              {signOutError}
            </p>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
