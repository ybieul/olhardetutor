import { supabase } from '@/lib/supabase/client';
import type { Tables, TablesInsert } from '@/lib/supabase/types';

export type WeightEntry = Tables<'weight_history'>;
export type AddWeightEntryInput = TablesInsert<'weight_history'>;

export async function getWeightHistory(petId: string): Promise<WeightEntry[]> {
  const { data, error } = await supabase
    .from('weight_history')
    .select('*')
    .eq('pet_id', petId)
    .order('date', { ascending: true });
  if (error) throw error;
  return data;
}

export async function addWeightEntry(input: AddWeightEntryInput): Promise<WeightEntry> {
  const { data, error } = await supabase.from('weight_history').insert(input).select('*').single();
  if (error) throw error;
  return data;
}
