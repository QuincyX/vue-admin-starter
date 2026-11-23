import { createRandom, pick, randomInt } from '@/lib/random'
import type { AuditAction, AuditActor, AuditEvent, AuditOutcome } from '@/types/audit'

const DAY_MS = 86_400_000

const ACTORS: AuditActor[] = [
  { id: 'usr_owner', name: '陈思远', email: 'chen.siyuan@aurora.dev', role: 'owner' },
  { id: 'usr_admin', name: '林浅', email: 'lin.qian@aurora.dev', role: 'admin' },
  { id: 'usr_admin_2', name: '赵一鸣', email: 'zhao.yiming@aurora.dev', role: 'admin' },
  { id: 'usr_viewer', name: '吴迪', email: 'wu.di@aurora.dev', role: 'viewer' },
]

const ACTION_WEIGHTS: AuditAction[] = [
  'auth.login',
  'auth.login',
  'auth.login',
  'auth.logout',
  'member.update',
  'member.update',
  'member.create',
  'member.delete',
  'settings.profile',
  'settings.password',
  'data.export',
]

const TARGETS: Record<AuditAction, string[]> = {
  'auth.login': ['控制台登录'],
  'auth.logout': ['控制台退出'],
  'member.create': ['新增成员', '邀请成员'],
  'member.update': ['更新成员资料', '调整成员角色'],
  'member.delete': ['移除成员'],
  'settings.profile': ['更新个人资料'],
  'settings.password': ['修改登录密码'],
  'data.export': ['导出操作日志'],
  'data.reset': ['重置演示数据'],
}

const MEMBER_NAMES = ['吴迪', '沈亦然', '韩雪', '程野', '罗嘉', '许安', '唐屿', '孟琢', '范舟']

/**
 * Seeded history for the audit log.
 *
 * A demo admin needs something to filter, sort and page through on first boot. The
 * generator is seeded, so the same request order produces the same table on every
 * reload — unlike `Math.random()`, which would make screenshots and E2E assertions
 * drift.
 */
export function createSeedAuditEvents(now = new Date()): AuditEvent[] {
  const random = createRandom(20260812)
  const events: AuditEvent[] = []

  // 14 days of history, 3–6 events per day.
  for (let dayOffset = 13; dayOffset >= 0; dayOffset--) {
    const perDay = randomInt(random, 3, 6)

    for (let index = 0; index < perDay; index++) {
      const action = pick(random, ACTION_WEIGHTS)
      const actor = pick(random, ACTORS)
      const outcome: AuditOutcome = random() < 0.07 ? 'failure' : 'success'
      const at = new Date(
        now.getTime() -
          dayOffset * DAY_MS -
          randomInt(random, 1, 10) * 3_600_000 -
          randomInt(random, 0, 59) * 60_000,
      )

      events.push({
        id: `evt_seed_${dayOffset}_${index}`,
        at: at.toISOString(),
        actor,
        action,
        outcome,
        target: buildTarget(action, random),
        ip: `10.24.${randomInt(random, 0, 12)}.${randomInt(random, 2, 240)}`,
        metadata: buildMetadata(action, actor, outcome),
      })
    }
  }

  return events.sort((a, b) => b.at.localeCompare(a.at))
}

function buildTarget(action: AuditAction, random: () => number): string {
  const candidates = TARGETS[action]
  const base = pick(random, candidates)

  if (action.startsWith('member.') && action !== 'member.create') {
    return `${base} · ${pick(random, MEMBER_NAMES)}`
  }

  return base
}

function buildMetadata(
  action: AuditAction,
  actor: AuditActor,
  outcome: AuditOutcome,
): Record<string, string> {
  const metadata: Record<string, string> = {
    role: actor.role,
    client: 'web-admin',
  }

  if (action.startsWith('member.')) metadata.scope = 'members'
  if (action.startsWith('settings.')) metadata.scope = 'account'
  if (action === 'data.export') metadata.format = 'csv'
  if (outcome === 'failure') metadata.reason = '权限校验未通过'

  return metadata
}
