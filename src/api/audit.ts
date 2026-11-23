import { createSeedAuditEvents } from '@/data/audit'
import {
  auditDraftSchema,
  auditListSchema,
  type AuditAction,
  type AuditActor,
  type AuditDraft,
  type AuditEvent,
  type AuditOutcome,
} from '@/types/audit'
import { localRepository } from './repository'

export const AUDIT_STORAGE_KEY = 'aurora.audit.v1'

/**
 * Where the client thinks the request came from.
 *
 * An audit trail must be written server-side: the client cannot be trusted for the
 * actor, the IP or the timestamp. This constant exists so the demo log has a
 * plausible column and so replacing this module with `POST /audit/events` is a
 * one-file change.
 */
const CLIENT_IP = '127.0.0.1'

function toEntity(draft: AuditDraft): AuditEvent {
  return { ...draft, id: `evt_${crypto.randomUUID().slice(0, 8)}` }
}

function merge(current: AuditEvent, draft: AuditDraft): AuditEvent {
  return { ...current, ...draft }
}

export const auditRepository = localRepository<AuditEvent, AuditDraft>({
  storageKey: AUDIT_STORAGE_KEY,
  schema: auditListSchema,
  seed: () => createSeedAuditEvents(),
  toEntity,
  merge,
})

export interface RecordAuditInput {
  actor: AuditActor
  action: AuditAction
  target: string
  outcome?: AuditOutcome
  metadata?: Record<string, string>
  ip?: string
}

/**
 * Appends one audit row for a user action the UI just performed.
 *
 * Best-effort by design: a failed write must never fail the member edit that
 * produced it, and local storage can be unavailable (private mode, quota). The
 * production equivalent is a server-side write inside the same transaction as the
 * mutation — the doc explains that trade-off.
 */
export async function recordAuditEvent(input: RecordAuditInput): Promise<void> {
  const draft = auditDraftSchema.parse({
    at: new Date().toISOString(),
    actor: input.actor,
    action: input.action,
    outcome: input.outcome ?? 'success',
    target: input.target,
    ip: input.ip ?? CLIENT_IP,
    metadata: input.metadata ?? {},
  })

  try {
    await auditRepository.create(draft)
  } catch {
    // Never block the domain action on the demo audit trail.
  }
}
