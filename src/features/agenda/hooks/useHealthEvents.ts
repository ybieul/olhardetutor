import { useEffect, useState } from 'react';

import {
  deleteHealthEvent,
  getHealthEvents,
  upsertHealthEvent,
  type HealthEvent,
  type UpsertHealthEventInput,
} from '@/lib/supabase/queries/healthEvents';
import { getPets } from '@/lib/supabase/queries/pets';

type State = {
  events: HealthEvent[];
  petId: string | null;
  loading: boolean;
  error: string | null;
};

export function useHealthEvents() {
  const [state, setState] = useState<State>({ events: [], petId: null, loading: true, error: null });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const pets = await getPets();
        if (cancelled) return;
        const pet = pets[0] ?? null;
        if (!pet) {
          setState({ events: [], petId: null, loading: false, error: null });
          return;
        }
        const events = await getHealthEvents(pet.id);
        if (cancelled) return;
        events.sort((a, b) => b.date.localeCompare(a.date));
        setState({ events, petId: pet.id, loading: false, error: null });
      } catch {
        if (!cancelled) setState((s) => ({ ...s, loading: false, error: 'load_failed' }));
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [version]);

  async function saveEvent(input: UpsertHealthEventInput): Promise<void> {
    await upsertHealthEvent(input);
    setVersion((v) => v + 1);
  }

  async function removeEvent(id: string): Promise<void> {
    await deleteHealthEvent(id);
    setVersion((v) => v + 1);
  }

  async function toggleReminder(event: HealthEvent): Promise<void> {
    await upsertHealthEvent({ ...event, reminder_enabled: !event.reminder_enabled });
    setVersion((v) => v + 1);
  }

  return { ...state, saveEvent, removeEvent, toggleReminder };
}
