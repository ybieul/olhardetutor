import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/cn';
import { Icon } from '@/components/ui/Icon';

type SegmentedControlOption<T extends string> = {
  value: T;
  label: string;
  icon?: LucideIcon;
};

type SegmentedControlProps<T extends string> = {
  /** Accessible group label — not visually rendered. */
  label: string;
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

/** Mutually-exclusive option toggle, e.g. Dog/Cat. */
export function SegmentedControl<T extends string>({ label, options, value, onChange }: SegmentedControlProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex gap-4 rounded-md bg-neutral-100 p-4">
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
              'flex items-center gap-4 rounded-sm px-16 py-8 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
              selected ? 'bg-white text-primary-700 shadow-sm' : 'text-neutral-600 hover:text-neutral-900',
            )}
          >
            {option.icon ? <Icon icon={option.icon} size="sm" color={selected ? 'primary' : 'neutral'} /> : null}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
