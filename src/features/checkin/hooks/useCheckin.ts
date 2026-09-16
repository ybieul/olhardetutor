import { useEffect } from 'react';
import { create } from 'zustand';

import { getCheckinByDate, getCheckins, type Checkin } from '@/lib/supabase/queries/checkins';
import { getPets, type Pet } from '@/lib/supabase/queries/pets';
import { useAuthStore } from '@/store/useAuthStore';

type CheckinState = {
  pet: Pet | null;
  todayCheckin: Checkin | null | undefined;
  history: Checkin[];
  loading: boolean;
  loaded: boolean;
  error: Error | null;
};

type CheckinStore = CheckinState & {
  load: () => Promise<void>;
  applySaved: (checkin: Checkin) => void;
};

const INITIAL_STATE: CheckinState = {
  pet: null,
  todayCheckin: undefined,
  history: [],
  loading: true,
  loaded: false,
  error: null,
};

/**
 * Cached across mounts so leaving Check-in and coming back doesn't re-fetch
 * or flash the loading skeleton — only the first visit per session pays the
 * network round trip.
 */
const useCheckinStore = create<CheckinStore>((set, get) => ({
  ...INITIAL_STATE,

  async load() {
    if (get().loaded) return;
    set({ loading: true, error: null });

    try {
      const pets = await getPets();
      const firstPet = pets[0] ?? null;

      if (!firstPet) {
        set({ pet: null, todayCheckin: null, history: [], loading: false, loaded: true });
        return;
      }

      const today = new Date().toISOString().slice(0, 10);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

      const [todayResult, historyResult] = await Promise.all([
        getCheckinByDate(firstPet.id, today),
        getCheckins(firstPet.id, { from: thirtyDaysAgo }),
      ]);

      set({ pet: firstPet, todayCheckin: todayResult, history: historyResult, loading: false, loaded: true });
    } catch (err) {
      set({
        error: err instanceof Error ? err : new Error('Failed to load check-in data'),
        loading: false,
        loaded: true,
      });
    }
  },

  applySaved(checkin) {
    set((s) => ({
      todayCheckin: checkin,
      history: [checkin, ...s.history.filter((c) => c.date !== checkin.date)],
    }));
  },
}));

// Clear the cache on sign-out so a different account on the same tab never
// sees the previous user's cached pet data.
useAuthStore.subscribe((state, prevState) => {
  if (state.status === 'unauthenticated' && prevState.status !== 'unauthenticated') {
    useCheckinStore.setState({ ...INITIAL_STATE });
  }
});

type UseCheckinResult = {
  pet: Pet | null;
  todayCheckin: Checkin | null | undefined;
  history: Checkin[];
  loading: boolean;
  error: Error | null;
  applySaved: (checkin: Checkin) => void;
};

/**
 * Fetches the first pet, today's check-in, and the last 30 days of history.
 * `todayCheckin` is `undefined` while loading, `null` when no check-in exists
 * for today, or the found Checkin row.
 */
export function useCheckin(): UseCheckinResult {
  const pet = useCheckinStore((s) => s.pet);
  const todayCheckin = useCheckinStore((s) => s.todayCheckin);
  const history = useCheckinStore((s) => s.history);
  const loading = useCheckinStore((s) => s.loading);
  const error = useCheckinStore((s) => s.error);
  const load = useCheckinStore((s) => s.load);
  const applySaved = useCheckinStore((s) => s.applySaved);

  useEffect(() => {
    void load();
  }, [load]);

  return { pet, todayCheckin, history, loading, error, applySaved };
}
