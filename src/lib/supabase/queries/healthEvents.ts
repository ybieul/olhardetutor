import { supabase } from '@/lib/supabase/client';
import type { Tables, TablesInsert } from '@/lib/supabase/types';

export type HealthEvent = Tables<'health_events'>;
export type UpsertHealthEventInput = TablesInsert<'health_events'> & { id?: string };

export async function getHealthEvents(petId: string): Promise<HealthEvent[]> {
  const { data, error } = await supabase
    .from('health_events')
    .select('*')
    .eq('pet_id', petId)
    .order('date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function upsertHealthEvent(input: UpsertHealthEventInput): Promise<HealthEvent> {
  const { data, error } = await supabase.from('health_events').upsert(input).select('*').single();
  if (error) throw error;
  return data;
}

export async function deleteHealthEvent(id: string): Promise<void> {
  const { error } = await supabase.from('health_events').delete().eq('id', id);
  if (error) throw error;
}
