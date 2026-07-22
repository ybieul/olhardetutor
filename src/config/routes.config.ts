/**
 * Central registry of route paths. Navigation code should reference these
 * constants rather than writing path strings inline.
 */

export const ROUTES = {
  login: '/login',
  onboarding: '/onboarding',
  home: '/home',
  checkin: '/checkin',
  guides: '/guides',
  agenda: '/agenda',
  profile: '/profile',
} as const;

export type RouteKey = keyof typeof ROUTES;
