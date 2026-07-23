import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Icon } from '@/components/ui/Icon';

/** Shown while route guards are resolving auth/pet status. */
export function AuthLoadingScreen() {
  const { t } = useTranslation('common');

  return (
    <div role="status" aria-label={t('status.loading')} className="flex min-h-svh flex-col items-center justify-center">
      <Icon icon={Loader2} size="xl" color="primary" className="animate-spin" />
    </div>
  );
}
