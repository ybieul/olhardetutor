import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { ROUTES } from '@/config/routes.config';
import { useOnboardingStore } from '@/features/onboarding/store/useOnboardingStore';
import { StepSpecies } from '@/features/onboarding/components/StepSpecies';
import { StepLifeStage } from '@/features/onboarding/components/StepLifeStage';
import { StepProfile } from '@/features/onboarding/components/StepProfile';
import { StepBaseline } from '@/features/onboarding/components/StepBaseline';
import { computeBirthDate, validateProfileStep } from '@/features/onboarding/lib/petProfileHelpers';
import { upsertPet } from '@/lib/supabase/queries/pets';
import { addWeightEntry } from '@/lib/supabase/queries/weightHistory';
import { updateProfile } from '@/lib/supabase/queries/profiles';

const TOTAL_STEPS = 4;

/**
 * 4-step onboarding container: owns navigation between steps and the
 * final Supabase write. All collected data lives in useOnboardingStore
 * (persisted), so this component itself holds no form state — only
 * transient UI state (validation display, submit status). See
 * docs/ONBOARDING.md.
 */
export function OnboardingPage() {
  const { t } = useTranslation('onboarding');
  const navigate = useNavigate();

  const step = useOnboardingStore((state) => state.step);
  const data = useOnboardingStore((state) => state.data);
  const nextStep = useOnboardingStore((state) => state.nextStep);
  const previousStep = useOnboardingStore((state) => state.previousStep);
  const reset = useOnboardingStore((state) => state.reset);

  const [showValidation, setShowValidation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const profileErrors = validateProfileStep(data);

  function handleBack() {
    setShowValidation(false);
    previousStep();
  }

  function handleContinue() {
    if (step === 1 && !data.species) {
      setShowValidation(true);
      return;
    }
    if (step === 2 && !data.lifeStage) {
      setShowValidation(true);
      return;
    }
    if (step === 3 && Object.keys(profileErrors).length > 0) {
      setShowValidation(true);
      return;
    }
    setShowValidation(false);
    nextStep();
  }

  async function handleFinish() {
    if (!data.species || !data.lifeStage) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const weightKg = Number(data.weightKg);
      const pet = await upsertPet({
        name: data.name.trim(),
        species: data.species,
        life_stage: data.lifeStage,
        breed: data.breedUnknown ? null : data.breed.trim() || null,
        birth_date: computeBirthDate(data),
        initial_weight: weightKg,
        photo_url: data.photoPath,
      });

      const today = new Date().toISOString().slice(0, 10);
      // Best-effort: the pet already exists at this point, which is what
      // PetGate checks — a hiccup seeding the first weight point or
      // flipping onboarding_completed shouldn't trap the tutor in a retry
      // loop over a secondary side effect.
      await Promise.allSettled([
        addWeightEntry({ pet_id: pet.id, date: today, weight_kg: weightKg }),
        updateProfile({ onboarding_completed: true }),
      ]);

      reset();
      navigate(ROUTES.home, { replace: true });
    } catch {
      setSubmitError(t('baseline.submitError'));
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-svh flex-col bg-background-light px-16 py-24">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <div className="mb-16 flex justify-end">
          <LanguageSwitcher />
        </div>
        <ProgressBar
          value={(step / TOTAL_STEPS) * 100}
          label={t('progress.label', { current: step, total: TOTAL_STEPS })}
        />

        <div className="mt-32 flex-1">
          {step === 1 ? <StepSpecies error={showValidation && !data.species ? t('species.error') : undefined} /> : null}
          {step === 2 ? (
            <StepLifeStage error={showValidation && !data.lifeStage ? t('lifeStage.error') : undefined} />
          ) : null}
          {step === 3 ? <StepProfile errors={showValidation ? profileErrors : {}} /> : null}
          {step === 4 ? <StepBaseline /> : null}
        </div>

        {submitError ? (
          <p role="alert" className="mt-16 text-center text-sm text-danger-600">
            {submitError}
          </p>
        ) : null}

        <div className="mt-32 flex gap-12">
          {step > 1 ? (
            <Button variant="secondary" onClick={handleBack} disabled={submitting}>
              {t('nav.back')}
            </Button>
          ) : null}
          {step < TOTAL_STEPS ? (
            <Button fullWidth onClick={handleContinue}>
              {t('nav.continue')}
            </Button>
          ) : (
            <Button fullWidth loading={submitting} onClick={handleFinish}>
              {t('nav.finish')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
