import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
};

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700',
  secondary: 'bg-neutral-100 text-foreground-light hover:bg-neutral-200 active:bg-neutral-300',
  ghost: 'bg-transparent text-foreground-light hover:bg-neutral-100 active:bg-neutral-200',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-btn-sm px-12 text-sm',
  md: 'h-btn-md px-16 text-base',
  lg: 'h-btn-lg px-24 text-lg',
};

/** Generic button primitive — every visual value comes from design tokens. */
export function Button({ variant = 'primary', size = 'md', className, children, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center gap-8 rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
