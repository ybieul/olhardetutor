import { useAuthStore } from '@/store/useAuthStore';

/**
 * The service worker's NetworkFirst cache for *.supabase.co responses
 * (cacheName 'supabase-api', see src/sw.ts) can hold authenticated API
 * responses for up to 24h. Tell the active service worker to clear it on
 * sign-out, so a different account on the same device/tab never sees a
 * previous tutor's cached data before the first real network round trip
 * completes. Side-effect-only module — import once for its top-level
 * subscription (see src/main.tsx).
 */
useAuthStore.subscribe((state, prevState) => {
  if (state.status === 'unauthenticated' && prevState.status !== 'unauthenticated') {
    navigator.serviceWorker?.controller?.postMessage({ type: 'CLEAR_API_CACHE' });
  }
});
