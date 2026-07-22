import { supabase } from '@/lib/supabase/client';
import { getAlerts, type Alert } from '@/lib/supabase/queries/alerts';
import { getCheckins, type Checkin } from '@/lib/supabase/queries/checkins';
import { getHealthEvents, type HealthEvent } from '@/lib/supabase/queries/healthEvents';
import { getPets, type Pet } from '@/lib/supabase/queries/pets';
import { getProfile, type Profile } from '@/lib/supabase/queries/profiles';
import { getWeightHistory, type WeightEntry } from '@/lib/supabase/queries/weightHistory';

export type PetExport = Pet & {
  checkins: Checkin[];
  weightHistory: WeightEntry[];
  healthEvents: HealthEvent[];
  alerts: Alert[];
};

export type AccountExport = {
  exportedAt: string;
  profile: Profile | null;
  pets: PetExport[];
};

/**
 * LGPD/GDPR "right to data portability" — assembles every row the
 * signed-in user owns into one JSON-ready object. Pure reads, entirely
 * scoped by RLS; turning this into a downloadable file is a UI concern.
 */
export async function exportUserData(): Promise<AccountExport> {
  const [profile, pets] = await Promise.all([getProfile(), getPets()]);

  const petsWithHistory = await Promise.all(
    pets.map(async (pet): Promise<PetExport> => {
      const [checkins, weightHistory, healthEvents, alerts] = await Promise.all([
        getCheckins(pet.id),
        getWeightHistory(pet.id),
        getHealthEvents(pet.id),
        getAlerts(pet.id),
      ]);
      return { ...pet, checkins, weightHistory, healthEvents, alerts };
    }),
  );

  return {
    exportedAt: new Date().toISOString(),
    profile,
    pets: petsWithHistory,
  };
}

/**
 * LGPD/GDPR "right to erasure". Deleting the auth.users row (which
 * cascades to profiles/pets/checkins/weight_history/health_events/alerts
 * via FK ON DELETE CASCADE, and removes storage objects) requires
 * privileges the client never holds. This invokes the `delete-account`
 * edge function, which runs server-side with the service_role key — see
 * supabase/functions/delete-account/index.ts and docs/SECURITY.md.
 */
export async function deleteAccount(): Promise<void> {
  const { error } = await supabase.functions.invoke('delete-account', { method: 'POST' });
  if (error) throw error;
}
