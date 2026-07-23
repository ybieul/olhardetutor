import { describe, expect, it } from 'vitest';

import { computeDayScore, getScoreBand } from './scoring';
import type { CheckinFormData } from './types';

const BASE: CheckinFormData = {
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

describe('computeDayScore', () => {
  it('returns 100 when all categories are optimal', () => {
    expect(
      computeDayScore({ ...BASE, feeding: 5, water: 5, sleep: 3, activity: 5, behavior: 5 }),
    ).toBe(100);
  });

  it('returns a medium-range score (50–74) for mild issues', () => {
    // all sliders at 3, stool normal, urine different with mild flag
    const score = computeDayScore({ ...BASE, urineStatus: 'different', urineDetails: { increasedFrequency: true } });
    expect(score).toBeGreaterThanOrEqual(50);
    expect(score).toBeLessThan(75);
  });

  it('returns a low score (< 50) for severe multi-category issues', () => {
    const score = computeDayScore({
      ...BASE,
      feeding: 1,
      water: 1,
      sleep: 5,
      activity: 1,
      stoolStatus: 'different',
      stoolDetails: { blood: true },
      urineStatus: 'different',
      urineDetails: { blood: true },
      behavior: 1,
    });
    expect(score).toBeLessThan(50);
  });

  it('penalises sleep at extremes equally (1 and 5 score the same)', () => {
    const sleepLow = computeDayScore({ ...BASE, sleep: 1 });
    const sleepHigh = computeDayScore({ ...BASE, sleep: 5 });
    expect(sleepLow).toBe(sleepHigh);
  });

  it('treats stool blood/mucus/parasites as more severe than soft/hard', () => {
    const mild = computeDayScore({ ...BASE, stoolStatus: 'different', stoolDetails: { soft: true } });
    const severe = computeDayScore({ ...BASE, stoolStatus: 'different', stoolDetails: { blood: true } });
    expect(severe).toBeLessThan(mild);
  });

  it('treats urine blood/straining as more severe than frequency changes', () => {
    const mild = computeDayScore({
      ...BASE,
      urineStatus: 'different',
      urineDetails: { increasedFrequency: true },
    });
    const severe = computeDayScore({ ...BASE, urineStatus: 'different', urineDetails: { blood: true } });
    expect(severe).toBeLessThan(mild);
  });

  it('returns a value between 0 and 100', () => {
    const score = computeDayScore(BASE);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});

describe('getScoreBand', () => {
  it('returns high for scores >= 75', () => {
    expect(getScoreBand(75)).toBe('high');
    expect(getScoreBand(100)).toBe('high');
  });

  it('returns medium for scores 50–74', () => {
    expect(getScoreBand(50)).toBe('medium');
    expect(getScoreBand(74)).toBe('medium');
  });

  it('returns low for scores < 50', () => {
    expect(getScoreBand(49)).toBe('low');
    expect(getScoreBand(0)).toBe('low');
  });
});
