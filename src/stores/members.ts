import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { recordAuditEvent } from '@/api/audit'
import { isApiError, type ApiErrorCode } from '@/api/errors'
import { memberRepository } from '@/api/members'
import { roleCan } from '@/constants/permissions'
import { createSeedMembers } from '@/data/members'
import { useAuthStore } from '@/stores/auth'
import type { Role } from '@/types/auth'
import type { Department, Member, MemberDraft, MemberStatus } from '@/types/member'

export type MemberStoreStatus = 'idle' | 'loading' | 'ready' | 'error'

/** A rule the UI must explain inline instead of showing a generic API failure. */
export class MemberRuleError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'MemberRuleError'
  }
}

function emptyCounts<T extends string>(values: readonly T[]): Record<T, number> {
  return Object.fromEntries(values.map((value) => [value, 0])) as Record<T, number>
}

export const useMemberStore = defineStore('members', () => {
  const auth = useAuthStore()

  const members = ref<Member[]>([])
  const status = ref<MemberStoreStatus>('idle')
  const errorCode = ref<ApiErrorCode | null>(null)
  const pending = ref(false)

  let inFlight: Promise<void> | null = null

  const total = computed(() => members.value.length)

  const statusCounts = computed(() => {
    const counts = emptyCounts<MemberStatus>(['active', 'invited', 'suspended'])
    for (const member of members.value) counts[member.status] += 1
    return counts
  })

  const roleCounts = computed(() => {
    const counts = emptyCounts<Role>(['owner', 'admin', 'viewer'])
    for (const member of members.value) counts[member.role] += 1
    return counts
  })

  const departmentCounts = computed(() => {
    const counts = emptyCounts<Department>([
      'engineering',
      'design',
      'growth',
      'support',
      'finance',
    ])
    for (const member of members.value) counts[member.department] += 1
    return counts
  })

  const activeCount = computed(() => statusCounts.value.active)
  const privilegedCount = computed(() => roleCounts.value.owner + roleCounts.value.admin)

  /** Loads members once; `force` refetches (used by the audit-driven pages and tests). */
  async function hydrate(force = false): Promise<void> {
    if (inFlight) return inFlight
    if (!force && status.value === 'ready') return

    status.value = 'loading'
    errorCode.value = null

    inFlight = (async () => {
      try {
        const { rows } = await memberRepository.list()
        members.value = rows
        status.value = 'ready'
      } catch (error) {
        status.value = 'error'
        errorCode.value = isApiError(error) ? error.code : 'unknown'
      } finally {
        inFlight = null
      }
    })()

    return inFlight
  }

  function isEmailTaken(email: string, exceptId?: string): boolean {
    const normalized = email.trim().toLowerCase()
    return members.value.some(
      (member) => member.id !== exceptId && member.email.toLowerCase() === normalized,
    )
  }

  function findById(id: string): Member | null {
    return members.value.find((member) => member.id === id) ?? null
  }

  function requireActor() {
    const actor = auth.user
    if (!actor) throw new MemberRuleError('登录状态已失效，请重新登录后再操作。')
    return { id: actor.id, name: actor.name, email: actor.email, role: actor.role }
  }

  async function createMember(draft: MemberDraft): Promise<Member> {
    const actor = requireActor()

    if (isEmailTaken(draft.email)) {
      throw new MemberRuleError('该邮箱已被其他成员使用。')
    }

    pending.value = true
    try {
      const created = await memberRepository.create(draft)
      members.value = [created, ...members.value]

      await recordAuditEvent({
        actor,
        action: 'member.create',
        target: `新增成员 · ${created.name}`,
        metadata: { email: created.email, role: created.role, department: created.department },
      })

      return created
    } finally {
      pending.value = false
    }
  }

  async function updateMember(id: string, draft: MemberDraft): Promise<Member> {
    const actor = requireActor()
    const current = findById(id)

    if (!current) throw new MemberRuleError('该成员已不存在，请刷新后重试。')

    if (isEmailTaken(draft.email, id)) {
      throw new MemberRuleError('该邮箱已被其他成员使用。')
    }

    const grantsOwner = current.role !== 'owner' && draft.role === 'owner'
    if (grantsOwner && !roleCan(actor.role, 'system:manage')) {
      throw new MemberRuleError('只有拥有者可以授予「拥有者」角色。')
    }

    pending.value = true
    try {
      const updated = await memberRepository.update(id, draft)
      members.value = members.value.map((member) => (member.id === id ? updated : member))

      await recordAuditEvent({
        actor,
        action: 'member.update',
        target:
          current.role !== updated.role
            ? `调整成员角色 · ${updated.name}`
            : `更新成员资料 · ${updated.name}`,
        metadata:
          current.role !== updated.role
            ? { from: current.role, to: updated.role }
            : { email: updated.email, status: updated.status },
      })

      return updated
    } finally {
      pending.value = false
    }
  }

  async function removeMember(id: string): Promise<void> {
    const actor = requireActor()
    const current = findById(id)

    if (!current) throw new MemberRuleError('该成员已不存在，请刷新后重试。')

    if (current.role === 'owner') {
      throw new MemberRuleError('拥有者账号不能被移除。')
    }

    pending.value = true
    try {
      await memberRepository.remove(id)
      members.value = members.value.filter((member) => member.id !== id)

      await recordAuditEvent({
        actor,
        action: 'member.delete',
        target: `移除成员 · ${current.name}`,
        metadata: { email: current.email, role: current.role },
      })
    } finally {
      pending.value = false
    }
  }

  /** Demo-only: restore the seeded roster. Gated by `system:manage` in the UI. */
  async function resetToSeed(): Promise<void> {
    const actor = requireActor()

    if (!roleCan(actor.role, 'system:manage')) {
      throw new MemberRuleError('只有拥有者可以重置演示数据。')
    }

    pending.value = true
    try {
      await memberRepository.replaceAll(createSeedMembers())
      await hydrate(true)

      await recordAuditEvent({
        actor,
        action: 'data.reset',
        target: '重置成员演示数据',
        metadata: { rows: String(members.value.length) },
      })
    } finally {
      pending.value = false
    }
  }

  return {
    members,
    status,
    errorCode,
    pending,
    total,
    activeCount,
    privilegedCount,
    statusCounts,
    roleCounts,
    departmentCounts,
    hydrate,
    findById,
    isEmailTaken,
    createMember,
    updateMember,
    removeMember,
    resetToSeed,
  }
})
