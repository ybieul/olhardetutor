import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { TextArea } from '@/components/ui/TextArea';
import { sanitizeFreeText } from '@/lib/security/sanitize';
import type { HealthEvent } from '../types';

const EVENT_TYPES = ['vaccine', 'deworming', 'flea', 'consultation', 'medication'] as const;
type EventType = (typeof EVENT_TYPES)[number];

type EventFormProps = {
  open: boolean;
  petId: string;
  event?: HealthEvent;
  onClose: () => void;
  onSave: (input: {
    id?: string;
    pet_id: string;
    type: EventType;
    date: string;
    description: string | null;
    next_date: string | null;
    reminder_enabled: boolean;
  }) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
};

type FormErrors = {
  type?: string;
  date?: string;
};

export function EventForm({ open, petId, event, onClose, onSave, onDelete }: EventFormProps) {
  const { t } = useTranslation('agenda');

  const [type, setType] = useState<EventType>(event?.type ?? 'vaccine');
  const [date, setDate] = useState(event?.date ?? '');
  const [nextDate, setNextDate] = useState(event?.next_date ?? '');
  const [description, setDescription] = useState(event?.description ?? '');
  const [reminderEnabled, setReminderEnabled] = useState(event?.reminder_enabled ?? false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function validate(): boolean {
    const next: FormErrors = {};
    if (!type) next.type = t('form.errors.typeRequired');
    if (!date) next.date = t('form.errors.dateRequired');
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave({
        id: event?.id,
        pet_id: petId,
        type,
        date,
        description: description ? sanitizeFreeText(description) : null,
        next_date: nextDate || null,
        reminder_enabled: reminderEnabled,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!event || !onDelete) return;
    setDeleting(true);
    try {
      await onDelete(event.id);
      onClose();
    } finally {
      setDeleting(false);
    }
  }

  const title = event ? t('form.titleEdit') : t('form.titleAdd');

  return (
    <Modal open={open} onClose={onClose} title={title} closeLabel={t('close')}>
      {confirmingDelete ? (
        <div className="flex flex-col gap-16">
          <p className="font-semibold text-foreground">{t('form.confirmDelete')}</p>
          <p className="text-sm text-neutral-600">{t('form.confirmDeleteHint')}</p>
          <div className="flex gap-8 pt-8">
            <Button variant="ghost" fullWidth onClick={() => setConfirmingDelete(false)}>
              {t('form.cancel')}
            </Button>
            <Button variant="danger" fullWidth loading={deleting} onClick={() => void handleDelete()}>
              {t('form.confirmDeleteYes')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-16">
          <div className="flex flex-col gap-4">
            <label className="text-sm font-medium text-foreground-light">{t('form.type')}</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as EventType)}
              className="h-btn-md rounded-md border border-neutral-300 bg-white px-12 text-base text-foreground-light focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              {EVENT_TYPES.map((et) => (
                <option key={et} value={et}>
                  {t(`types.${et}`)}
                </option>
              ))}
            </select>
            {errors.type ? <p role="alert" className="text-sm text-danger-600">{errors.type}</p> : null}
          </div>

          <Input
            label={t('form.date')}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            error={errors.date}
          />

          <Input
            label={t('form.nextDate')}
            type="date"
            value={nextDate}
            onChange={(e) => setNextDate(e.target.value)}
          />

          <TextArea
            label={t('form.description')}
            value={description}
            rows={3}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Checkbox
            label={t('form.reminder')}
            checked={reminderEnabled}
            onChange={(e) => setReminderEnabled(e.target.checked)}
          />

          <div className="flex flex-col gap-8 pt-8">
            <Button variant="primary" fullWidth loading={saving} onClick={() => void handleSave()}>
              {t('form.save')}
            </Button>
            {event && onDelete ? (
              <Button variant="danger" fullWidth onClick={() => setConfirmingDelete(true)}>
                {t('form.delete')}
              </Button>
            ) : null}
            <Button variant="ghost" fullWidth onClick={onClose}>
              {t('form.cancel')}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
