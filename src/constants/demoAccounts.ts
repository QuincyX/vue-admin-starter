import type { Role } from '@/types/auth'

export interface DemoAccount {
  role: Role
  email: string
  password: string
  /** Short description of what this account can do in the console. */
  note: string
}

/**
 * Demo credentials served by `server/admin-api-mock.ts`.
 *
 * Keep these in sync with the mock server: the login page renders them as one-click
 * fill buttons so a reviewer can see the RBAC differences without editing data.
 */
export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: 'owner',
    email: 'owner@aurora.dev',
    password: 'AuroraOwner123!',
    note: '全部权限，可调整角色与重置数据',
  },
  {
    role: 'admin',
    email: 'admin@aurora.dev',
    password: 'AuroraAdmin123!',
    note: '可管理成员与导出日志',
  },
  {
    role: 'viewer',
    email: 'viewer@aurora.dev',
    password: 'AuroraViewer123!',
    note: '只读，写入操作会被拒绝',
  },
]
