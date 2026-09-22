/**
 * Formats a Date as its LOCAL year-month-day (YYYY-MM-DD). Unlike
 * `date.toISOString().slice(0, 10)` (which reports the UTC date), this
 * matches what the tutor sees on their own clock — the two disagree near
 * midnight, in either direction depending on the tutor's time zone offset.
 */
export function toLocalDateStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/** Today's date in the tutor's local time zone, as YYYY-MM-DD. */
export function todayLocal(): string {
  return toLocalDateStr(new Date());
}
