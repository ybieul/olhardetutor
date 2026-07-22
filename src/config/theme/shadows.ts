/**
 * Design tokens — box shadow scale.
 */

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(26, 26, 46, 0.06)',
  md: '0 4px 6px -1px rgba(26, 26, 46, 0.1), 0 2px 4px -2px rgba(26, 26, 46, 0.08)',
  lg: '0 10px 15px -3px rgba(26, 26, 46, 0.1), 0 4px 6px -4px rgba(26, 26, 46, 0.08)',
  xl: '0 20px 25px -5px rgba(26, 26, 46, 0.12), 0 8px 10px -6px rgba(26, 26, 46, 0.08)',
} as const;

export type Shadows = typeof shadows;
