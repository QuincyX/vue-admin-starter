import type { Component } from 'vue'
import { LayoutDashboard, ScrollText, Settings, ShieldCheck, Users } from '@lucide/vue'

import type { Permission } from '@/types/auth'

export interface NavItem {
  /** Route path used by `RouterLink` and `aria-current` matching. */
  to: string
  label: string
  icon: Component
  /** The sidebar hides the item and the route guard blocks it without this. */
  permission: Permission
}

export interface NavGroup {
  title: string
  items: NavItem[]
}

/**
 * Sidebar source of truth. The router keeps its own records (they must stay
 * lazy-loadable), and `navigation.spec.ts` asserts both lists address the same
 * paths so navigation cannot drift from the route table.
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    title: '概览',
    items: [{ to: '/', label: '数据总览', icon: LayoutDashboard, permission: 'dashboard:read' }],
  },
  {
    title: '管理',
    items: [
      { to: '/members', label: '成员管理', icon: Users, permission: 'members:read' },
      { to: '/audit', label: '操作日志', icon: ScrollText, permission: 'audit:read' },
    ],
  },
  {
    title: '系统',
    items: [
      { to: '/settings', label: '系统设置', icon: Settings, permission: 'settings:read' },
      { to: '/access', label: '访问控制', icon: ShieldCheck, permission: 'system:manage' },
    ],
  },
]

export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((group) => group.items)
