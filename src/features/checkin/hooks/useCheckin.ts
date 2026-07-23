import { useEffect, useState } from 'react';

import { getCheckinByDate, getCheckins, type Checkin } from '@/lib/supabase/queries/checkins';
import { getPets, type Pet } from '@/lib/supabase/queries/pets';

type UseCheckinResult = {
  pet: Pet | null;
  todayCheckin: Checkin | null | undefined;
  history: Checkin[];
  loading: boolean;
  error: Error | null;
};

/**
 * Fetches the first pet, today's check-in, and the last 30 days of history.
 * `todayCheckin` is `undefined` while loading, `null` when no check-in exists
 * for today, or the found Checkin row.
 */
export function useCheckin(): UseCheckinResult {
  const [pet, setPet] = useState<Pet | null>(null);
  const [todayCheckin, setTodayCheckin] = useState<Checkin | null | undefined>(undefined);
  const [history, setHistory] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const pets = await getPets();
        if (!active) return;

        const firstPet = pets[0] ?? null;
        setPet(firstPet);

        if (firstPet) {
          const today = new Date().toISOString().slice(0, 10);
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

          const [todayResult, historyResult] = await Promise.all([
            getCheckinByDate(firstPet.id, today),
            getCheckins(firstPet.id, { from: thirtyDaysAgo }),
          ]);

          if (!active) return;
          setTodayCheckin(todayResult);
          setHistory(historyResult);
        } else {
          if (active) setTodayCheckin(null);
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err : new Error('Failed to load check-in data'));
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  return { pet, todayCheckin, history, loading, error };
}
