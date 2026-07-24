import { useTranslation } from 'react-i18next';

import type { WeightEntry } from '@/lib/supabase/queries/weightHistory';

const SVG_W = 400;
const SVG_H = 180;
const PAD = { top: 16, right: 16, bottom: 32, left: 44 };
const CHART_W = SVG_W - PAD.left - PAD.right;
const CHART_H = SVG_H - PAD.top - PAD.bottom;

type WeightChartProps = {
  entries: WeightEntry[];
};

export function WeightChart({ entries }: WeightChartProps) {
  const { t } = useTranslation('profile');

  const lastEntry = entries.at(-1);
  const currentWeight = lastEntry?.weight_kg ?? null;

  if (entries.length === 0) {
    return (
      <div className="py-24 text-center text-sm text-neutral-400">{t('weight.noData')}</div>
    );
  }

  const weights = entries.map((e) => e.weight_kg);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const range = maxW - minW || 1;

  function toX(i: number): number {
    if (entries.length === 1) return PAD.left + CHART_W / 2;
    return PAD.left + (i / (entries.length - 1)) * CHART_W;
  }

  function toY(w: number): number {
    return PAD.top + CHART_H - ((w - minW) / range) * CHART_H;
  }

  const points = entries.map((e, i) => `${toX(i)},${toY(e.weight_kg)}`).join(' ');

  const firstDate = entries.at(0)?.date ?? '';
  const lastDate = entries.at(-1)?.date ?? '';

  return (
    <div className="flex flex-col gap-8">
      {currentWeight !== null ? (
        <div className="flex items-baseline gap-6">
          <span className="text-2xl font-bold text-foreground">{currentWeight}</span>
          <span className="text-sm text-neutral-500">{t('weight.unit')}</span>
          <span className="ml-4 text-xs text-neutral-400">{t('weight.current')}</span>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-lg">
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full" aria-hidden="true">
          {/* Axes */}
          <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + CHART_H} stroke="#e5e7eb" strokeWidth="1" />
          <line x1={PAD.left} y1={PAD.top + CHART_H} x2={PAD.left + CHART_W} y2={PAD.top + CHART_H} stroke="#e5e7eb" strokeWidth="1" />

          {/* Y axis labels */}
          <text x={PAD.left - 4} y={PAD.top + 4} textAnchor="end" fontSize="11" fill="#9ca3af">
            {maxW}
          </text>
          <text x={PAD.left - 4} y={PAD.top + CHART_H} textAnchor="end" fontSize="11" fill="#9ca3af">
            {minW}
          </text>

          {/* Area fill */}
          <polyline
            points={[
              `${toX(0)},${PAD.top + CHART_H}`,
              ...entries.map((e, i) => `${toX(i)},${toY(e.weight_kg)}`),
              `${toX(entries.length - 1)},${PAD.top + CHART_H}`,
            ].join(' ')}
            fill="#fef3c7"
            stroke="none"
          />

          {/* Line */}
          <polyline points={points} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Data points */}
          {entries.map((e, i) => (
            <circle key={e.id} cx={toX(i)} cy={toY(e.weight_kg)} r="4" fill="#f59e0b" stroke="white" strokeWidth="2" />
          ))}

          {/* X axis date labels */}
          {firstDate !== lastDate ? (
            <>
              <text x={PAD.left} y={SVG_H - 4} textAnchor="start" fontSize="10" fill="#9ca3af">
                {firstDate}
              </text>
              <text x={PAD.left + CHART_W} y={SVG_H - 4} textAnchor="end" fontSize="10" fill="#9ca3af">
                {lastDate}
              </text>
            </>
          ) : (
            <text x={PAD.left + CHART_W / 2} y={SVG_H - 4} textAnchor="middle" fontSize="10" fill="#9ca3af">
              {firstDate}
            </text>
          )}
        </svg>
      </div>
    </div>
  );
}
