import { create } from 'zustand';

import type { CheckinFormData, StoolDetails, StoolUIStatus, UrineDetails, UrineUIStatus } from '../types';
import { DEFAULT_CHECKIN_FORM } from '../types';

type CheckinFormStore = {
  form: CheckinFormData;
  update: (patch: Partial<CheckinFormData>) => void;
  updateStoolDetail: (key: keyof StoolDetails, value: boolean) => void;
  updateUrineDetail: (key: keyof UrineDetails, value: boolean) => void;
  setStoolStatus: (status: StoolUIStatus) => void;
  setUrineStatus: (status: UrineUIStatus) => void;
  reset: () => void;
};

export const useCheckinFormStore = create<CheckinFormStore>((set) => ({
  form: { ...DEFAULT_CHECKIN_FORM },

  update: (patch) => set((s) => ({ form: { ...s.form, ...patch } })),

  updateStoolDetail: (key, value) =>
    set((s) => ({ form: { ...s.form, stoolDetails: { ...s.form.stoolDetails, [key]: value } } })),

  updateUrineDetail: (key, value) =>
    set((s) => ({ form: { ...s.form, urineDetails: { ...s.form.urineDetails, [key]: value } } })),

  setStoolStatus: (status) =>
    set((s) => ({
      form: {
        ...s.form,
        stoolStatus: status,
        // clear details when switching away from 'different'
        stoolDetails: status === 'different' ? s.form.stoolDetails : {},
      },
    })),

  setUrineStatus: (status) =>
    set((s) => ({
      form: {
        ...s.form,
        urineStatus: status,
        urineDetails: status === 'different' ? s.form.urineDetails : {},
      },
    })),

  reset: () => set({ form: { ...DEFAULT_CHECKIN_FORM } }),
}));
