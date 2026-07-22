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

export const sizing = {
  buttonHeight,
  iconSize,
  avatarSize,
  cardSize,
  maxContentWidth,
} as const;

export type Sizing = typeof sizing;
