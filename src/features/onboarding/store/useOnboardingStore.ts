import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { PetLifeStageKey, PetSpeciesKey } from '@/config/app.config';

export type BirthDateMode = 'exact' | 'approximate';

export type OnboardingStep = 1 | 2 | 3 | 4;

export type OnboardingData = {
  species: PetSpeciesKey | null;
  lifeStage: PetLifeStageKey | null;
  name: string;
  breed: string;
  breedUnknown: boolean;
  birthDateMode: BirthDateMode;
  /** ISO date (yyyy-mm-dd), used when birthDateMode === 'exact'. */
  birthDate: string;
  /** Kept as strings for controlled inputs; parsed to numbers on submit. */
  approximateAgeYears: string;
  approximateAgeMonths: string;
  weightKg: string;
  /**
   * Storage path under the pet-photos bucket (e.g. "<uid>/onboarding-123.jpg"),
   * already uploaded — never a raw File, which can't survive persistence.
   */
  photoPath: string | null;
};

const INITIAL_DATA: OnboardingData = {
  species: null,
  lifeStage: null,
  name: '',
  breed: '',
  breedUnknown: false,
  birthDateMode: 'exact',
  birthDate: '',
  approximateAgeYears: '',
  approximateAgeMonths: '',
  weightKg: '',
  photoPath: null,
};

type OnboardingState = {
  step: OnboardingStep;
  data: OnboardingData;
  updateData: (patch: Partial<OnboardingData>) => void;
  goToStep: (step: OnboardingStep) => void;
  nextStep: () => void;
  previousStep: () => void;
  reset: () => void;
};

/**
 * Flow state for src/features/onboarding/ — persisted to localStorage so
 * a tutor who closes the tab mid-flow (e.g. right after the purchase
 * email) picks up exactly where they left off. See docs/ONBOARDING.md.
 */
export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      step: 1,
      data: INITIAL_DATA,
      updateData: (patch) => set((state) => ({ data: { ...state.data, ...patch } })),
      goToStep: (step) => set({ step }),
      nextStep: () => set((state) => ({ step: Math.min(4, state.step + 1) as OnboardingStep })),
      previousStep: () => set((state) => ({ step: Math.max(1, state.step - 1) as OnboardingStep })),
      reset: () => set({ step: 1, data: INITIAL_DATA }),
    }),
    {
      name: 'olhar-de-tutor:onboarding',
    },
  ),
);
