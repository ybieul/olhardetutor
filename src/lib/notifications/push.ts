import { env } from '@/config/env';
import { upsertPushSubscription, deletePushSubscription } from '@/lib/supabase/queries/pushSubscriptions';


/** True when push notifications are technically supported in this browser. */
export function isPushSupported(): boolean {
  return (
    typeof Notification !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    env.vapidPublicKey !== null
  );
}

export function getPermission(): NotificationPermission {
  if (typeof Notification === 'undefined') return 'denied';
  return Notification.permission;
}

/** Subscribes the current device to push notifications and persists the subscription to Supabase. */
export async function subscribeToNotifications(lang: string): Promise<'subscribed' | 'denied' | 'error'> {
  if (!isPushSupported() || !env.vapidPublicKey) return 'error';

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return 'denied';

  try {
    const registration = await navigator.serviceWorker.ready;
    const existing = await registration.pushManager.getSubscription();
    // Modern browsers accept the base64url VAPID key string directly
    const subscription = existing ?? await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: env.vapidPublicKey,
    });

    const json = subscription.toJSON();
    const keys = json.keys as { p256dh?: string; auth?: string } | undefined;

    await upsertPushSubscription({
      endpoint: subscription.endpoint,
      p256dh: keys?.p256dh ?? '',
      auth: keys?.auth ?? '',
      lang,
      notifications_enabled: true,
    });

    return 'subscribed';
  } catch {
    return 'error';
  }
}

/** Unsubscribes the current device from push notifications and removes from Supabase. */
export async function unsubscribeFromNotifications(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return;
    await subscription.unsubscribe();
    await deletePushSubscription(subscription.endpoint);
  } catch {
    // Best-effort — if SW isn't registered yet, there's nothing to unsubscribe
  }
}
