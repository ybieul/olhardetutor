import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2, type LucideIcon } from 'lucide-react';

import { cn } from '@/lib/cn';
import { Icon, type IconColor } from '@/components/ui/Icon';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: LucideIcon;
  fullWidth?: boolean;
  children: ReactNode;
};

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700',
  secondary: 'bg-neutral-100 text-foreground-light hover:bg-neutral-200 active:bg-neutral-300',
  ghost: 'bg-transparent text-foreground-light hover:bg-neutral-100 active:bg-neutral-200',
  danger: 'bg-danger-500 text-white hover:bg-danger-600 active:bg-danger-700',
};

const ICON_COLOR_BY_VARIANT: Record<ButtonVariant, IconColor> = {
  primary: 'white',
  secondary: 'current',
  ghost: 'current',
  danger: 'white',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-btn-sm px-12 text-sm',
  md: 'h-btn-md px-16 text-base',
  lg: 'h-btn-lg px-24 text-lg',
};

const ICON_SIZE_BY_BUTTON_SIZE: Record<ButtonSize, 'sm' | 'md' | 'lg'> = {
  sm: 'sm',
  md: 'md',
  lg: 'md',
};

/** Generic button primitive — every visual value comes from design tokens. */
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  fullWidth = false,
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type="button"
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center gap-8 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? (
        <Icon
          icon={Loader2}
          size={ICON_SIZE_BY_BUTTON_SIZE[size]}
          color={ICON_COLOR_BY_VARIANT[variant]}
          className="animate-spin"
        />
      ) : icon ? (
        <Icon icon={icon} size={ICON_SIZE_BY_BUTTON_SIZE[size]} color={ICON_COLOR_BY_VARIANT[variant]} />
      ) : null}
      {children}
    </button>
  );
}
