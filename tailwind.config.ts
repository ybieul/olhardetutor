import type { Config } from 'tailwindcss';
import { colors, typography, spacing, radius, shadows, breakpoints, sizing } from './src/config/theme';

/**
 * Tailwind reads every scale from src/config/theme/ — colors, type scale,
 * spacing, radius, shadows and breakpoints are defined once there and
 * never duplicated here. This is a full `theme` override (not `extend`)
 * for those keys so Tailwind's stock palette/scale can't be reached by
 * accident — see CLAUDE.md, "Proibido hardcoding de valor visual".
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    colors,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize,
    fontWeight: typography.fontWeight,
    lineHeight: typography.lineHeight,
    spacing,
    borderRadius: radius,
    boxShadow: shadows,
    screens: breakpoints,
    extend: {
      height: {
        'btn-sm': sizing.buttonHeight.sm,
        'btn-md': sizing.buttonHeight.md,
        'btn-lg': sizing.buttonHeight.lg,
        'icon-sm': sizing.iconSize.sm,
        'icon-md': sizing.iconSize.md,
        'icon-lg': sizing.iconSize.lg,
        'icon-xl': sizing.iconSize.xl,
        'avatar-sm': sizing.avatarSize.sm,
        'avatar-md': sizing.avatarSize.md,
        'avatar-lg': sizing.avatarSize.lg,
        'avatar-xl': sizing.avatarSize.xl,
      },
      width: {
        'icon-sm': sizing.iconSize.sm,
        'icon-md': sizing.iconSize.md,
        'icon-lg': sizing.iconSize.lg,
        'icon-xl': sizing.iconSize.xl,
        'avatar-sm': sizing.avatarSize.sm,
        'avatar-md': sizing.avatarSize.md,
        'avatar-lg': sizing.avatarSize.lg,
        'avatar-xl': sizing.avatarSize.xl,
        'card-sm': sizing.cardSize.sm,
        'card-md': sizing.cardSize.md,
        'card-lg': sizing.cardSize.lg,
      },
      maxWidth: {
        content: sizing.maxContentWidth,
      },
    },
  },
  plugins: [],
} satisfies Config;
