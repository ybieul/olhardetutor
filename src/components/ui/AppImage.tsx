import { useState } from 'react';
import { ImageOff } from 'lucide-react';

import { cn } from '@/lib/cn';
import { Icon } from '@/components/ui/Icon';
import { ASSET_PATHS, type AssetKey } from '@/config/assets.config';

type AppImageSize = 'sm' | 'md' | 'lg' | 'xl';

type AppImageProps = {
  /** Semantic key from src/config/assets.config.ts — never pass a raw path. */
  assetKey: AssetKey;
  alt: string;
  /** Token-based height preset; width flows naturally to keep the asset's aspect ratio. */
  size?: AppImageSize;
  /** Explicit overrides (px) for when a fixed box is required, e.g. a PWA icon preview. */
  width?: number;
  height?: number;
  className?: string;
};

const SIZE_CLASSES: Record<AppImageSize, string> = {
  sm: 'h-image-sm',
  md: 'h-image-md',
  lg: 'h-image-lg',
  xl: 'h-image-xl',
};

/**
 * Renders a static app asset (logo, illustration, PWA icon...) by its
 * semantic key. If the file hasn't been dropped into public/assets/ yet —
 * or fails to load for any other reason — it falls back to a neutral
 * placeholder instead of a broken image. See docs/ASSETS_GUIDE.md for the
 * expected file name, folder and dimensions per key.
 */
export function AppImage({ assetKey, alt, size, width, height, className }: AppImageProps) {
  const [errored, setErrored] = useState(false);
  const hasExplicitDimensions = width !== undefined || height !== undefined;
  // Default to "md" so the fallback box is never invisible when the caller
  // relied on the source image's natural size instead of `size`/width/height.
  const sizeClass = hasExplicitDimensions ? undefined : SIZE_CLASSES[size ?? 'md'];

  if (errored) {
    return (
      <span
        role="img"
        aria-label={alt}
        style={hasExplicitDimensions ? { width, height } : undefined}
        className={cn(
          'inline-flex items-center justify-center rounded-md bg-neutral-100',
          !hasExplicitDimensions && 'aspect-square',
          sizeClass,
          className,
        )}
      >
        <Icon icon={ImageOff} size="md" color="neutral" />
      </span>
    );
  }

  return (
    <img
      src={ASSET_PATHS[assetKey]}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      onError={() => setErrored(true)}
      className={cn('object-contain', sizeClass, className)}
    />
  );
}
