import { cn } from '@/lib/cn';

type SkeletonRadius = 'sm' | 'md' | 'lg' | 'full';

type SkeletonProps = {
  /** Size the placeholder with token-based width/height utility classes, e.g. "h-16 w-3/4". */
  className?: string;
  radius?: SkeletonRadius;
};

const RADIUS_CLASSES: Record<SkeletonRadius, string> = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
};

/** Loading placeholder — content is decorative, so it's hidden from assistive tech. */
export function Skeleton({ className, radius = 'md' }: SkeletonProps) {
  return <div aria-hidden="true" className={cn('animate-pulse bg-neutral-200', RADIUS_CLASSES[radius], className)} />;
}
