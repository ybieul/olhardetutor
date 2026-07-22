import { supabase } from '@/lib/supabase/client';
import type { Tables, TablesInsert } from '@/lib/supabase/types';

export type Checkin = Tables<'checkins'>;
export type UpsertCheckinInput = TablesInsert<'checkins'> & { id?: string };

type GetCheckinsOptions = {
  /** ISO date, inclusive. */
  from?: string;
  /** ISO date, inclusive. */
  to?: string;
  limit?: number;
};

export async function getCheckins(petId: string, options: GetCheckinsOptions = {}): Promise<Checkin[]> {
  let query = supabase.from('checkins').select('*').eq('pet_id', petId).order('date', { ascending: false });

  if (options.from) query = query.gte('date', options.from);
  if (options.to) query = query.lte('date', options.to);
  if (options.limit) query = query.limit(options.limit);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getCheckinByDate(petId: string, date: string): Promise<Checkin | null> {
  const { data, error } = await supabase
    .from('checkins')
    .select('*')
    .eq('pet_id', petId)
    .eq('date', date)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** Insert or update the check-in for `input.pet_id` + `input.date` (unique per pet per day). */
export async function upsertCheckin(input: UpsertCheckinInput): Promise<Checkin> {
  const { data, error } = await supabase
    .from('checkins')
    .upsert(input, { onConflict: 'pet_id,date' })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}
