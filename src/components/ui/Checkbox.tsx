import { useId, type InputHTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string;
};

export function Checkbox({ label, id, className, ...rest }: CheckboxProps) {
  const generatedId = useId();
  const checkboxId = id ?? generatedId;

  return (
    <label htmlFor={checkboxId} className="flex cursor-pointer items-center gap-8">
      <input
        id={checkboxId}
        type="checkbox"
        className={cn(
          'h-control-md w-control-md shrink-0 rounded-sm border-neutral-300 text-primary-500',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
          className,
        )}
        {...rest}
      />
      <span className="text-base text-foreground-light">{label}</span>
    </label>
  );
}
