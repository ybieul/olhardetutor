import { Bell, BellOff } from 'lucide-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { useLanguageStore } from '@/store/useLanguageStore';
import { useNotificationStore } from '@/store/useNotificationStore';

export function NotificationCard() {
  const { t } = useTranslation('pwa');
  const { language } = useLanguageStore();
  const { supported, permission, isSubscribed, isLoading, init, enable, disable } =
    useNotificationStore();

  useEffect(() => {
    void init();
  }, [init]);

  if (!supported) {
    return (
      <Card padding="md" shadow="sm">
        <div className="flex items-center gap-12">
          <Icon icon={BellOff} size="md" color="neutral" />
          <p className="text-sm text-neutral-400">{t('notifications.unavailable')}</p>
        </div>
      </Card>
    );
  }

  if (permission === 'denied') {
    return (
      <Card padding="md" shadow="sm">
        <div className="flex items-center gap-12">
          <Icon icon={BellOff} size="md" color="neutral" />
          <p className="text-sm text-neutral-400">{t('notifications.blocked')}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="md" shadow="sm">
      <div className="flex flex-col gap-12">
        <div className="flex items-center gap-12">
          <Icon icon={Bell} size="md" color="primary" />
          <p className="font-semibold text-foreground">{t('notifications.title')}</p>
        </div>
        <p className="text-sm text-neutral-500">{t('notifications.description')}</p>
        {isSubscribed ? (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-success-600">{t('notifications.enabled')}</span>
            <Button
              variant="secondary"
              size="sm"
              loading={isLoading}
              onClick={() => void disable()}
            >
              {t('notifications.disable')}
            </Button>
          </div>
        ) : (
          <Button
            variant="primary"
            size="sm"
            loading={isLoading}
            onClick={() => void enable(language)}
          >
            {t('notifications.enable')}
          </Button>
        )}
      </div>
    </Card>
  );
}
