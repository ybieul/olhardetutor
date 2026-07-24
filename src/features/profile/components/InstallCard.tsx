import { Download, Share } from 'lucide-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { usePwaStore } from '@/store/usePwaStore';

export function InstallCard() {
  const { t } = useTranslation('pwa');
  const { isInstallable, isInstalled, isIos, init, promptInstall } = usePwaStore();

  useEffect(() => {
    init();
  }, [init]);

  // Already installed as PWA — hide the card
  if (isInstalled) return null;

  // Android / desktop — show native install button
  if (isInstallable) {
    return (
      <Card padding="md" shadow="sm">
        <div className="flex flex-col gap-12">
          <div className="flex items-center gap-12">
            <Icon icon={Download} size="md" color="primary" />
            <p className="font-semibold text-foreground">{t('install.title')}</p>
          </div>
          <p className="text-sm text-neutral-500">{t('install.description')}</p>
          <Button variant="primary" size="sm" onClick={() => void promptInstall()}>
            {t('install.button')}
          </Button>
        </div>
      </Card>
    );
  }

  // iOS Safari — show manual instruction
  if (isIos) {
    return (
      <Card padding="md" shadow="sm">
        <div className="flex flex-col gap-12">
          <div className="flex items-center gap-12">
            <Icon icon={Share} size="md" color="primary" />
            <p className="font-semibold text-foreground">{t('install.ios.title')}</p>
          </div>
          <p className="text-sm text-neutral-500">{t('install.description')}</p>
          <ol className="flex flex-col gap-4 text-sm text-neutral-600">
            <li className="flex items-center gap-8">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
                1
              </span>
              {t('install.ios.step1')}
            </li>
            <li className="flex items-center gap-8">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
                2
              </span>
              {t('install.ios.step2')}
            </li>
          </ol>
        </div>
      </Card>
    );
  }

  return null;
}
