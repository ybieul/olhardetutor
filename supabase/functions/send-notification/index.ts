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
 */

// deno-lint-ignore-file no-explicit-any

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

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Validate shared secret
  const authHeader = req.headers.get('authorization') ?? '';
  if (NOTIFICATION_SECRET && authHeader !== `Bearer ${NOTIFICATION_SECRET}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const body = (await req.json()) as { type: NotificationType };
  const type = body.type;

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  let subscriptions: Subscription[] = [];
  let payloads: Map<string, object> = new Map();

  if (type === 'daily_checkin') {
    // Fetch all active subscriptions
    const { data, error } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth, lang, user_id')
      .eq('notifications_enabled', true);

    if (error) throw error;

    // For each user, get their pet name
    for (const sub of data ?? []) {
      const { data: pet } = await supabase
        .from('pets')
        .select('name')
        .eq('user_id', sub.user_id)
        .maybeSingle();

      subscriptions.push({ endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth, lang: sub.lang });
      payloads.set(sub.endpoint, {
        type: 'daily_checkin',
        petName: pet?.name ?? 'Pet',
        lang: sub.lang,
      });
    }
  } else if (type === 'health_event_reminder') {
    // Find health events happening in the next 3 days
    const now = new Date();
    const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const { data: events, error } = await supabase
      .from('health_events')
      .select('id, user_id, event_type, next_date, pets(name)')
      .gte('next_date', now.toISOString().slice(0, 10))
      .lte('next_date', in3Days.toISOString().slice(0, 10));

    if (error) throw error;

    for (const event of events ?? []) {
      const { data: subs } = await supabase
        .from('push_subscriptions')
        .select('endpoint, p256dh, auth, lang')
        .eq('user_id', event.user_id)
        .eq('notifications_enabled', true);

      for (const sub of subs ?? []) {
        const daysUntil = Math.ceil(
          (new Date(event.next_date as string).getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );
        subscriptions.push({ endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth, lang: sub.lang });
        payloads.set(sub.endpoint, {
          type: 'health_event',
          petName: (event.pets as any)?.name ?? 'Pet',
          eventName: event.event_type,
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

  return new Response(JSON.stringify({ sent, failed }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
