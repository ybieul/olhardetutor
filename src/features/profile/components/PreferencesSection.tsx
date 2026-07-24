import { useTranslation } from 'react-i18next';

import { Card } from '@/components/ui/Card';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import type { SupportedLanguage } from '@/config/i18n.config';
import { cn } from '@/lib/cn';
import { useLanguageStore } from '@/store/useLanguageStore';
import { TTS_SPEEDS, useTtsStore, type TtsSpeed } from '@/store/useTtsStore';

const LANGUAGE_OPTIONS: Array<{ value: SupportedLanguage; label: string }> = [
  { value: 'pt-BR', label: 'Português' },
  { value: 'en', label: 'English' },
];

export function PreferencesSection() {
  const { t } = useTranslation('profile');
  const { language, setLanguage } = useLanguageStore();
  const { rate, setRate } = useTtsStore();

  const speedLabels: Record<TtsSpeed, string> = {
    0.7: t('preferences.audioSpeeds.slow'),
    1.0: t('preferences.audioSpeeds.normal'),
    1.3: t('preferences.audioSpeeds.fast'),
  };

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

        <div className="flex flex-col gap-4">
          <p className="text-sm font-medium text-neutral-500">{t('preferences.notifications')}</p>
          <p className="text-xs text-neutral-400">{t('preferences.notificationsHint')}</p>
        </div>
      </div>
    </Card>
  );
}
