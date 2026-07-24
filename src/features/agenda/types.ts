import type { HealthEvent } from '@/lib/supabase/queries/healthEvents';

export type { HealthEvent };

export type EventStatus = 'expired' | 'soon' | 'upcoming' | 'none';

function parseLocalDate(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00`);
}

export function getEventStatus(nextDate: string | null | undefined): EventStatus {
  if (!nextDate) return 'none';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const next = parseLocalDate(nextDate);
  const diffMs = next.getTime() - today.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'expired';
  if (diffDays <= 7) return 'soon';
  return 'upcoming';
}
