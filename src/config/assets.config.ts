/**
 * Central registry of static asset paths under public/assets/. Every
 * component that displays an app image imports a KEY from here — never a
 * literal path. Drop a file with the exact name into the matching folder
 * (see docs/ASSETS_GUIDE.md for the full spec) and it's picked up
 * automatically through AppImage, no code change required.
 */

export const ASSET_PATHS = {
  logoPrimary: '/assets/logos/logo-primary.svg',
  logoIcon: '/assets/logos/logo-icon.svg',
  logoWhite: '/assets/logos/logo-white.svg',
  splashLogo: '/assets/logos/splash-logo.svg',
  onboardingSpeciesDog: '/assets/onboarding/onboarding-species-dog.svg',
  onboardingSpeciesCat: '/assets/onboarding/onboarding-species-cat.svg',
  emptyStatePet: '/assets/illustrations/empty-state-pet.svg',
  placeholderAvatar: '/assets/illustrations/placeholder-avatar.svg',
  pwaIcon192: '/assets/pwa/icon-192.png',
  pwaIcon512: '/assets/pwa/icon-512.png',
} as const;

export type AssetKey = keyof typeof ASSET_PATHS;

/**
 * Deliberately-missing path — exists only to demo AppImage/Avatar's
 * broken-image fallback in the /_dev showcase. Not a real app asset, so
 * it's kept out of ASSET_PATHS and docs/ASSETS_GUIDE.md.
 */
export const DEV_BROKEN_IMAGE_PATH = '/assets/does-not-exist.jpg';
