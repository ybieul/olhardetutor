import type { OnboardingData } from '@/features/onboarding/store/useOnboardingStore';

export type ProfileFieldError = 'nameError' | 'birthDateError' | 'approximateAgeError' | 'weightError';
export type ProfileStepErrors = Partial<Record<'name' | 'birthDate' | 'approximateAge' | 'weight', ProfileFieldError>>;

/** Pure validation for the "pet profile" step — returns i18n key suffixes under the `profile.*` namespace, or nothing when a field is valid. */
export function validateProfileStep(data: OnboardingData): ProfileStepErrors {
  const errors: ProfileStepErrors = {};

  if (!data.name.trim()) {
    errors.name = 'nameError';
  }

  if (data.birthDateMode === 'exact') {
    const parsed = data.birthDate ? new Date(data.birthDate) : null;
    if (!parsed || Number.isNaN(parsed.getTime()) || parsed > new Date()) {
      errors.birthDate = 'birthDateError';
    }
  } else {
    const years = Number(data.approximateAgeYears || 0);
    const months = Number(data.approximateAgeMonths || 0);
    if (years <= 0 && months <= 0) {
      errors.approximateAge = 'approximateAgeError';
    }
  }

  const weight = Number(data.weightKg);
  if (!data.weightKg || Number.isNaN(weight) || weight <= 0) {
    errors.weight = 'weightError';
  }

  return errors;
}

/**
 * Resolves the birth date to persist on `pets.birth_date`: the exact date
 * as entered, or — when the tutor only knows an approximate age — today
 * minus that many years/months. The schema only has one `birth_date`
 * column, so an approximate age is stored as its best-guess equivalent.
 */
export function computeBirthDate(
  data: Pick<OnboardingData, 'birthDateMode' | 'birthDate' | 'approximateAgeYears' | 'approximateAgeMonths'>,
): string {
  if (data.birthDateMode === 'exact') {
    return data.birthDate;
  }

  const years = Number(data.approximateAgeYears || 0);
  const months = Number(data.approximateAgeMonths || 0);
  const totalMonthsAgo = years * 12 + months;

  const date = new Date();
  date.setMonth(date.getMonth() - totalMonthsAgo);
  return date.toISOString().slice(0, 10);
}
