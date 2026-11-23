import { z } from 'zod'

import { roleSchema } from './auth'

/**
 * Audit actions are a closed enum on purpose: the log table filters, badge styling
 * and labels all key off it, so an unknown action from a backend is a schema error
 * instead of a silently unstyled row.
 */
export const AUDIT_ACTIONS = [
  'auth.login',
  'auth.logout',
  'member.create',
  'member.update',
  'member.delete',
  'settings.profile',
  'settings.password',
  'data.export',
  'data.reset',
] as const

export const AUDIT_OUTCOMES = ['success', 'failure'] as const

export const auditActionSchema = z.enum(AUDIT_ACTIONS)
export const auditOutcomeSchema = z.enum(AUDIT_OUTCOMES)

export const auditActorSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  role: roleSchema,
})

export const auditEventSchema = z.object({
  id: z.string().min(1),
  at: z.string().min(1),
  actor: auditActorSchema,
  action: auditActionSchema,
  outcome: auditOutcomeSchema,
  /** Human-readable subject, e.g. the member name or the affected setting. */
  target: z.string(),
  ip: z.string(),
  /** Flat string map shown in the detail dialog; never tokens or secrets. */
  metadata: z.record(z.string(), z.string()).default({}),
})

export const auditListSchema = z.array(auditEventSchema)

export const auditDraftSchema = auditEventSchema.omit({ id: true })

export type AuditAction = z.infer<typeof auditActionSchema>
export type AuditOutcome = z.infer<typeof auditOutcomeSchema>
export type AuditActor = z.infer<typeof auditActorSchema>
export type AuditEvent = z.infer<typeof auditEventSchema>
export type AuditDraft = z.infer<typeof auditDraftSchema>
export type AuditList = z.infer<typeof auditListSchema>
