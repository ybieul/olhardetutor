import type { LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type PlaceholderPageProps = {
  icon: LucideIcon;
  titleKey: string;
};

/** Stand-in for a feature page that hasn't been built yet. */
export function PlaceholderPage({ icon: Icon, titleKey }: PlaceholderPageProps) {
  const { t } = useTranslation('common');

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-16 px-16 py-48 text-center">
      <Icon className="h-icon-xl w-icon-xl text-primary-500" aria-hidden="true" />
      <h1 className="text-2xl font-semibold text-foreground-light">{t(titleKey)}</h1>
      <p className="text-base text-neutral-600">{t('placeholder.comingSoon')}</p>
    </div>
  );
}
