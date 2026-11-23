import type { AuditAction, AuditOutcome } from '@/types/audit'

/** Display metadata for every audit action; shared by the log table and charts. */
export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  'auth.login': '登录',
  'auth.logout': '退出登录',
  'member.create': '新增成员',
  'member.update': '更新成员',
  'member.delete': '移除成员',
  'settings.profile': '更新资料',
  'settings.password': '修改密码',
  'data.export': '导出日志',
  'data.reset': '重置数据',
}

/** Actions that change access or data get a destructive/attention tone. */
export const AUDIT_ACTION_TONES: Record<AuditAction, 'neutral' | 'accent' | 'danger'> = {
  'auth.login': 'neutral',
  'auth.logout': 'neutral',
  'member.create': 'accent',
  'member.update': 'neutral',
  'member.delete': 'danger',
  'settings.profile': 'neutral',
  'settings.password': 'accent',
  'data.export': 'neutral',
  'data.reset': 'danger',
}

export const AUDIT_OUTCOME_LABELS: Record<AuditOutcome, string> = {
  success: '成功',
  failure: '失败',
}

export const AUDIT_ACTIONS_SORTED: AuditAction[] = [
  'auth.login',
  'auth.logout',
  'member.create',
  'member.update',
  'member.delete',
  'settings.profile',
  'settings.password',
  'data.export',
  'data.reset',
]
