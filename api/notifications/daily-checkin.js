/**
 * Vercel cron handler — triggers the daily check-in push notification batch.
 * Scheduled in vercel.json: every day at 09:00 UTC.
 * Proxies to the Supabase Edge Function with the shared NOTIFICATION_SECRET.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const secret = process.env.NOTIFICATION_SECRET;

  if (!supabaseUrl || !secret) {
    console.error('daily-checkin: missing env vars');
    return res.status(500).json({ error: 'misconfigured' });
  }

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/send-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({ type: 'daily_checkin' }),
    });

    const data = await response.json().catch(() => ({}));

    return res.status(response.ok ? 200 : 502).json(data);
  } catch (err) {
    console.error('daily-checkin: fetch failed', err);
    return res.status(500).json({ error: 'upstream_error' });
  }
}
