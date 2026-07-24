import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Icon } from '@/components/ui/Icon';
import { TourOverlay } from '@/components/tutorial/TourOverlay';
import { upsertCheckin, type Checkin } from '@/lib/supabase/queries/checkins';
import { computeDayScore, deriveStoolStatus, deriveUrineStatus } from '../scoring';
import { useCheckin } from '../hooks/useCheckin';
import { useCheckinFormStore } from '../store/useCheckinFormStore';
import { CheckinForm } from '../components/CheckinForm';
import { CheckinSummary } from '../components/CheckinSummary';

export function CheckinPage() {
  const { t } = useTranslation('checkin');
  const { pet, todayCheckin, history, loading, error } = useCheckin();

  const form = useCheckinFormStore((s) => s.form);
  const reset = useCheckinFormStore((s) => s.reset);

  // Local overrides set after a successful save
  const [savedCheckin, setSavedCheckin] = useState<Checkin | null>(null);
  const [savedHistory, setSavedHistory] = useState<Checkin[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const activeCheckin = savedCheckin ?? (todayCheckin === undefined ? undefined : todayCheckin);
  const activeHistory = savedHistory ?? history;

  async function handleSave() {
    if (!pet) return;
    setSaving(true);
    setSaveError(null);

    try {
      const today = new Date().toISOString().slice(0, 10);
      const dayScore = computeDayScore(form);

      const saved = await upsertCheckin({
        pet_id: pet.id,
        date: today,
        feeding: form.feeding,
        water: form.water,
        sleep: form.sleep,
        activity: form.activity,
        stool_status: deriveStoolStatus(form.stoolStatus, form.stoolDetails),
        stool_details: form.stoolDetails as Record<string, boolean>,
        urine_status: deriveUrineStatus(form.urineStatus, form.urineDetails),
        urine_details: form.urineDetails as Record<string, boolean>,
        behavior: form.behavior,
        free_note: form.freeNote || null,
        day_score: dayScore,
      });

      const updated = [saved, ...history.filter((c) => c.date !== saved.date)];
      setSavedCheckin(saved);
      setSavedHistory(updated);
      reset();
    } catch {
      setSaveError(t('errors.save'));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-12">
        <Skeleton className="h-8 w-32 rounded" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-8 py-32 text-center">
        <Icon icon={AlertCircle} size="lg" color="danger" />
        <p className="text-sm text-danger-600">{t('errors.load')}</p>
      </div>
    );
  }

  const petName = pet?.name ?? '';

  if (activeCheckin) {
    return (
      <div className="flex flex-col gap-16">
        <div>
          <h1 className="text-xl font-semibold text-foreground-light">{t('summary.title')}</h1>
          {activeCheckin === todayCheckin ? (
            <p className="mt-2 text-sm text-neutral-500">{t('alreadyDone.subtitle', { name: petName })}</p>
          ) : null}
        </div>
        <CheckinSummary checkin={activeCheckin} history={activeHistory} petName={petName} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-16 pb-24">
      <TourOverlay tourId="checkin" />

      {/* Header */}
      <div data-tour="checkin-header">
        <h1 className="text-xl font-semibold text-foreground-light">{t('title')}</h1>
        <p className="mt-2 text-sm text-neutral-500">{t('subtitle', { name: petName })}</p>
      </div>

      {/* Disclaimer — visible at the start of the form */}
      <div className="rounded-md border border-primary-200 bg-primary-50 px-12 py-8">
        <p className="text-xs text-primary-700">{t('disclaimer')}</p>
      </div>

      <CheckinForm />

      {saveError ? (
        <p role="alert" className="text-center text-sm text-danger-600">
          {saveError}
        </p>
      ) : null}

      <div data-tour="checkin-submit">
        <Button fullWidth loading={saving} onClick={handleSave}>
          {saving ? t('saving') : t('submit')}
        </Button>
      </div>
    </div>
  );
}
