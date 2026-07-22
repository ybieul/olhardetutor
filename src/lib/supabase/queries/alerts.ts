import { supabase } from '@/lib/supabase/client';
import type { Tables } from '@/lib/supabase/types';

export type Alert = Tables<'alerts'>;

export async function getAlerts(petId: string): Promise<Alert[]> {
  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .eq('pet_id', petId)
    .order('date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function resolveAlert(id: string): Promise<Alert> {
  const { data, error } = await supabase.from('alerts').update({ resolved: true }).eq('id', id).select('*').single();
  if (error) throw error;
  return data;
}
