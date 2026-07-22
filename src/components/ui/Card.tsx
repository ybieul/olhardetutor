import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/cn';

type CardPadding = 'sm' | 'md' | 'lg';
type CardShadow = 'none' | 'sm' | 'md' | 'lg' | 'xl';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  padding?: CardPadding;
  shadow?: CardShadow;
  children: ReactNode;
};

const PADDING_CLASSES: Record<CardPadding, string> = {
  sm: 'p-12',
  md: 'p-16',
  lg: 'p-24',
};

const SHADOW_CLASSES: Record<CardShadow, string> = {
  none: 'shadow-none',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
};

/** Generic content container — padding, radius and shadow all come from tokens. */
export function Card({ padding = 'md', shadow = 'md', className, children, ...rest }: CardProps) {
  return (
    <div className={cn('rounded-lg bg-white', PADDING_CLASSES[padding], SHADOW_CLASSES[shadow], className)} {...rest}>
      {children}
    </div>
  );
}
