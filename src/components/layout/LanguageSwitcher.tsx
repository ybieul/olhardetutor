import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/cn';
import { useLanguage } from '@/i18n/useLanguage';
import { Icon } from '@/components/ui/Icon';

export function LanguageSwitcher() {
  const { t } = useTranslation('common');
  const { language, setLanguage, supportedLanguages } = useLanguage();

  return (
    <div className="flex items-center gap-8" role="group" aria-label={t('language.label')}>
      <Icon icon={Languages} size="sm" color="neutral" />
      {supportedLanguages.map((lng) => (
        <button
          key={lng}
          type="button"
          onClick={() => setLanguage(lng)}
          aria-pressed={language === lng}
          className={cn(
            'rounded-sm px-8 py-4 text-sm font-medium transition-colors',
            language === lng ? 'bg-primary-500 text-white' : 'text-neutral-600 hover:bg-neutral-100',
          )}
        >
          {t(`language.${lng}`)}
        </button>
      ))}
    </div>
  );
}
