import type { PetSpeciesKey, GuideModuleId } from '@/config/app.config';

export type AlertLevel = 'observe' | 'attention' | 'urgent';
export type SignalSpecies = 'all' | PetSpeciesKey;

export type AlertSignData = {
  text: string;
  level: AlertLevel;
  species: SignalSpecies;
};

export type AlertCategoryData = {
  title: string;
  signals: AlertSignData[];
};

export type GuideSectionData = {
  id: string;
  title: string;
  body: string;
  species: SignalSpecies;
};

export type GuideModuleData = {
  title: string;
  tagline: string;
  sections: GuideSectionData[];
};

export type GuideView =
  | { type: 'list' }
  | { type: 'module'; id: GuideModuleId }
  | { type: 'alertSigns' };
