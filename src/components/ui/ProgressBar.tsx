type ProgressBarProps = {
  /** 0–100 */
  value: number;
  /** Accessible label describing what's progressing, e.g. "Step 2 of 5". */
  label: string;
};

export function ProgressBar({ value, label }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className="h-track-sm w-full overflow-hidden rounded-full bg-neutral-200"
    >
      <div className="h-full rounded-full bg-primary-500 transition-all" style={{ width: `${clamped}%` }} />
    </div>
  );
}
