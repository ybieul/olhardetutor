import { RefreshCw, X } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

export function UpdatePrompt() {
  const { t } = useTranslation('pwa');
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-80 z-toast flex justify-center px-16">
      <div
        role="alert"
        className="pointer-events-auto flex items-center gap-12 rounded-lg bg-neutral-900 px-16 py-12 text-white shadow-xl"
      >
        <Icon icon={RefreshCw} size="sm" color="primary" />
        <span className="flex-1 text-sm">{t('update.available')}</span>
        <Button variant="primary" size="sm" onClick={() => void updateServiceWorker(true)}>
          {t('update.refresh')}
        </Button>
        <button
          type="button"
          aria-label={t('update.dismiss')}
          onClick={() => setNeedRefresh(false)}
          className="text-neutral-400 hover:text-neutral-200"
        >
          <Icon icon={X} size="sm" />
        </button>
      </div>
    </div>
  );
}
