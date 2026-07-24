import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { TourOverlay } from '@/components/tutorial/TourOverlay';
import { useHealthEvents } from '../hooks/useHealthEvents';
import { EventCard } from '../components/EventCard';
import { EventForm } from '../components/EventForm';
import type { HealthEvent } from '../types';

export function AgendaPage() {
  const { t } = useTranslation('agenda');
  const { events, petId, loading, saveEvent, removeEvent, toggleReminder } = useHealthEvents();

  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<HealthEvent | undefined>(undefined);

  function openAdd() {
    setEditingEvent(undefined);
    setShowForm(true);
  }

  function openEdit(event: HealthEvent) {
    setEditingEvent(event);
    setShowForm(true);
  }

  function handleClose() {
    setShowForm(false);
    setEditingEvent(undefined);
  }

  return (
    <div className="flex flex-col gap-16">
      <TourOverlay tourId="agenda" />

      <div data-tour="agenda-header" className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">{t('title')}</h1>
        <span data-tour="agenda-add-btn">
          <Button variant="primary" size="sm" icon={Plus} onClick={openAdd}>
            {t('addEvent')}
          </Button>
        </span>
      </div>

      {loading ? (
        <div className="flex flex-col gap-10">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center gap-8 py-48 text-center">
          <p className="font-semibold text-neutral-600">{t('empty')}</p>
          <p className="text-sm text-neutral-400">{t('emptyHint')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onEdit={() => openEdit(event)}
              onToggleReminder={() => void toggleReminder(event)}
            />
          ))}
        </div>
      )}

      {petId && (
        <EventForm
          open={showForm}
          petId={petId}
          event={editingEvent}
          onClose={handleClose}
          onSave={saveEvent}
          onDelete={editingEvent ? removeEvent : undefined}
        />
      )}
    </div>
  );
}
