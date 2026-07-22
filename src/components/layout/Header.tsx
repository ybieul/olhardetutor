import { PawPrint } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';

export function Header() {
  const { t } = useTranslation('common');

  return (
    <header className="flex items-center justify-between gap-16 border-b border-neutral-200 px-16 py-12">
      <div className="flex items-center gap-8">
        <PawPrint className="h-icon-lg w-icon-lg text-primary-500" aria-hidden="true" />
        <div>
          <p className="text-lg font-bold leading-tight text-foreground-light">{t('app.name')}</p>
          <p className="text-xs text-neutral-500">{t('app.tagline')}</p>
        </div>
      </div>
      <LanguageSwitcher />
    </header>
  );
}
