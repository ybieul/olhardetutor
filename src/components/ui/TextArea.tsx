import { useId, type TextareaHTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
  helperText?: string;
};

/** Multi-line text input with label, error and helper-text states. */
export function TextArea({ label, error, helperText, id, className, rows = 4, ...rest }: TextAreaProps) {
  const generatedId = useId();
  const textAreaId = id ?? generatedId;
  const errorId = `${textAreaId}-error`;
  const helperId = `${textAreaId}-helper`;

  return (
    <div className="flex flex-col gap-4">
      <label htmlFor={textAreaId} className="text-sm font-medium text-foreground-light">
        {label}
      </label>
      <textarea
        id={textAreaId}
        rows={rows}
        aria-invalid={!!error || undefined}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        className={cn(
          'resize-y rounded-md border bg-white px-12 py-8 text-base text-foreground-light placeholder:text-neutral-400',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
          error ? 'border-danger-500' : 'border-neutral-300',
          className,
        )}
        {...rest}
      />
      {error ? (
        <p id={errorId} role="alert" className="text-sm text-danger-600">
          {error}
        </p>
      ) : helperText ? (
        <p id={helperId} className="text-sm text-neutral-500">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
