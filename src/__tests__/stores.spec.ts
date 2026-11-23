import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { MemberRuleError, useMemberStore } from '@/stores/members'
import { useAuditStore } from '@/stores/audit'
import { useAuthStore } from '@/stores/auth'
import type { Role } from '@/types/auth'
import type { MemberDraft } from '@/types/member'

function signInAs(role: Role): void {
  const auth = useAuthStore()
  auth.user = { id: 'usr_test', name: '测试账号', email: 'test@aurora.dev', role }
  auth.status = 'authenticated'
  auth.initialized = true
}

function draft(overrides: Partial<MemberDraft> = {}): MemberDraft {
  return {
    name: '新成员',
    email: 'new.member@aurora.dev',
    role: 'viewer',
    status: 'invited',
    department: 'design',
    title: '视觉设计师',
    ...overrides,
  }
}

describe('member store', () => {
  beforeEach(() => {
    window.localStorage.clear()
    setActivePinia(createPinia())
    signInAs('admin')
  })

  it('hydrates the seeded roster once and derives counts', async () => {
    const members = useMemberStore()

    await members.hydrate()

    expect(members.status).toBe('ready')
    expect(members.total).toBe(24)
    expect(members.roleCounts.owner).toBe(1)
    expect(
      members.statusCounts.active + members.statusCounts.invited + members.statusCounts.suspended,
    ).toBe(24)
    expect(members.departmentCounts.engineering).toBeGreaterThan(0)

    // A second call without `force` is a no-op, so the table does not refetch on
    // every navigation.
    const before = members.members.length
    await members.hydrate()
    expect(members.members.length).toBe(before)
  })

  it('creates a member and appends an audit row', async () => {
    const members = useMemberStore()
    const audit = useAuditStore()
    await members.hydrate()

    const created = await members.createMember(draft())

    expect(members.total).toBe(25)
    expect(members.members[0]?.id).toBe(created.id)
    expect(created.lastActiveAt).toBeNull()

    await audit.hydrate(true)
    expect(
      audit.events.some(
        (event) => event.action === 'member.create' && event.target.includes('新成员'),
      ),
    ).toBe(true)
  })

  it('rejects a duplicate email case-insensitively', async () => {
    const members = useMemberStore()
    await members.hydrate()

    await expect(
      members.createMember(draft({ email: 'CHEN.SIYUAN@aurora.dev' })),
    ).rejects.toBeInstanceOf(MemberRuleError)
  })

  it('lets only the owner grant the owner role', async () => {
    const members = useMemberStore()
    await members.hydrate()

    const viewer = members.members.find((member) => member.role === 'viewer')
    expect(viewer).toBeDefined()
    if (!viewer) return

    await expect(
      members.updateMember(viewer.id, {
        name: viewer.name,
        email: viewer.email,
        role: 'owner',
        status: viewer.status,
        department: viewer.department,
        title: viewer.title,
      }),
    ).rejects.toThrow('只有拥有者可以授予「拥有者」角色。')

    signInAs('owner')

    const updated = await members.updateMember(viewer.id, {
      name: viewer.name,
      email: viewer.email,
      role: 'owner',
      status: viewer.status,
      department: viewer.department,
      title: viewer.title,
    })

    expect(updated.role).toBe('owner')
  })

  it('refuses to remove the owner account', async () => {
    const members = useMemberStore()
    await members.hydrate()

    const owner = members.members.find((member) => member.role === 'owner')
    expect(owner).toBeDefined()
    if (!owner) return

    await expect(members.removeMember(owner.id)).rejects.toThrow('拥有者账号不能被移除。')
  })

  it('removes a member and records the action', async () => {
    const members = useMemberStore()
    const audit = useAuditStore()
    await members.hydrate()

    const target = members.members.find((member) => member.role === 'viewer')
    expect(target).toBeDefined()
    if (!target) return

    await members.removeMember(target.id)

    expect(members.findById(target.id)).toBeNull()
    expect(members.total).toBe(23)

    await audit.hydrate(true)
    expect(audit.events.some((event) => event.action === 'member.delete')).toBe(true)
  })

  it('gates the demo reset behind system:manage', async () => {
    const members = useMemberStore()
    await members.hydrate()

    await expect(members.resetToSeed()).rejects.toThrow('只有拥有者可以重置演示数据。')

    const target = members.members.find((member) => member.role === 'viewer')
    if (target) await members.removeMember(target.id)
    expect(members.total).toBe(23)

    signInAs('owner')
    await members.resetToSeed()
    expect(members.total).toBe(24)
  })
})

describe('audit store', () => {
  beforeEach(() => {
    window.localStorage.clear()
    setActivePinia(createPinia())
    signInAs('admin')
  })

  it('hydrates seeded history and derives distributions', async () => {
    const audit = useAuditStore()

    await audit.hydrate(true)

    expect(audit.status).toBe('ready')
    expect(audit.total).toBeGreaterThan(30)

    const summed = Object.values(audit.actionCounts).reduce((total, count) => total + count, 0)
    expect(summed).toBe(audit.total)

    expect(audit.failures24h).toBeGreaterThanOrEqual(0)
    expect(audit.recent.length).toBeLessThanOrEqual(6)
  })

  it('keeps the seeded history stable across reads', async () => {
    const audit = useAuditStore()

    await audit.hydrate(true)
    const firstIds = audit.events.slice(0, 5).map((event) => event.id)

    await audit.hydrate(true)
    expect(audit.events.slice(0, 5).map((event) => event.id)).toEqual(firstIds)
  })
})
