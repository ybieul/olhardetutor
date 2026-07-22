import { useId } from 'react';

type RadioOption = {
  value: string;
  label: string;
};

type RadioGroupProps = {
  label: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
};

export function RadioGroup({ label, options, value, onChange }: RadioGroupProps) {
  const name = useId();

  return (
    <fieldset className="flex flex-col gap-8">
      <legend className="mb-4 text-sm font-medium text-foreground-light">{label}</legend>
      {options.map((option) => (
        <label key={option.value} className="flex cursor-pointer items-center gap-8">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={option.value === value}
            onChange={() => onChange(option.value)}
            className="h-control-md w-control-md shrink-0 border-neutral-300 text-primary-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          />
          <span className="text-base text-foreground-light">{option.label}</span>
        </label>
      ))}
    </fieldset>
  );
}
