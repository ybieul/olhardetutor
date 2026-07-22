import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import {
  DEFAULT_I18N_NAMESPACE,
  FALLBACK_LANGUAGE,
  I18N_NAMESPACES,
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LANGUAGES,
} from '@/config/i18n.config';

import ptBRCommon from './locales/pt-BR/common.json';
import ptBRAuth from './locales/pt-BR/auth.json';
import ptBROnboarding from './locales/pt-BR/onboarding.json';
import ptBRHome from './locales/pt-BR/home.json';
import ptBRCheckin from './locales/pt-BR/checkin.json';
import ptBRGuides from './locales/pt-BR/guides.json';
import ptBRAgenda from './locales/pt-BR/agenda.json';
import ptBRProfile from './locales/pt-BR/profile.json';
import ptBRDev from './locales/pt-BR/dev.json';

import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enOnboarding from './locales/en/onboarding.json';
import enHome from './locales/en/home.json';
import enCheckin from './locales/en/checkin.json';
import enGuides from './locales/en/guides.json';
import enAgenda from './locales/en/agenda.json';
import enProfile from './locales/en/profile.json';
import enDev from './locales/en/dev.json';

const resources = {
  'pt-BR': {
    common: ptBRCommon,
    auth: ptBRAuth,
    onboarding: ptBROnboarding,
    home: ptBRHome,
    checkin: ptBRCheckin,
    guides: ptBRGuides,
    agenda: ptBRAgenda,
    profile: ptBRProfile,
    dev: ptBRDev,
  },
  en: {
    common: enCommon,
    auth: enAuth,
    onboarding: enOnboarding,
    home: enHome,
    checkin: enCheckin,
    guides: enGuides,
    agenda: enAgenda,
    profile: enProfile,
    dev: enDev,
  },
} as const;

/**
 * Our supported list mixes a full regional code ('pt-BR') with a bare one
 * ('en'), so i18next's own `nonExplicitSupportedLngs` matching (which
 * strips the region off *before* checking membership) can't match
 * 'pt-BR' against itself — it ends up checking for a bare 'pt' that was
 * never declared as supported, so the resolve hierarchy comes back empty.
 * Normalizing the detected code ourselves sidesteps that entirely.
 */
function normalizeDetectedLanguage(detected: string): (typeof SUPPORTED_LANGUAGES)[number] {
  return detected.toLowerCase().startsWith('pt') ? 'pt-BR' : 'en';
}

// Guard against Vite HMR re-running this module's top-level init() on an
// already-initialized singleton, which leaves the translator holding a
// stale resource store.
if (!i18n.isInitialized) {
  void i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      ns: I18N_NAMESPACES,
      defaultNS: DEFAULT_I18N_NAMESPACE,
      fallbackLng: FALLBACK_LANGUAGE,
      supportedLngs: SUPPORTED_LANGUAGES,
      detection: {
        order: ['localStorage', 'navigator'],
        lookupLocalStorage: LANGUAGE_STORAGE_KEY,
        caches: ['localStorage'],
        convertDetectedLanguage: normalizeDetectedLanguage,
      },
      interpolation: {
        escapeValue: false,
      },
      returnNull: false,
    });
}

export default i18n;
