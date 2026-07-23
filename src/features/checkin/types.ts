export type StoolUIStatus = 'normal' | 'different' | 'not_observed';
export type UrineUIStatus = 'normal' | 'different' | 'not_observed';

export type StoolDetails = {
  soft?: boolean;
  hard?: boolean;
  blood?: boolean;
  mucus?: boolean;
  colorChange?: boolean;
  parasites?: boolean;
};

export type UrineDetails = {
  increasedFrequency?: boolean;
  decreasedFrequency?: boolean;
  colorChange?: boolean;
  blood?: boolean;
  straining?: boolean;
};

export type CheckinFormData = {
  feeding: number;
  water: number;
  sleep: number;
  activity: number;
  stoolStatus: StoolUIStatus;
  stoolDetails: StoolDetails;
  urineStatus: UrineUIStatus;
  urineDetails: UrineDetails;
  behavior: number;
  freeNote: string;
};

export const DEFAULT_CHECKIN_FORM: CheckinFormData = {
  feeding: 3,
  water: 3,
  sleep: 3,
  activity: 3,
  stoolStatus: 'normal',
  stoolDetails: {},
  urineStatus: 'normal',
  urineDetails: {},
  behavior: 3,
  freeNote: '',
};
