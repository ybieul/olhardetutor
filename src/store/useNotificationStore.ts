import { create } from 'zustand';
import {
  isPushSupported,
  getPermission,
  subscribeToNotifications,
  unsubscribeFromNotifications,
} from '@/lib/notifications/push';

type NotificationStore = {
  supported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
  isLoading: boolean;
  init: () => Promise<void>;
  enable: (lang: string) => Promise<void>;
  disable: () => Promise<void>;
};

export const useNotificationStore = create<NotificationStore>()((set, get) => ({
  supported: false,
  permission: 'default',
  isSubscribed: false,
  isLoading: false,

  async init() {
    const supported = isPushSupported();
    const permission = getPermission();
    set({ supported, permission });

    if (!supported || !('serviceWorker' in navigator)) return;
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) return;
      const subscription = await registration.pushManager.getSubscription();
      set({ isSubscribed: subscription !== null && permission === 'granted' });
    } catch {
      // SW not registered yet — that's fine
    }
  },

  async enable(lang: string) {
    if (get().isLoading) return;
    set({ isLoading: true });
    try {
      const result = await subscribeToNotifications(lang);
      if (result === 'subscribed') {
        set({ isSubscribed: true, permission: 'granted' });
      } else if (result === 'denied') {
        set({ permission: 'denied' });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  async disable() {
    if (get().isLoading) return;
    set({ isLoading: true });
    try {
      await unsubscribeFromNotifications();
      set({ isSubscribed: false });
    } finally {
      set({ isLoading: false });
    }
  },
}));
