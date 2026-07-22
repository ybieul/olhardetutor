/**
 * Central registry of static asset paths. No component should reference an
 * image path as a string literal — import it from here instead, so every
 * asset has exactly one place it's declared.
 */

export const ASSETS_CONFIG = {
  branding: {
    icon: '/favicon.svg',
  },
  /** Deliberately-missing path, used to demo Avatar's broken-image fallback. */
  dev: {
    brokenImage: '/does-not-exist.jpg',
  },
} as const;

export type AssetsConfig = typeof ASSETS_CONFIG;
