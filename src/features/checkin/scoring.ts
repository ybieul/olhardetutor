import { CHECKIN_SCORE_WEIGHTS } from '@/config/app.config';
import type { CheckinFormData, StoolDetails, StoolUIStatus, UrineDetails, UrineUIStatus } from './types';

function scoreUnidirectional(value: number): number {
  // 1-5 scale where 5 is best: (value-1)/4 → 0..1
  return (value - 1) / 4;
}

function scoreBidirectional(value: number): number {
  // 1-5 scale where 3 (center) is best; both extremes are equally bad
  return 1 - Math.abs(value - 3) / 2;
}

function scoreStool(status: StoolUIStatus, details: StoolDetails): number {
  if (status === 'normal') return 1;
  if (status === 'not_observed') return 0.6;
  // different — severity-graded
  if (details.blood || details.mucus || details.parasites) return 0.2;
  return 0.5;
}

function scoreUrine(status: UrineUIStatus, details: UrineDetails): number {
  if (status === 'normal') return 1;
  if (status === 'not_observed') return 0.6;
  // different — severity-graded
  if (details.blood || details.straining) return 0.2;
  return 0.5;
}

/** Returns a 1–100 integer score derived from the completed form. Pure function. */
export function computeDayScore(form: CheckinFormData): number {
  const w = CHECKIN_SCORE_WEIGHTS;
  const raw =
    scoreUnidirectional(form.feeding) * w.feeding +
    scoreUnidirectional(form.water) * w.water +
    scoreBidirectional(form.sleep) * w.sleep +
    scoreUnidirectional(form.activity) * w.activity +
    scoreStool(form.stoolStatus, form.stoolDetails) * w.stool +
    scoreUrine(form.urineStatus, form.urineDetails) * w.urine +
    scoreUnidirectional(form.behavior) * w.behavior;

  return Math.round(raw * 100);
}

export type ScoreBand = 'high' | 'medium' | 'low';

export function getScoreBand(score: number): ScoreBand {
  if (score >= 75) return 'high';
  if (score >= 50) return 'medium';
  return 'low';
}

/**
 * Maps the UI stool status + details to the DB enum value for persistence.
 * Priority: blood/mucus > soft > hard > catch-all.
 */
export function deriveStoolStatus(
  status: StoolUIStatus,
  details: StoolDetails,
): 'normal' | 'soft' | 'hard' | 'diarrhea' | 'blood_or_mucus' | 'not_observed' {
  if (status === 'normal') return 'normal';
  if (status === 'not_observed') return 'not_observed';
  if (details.blood || details.mucus) return 'blood_or_mucus';
  if (details.soft) return 'soft';
  if (details.hard) return 'hard';
  return 'soft';
}

/**
 * Maps the UI urine status + details to the DB enum value for persistence.
 * Priority: blood > straining > frequency > catch-all.
 */
export function deriveUrineStatus(
  status: UrineUIStatus,
  details: UrineDetails,
): 'normal' | 'increased_frequency' | 'decreased_frequency' | 'blood_present' | 'straining' | 'not_observed' {
  if (status === 'normal') return 'normal';
  if (status === 'not_observed') return 'not_observed';
  if (details.blood) return 'blood_present';
  if (details.straining) return 'straining';
  if (details.increasedFrequency) return 'increased_frequency';
  if (details.decreasedFrequency) return 'decreased_frequency';
  return 'increased_frequency';
}
