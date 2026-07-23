import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/cn';
import { Icon } from '@/components/ui/Icon';

type SegmentedControlOption<T extends string> = {
  value: T;
  label: string;
  icon?: LucideIcon;
};

type SegmentedControlSize = 'md' | 'lg';

type SegmentedControlProps<T extends string> = {
  /** Accessible group label — not visually rendered. */
  label: string;
  options: SegmentedControlOption<T>[];
  /** null when nothing is selected yet — every option renders unselected. */
  value: T | null;
  onChange: (value: T) => void;
  size?: SegmentedControlSize;
};

const BUTTON_SIZE_CLASSES: Record<SegmentedControlSize, string> = {
  md: 'gap-4 rounded-sm px-16 py-8 text-sm',
  lg: 'flex-1 flex-col gap-8 rounded-md px-24 py-24 text-base',
};

const ICON_SIZE_BY_SEGMENT_SIZE: Record<SegmentedControlSize, 'sm' | 'lg'> = {
  md: 'sm',
  lg: 'lg',
};

/** Mutually-exclusive option toggle, e.g. Dog/Cat. */
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  size = 'md',
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn('flex gap-4 rounded-md bg-neutral-100 p-4', size === 'md' && 'inline-flex')}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
              BUTTON_SIZE_CLASSES[size],
              selected ? 'bg-white text-primary-700 shadow-sm' : 'text-neutral-600 hover:text-neutral-900',
            )}
          >
            {option.icon ? (
              <Icon
                icon={option.icon}
                size={ICON_SIZE_BY_SEGMENT_SIZE[size]}
                color={selected ? 'primary' : 'neutral'}
              />
            ) : null}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
