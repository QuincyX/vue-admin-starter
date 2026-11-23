import type { RouteLocationRaw } from 'vue-router'

import type { Permission } from '@/types/auth'

declare module 'vue-router' {
  interface RouteMeta {
    /** Document title and breadcrumb label. Every route must set it (red line 5). */
    title: string
    description?: string
    requiresAuth?: boolean
    guestOnly?: boolean
    layout?: 'default' | 'auth'
    /** Permission required to enter the route; the guard redirects to /403 without it. */
    permission?: Permission
  }
}

export type AppRouteLocation = RouteLocationRaw
