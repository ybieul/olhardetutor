import { useTranslation } from 'react-i18next';
import { CalendarCheck } from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { ONBOARDING_BASELINE_DAYS } from '@/config/app.config';

export function StepBaseline() {
  const { t } = useTranslation('onboarding');
  const days = Array.from({ length: ONBOARDING_BASELINE_DAYS }, (_, index) => index + 1);

  return (
    <div className="flex flex-col gap-24">
      <div className="flex flex-col items-center gap-8 text-center">
        <Icon icon={CalendarCheck} size="xl" color="primary" />
        <h1 className="text-2xl font-semibold text-foreground-light">{t('baseline.title')}</h1>
        <p className="text-base text-neutral-600">{t('baseline.subtitle', { days: ONBOARDING_BASELINE_DAYS })}</p>
      </div>

      <Card padding="lg" shadow="sm">
        <div className="flex justify-between gap-8">
          {days.map((day) => (
            <div key={day} className="flex flex-1 flex-col items-center gap-4">
              <span className="flex h-avatar-sm w-avatar-sm items-center justify-center rounded-full bg-primary-50 text-sm font-semibold text-primary-700">
                {day}
              </span>
              <span className="text-xs text-neutral-500">{t('baseline.dayLabel', { day })}</span>
            </div>
          ))}
        </div>
        <p className="mt-16 text-sm text-neutral-600">{t('baseline.explanation')}</p>
      </Card>
    </div>
  );
}
