import { useTranslation } from 'react-i18next';
import { TrendingUp, BookOpen } from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import { getScoreBand } from '../scoring';
import { ScoreTrend } from './ScoreTrend';
import type { Checkin } from '@/lib/supabase/queries/checkins';

type CheckinSummaryProps = {
  checkin: Checkin;
  history: Checkin[];
  petName: string;
};

const SCORE_COLOR = {
  high: 'text-success-600',
  medium: 'text-warning-600',
  low: 'text-danger-600',
} as const;

const BADGE_LEVEL = {
  high: 'success',
  medium: 'warning',
  low: 'danger',
} as const;

/** Builds the 7-point trend from history ordered by date (desc from DB). */
function buildTrendPoints(history: Checkin[]) {
  const today = new Date();
  const scoreByDate = new Map(history.map((c) => [c.date, c.day_score]));

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().slice(0, 10);
    const score = scoreByDate.get(dateStr) ?? null;
    return { date: dateStr, score };
  });
}

export function CheckinSummary({ checkin, history, petName }: CheckinSummaryProps) {
  const { t } = useTranslation('checkin');
  const score = checkin.day_score ?? 0;
  const band = getScoreBand(score);
  const trendPoints = buildTrendPoints(history);
  const firstInHistory = history[0];
  const hasHistory = history.length > 1 || (firstInHistory !== undefined && firstInHistory.id !== checkin.id);

  return (
    <div className="flex flex-col gap-16">
      {/* Score card */}
      <Card padding="lg" shadow="md">
        <div className="flex flex-col items-center gap-8 text-center">
          <span className="text-sm font-medium text-neutral-500">{t('summary.scoreLabel')}</span>
          <span className={cn('text-6xl font-bold tabular-nums', SCORE_COLOR[band])}>{score}</span>
          <Badge label={t(`summary.band.${band}`)} level={BADGE_LEVEL[band]} />
          <p className="mt-4 text-sm text-neutral-600">{t(`summary.message.${band}`, { name: petName })}</p>
        </div>
      </Card>

      {/* Guides hint for medium/low scores */}
      {band !== 'high' ? (
        <div className="flex items-start gap-8 rounded-md border border-warning-200 bg-warning-50 p-12">
          <Icon icon={BookOpen} size="sm" color="warning" />
          <p className="text-sm text-warning-700">{t('summary.guidesHint')}</p>
        </div>
      ) : null}

      {/* 7-day trend */}
      <Card padding="md" shadow="sm">
        <div className="flex items-center gap-8 pb-8">
          <Icon icon={TrendingUp} size="sm" color="primary" />
          <span className="text-sm font-semibold text-foreground-light">{t('summary.trendTitle')}</span>
        </div>
        {hasHistory ? (
          <ScoreTrend points={trendPoints} />
        ) : (
          <p className="py-16 text-center text-sm text-neutral-400">{t('summary.noHistory')}</p>
        )}
      </Card>

      {/* Next check-in notice */}
      <p className="text-center text-sm text-neutral-400">{t('summary.newCheckin')}</p>

      {/* Disclaimer */}
      <p className="text-center text-xs text-neutral-400">{t('disclaimer')}</p>
    </div>
  );
}
