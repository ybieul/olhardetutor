import type { Options, PartialDeep, Styles } from 'react-joyride';

import { colors } from '@/config/theme/colors';
import { radius } from '@/config/theme/radius';
import { shadows } from '@/config/theme/shadows';
import { zIndex } from '@/config/theme/zIndex';

export function buildTourStyles(): PartialDeep<Styles> {
  return {
    tooltip: {
      borderRadius: radius.lg,
      boxShadow: shadows.xl,
      padding: '1.25rem',
    },
    tooltipTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      color: colors.neutral[900],
      marginBottom: '0.5rem',
    },
    tooltipContent: {
      fontSize: '0.875rem',
      lineHeight: '1.5',
      color: colors.neutral[600],
      padding: 0,
    },
    buttonPrimary: {
      // Dark text on primary-500 measures 7.18:1 — white on the same
      // background measures 2.38:1, well under the WCAG 1.4.3 minimum of
      // 4.5:1. Same fix as the primary Button variant (Button.tsx), which
      // this tooltip reproduces manually instead of reusing.
      backgroundColor: colors.primary[500],
      borderRadius: radius.md,
      color: colors.neutral[900],
      fontSize: '0.875rem',
      padding: '0.5rem 1rem',
      outline: 'none',
    },
    buttonBack: {
      color: colors.neutral[600],
      fontSize: '0.875rem',
      marginRight: '0.5rem',
    },
    buttonSkip: {
      color: colors.neutral[400],
      fontSize: '0.75rem',
    },
  };
}

export function buildTourOptions(): Partial<Options> {
  return {
    skipBeacon: true,
    showProgress: true,
    buttons: ['back', 'skip', 'primary'],
    overlayClickAction: false,
    scrollOffset: 96,
    spotlightPadding: 6,
    primaryColor: colors.primary[500],
    backgroundColor: colors.white,
    overlayColor: colors.tour.overlay,
    textColor: colors.neutral[900],
    arrowColor: colors.white,
    zIndex: Number(zIndex.tour),
  };
}
