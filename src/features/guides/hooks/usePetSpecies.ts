import { useEffect, useState } from 'react';

import { getPets } from '@/lib/supabase/queries/pets';
import type { PetSpeciesKey } from '@/config/app.config';

/**
 * Returns the species of the user's first pet, or null while loading / on error.
 * Used to filter species-specific guide sections and alert signs.
 */
export function usePetSpecies(): PetSpeciesKey | null {
  const [species, setSpecies] = useState<PetSpeciesKey | null>(null);

  useEffect(() => {
    let cancelled = false;
    getPets()
      .then((pets) => {
        if (!cancelled && pets[0]) {
          setSpecies(pets[0].species as PetSpeciesKey);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return species;
}
