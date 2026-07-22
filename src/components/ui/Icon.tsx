import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/cn';

export type IconSize = 'sm' | 'md' | 'lg' | 'xl';
export type IconColor = 'current' | 'primary' | 'neutral' | 'success' | 'warning' | 'danger' | 'white';

type IconProps = {
  icon: LucideIcon;
  size?: IconSize;
  color?: IconColor;
  className?: string;
  /** Only set this when the icon conveys meaning on its own (no adjacent text label). */
  'aria-label'?: string;
};

const SIZE_CLASSES: Record<IconSize, string> = {
  sm: 'h-icon-sm w-icon-sm',
  md: 'h-icon-md w-icon-md',
  lg: 'h-icon-lg w-icon-lg',
  xl: 'h-icon-xl w-icon-xl',
};

const COLOR_CLASSES: Record<IconColor, string> = {
  current: 'text-current',
  primary: 'text-primary-500',
  neutral: 'text-neutral-500',
  success: 'text-success-500',
  warning: 'text-warning-500',
  danger: 'text-danger-500',
  white: 'text-white',
};

/**
 * The only sanctioned way to render a lucide-react icon in this app — see
 * CLAUDE.md, "Ícones sempre via src/components/ui/Icon.tsx". Standardizes
 * size and color to design tokens instead of ad-hoc className sizing.
 */
export function Icon({
  icon: LucideIconComponent,
  size = 'md',
  color = 'current',
  className,
  'aria-label': ariaLabel,
}: IconProps) {
  return (
    <LucideIconComponent
      className={cn(SIZE_CLASSES[size], COLOR_CLASSES[color], className)}
      aria-hidden={ariaLabel ? undefined : true}
      aria-label={ariaLabel}
      role={ariaLabel ? 'img' : undefined}
    />
  );
}
