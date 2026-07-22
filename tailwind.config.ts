import type { Config } from 'tailwindcss';
import { colors, typography, spacing, radius, shadows, breakpoints, sizing, zIndex } from './src/config/theme';

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
    zIndex,
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
        'control-sm': sizing.controlSize.sm,
        'control-md': sizing.controlSize.md,
        'control-lg': sizing.controlSize.lg,
        'track-sm': sizing.trackHeight.sm,
        'track-md': sizing.trackHeight.md,
        'track-lg': sizing.trackHeight.lg,
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
        'control-sm': sizing.controlSize.sm,
        'control-md': sizing.controlSize.md,
        'control-lg': sizing.controlSize.lg,
        rail: sizing.railWidth,
      },
      maxWidth: {
        content: sizing.maxContentWidth,
        modal: sizing.dialogSize.modalMaxWidth,
        sheet: sizing.dialogSize.sheetMaxWidth,
      },
      maxHeight: {
        modal: sizing.dialogSize.maxHeight,
      },
    },
  },
  plugins: [],
} satisfies Config;
