import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/cn';
import { LIFE_STAGE_AGE_RANGES_MONTHS, type PetLifeStageKey, type PetSpeciesKey } from '@/config/app.config';
import { useOnboardingStore } from '@/features/onboarding/store/useOnboardingStore';

const LIFE_STAGES: PetLifeStageKey[] = ['puppy', 'adult', 'senior'];

/** Puppy/kitten range reads naturally in months; adult/senior read better in years. */
function formatAgeRange(species: PetSpeciesKey, stage: PetLifeStageKey, t: TFunction<'onboarding'>): string {
  const range = LIFE_STAGE_AGE_RANGES_MONTHS[species][stage];
  const useYears = range.min >= 12;

  if (useYears) {
    const min = Math.round(range.min / 12);
    if (range.max === null) return t('lifeStage.ageRangeYearsOpenEnded', { min });
    return t('lifeStage.ageRangeYears', { min, max: Math.round(range.max / 12) });
  }

  if (range.max === null) return t('lifeStage.ageRangeMonthsOpenEnded', { min: range.min });
  return t('lifeStage.ageRangeMonths', { min: range.min, max: range.max });
}

type StepLifeStageProps = {
  error?: string;
};

export function StepLifeStage({ error }: StepLifeStageProps) {
  const { t } = useTranslation('onboarding');
  const species = useOnboardingStore((state) => state.data.species);
  const lifeStage = useOnboardingStore((state) => state.data.lifeStage);
  const updateData = useOnboardingStore((state) => state.updateData);

  // Step 1 is validated before this step is reachable, so species is
  // always set in practice; the fallback just keeps this render-safe.
  const resolvedSpecies: PetSpeciesKey = species ?? 'dog';

  return (
    <div className="flex flex-col gap-24">
      <div className="flex flex-col gap-8 text-center">
        <h1 className="text-2xl font-semibold text-foreground-light">{t('lifeStage.title')}</h1>
        <p className="text-base text-neutral-600">{t('lifeStage.subtitle')}</p>
      </div>
      <div role="radiogroup" aria-label={t('lifeStage.title')} className="flex flex-col gap-12">
        {LIFE_STAGES.map((stage) => {
          const selected = lifeStage === stage;
          return (
            <Card
              key={stage}
              padding="md"
              shadow="none"
              role="radio"
              aria-checked={selected}
              tabIndex={0}
              onClick={() => updateData({ lifeStage: stage })}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  updateData({ lifeStage: stage });
                }
              }}
              className={cn(
                'cursor-pointer border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                selected ? 'border-primary-500 bg-primary-50' : 'border-neutral-200 hover:border-neutral-300',
              )}
            >
              <div className="flex items-center justify-between gap-8">
                <span className="text-base font-semibold text-foreground-light">
                  {t(`lifeStage.options.${stage}.label`)}
                </span>
                <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                  {formatAgeRange(resolvedSpecies, stage, t)}
                </span>
              </div>
              <p className="mt-4 text-sm text-neutral-600">{t(`lifeStage.options.${stage}.description`)}</p>
            </Card>
          );
        })}
      </div>
      {error ? (
        <p role="alert" className="text-center text-sm text-danger-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
