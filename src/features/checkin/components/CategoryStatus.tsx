import { cn } from '@/lib/cn';
import { Checkbox } from '@/components/ui/Checkbox';

type StatusValue = 'normal' | 'different' | 'not_observed';

type CheckboxItem = {
  key: string;
  label: string;
  checked: boolean;
};

type CategoryStatusProps = {
  label: string;
  value: StatusValue;
  onChange: (value: StatusValue) => void;
  normalLabel: string;
  differentLabel: string;
  notObservedLabel: string;
  detailsTitle: string;
  items: CheckboxItem[];
  onItemChange: (key: string, checked: boolean) => void;
};

const BUTTON_BASE =
  'flex-1 rounded-md border py-8 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2';

const BUTTON_ACTIVE = 'border-primary-500 bg-primary-50 text-primary-700';
const BUTTON_IDLE = 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50';

/** Three-way status selector (Normal / Different / Not observed) with an optional details panel. */
export function CategoryStatus({
  label,
  value,
  onChange,
  normalLabel,
  differentLabel,
  notObservedLabel,
  detailsTitle,
  items,
  onItemChange,
}: CategoryStatusProps) {
  return (
    <div className="flex flex-col gap-8">
      <span className="text-sm font-medium text-foreground-light">{label}</span>
      <div role="radiogroup" aria-label={label} className="flex gap-8">
        {(
          [
            { val: 'normal' as const, lbl: normalLabel },
            { val: 'different' as const, lbl: differentLabel },
            { val: 'not_observed' as const, lbl: notObservedLabel },
          ] as const
        ).map(({ val, lbl }) => (
          <button
            key={val}
            type="button"
            role="radio"
            aria-checked={value === val}
            onClick={() => onChange(val)}
            className={cn(BUTTON_BASE, value === val ? BUTTON_ACTIVE : BUTTON_IDLE)}
          >
            {lbl}
          </button>
        ))}
      </div>

      {value === 'different' ? (
        <div className="rounded-md border border-neutral-200 bg-neutral-50 p-12">
          <p className="mb-8 text-xs font-semibold uppercase tracking-wide text-neutral-500">{detailsTitle}</p>
          <div className="flex flex-wrap gap-x-16 gap-y-8">
            {items.map((item) => (
              <Checkbox
                key={item.key}
                label={item.label}
                checked={item.checked}
                onChange={(e) => onItemChange(item.key, e.target.checked)}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
