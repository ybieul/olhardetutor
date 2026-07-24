/**
 * Design tokens — stacking order scale.
 */

export const zIndex = {
  base: '0',
  dropdown: '20',
  sticky: '30',
  overlay: '40',
  modal: '50',
  toast: '60',
  tour: '9999',
} as const;

export type ZIndex = typeof zIndex;
