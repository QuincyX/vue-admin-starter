import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { auditRepository } from '@/api/audit'
import { isApiError, type ApiErrorCode } from '@/api/errors'
import { AUDIT_ACTIONS, type AuditAction, type AuditEvent } from '@/types/audit'

export type AuditStoreStatus = 'idle' | 'loading' | 'ready' | 'error'

const DAY_MS = 86_400_000

function emptyActionCounts(): Record<AuditAction, number> {
  return Object.fromEntries(AUDIT_ACTIONS.map((action) => [action, 0])) as Record<
    AuditAction,
    number
  >
}

/**
 * Read side of the audit trail.
 *
 * The store only hydrates and derives; mutations are written through
 * `recordAuditEvent()` by the store that owns the domain action. That keeps one
 * writer per event and lets this store stay a pure projection — swap the
 * repository for a REST adapter and nothing here changes.
 */
export const useAuditStore = defineStore('audit', () => {
  const events = ref<AuditEvent[]>([])
  const status = ref<AuditStoreStatus>('idle')
  const errorCode = ref<ApiErrorCode | null>(null)

  let inFlight: Promise<void> | null = null

  const total = computed(() => events.value.length)

  const actionCounts = computed(() => {
    const counts = emptyActionCounts()
    for (const event of events.value) counts[event.action] += 1
    return counts
  })

  /** Failures are the reason an operator opens this log, so they get a KPI. */
  const failures24h = computed(() => {
    const since = Date.now() - DAY_MS
    return events.value.filter(
      (event) => event.outcome === 'failure' && new Date(event.at).getTime() >= since,
    ).length
  })

  const recent = computed(() =>
    [...events.value].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 6),
  )

  async function hydrate(force = false): Promise<void> {
    if (inFlight) return inFlight
    if (!force && status.value === 'ready') return

    status.value = 'loading'
    errorCode.value = null

    inFlight = (async () => {
      try {
        const { rows } = await auditRepository.list()
        events.value = rows
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

  return { events, status, errorCode, total, actionCounts, failures24h, recent, hydrate }
})
