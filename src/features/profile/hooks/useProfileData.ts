import { useEffect, useState } from 'react';

import { getPets, getPetPhotoUrl, type Pet } from '@/lib/supabase/queries/pets';
import { getWeightHistory, addWeightEntry, type WeightEntry } from '@/lib/supabase/queries/weightHistory';
import { getCheckins, type Checkin } from '@/lib/supabase/queries/checkins';
import { getHealthEvents, type HealthEvent } from '@/lib/supabase/queries/healthEvents';

export type ProfileData = {
  pet: Pet | null;
  photoUrl: string | null;
  weightHistory: WeightEntry[];
  recentCheckins: Checkin[];
  healthEvents: HealthEvent[];
};

type State = ProfileData & { loading: boolean; error: string | null };

export function useProfileData() {
  const [state, setState] = useState<State>({
    pet: null,
    photoUrl: null,
    weightHistory: [],
    recentCheckins: [],
    healthEvents: [],
    loading: true,
    error: null,
  });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const pets = await getPets();
        if (cancelled) return;
        const pet = pets[0] ?? null;
        if (!pet) {
          setState((s) => ({ ...s, pet: null, loading: false }));
          return;
        }

        const since = new Date();
        since.setDate(since.getDate() - 60);
        const fromDate = `${since.getFullYear()}-${String(since.getMonth() + 1).padStart(2, '0')}-${String(since.getDate()).padStart(2, '0')}`;

        const [weightHistory, recentCheckins, healthEvents] = await Promise.all([
          getWeightHistory(pet.id),
          getCheckins(pet.id, { from: fromDate }),
          getHealthEvents(pet.id),
        ]);

        if (cancelled) return;

        weightHistory.sort((a, b) => a.date.localeCompare(b.date));

        let photoUrl: string | null = null;
        if (pet.photo_url) {
          try {
            photoUrl = await getPetPhotoUrl(pet.photo_url);
          } catch {
            // Non-fatal
          }
        }

        if (!cancelled) {
          setState({
            pet,
            photoUrl,
            weightHistory,
            recentCheckins,
            healthEvents,
            loading: false,
            error: null,
          });
        }
      } catch {
        if (!cancelled) setState((s) => ({ ...s, loading: false, error: 'load_failed' }));
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [version]);

  async function recordWeight(petId: string, date: string, weightKg: number): Promise<void> {
    await addWeightEntry({ pet_id: petId, date, weight_kg: weightKg });
    setVersion((v) => v + 1);
  }

  return { ...state, recordWeight };
}
