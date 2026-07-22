import { useState } from 'react';
import { PawPrint, type LucideIcon } from 'lucide-react';

import { cn } from '@/lib/cn';
import { Icon, type IconSize } from '@/components/ui/Icon';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

type AvatarProps = {
  src?: string;
  /** Required — used as the image alt text and as the fallback icon's accessible label. */
  alt: string;
  size?: AvatarSize;
  fallbackIcon?: LucideIcon;
  className?: string;
};

const SIZE_CLASSES: Record<AvatarSize, string> = {
  sm: 'h-avatar-sm w-avatar-sm',
  md: 'h-avatar-md w-avatar-md',
  lg: 'h-avatar-lg w-avatar-lg',
  xl: 'h-avatar-xl w-avatar-xl',
};

const FALLBACK_ICON_SIZE: Record<AvatarSize, IconSize> = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'xl',
};

/** Pet/user photo with an icon fallback when there's no image (or it fails to load). */
export function Avatar({ src, alt, size = 'md', fallbackIcon = PawPrint, className }: AvatarProps) {
  const [errored, setErrored] = useState(false);
  const showFallback = !src || errored;

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-100',
        SIZE_CLASSES[size],
        className,
      )}
    >
      {showFallback ? (
        <Icon icon={fallbackIcon} size={FALLBACK_ICON_SIZE[size]} color="neutral" aria-label={alt} />
      ) : (
        <img src={src} alt={alt} className="h-full w-full object-cover" onError={() => setErrored(true)} />
      )}
    </span>
  );
}
