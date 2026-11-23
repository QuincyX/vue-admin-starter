import type { Permission, Role } from '@/types/auth'

/**
 * The single authorization table.
 *
 * Route guards, the sidebar and in-page action buttons all resolve permissions
 * through this module; nothing hardcodes `role === 'admin'`. A backend that
 * returns per-user permission codes instead of a role would replace this file and
 * keep every call site.
 */
export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  owner: [
    'dashboard:read',
    'members:read',
    'members:write',
    'audit:read',
    'audit:export',
    'settings:read',
    'settings:write',
    'system:manage',
  ],
  admin: [
    'dashboard:read',
    'members:read',
    'members:write',
    'audit:read',
    'audit:export',
    'settings:read',
    'settings:write',
  ],
  viewer: ['dashboard:read', 'members:read', 'audit:read', 'settings:read'],
}

export const ROLE_LABELS: Record<Role, string> = {
  owner: '拥有者',
  admin: '管理员',
  viewer: '观察员',
}

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  owner: '全部权限，包含成员角色调整与演示数据重置。',
  admin: '可管理成员、查看并导出操作日志，但不能调整成员角色。',
  viewer: '只读账号：可查看总览、成员与操作日志。',
}

export const PERMISSION_LABELS: Record<Permission, string> = {
  'dashboard:read': '查看总览',
  'members:read': '查看成员',
  'members:write': '管理成员',
  'audit:read': '查看操作日志',
  'audit:export': '导出操作日志',
  'settings:read': '查看设置',
  'settings:write': '修改个人设置',
  'system:manage': '系统管理',
}

export function permissionsForRole(role: Role | null | undefined): readonly Permission[] {
  if (!role) return []
  return ROLE_PERMISSIONS[role]
}

export function roleCan(role: Role | null | undefined, permission: Permission): boolean {
  if (!role) return false
  return ROLE_PERMISSIONS[role].includes(permission)
}
