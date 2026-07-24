import { Bell, BellOff, Bug, Calendar, ClipboardList, Pill, Stethoscope, Syringe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import type { HealthEvent } from '../types';
import { getEventStatus } from '../types';

const TYPE_ICON = {
  vaccine: Syringe,
  deworming: Pill,
  flea: Bug,
  consultation: Stethoscope,
  medication: ClipboardList,
} as const;

type EventCardProps = {
  event: HealthEvent;
  onEdit: () => void;
  onToggleReminder: () => void;
};

export function EventCard({ event, onEdit, onToggleReminder }: EventCardProps) {
  const { t } = useTranslation('agenda');

  const status = getEventStatus(event.next_date);
  const TypeIcon = TYPE_ICON[event.type] ?? Calendar;

  const statusBadge: { label: string; className: string } | null =
    status === 'expired'
      ? { label: t('status.expired'), className: 'bg-danger-100 text-danger-700' }
      : status === 'soon'
        ? { label: t('status.soon'), className: 'bg-warning-100 text-warning-700' }
        : null;

  const borderClass =
    status === 'expired'
      ? 'border-l-4 border-l-danger-400'
      : status === 'soon'
        ? 'border-l-4 border-l-warning-400'
        : '';

  return (
    <button type="button" onClick={onEdit} className="w-full text-left">
      <Card padding="md" shadow="sm" className={cn('transition-shadow hover:shadow-md', borderClass)}>
        <div className="flex items-start gap-12">
          <div className="mt-2 flex h-36 w-36 flex-shrink-0 items-center justify-center rounded-full bg-primary-50">
            <Icon icon={TypeIcon} size="sm" color="primary" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-8">
              <p className="font-semibold text-foreground">{t(`types.${event.type}`)}</p>
              {statusBadge ? (
                <span className={cn('rounded-full px-8 py-2 text-xs font-medium', statusBadge.className)}>
                  {statusBadge.label}
                </span>
              ) : null}
            </div>

            <p className="mt-2 text-sm text-neutral-500">{event.date}</p>

            {event.next_date ? (
              <p className="mt-2 text-sm text-neutral-400">
                {t('form.nextDate').replace(' (opcional)', '').replace(' (optional)', '')}: {event.next_date}
              </p>
            ) : null}

            {event.description ? (
              <p className="mt-4 line-clamp-2 text-sm text-neutral-600">{event.description}</p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleReminder();
            }}
            className="mt-2 flex-shrink-0 rounded-full p-8 text-neutral-400 hover:bg-neutral-100 hover:text-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            aria-label={t('form.reminder')}
          >
            <Icon icon={event.reminder_enabled ? Bell : BellOff} size="sm" color={event.reminder_enabled ? 'primary' : 'neutral'} />
          </button>
        </div>
      </Card>
    </button>
  );
}
