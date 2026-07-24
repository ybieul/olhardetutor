import { supabase } from '@/lib/supabase/client';
import { getCurrentUserId } from '@/lib/supabase/currentUser';

type PushSubscriptionRecord = {
  endpoint: string;
  p256dh: string;
  auth: string;
  lang: string;
  notifications_enabled: boolean;
};

/** Upserts a push subscription, keying on endpoint. */
export async function upsertPushSubscription(record: PushSubscriptionRecord): Promise<void> {
  const userId = await getCurrentUserId();
  const { error } = await supabase.from('push_subscriptions').upsert(
    { user_id: userId, ...record, updated_at: new Date().toISOString() },
    { onConflict: 'endpoint' },
  );
  if (error) throw error;
}

/** Removes a push subscription by endpoint. */
export async function deletePushSubscription(endpoint: string): Promise<void> {
  const { error } = await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint);
  if (error) throw error;
}

/** Returns true if the current user has at least one active push subscription. */
export async function hasActivePushSubscription(): Promise<boolean> {
  const { count, error } = await supabase
    .from('push_subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('notifications_enabled', true);
  if (error) return false;
  return (count ?? 0) > 0;
}
