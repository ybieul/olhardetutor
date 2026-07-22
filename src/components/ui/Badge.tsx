import { cn } from '@/lib/cn';

type BadgeLevel = 'neutral' | 'success' | 'warning' | 'danger';

type BadgeProps = {
  label: string;
  level?: BadgeLevel;
};

const LEVEL_CLASSES: Record<BadgeLevel, string> = {
  neutral: 'bg-neutral-100 text-neutral-700',
  success: 'bg-success-50 text-success-700',
  warning: 'bg-warning-50 text-warning-700',
  danger: 'bg-danger-50 text-danger-700',
};

/**
 * Status pill — used for check-in severity levels (e.g. observe/attention/
 * urgent) by mapping the domain level to `neutral`/`warning`/`danger` at
 * the call site.
 */
export function Badge({ label, level = 'neutral' }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-8 py-2 text-xs font-medium', LEVEL_CLASSES[level])}>
      {label}
    </span>
  );
}
