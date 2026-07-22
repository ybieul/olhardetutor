import { useId } from 'react';

import { cn } from '@/lib/cn';

type SliderMark = {
  value: number;
  label: string;
};

type SliderProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  /** One mark per selectable step, e.g. 5 entries for a 1–5 scale. */
  marks: SliderMark[];
  id?: string;
};

/**
 * Discrete 1–N scale slider used for the pet check-in. The scale is
 * bidirectional: the middle mark is treated as "normal" and highlighted,
 * while the marks on either side represent divergence in each direction.
 */
export function Slider({ label, value, onChange, marks, id }: SliderProps) {
  const generatedId = useId();
  const sliderId = id ?? generatedId;
  const values = marks.map((mark) => mark.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const center = min + Math.round((max - min) / 2);

  return (
    <div className="flex flex-col gap-8">
      <label htmlFor={sliderId} className="text-sm font-medium text-foreground-light">
        {label}
      </label>
      <input
        id={sliderId}
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-track-md w-full cursor-pointer appearance-none rounded-full bg-neutral-200 accent-primary-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
      />
      <div className="flex justify-between">
        {marks.map((mark) => {
          const isSelected = mark.value === value;
          const isCenter = mark.value === center;
          return (
            <span key={mark.value} className="flex flex-col items-center gap-4">
              <span
                aria-hidden="true"
                className={cn('h-8 w-2 rounded-full', isCenter ? 'bg-success-400' : 'bg-neutral-300')}
              />
              <span
                className={cn(
                  'text-xs',
                  isSelected ? 'font-semibold text-primary-600' : isCenter ? 'text-success-600' : 'text-neutral-500',
                )}
              >
                {mark.label}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
