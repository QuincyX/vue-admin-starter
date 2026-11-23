import { request } from './http'
import {
  authMeResponseSchema,
  authProfileResponseSchema,
  authSessionSchema,
  type LoginInput,
  type PasswordInput,
  type ProfileInput,
} from '@/types/auth'

/**
 * Auth contract. Each response is parsed by its Zod schema, so an unexpected
 * backend shape fails here instead of leaking into the auth store.
 *
 * Account provisioning is intentionally absent: admin accounts are created by an
 * operator or the identity provider, never by self-service registration.
 */
export const authApi = {
  login: async (input: LoginInput) => {
    const payload = await request<unknown>({ url: '/auth/login', method: 'POST', data: input })
    return authSessionSchema.parse(payload)
  },

  me: async () => {
    const payload = await request<unknown>({ url: '/auth/me', method: 'GET' })
    return authMeResponseSchema.parse(payload)
  },

  updateProfile: async (input: ProfileInput) => {
    const payload = await request<unknown>({ url: '/auth/profile', method: 'PATCH', data: input })
    return authProfileResponseSchema.parse(payload)
  },

  changePassword: async (input: PasswordInput): Promise<void> => {
    await request<void>({ url: '/auth/password', method: 'PUT', data: input })
  },

  logout: async (): Promise<void> => {
    await request<void>({ url: '/auth/logout', method: 'POST' })
  },
}
