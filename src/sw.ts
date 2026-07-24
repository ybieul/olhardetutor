/// <reference lib="webworker" />

import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

// vite-plugin-pwa injects the asset manifest here
declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision: string | null }>;
};

clientsClaim();

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Serve index.html for all navigation requests (SPA fallback)
const handler = createHandlerBoundToURL('/index.html');
const navigationRoute = new NavigationRoute(handler, {
  denylist: [/^\/assets\//],
});
registerRoute(navigationRoute);

// NetworkFirst for Supabase API calls
registerRoute(
  ({ url }) => url.hostname.endsWith('.supabase.co'),
  new NetworkFirst({
    cacheName: 'supabase-api',
    plugins: [new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 })],
  }),
);

// CacheFirst for images (long-lived)
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 })],
  }),
);

// Receive SKIP_WAITING from the client (triggered by UpdatePrompt)
self.addEventListener('message', (event) => {
  if ((event.data as { type?: string } | null)?.type === 'SKIP_WAITING') {
    void self.skipWaiting();
  }
});

// Push notification strings (kept inline — the SW has no access to i18n)
type Lang = 'pt-BR' | 'en';
type PushPayload = {
  type: 'daily_checkin' | 'health_event';
  petName: string;
  eventName?: string;
  daysUntil?: number;
  lang: string;
};

const STRINGS: Record<Lang, {
  title: (p: PushPayload) => string;
  body: (p: PushPayload) => string;
}> = {
  'pt-BR': {
    title: (p) => p.type === 'daily_checkin'
      ? `${p.petName} está esperando!`
      : `Evento próximo: ${p.eventName ?? ''}`,
    body: (p) => p.type === 'daily_checkin'
      ? 'Faça o check-in diário e monitore a saúde do seu pet.'
      : `Em ${p.daysUntil ?? 3} dia${(p.daysUntil ?? 3) !== 1 ? 's' : ''} — ${p.petName}`,
  },
  en: {
    title: (p) => p.type === 'daily_checkin'
      ? `${p.petName} is waiting!`
      : `Upcoming: ${p.eventName ?? ''}`,
    body: (p) => p.type === 'daily_checkin'
      ? "Do the daily check-in and monitor your pet's health."
      : `In ${p.daysUntil ?? 3} day${(p.daysUntil ?? 3) !== 1 ? 's' : ''} — ${p.petName}`,
  },
};

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload: PushPayload;
  try {
    payload = event.data.json() as PushPayload;
  } catch {
    return;
  }

  const lang: Lang = payload.lang === 'pt-BR' ? 'pt-BR' : 'en';
  const strings = STRINGS[lang];

  event.waitUntil(
    self.registration.showNotification(strings.title(payload), {
      body: strings.body(payload),
      icon: '/assets/pwa/icon-192.png',
      badge: '/assets/pwa/icon-192.png',
      tag: payload.type,
      data: { url: payload.type === 'health_event' ? '/agenda' : '/' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data as { url?: string } | null)?.url ?? '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const existing = clientList.find((c) => 'focus' in c);
      if (existing) return existing.focus();
      return self.clients.openWindow(url);
    }),
  );
});
