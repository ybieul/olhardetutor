/**
 * Design tokens — component sizing.
 */

export const buttonHeight = {
  sm: '2rem', // 32px
  md: '2.5rem', // 40px
  lg: '3rem', // 48px
} as const;

export const iconSize = {
  sm: '1rem', // 16px
  md: '1.25rem', // 20px
  lg: '1.5rem', // 24px
  xl: '2rem', // 32px
} as const;

export const avatarSize = {
  sm: '2rem', // 32px
  md: '2.5rem', // 40px
  lg: '3.5rem', // 56px
  xl: '5rem', // 80px
} as const;

export const cardSize = {
  sm: '16rem', // 256px
  md: '20rem', // 320px
  lg: '24rem', // 384px
} as const;

/** Max width applied to the app's main content wrapper. */
export const maxContentWidth = '75rem'; // 1200px

/** Checkbox/radio control dimensions. */
export const controlSize = {
  sm: '1rem', // 16px
  md: '1.25rem', // 20px
  lg: '1.5rem', // 24px
} as const;

/** Track thickness for Slider and ProgressBar. */
export const trackHeight = {
  sm: '0.375rem', // 6px
  md: '0.5rem', // 8px
  lg: '0.75rem', // 12px
} as const;

/** Modal/Sheet panel dimensions. */
export const dialogSize = {
  modalMaxWidth: '32rem', // 512px
  sheetMaxWidth: '32rem', // 512px
  maxHeight: '90vh',
} as const;

/** Width of the desktop side-rail navigation. */
export const railWidth = '16rem'; // 256px

/**
 * Height presets for AppImage (logos, illustrations, PWA icon previews).
 * Width is left to flow naturally so non-square assets like logos keep
 * their aspect ratio — pass explicit width/height props when a fixed box
 * is required instead.
 */
export const imageHeight = {
  sm: '2rem', // 32px
  md: '4rem', // 64px
  lg: '8rem', // 128px
  xl: '12rem', // 192px
} as const;

export const sizing = {
  buttonHeight,
  iconSize,
  avatarSize,
  cardSize,
  maxContentWidth,
  controlSize,
  trackHeight,
  dialogSize,
  railWidth,
  imageHeight,
} as const;

export type Sizing = typeof sizing;
