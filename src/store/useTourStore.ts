import { create } from 'zustand';

import { getProfile, updateProfile } from '@/lib/supabase/queries/profiles';
import type { Json } from '@/lib/supabase/types';

export type TourId = 'home' | 'checkin' | 'guides' | 'agenda' | 'profile';

type TourStore = {
  loaded: boolean;
  completedTours: TourId[];
  load: () => Promise<void>;
  markCompleted: (id: TourId) => Promise<void>;
  resetAllTours: () => Promise<void>;
};

export const useTourStore = create<TourStore>()((set, get) => ({
  loaded: false,
  completedTours: [],

  load: async () => {
    try {
      const profile = await getProfile();
      const raw = profile?.tour_completed;
      const completed = Array.isArray(raw) ? (raw as TourId[]) : [];
      set({ loaded: true, completedTours: completed });
    } catch {
      set({ loaded: true, completedTours: [] });
    }
  },

  markCompleted: async (id: TourId) => {
    const { completedTours } = get();
    if (completedTours.includes(id)) return;
    const updated = [...completedTours, id];
    set({ completedTours: updated });
    try {
      await updateProfile({ tour_completed: updated as Json });
    } catch {
      // Non-fatal: local state is authoritative for this session
    }
  },

  resetAllTours: async () => {
    set({ completedTours: [] });
    try {
      await updateProfile({ tour_completed: [] as Json });
    } catch {
      // Non-fatal
    }
  },
}));
