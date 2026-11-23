import { z } from 'zod'

import { roleSchema } from './auth'

export const MEMBER_STATUSES = ['active', 'invited', 'suspended'] as const
export const DEPARTMENTS = ['engineering', 'design', 'growth', 'support', 'finance'] as const

export const memberStatusSchema = z.enum(MEMBER_STATUSES)
export const departmentSchema = z.enum(DEPARTMENTS)

/**
 * Every external boundary (seed data, form input, local cache, future REST
 * response) parses through these schemas; `Member` is inferred, never restated.
 */
export const memberSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  role: roleSchema,
  status: memberStatusSchema,
  department: departmentSchema,
  title: z.string().default(''),
  lastActiveAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const memberListSchema = z.array(memberSchema)

export const memberDraftSchema = z.object({
  name: z.string().trim().min(2, '姓名至少需要 2 个字符').max(40, '姓名不能超过 40 个字符'),
  email: z.string().trim().min(1, '请输入邮箱').email('请输入有效的邮箱地址'),
  role: roleSchema,
  status: memberStatusSchema,
  department: departmentSchema,
  title: z.string().trim().max(60, '职位不能超过 60 个字符').default(''),
})

export type Member = z.infer<typeof memberSchema>
export type MemberDraft = z.infer<typeof memberDraftSchema>
export type MemberList = z.infer<typeof memberListSchema>
export type MemberStatus = z.infer<typeof memberStatusSchema>
export type Department = z.infer<typeof departmentSchema>
