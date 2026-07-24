import { create } from 'zustand';

type PwaStore = {
  isInstallable: boolean;
  isInstalled: boolean;
  isIos: boolean;
  deferredPrompt: BeforeInstallPromptEvent | null;
  init: () => void;
  promptInstall: () => Promise<void>;
};

function detectIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function detectInstalled(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as { standalone?: boolean }).standalone === true;
}

export const usePwaStore = create<PwaStore>()((set, get) => ({
  isInstallable: false,
  isInstalled: false,
  isIos: false,
  deferredPrompt: null,

  init() {
    const installed = detectInstalled();
    const ios = detectIos();
    set({ isInstalled: installed, isIos: ios });

    if (installed) return;

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      set({ isInstallable: true, deferredPrompt: event as BeforeInstallPromptEvent });
    });

    window.addEventListener('appinstalled', () => {
      set({ isInstalled: true, isInstallable: false, deferredPrompt: null });
    });
  },

  async promptInstall() {
    const { deferredPrompt } = get();
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      set({ isInstalled: true, isInstallable: false, deferredPrompt: null });
    }
  },
}));
