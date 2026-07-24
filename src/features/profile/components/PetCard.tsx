import { useTranslation } from 'react-i18next';

import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import type { PetSpeciesKey } from '@/config/app.config';
import type { Pet } from '@/lib/supabase/queries/pets';

type PetCardProps = {
  pet: Pet;
  photoUrl: string | null;
};

function calcAgeMonths(birthDate: string): number {
  const birth = new Date(`${birthDate}T00:00:00`);
  const now = new Date();
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  const dayAdjust = now.getDate() < birth.getDate() ? -1 : 0;
  return Math.max(0, months + dayAdjust);
}

export function PetCard({ pet, photoUrl }: PetCardProps) {
  const { t } = useTranslation('profile');

  const totalMonths = pet.birth_date ? calcAgeMonths(pet.birth_date) : null;

  let ageLabel = '';
  if (totalMonths !== null) {
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
    if (years === 0) {
      ageLabel = t('pet.ageMonths', { count: totalMonths });
    } else if (months === 0) {
      ageLabel = t('pet.ageYears', { count: years });
    } else {
      ageLabel = t('pet.ageYearsMonths', { years, months, count: months });
    }
  }

  const speciesLabel = pet.species ? t(`pet.species.${pet.species as PetSpeciesKey}`) : '';

  return (
    <Card padding="md" shadow="sm">
      <div className="flex items-center gap-16">
        <Avatar
          src={photoUrl ?? undefined}
          alt={pet.name ?? t('pet.noPhoto')}
          size="xl"
        />
        <div className="min-w-0 flex-1">
          <p className="text-xl font-bold text-foreground">{pet.name ?? t('pet.noName')}</p>
          {speciesLabel ? <p className="text-sm text-neutral-500">{speciesLabel}</p> : null}
          {pet.breed ? <p className="text-sm text-neutral-500">{pet.breed}</p> : null}
          {ageLabel ? <p className="mt-4 text-sm text-primary-600">{ageLabel}</p> : null}
        </div>
      </div>
    </Card>
  );
}
