import { getScoreBand } from '../scoring';

type TrendPoint = {
  date: string;
  score: number | null;
};

type ScoreTrendProps = {
  points: TrendPoint[];
};

const W = 280;
const H = 80;
const PAD_X = 20;
const PAD_Y = 10;
const CHART_W = W - PAD_X * 2;
const CHART_H = H - PAD_Y * 2;
const N = 7;
const COL = CHART_W / (N - 1);

const BAND_COLORS = {
  high: '#22A155',
  medium: '#F59E0B',
  low: '#E23B3B',
} as const;

function scoreToY(score: number): number {
  // score 0 → bottom (PAD_Y + CHART_H), score 100 → top (PAD_Y)
  return PAD_Y + CHART_H * (1 - score / 100);
}

/** Inline SVG mini-trend showing 7 daily scores as connected dots. */
export function ScoreTrend({ points }: ScoreTrendProps) {
  const dots = points.map((p, i) => ({
    x: PAD_X + i * COL,
    y: p.score !== null ? scoreToY(p.score) : null,
    score: p.score,
    color: p.score !== null ? BAND_COLORS[getScoreBand(p.score)] : '#C9C9D4',
  }));

  // Build polyline path segments — only connect consecutive non-null points
  const segments: string[] = [];
  for (let i = 0; i < dots.length - 1; i++) {
    const a = dots[i];
    const b = dots[i + 1];
    if (a !== undefined && b !== undefined && a.y !== null && b.y !== null) {
      segments.push(`M ${a.x} ${a.y} L ${b.x} ${b.y}`);
    }
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      aria-hidden="true"
      className="overflow-visible"
    >
      {/* connector lines */}
      {segments.map((d, i) => (
        <path key={i} d={d} stroke="#E2E2E8" strokeWidth={2} fill="none" />
      ))}

      {/* dots */}
      {dots.map((dot, i) => (
        <circle
          key={i}
          cx={dot.x}
          cy={dot.y ?? H / 2}
          r={dot.y !== null ? 6 : 4}
          fill={dot.y !== null ? dot.color : 'none'}
          stroke={dot.color}
          strokeWidth={dot.y !== null ? 0 : 2}
        />
      ))}
    </svg>
  );
}
