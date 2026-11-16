/**
 * Edge Function: send-notification
 *
 * Sends localized push notifications to subscribed users.
 * Called by a scheduler (Vercel Cron or pg_cron) with:
 *   POST /functions/v1/send-notification
 *   Authorization: Bearer <NOTIFICATION_SECRET>
 *   { "type": "daily_checkin" | "health_event_reminder" }
 *
 * Requires env secrets:
 *   VAPID_PUBLIC_KEY   — VAPID public key (base64url)
 *   VAPID_PRIVATE_KEY  — VAPID private key (base64url)
 *   VAPID_MAILTO       — e.g. mailto:admin@olhardetutor.com.br
 *   NOTIFICATION_SECRET — shared secret for cron authentication
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY — injected automatically
 *
 * Generate VAPID keys:
 *   npx web-push generate-vapid-keys
 *
 * Deploy with: supabase functions deploy send-notification --no-verify-jwt
 * (the Vercel cron authenticates with the shared secret above, not with a
 * Supabase JWT, so the gateway must not demand one — the secret check
 * below is what protects this endpoint, and it fails closed.)
 */

import { createClient } from 'npm:@supabase/supabase-js@2';
import webpush from 'npm:web-push@3';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY') ?? '';
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') ?? '';
const VAPID_MAILTO = Deno.env.get('VAPID_MAILTO') ?? 'mailto:admin@olhardetutor.com.br';
const NOTIFICATION_SECRET = Deno.env.get('NOTIFICATION_SECRET');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
};

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_MAILTO, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

type NotificationType = 'daily_checkin' | 'health_event_reminder';

type Subscription = {
  endpoint: string;
  p256dh: string;
  auth: string;
  lang: string;
};

type EventWithPet = {
  pet_id: string;
  type: string;
  next_date: string;
  reminder_enabled: boolean;
  pets: { user_id: string; name: string } | null;
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Validate shared secret — fail closed. An unset/empty secret must never
  // turn this into an open endpoint: it can push a notification to every
  // subscriber in the database.
  if (!NOTIFICATION_SECRET) {
    return new Response(JSON.stringify({ error: 'Not configured (missing NOTIFICATION_SECRET)' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  const authHeader = req.headers.get('authorization') ?? '';
  if (authHeader !== `Bearer ${NOTIFICATION_SECRET}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const body = (await req.json()) as { type: NotificationType };
  const type = body.type;

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const subscriptions: Subscription[] = [];
  const payloads: Map<string, object> = new Map();

  if (type === 'daily_checkin') {
    const today = new Date().toISOString().slice(0, 10);

    // Fetch all active subscriptions
    const { data, error } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth, lang, user_id')
      .eq('notifications_enabled', true);

    if (error) throw error;

    // For each user, get their pet and skip anyone who already checked in today
    for (const sub of data ?? []) {
      const { data: pet } = await supabase
        .from('pets')
        .select('id, name')
        .eq('user_id', sub.user_id)
        .maybeSingle();

      if (!pet) continue;

      const { data: todayCheckin } = await supabase
        .from('checkins')
        .select('id')
        .eq('pet_id', pet.id)
        .eq('date', today)
        .maybeSingle();

      if (todayCheckin) continue;

      subscriptions.push({ endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth, lang: sub.lang });
      payloads.set(sub.endpoint, {
        type: 'daily_checkin',
        petName: pet.name ?? 'Pet',
        lang: sub.lang,
      });
    }
  } else if (type === 'health_event_reminder') {
    // Find health events happening in the next 3 days, with reminders enabled
    const now = new Date();
    const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const { data: events, error } = await supabase
      .from('health_events')
      .select('id, pet_id, type, next_date, reminder_enabled, pets(user_id, name)')
      .eq('reminder_enabled', true)
      .gte('next_date', now.toISOString().slice(0, 10))
      .lte('next_date', in3Days.toISOString().slice(0, 10))
      .returns<EventWithPet[]>();

    if (error) throw error;

    for (const event of events ?? []) {
      if (!event.pets) continue;

      const { data: subs } = await supabase
        .from('push_subscriptions')
        .select('endpoint, p256dh, auth, lang')
        .eq('user_id', event.pets.user_id)
        .eq('notifications_enabled', true);

      for (const sub of subs ?? []) {
        const daysUntil = Math.ceil(
          (new Date(event.next_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );
        subscriptions.push({ endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth, lang: sub.lang });
        payloads.set(sub.endpoint, {
          type: 'health_event',
          petName: event.pets.name ?? 'Pet',
          eventName: event.type,
          daysUntil,
          lang: sub.lang,
        });
      }
    }
  }

  // Send push notifications
  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payloads.get(sub.endpoint) ?? {}),
      ),
    ),
  );

  const sent = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.filter((r) => r.status === 'rejected').length;

  // web-push rejects with a WebPushError carrying `statusCode` when the push
  // service confirms the subscription is gone for good (uninstalled,
  // permission revoked at the OS level) — 404/410 specifically, never
  // anything transient. Delete those rows instead of retrying them forever.
  const deadEndpoints = results
    .map((result, i) => ({ result, endpoint: subscriptions[i]?.endpoint }))
    .filter((x): x is { result: PromiseRejectedResult; endpoint: string } => x.result.status === 'rejected' && !!x.endpoint)
    .filter(({ result }) => {
      const reason = result.reason as { statusCode?: number } | undefined;
      return reason?.statusCode === 404 || reason?.statusCode === 410;
    })
    .map(({ endpoint }) => endpoint);

  if (deadEndpoints.length > 0) {
    await supabase.from('push_subscriptions').delete().in('endpoint', deadEndpoints);
  }

  return new Response(JSON.stringify({ sent, failed, removed: deadEndpoints.length }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
