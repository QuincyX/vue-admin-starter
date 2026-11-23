import { z } from 'zod'

/**
 * Role-based access control is part of the auth schema, not a UI concern: the role
 * arrives from `/auth/login` and `/auth/me`, and every permission decision derives
 * from it. Adding a role means touching this file and `constants/permissions.ts`;
 * the compiler then reports every reference that needs a decision.
 */
export const ROLES = ['owner', 'admin', 'viewer'] as const

export const roleSchema = z.enum(ROLES)

export const PERMISSIONS = [
  'dashboard:read',
  'members:read',
  'members:write',
  'audit:read',
  'audit:export',
  'settings:read',
  'settings:write',
  'system:manage',
] as const

export const permissionSchema = z.enum(PERMISSIONS)

export const authUserSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  role: roleSchema,
})

export const authSessionSchema = z.object({
  token: z.string().min(1),
  user: authUserSchema,
})

export const authMeResponseSchema = z.object({
  user: authUserSchema,
})

export const authProfileResponseSchema = z.object({
  user: authUserSchema,
})

export const loginInputSchema = z.object({
  email: z.string().trim().min(1, '请输入邮箱').email('请输入有效的邮箱地址'),
  password: z.string().min(1, '请输入密码'),
})

export const profileInputSchema = z.object({
  name: z.string().trim().min(2, '名称至少需要 2 个字符').max(40, '名称不能超过 40 个字符'),
})

export const passwordInputSchema = z.object({
  currentPassword: z.string().min(1, '请输入当前密码'),
  newPassword: z.string().min(8, '密码至少需要 8 个字符').max(128, '密码不能超过 128 个字符'),
})

export type Role = z.infer<typeof roleSchema>
export type Permission = z.infer<typeof permissionSchema>
export type AuthUser = z.infer<typeof authUserSchema>
export type AuthSession = z.infer<typeof authSessionSchema>
export type LoginInput = z.infer<typeof loginInputSchema>
export type ProfileInput = z.infer<typeof profileInputSchema>
export type PasswordInput = z.infer<typeof passwordInputSchema>
