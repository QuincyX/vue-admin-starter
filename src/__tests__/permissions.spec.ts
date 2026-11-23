import { describe, expect, it } from 'vitest'

import { NAV_ITEMS } from '@/constants/navigation'
import {
  PERMISSION_LABELS,
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
  permissionsForRole,
  roleCan,
} from '@/constants/permissions'
import router from '@/router'
import { PERMISSIONS, ROLES, type Permission } from '@/types/auth'

describe('role permissions', () => {
  it('covers every declared permission in the label map', () => {
    expect(Object.keys(PERMISSION_LABELS).sort()).toEqual([...PERMISSIONS].sort())
  })

  it('covers every role in labels and descriptions', () => {
    expect(Object.keys(ROLE_LABELS).sort()).toEqual([...ROLES].sort())
    expect(Object.keys(ROLE_DESCRIPTIONS).sort()).toEqual([...ROLES].sort())
  })

  it('grants owner everything and viewer read-only access', () => {
    for (const permission of PERMISSIONS) {
      expect(roleCan('owner', permission)).toBe(true)
    }

    expect(roleCan('viewer', 'members:read')).toBe(true)
    expect(roleCan('viewer', 'members:write')).toBe(false)
    expect(roleCan('viewer', 'audit:export')).toBe(false)
    expect(roleCan('viewer', 'system:manage')).toBe(false)
  })

  it('keeps role changes and system management owner-only', () => {
    const admin = permissionsForRole('admin')

    expect(admin).toContain('members:write')
    expect(admin).not.toContain('system:manage')
    expect(roleCan('admin', 'system:manage')).toBe(false)
  })

  it('treats a missing role as no permissions', () => {
    for (const permission of PERMISSIONS) {
      expect(roleCan(null, permission)).toBe(false)
    }

    expect(permissionsForRole(null)).toEqual([])
  })
})

describe('navigation contract', () => {
  const routePaths = new Set(router.getRoutes().map((route) => route.path))

  it('points every sidebar item at a real route', () => {
    for (const item of NAV_ITEMS) {
      expect(routePaths.has(item.to)).toBe(true)
    }
  })

  it('mirrors each sidebar permission on the route meta', () => {
    for (const item of NAV_ITEMS) {
      const record = router
        .getRoutes()
        .find((route) => route.path === item.to && route.meta.permission)

      expect(record?.meta.permission).toBe(item.permission)
      expect(record?.meta.requiresAuth).toBe(true)
      expect(record?.meta.title).toEqual(expect.any(String))
    }
  })

  it('requires a title on every route', () => {
    for (const route of router.getRoutes()) {
      if (route.path.startsWith('/:')) continue
      expect(route.meta.title).toEqual(expect.any(String))
    }
  })

  it('grants every nav permission to at least one role', () => {
    for (const item of NAV_ITEMS) {
      const reachable = ROLES.some((role) => roleCan(role, item.permission as Permission))
      expect(reachable).toBe(true)
    }
  })
})
