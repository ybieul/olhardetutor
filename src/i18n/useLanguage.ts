import { SUPPORTED_LANGUAGES } from '@/config/i18n.config';
import { useLanguageStore } from '@/store/useLanguageStore';

/**
 * Hook for reading and switching the active app language. Switching
 * persists automatically through i18next-browser-languagedetector's
 * localStorage cache (see src/i18n/index.ts).
 */
export function useLanguage() {
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);

  return {
    language,
    setLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
  } as const;
}
