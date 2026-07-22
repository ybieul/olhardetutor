import { create } from 'zustand';

import { FALLBACK_LANGUAGE, SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/config/i18n.config';
import i18n from '@/i18n';

type LanguageState = {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
};

function isSupportedLanguage(value: string): value is SupportedLanguage {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}

function resolveInitialLanguage(): SupportedLanguage {
  return isSupportedLanguage(i18n.language) ? i18n.language : FALLBACK_LANGUAGE;
}

/**
 * Reactive mirror of the current i18next language. i18next itself owns
 * detection and persistence (via i18next-browser-languagedetector); this
 * store exists so components can subscribe to the active language without
 * pulling in useTranslation, and so any part of the app can switch
 * language through one action.
 */
export const useLanguageStore = create<LanguageState>(() => ({
  language: resolveInitialLanguage(),
  setLanguage: (language) => {
    void i18n.changeLanguage(language);
  },
}));

i18n.on('languageChanged', (lng) => {
  if (isSupportedLanguage(lng)) {
    useLanguageStore.setState({ language: lng });
  }
});
