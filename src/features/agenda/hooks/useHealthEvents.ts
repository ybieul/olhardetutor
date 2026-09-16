import { useEffect } from 'react';
import { create } from 'zustand';

import {
  deleteHealthEvent,
  getHealthEvents,
  upsertHealthEvent,
  type HealthEvent,
  type UpsertHealthEventInput,
} from '@/lib/supabase/queries/healthEvents';
import { getPets } from '@/lib/supabase/queries/pets';
import { useAuthStore } from '@/store/useAuthStore';

type AgendaState = {
  events: HealthEvent[];
  petId: string | null;
  loading: boolean;
  loaded: boolean;
  error: string | null;
};

type AgendaStore = AgendaState & {
  load: () => Promise<void>;
  saveEvent: (input: UpsertHealthEventInput) => Promise<void>;
  removeEvent: (id: string) => Promise<void>;
  toggleReminder: (event: HealthEvent) => Promise<void>;
};

const INITIAL_STATE: AgendaState = {
  events: [],
  petId: null,
  loading: true,
  loaded: false,
  error: null,
};

async function fetchSortedEvents(petId: string): Promise<HealthEvent[]> {
  const events = await getHealthEvents(petId);
  return [...events].sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Cached across mounts so leaving Agenda and coming back doesn't re-fetch or
 * flash the loading skeleton — only the first visit per session pays the
 * network round trip.
 */
const useAgendaStore = create<AgendaStore>((set, get) => ({
  ...INITIAL_STATE,

  async load() {
    if (get().loaded) return;
    set({ loading: true, error: null });

    try {
      const pets = await getPets();
      const pet = pets[0] ?? null;
      if (!pet) {
        set({ events: [], petId: null, loading: false, loaded: true });
        return;
      }
      const events = await fetchSortedEvents(pet.id);
      set({ events, petId: pet.id, loading: false, loaded: true });
    } catch {
      set({ loading: false, loaded: true, error: 'load_failed' });
    }
  },

  async saveEvent(input) {
    await upsertHealthEvent(input);
    const petId = get().petId;
    if (petId) set({ events: await fetchSortedEvents(petId) });
  },

  async removeEvent(id) {
    await deleteHealthEvent(id);
    const petId = get().petId;
    if (petId) set({ events: await fetchSortedEvents(petId) });
  },

  async toggleReminder(event) {
    await upsertHealthEvent({ ...event, reminder_enabled: !event.reminder_enabled });
    const petId = get().petId;
    if (petId) set({ events: await fetchSortedEvents(petId) });
  },
}));

// Clear the cache on sign-out so a different account on the same tab never
// sees the previous user's cached pet data.
useAuthStore.subscribe((state, prevState) => {
  if (state.status === 'unauthenticated' && prevState.status !== 'unauthenticated') {
    useAgendaStore.setState({ ...INITIAL_STATE });
  }
});

export function useHealthEvents() {
  const events = useAgendaStore((s) => s.events);
  const petId = useAgendaStore((s) => s.petId);
  const loading = useAgendaStore((s) => s.loading);
  const error = useAgendaStore((s) => s.error);
  const load = useAgendaStore((s) => s.load);
  const saveEvent = useAgendaStore((s) => s.saveEvent);
  const removeEvent = useAgendaStore((s) => s.removeEvent);
  const toggleReminder = useAgendaStore((s) => s.toggleReminder);

  useEffect(() => {
    void load();
  }, [load]);

  return { events, petId, loading, error, saveEvent, removeEvent, toggleReminder };
}
