/**
 * Cross-cutting product/business constants — domain rules that aren't
 * visual tokens, env vars, or i18n copy (e.g. "what age range counts as
 * senior for a cat"). Human-facing labels for these values live in i18n
 * (see src/i18n/locales/<lang>/onboarding.json); this file only holds numbers.
 */

export type PetSpeciesKey = 'dog' | 'cat';
export type PetLifeStageKey = 'puppy' | 'adult' | 'senior';

type AgeRangeMonths = {
  min: number;
  /** null means open-ended ("84+ months"). */
  max: number | null;
};

/**
 * Age boundaries (in months since birth) used to describe each life
 * stage per species on the onboarding "life stage" step. These are
 * educational rules of thumb, not veterinary diagnostic thresholds — see
 * CLAUDE.md, the app never diagnoses.
 */
export const LIFE_STAGE_AGE_RANGES_MONTHS: Record<PetSpeciesKey, Record<PetLifeStageKey, AgeRangeMonths>> = {
  dog: {
    puppy: { min: 0, max: 12 },
    adult: { min: 12, max: 84 },
    senior: { min: 84, max: null },
  },
  cat: {
    puppy: { min: 0, max: 12 },
    adult: { min: 12, max: 132 },
    senior: { min: 132, max: null },
  },
};

/** Length of the "get to know your pet" baseline period shown on the last onboarding step. */
export const ONBOARDING_BASELINE_DAYS = 5;

/**
 * Relative weights applied to each check-in category when computing day_score
 * (1–100). Must sum to 1.0. Adjust here without touching scoring.ts logic.
 */
export const CHECKIN_SCORE_WEIGHTS = {
  feeding: 0.15,
  water: 0.15,
  sleep: 0.15,
  activity: 0.15,
  stool: 0.15,
  urine: 0.10,
  behavior: 0.15,
} as const;

/** Ordered list of guide module IDs — controls display order in the list. */
export const GUIDE_MODULE_IDS = ['silence', 'dna', 'checkin', 'changes', 'history', 'when'] as const;
export type GuideModuleId = (typeof GUIDE_MODULE_IDS)[number];

/** Google Maps search URLs for "vet near me", keyed by supported language. */
export const VET_SEARCH_URLS: Record<'pt-BR' | 'en', string> = {
  'pt-BR': 'https://www.google.com/maps/search/veterin%C3%A1ria+perto+de+mim',
  en: 'https://www.google.com/maps/search/veterinarian+near+me',
};
