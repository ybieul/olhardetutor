/**
 * Design tokens — public entry point.
 * Tailwind (tailwind.config.ts) and any component that needs a raw token
 * value (e.g. for a chart or a canvas) should import from here rather than
 * declaring visual values inline.
 */

export * from './colors';
export * from './typography';
export * from './spacing';
export * from './sizing';
export * from './radius';
export * from './shadows';
export * from './breakpoints';
export * from './zIndex';

import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { sizing } from './sizing';
import { radius } from './radius';
import { shadows } from './shadows';
import { breakpoints } from './breakpoints';
import { zIndex } from './zIndex';

export const theme = {
  colors,
  typography,
  spacing,
  sizing,
  radius,
  shadows,
  breakpoints,
  zIndex,
} as const;

export type Theme = typeof theme;
