import { MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Icon } from '@/components/ui/Icon';
import { VET_SEARCH_URLS } from '@/config/app.config';
import { useLanguageStore } from '@/store/useLanguageStore';

export function VetButton() {
  const { t } = useTranslation('guides');
  const { language } = useLanguageStore();
  const url = VET_SEARCH_URLS[language as keyof typeof VET_SEARCH_URLS] ?? VET_SEARCH_URLS['pt-BR'];

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex w-full items-center justify-center gap-8 rounded-md bg-primary-500 px-16 py-12 text-base font-medium text-white transition-colors hover:bg-primary-600 active:bg-primary-700"
    >
      <Icon icon={MapPin} size="md" color="white" />
      {t('vetButton')}
    </a>
  );
}
