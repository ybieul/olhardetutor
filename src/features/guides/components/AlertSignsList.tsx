import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import type { PetSpeciesKey } from '@/config/app.config';
import type { AlertCategoryData, AlertLevel } from '../types';

const ALERT_CATEGORY_ORDER = ['feeding', 'sleep', 'stool', 'urine', 'behavior', 'physical'] as const;

const BADGE_LEVEL: Record<AlertLevel, 'neutral' | 'warning' | 'danger'> = {
  observe: 'neutral',
  attention: 'warning',
  urgent: 'danger',
};

type AlertSignsListProps = {
  petSpecies: PetSpeciesKey | null;
};

export function AlertSignsList({ petSpecies }: AlertSignsListProps) {
  const { t } = useTranslation('guides');

  const categories = t('alertSigns.categories', { returnObjects: true }) as unknown as Record<
    string,
    AlertCategoryData
  >;

  return (
    <div className="flex flex-col gap-16">
      {ALERT_CATEGORY_ORDER.map((categoryKey) => {
        const category = categories[categoryKey];
        if (!category) return null;

        const signals = category.signals.filter(
          (s) => s.species === 'all' || petSpecies === null || s.species === petSpecies,
        );

        if (signals.length === 0) return null;

        return (
          <Card key={categoryKey} padding="md" shadow="sm">
            <h3 className="pb-10 text-sm font-semibold text-foreground">{category.title}</h3>
            <div className="flex flex-col gap-8">
              {signals.map((signal, idx) => (
                <div key={idx} className="flex items-start gap-8">
                  <Badge
                    label={t(`alertSigns.levels.${signal.level}`)}
                    level={BADGE_LEVEL[signal.level]}
                  />
                  <p className="text-sm leading-relaxed text-neutral-600">{signal.text}</p>
                </div>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
