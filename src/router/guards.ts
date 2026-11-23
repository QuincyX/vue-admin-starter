import type { Router } from 'vue-router'

import { roleCan } from '@/constants/permissions'
import { useAuthStore } from '@/stores/auth'
import { pinia } from '@/stores/pinia'
import { getSafeRedirect } from '@/utils/redirect'

// Side-effect import: registers the `RouteMeta` augmentation used below.
import '@/types/router'

/**
 * Authentication + authorization, in one place.
 *
 * Order matters:
 * 1. restore the session before the first decision (a reload keeps the token);
 * 2. signed-in users never see /login;
 * 3. anonymous deep links bounce to /login with the original path;
 * 4. a missing permission routes to /403 — not /login, and not a blank page.
 *
 * The permission check is meta-driven so adding a module means adding one route
 * record, not touching this guard.
 */
export function installGuards(router: Router): void {
  router.beforeEach(async (to) => {
    const auth = useAuthStore(pinia)

    if (!auth.initialized) await auth.bootstrap()

    if (to.meta.guestOnly && auth.isAuthenticated) {
      return getSafeRedirect(to.query.redirect, '/')
    }

    if (to.meta.requiresAuth && !auth.isAuthenticated) {
      return { name: 'login', query: { redirect: to.fullPath } }
    }

    if (to.meta.permission && !roleCan(auth.role, to.meta.permission)) {
      return { name: 'forbidden', query: { from: to.fullPath } }
    }

    return true
  })
}
