import { Cat, Dog } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { SegmentedControl } from '@/components/ui/SegmentedControl';
import type { PetSpeciesKey } from '@/config/app.config';
import { useOnboardingStore } from '@/features/onboarding/store/useOnboardingStore';

type StepSpeciesProps = {
  error?: string;
};

export function StepSpecies({ error }: StepSpeciesProps) {
  const { t } = useTranslation('onboarding');
  const species = useOnboardingStore((state) => state.data.species);
  const updateData = useOnboardingStore((state) => state.updateData);

  return (
    <div className="flex flex-col gap-24">
      <div className="flex flex-col gap-8 text-center">
        <h1 className="text-2xl font-semibold text-foreground-light">{t('species.title')}</h1>
        <p className="text-base text-neutral-600">{t('species.subtitle')}</p>
      </div>
      <SegmentedControl<PetSpeciesKey>
        label={t('species.title')}
        size="lg"
        value={species}
        onChange={(value) => updateData({ species: value })}
        options={[
          { value: 'dog', label: t('species.dog'), icon: Dog },
          { value: 'cat', label: t('species.cat'), icon: Cat },
        ]}
      />
      {error ? (
        <p role="alert" className="text-center text-sm text-danger-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
