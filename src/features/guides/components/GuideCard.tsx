import { ChevronRight, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import type { GuideModuleId } from '@/config/app.config';

type GuideCardProps = {
  moduleId: GuideModuleId;
  iconComponent: LucideIcon;
  onClick: () => void;
};

export function GuideCard({ moduleId, iconComponent, onClick }: GuideCardProps) {
  const { t } = useTranslation('guides');

  return (
    <button type="button" onClick={onClick} className="w-full text-left">
      <Card padding="md" shadow="sm" className="transition-shadow hover:shadow-md">
        <div className="flex items-center gap-12">
          <div className="flex h-40 w-40 flex-shrink-0 items-center justify-center rounded-full bg-primary-50">
            <Icon icon={iconComponent} size="md" color="primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-foreground">{t(`modules.${moduleId}.title`)}</p>
            <p className="truncate text-sm text-neutral-500">{t(`modules.${moduleId}.tagline`)}</p>
          </div>
          <Icon icon={ChevronRight} size="sm" color="neutral" />
        </div>
      </Card>
    </button>
  );
}
