/**
 * i18n configuration constants. Nothing about supported languages, the
 * default/fallback language, or the persistence key should be hardcoded
 * anywhere else in the app — import from here.
 */

export const SUPPORTED_LANGUAGES = ['pt-BR', 'en'] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/** Used when the visitor's locale can't be resolved to a supported language. */
export const FALLBACK_LANGUAGE: SupportedLanguage = 'pt-BR';

/** localStorage key used to persist the user's manual language choice. */
export const LANGUAGE_STORAGE_KEY = 'olhar-de-tutor:language';

/** i18next namespaces — one per feature domain, plus a shared "common" one. */
export const I18N_NAMESPACES = [
  'common',
  'auth',
  'errors',
  'onboarding',
  'home',
  'checkin',
  'guides',
  'agenda',
  'profile',
  'dev',
] as const;

export type I18nNamespace = (typeof I18N_NAMESPACES)[number];

export const DEFAULT_I18N_NAMESPACE: I18nNamespace = 'common';
