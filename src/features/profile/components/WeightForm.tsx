import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';

type WeightFormProps = {
  open: boolean;
  onClose: () => void;
  onSave: (date: string, weightKg: number) => Promise<void>;
};

type FormErrors = {
  weight?: string;
  date?: string;
};

function todayIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function WeightForm({ open, onClose, onSave }: WeightFormProps) {
  const { t } = useTranslation('profile');
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(todayIso);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  function validate(): boolean {
    const next: FormErrors = {};
    if (!weight) {
      next.weight = t('weight.form.errors.weightRequired');
    } else if (isNaN(Number(weight)) || Number(weight) <= 0) {
      next.weight = t('weight.form.errors.weightInvalid');
    }
    if (!date) next.date = t('weight.form.errors.dateRequired');
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave(date, Number(weight));
      setWeight('');
      setDate(todayIso());
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={t('weight.form.title')} closeLabel={t('weight.form.close')}>
      <div className="flex flex-col gap-16">
        <Input
          label={t('weight.form.weight')}
          type="number"
          inputMode="decimal"
          min="0.1"
          step="0.1"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          error={errors.weight}
        />
        <Input
          label={t('weight.form.date')}
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          error={errors.date}
        />
        <div className="flex flex-col gap-8 pt-8">
          <Button variant="primary" fullWidth loading={saving} onClick={() => void handleSave()}>
            {t('weight.form.save')}
          </Button>
          <Button variant="ghost" fullWidth onClick={onClose}>
            {t('weight.form.cancel')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
