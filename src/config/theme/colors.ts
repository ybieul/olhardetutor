/**
 * Design tokens — color palette.
 * Single source of truth for every color used in the app. Nothing outside
 * this file (or the other files in src/config/theme/) should contain a raw
 * hex/rgb value.
 */

export type ColorScale = {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  DEFAULT: string;
};

const primary: ColorScale = {
  50: '#FFF8EC',
  100: '#FEEACB',
  200: '#FDD79A',
  300: '#FBBE61',
  400: '#F7A730',
  500: '#F4900C',
  600: '#D97706',
  700: '#B45F04',
  800: '#8A4A08',
  900: '#6B3908',
  DEFAULT: '#F4900C',
};

const neutral: ColorScale = {
  50: '#F8F8FA',
  100: '#F0F0F3',
  200: '#E2E2E8',
  300: '#C9C9D4',
  400: '#A6A6B8',
  500: '#82829A',
  600: '#61617A',
  700: '#47475C',
  800: '#2E2E42',
  900: '#1A1A2E',
  DEFAULT: '#82829A',
};

const success: ColorScale = {
  50: '#EDFBF0',
  100: '#D3F5DC',
  200: '#A8EBBB',
  300: '#74DA96',
  400: '#45C171',
  500: '#22A155',
  600: '#158043',
  700: '#106538',
  800: '#0F502E',
  900: '#0D4227',
  DEFAULT: '#22A155',
};

const warning: ColorScale = {
  50: '#FFFAEB',
  100: '#FFF1C2',
  200: '#FFE188',
  300: '#FFCB4D',
  400: '#FFB224',
  500: '#F59E0B',
  600: '#D3810A',
  700: '#A8630B',
  800: '#7C4A10',
  900: '#5C3910',
  DEFAULT: '#F59E0B',
};

const danger: ColorScale = {
  50: '#FEF2F2',
  100: '#FDDEDE',
  200: '#FBC0C0',
  300: '#F79191',
  400: '#F16060',
  500: '#E23B3B',
  600: '#C22626',
  700: '#9E1F1F',
  800: '#7A1919',
  900: '#5C1414',
  DEFAULT: '#E23B3B',
};

/** Base app surfaces — used to support future light/dark theming. */
const background = {
  light: '#FDF6EC',
  dark: '#1A1A2E',
} as const;

/** Text/ink color, inverse of the surface it sits on. */
const foreground = {
  light: '#1A1A2E',
  dark: '#FDF6EC',
} as const;

export const colors = {
  primary,
  neutral,
  success,
  warning,
  danger,
  background,
  foreground,
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export type Colors = typeof colors;
