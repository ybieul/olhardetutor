/**
 * Central registry of route paths. Navigation code should reference these
 * constants rather than writing path strings inline.
 */

export const ROUTES = {
  login: '/login',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  onboarding: '/onboarding',
  home: '/home',
  checkin: '/checkin',
  guides: '/guides',
  agenda: '/agenda',
  profile: '/profile',
  /** Component gallery for visual QA — not part of the shipped app. */
  devShowcase: '/_dev',
} as const;

export type RouteKey = keyof typeof ROUTES;
