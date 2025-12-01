/**
 * Centralized route configuration for the application.
 * Use these constants instead of hardcoding paths throughout the codebase.
 */
export const routes = {
  home: "/",
  signIn: "/sign-in",
  signUp: "/sign-up",
  onboarding: "/onboarding",

  business: {
    root: "/business/places",
    places: {
      list: "/business/places",
      new: "/business/places/new",
      detail: (id: string) => `/business/places/${id}` as const,
      preview: (id: string) => `/business/places/${id}/preview` as const,
    },
  },

  explorer: {
    root: "/explorer",
    feed: "/explorer",
    saved: "/explorer/saved",
    preferences: "/explorer/preferences",
    places: {
      detail: (id: string) => `/explorer/places/${id}` as const,
    },
  },
} as const;

/**
 * Helper to check if a pathname matches or starts with a route
 */
export function isRouteActive(pathname: string, route: string, exact = false): boolean {
  if (exact) {
    return pathname === route;
  }
  return pathname === route || pathname.startsWith(`${route}/`);
}
