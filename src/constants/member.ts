import type { Department, MemberStatus } from '@/types/member'
import type { Role } from '@/types/auth'

export const MEMBER_STATUS_LABELS: Record<MemberStatus, string> = {
  active: '已激活',
  invited: '待接受邀请',
  suspended: '已停用',
}

export const MEMBER_STATUS_BADGE_CLASS: Record<MemberStatus, string> = {
  active: 'border-transparent bg-emerald-500/12 text-emerald-700 dark:text-emerald-400',
  invited: 'border-transparent bg-amber-500/14 text-amber-700 dark:text-amber-400',
  suspended: 'border-transparent bg-rose-500/12 text-rose-700 dark:text-rose-400',
}

export const DEPARTMENT_LABELS: Record<Department, string> = {
  engineering: '研发',
  design: '设计',
  growth: '增长',
  support: '客户支持',
  finance: '财务',
}

export const ROLE_BADGE_CLASS: Record<Role, string> = {
  owner: 'border-transparent bg-primary/12 text-primary',
  admin: 'border-transparent bg-sky-500/12 text-sky-700 dark:text-sky-400',
  viewer: 'border-transparent bg-muted text-muted-foreground',
}
