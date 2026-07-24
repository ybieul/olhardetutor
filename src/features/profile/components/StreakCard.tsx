import { Flame } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import type { Checkin } from '@/lib/supabase/queries/checkins';

type StreakCardProps = {
  checkins: Checkin[];
};

function localDateStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function calculateStreak(checkins: Checkin[]): number {
  if (checkins.length === 0) return 0;
  const dateSet = new Set(checkins.map((c) => c.date));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let cursor = new Date(today);

  while (dateSet.has(localDateStr(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  // If today has no check-in yet, count from yesterday
  if (streak === 0) {
    cursor = new Date(today);
    cursor.setDate(cursor.getDate() - 1);
    while (dateSet.has(localDateStr(cursor))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
  }

  return streak;
}

export function StreakCard({ checkins }: StreakCardProps) {
  const { t } = useTranslation('profile');
  const streak = calculateStreak(checkins);

  return (
    <Card padding="md" shadow="sm">
      <div className="flex items-center gap-12">
        <div className="flex h-40 w-40 flex-shrink-0 items-center justify-center rounded-full bg-warning-50">
          <Icon icon={Flame} size="md" color="warning" />
        </div>
        <div>
          <p className="text-sm font-medium text-neutral-500">{t('streak.title')}</p>
          {streak > 0 ? (
            <p className="text-lg font-bold text-foreground">{t('streak.days', { count: streak })}</p>
          ) : (
            <p className="text-sm text-neutral-400">{t('streak.noStreak')}</p>
          )}
        </div>
      </div>
    </Card>
  );
}
