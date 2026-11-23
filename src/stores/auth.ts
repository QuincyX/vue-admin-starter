import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { authApi } from '@/api/auth'
import { recordAuditEvent } from '@/api/audit'
import { isApiError } from '@/api/errors'
import { clearAccessToken, getAccessToken, setAccessToken } from '@/api/token'
import { permissionsForRole } from '@/constants/permissions'
import type { AuditActor } from '@/types/audit'
import { type AuthUser, type LoginInput, type PasswordInput, type ProfileInput } from '@/types/auth'

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'guest'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const status = ref<AuthStatus>('idle')
  const initialized = ref(false)
  const pending = ref(false)

  let bootstrapPromise: Promise<void> | null = null

  const isAuthenticated = computed(() => status.value === 'authenticated' && user.value !== null)
  const role = computed(() => user.value?.role ?? null)
  const permissions = computed(() => permissionsForRole(role.value))
  const displayName = computed(() => user.value?.name ?? '未登录')

  /** The audit actor for the signed-in user, or `null` when there is nobody to log. */
  function auditActor(): AuditActor | null {
    if (!user.value) return null
    const { id, name, email, role: currentRole } = user.value
    return { id, name, email, role: currentRole }
  }

  function applySession(session: { token: string; user: AuthUser }): AuthUser {
    setAccessToken(session.token)
    user.value = session.user
    status.value = 'authenticated'
    initialized.value = true
    return session.user
  }

  function clearSession(): void {
    clearAccessToken()
    user.value = null
    status.value = 'guest'
    initialized.value = true
  }

  async function bootstrap(): Promise<void> {
    if (initialized.value) return
    if (bootstrapPromise) return bootstrapPromise

    status.value = 'loading'
    bootstrapPromise = (async () => {
      const token = getAccessToken()
      if (!token) {
        clearSession()
        return
      }

      try {
        const response = await authApi.me()
        user.value = response.user
        status.value = 'authenticated'
      } catch (error) {
        if (isApiError(error) && error.status === 401) clearAccessToken()
        user.value = null
        status.value = 'guest'
      } finally {
        initialized.value = true
        bootstrapPromise = null
      }
    })()

    return bootstrapPromise
  }

  async function login(input: LoginInput): Promise<AuthUser> {
    pending.value = true
    try {
      const session = await authApi.login(input)
      const signedIn = applySession(session)

      await recordAuditEvent({
        actor: { id: signedIn.id, name: signedIn.name, email: signedIn.email, role: signedIn.role },
        action: 'auth.login',
        target: '控制台登录',
        metadata: { role: signedIn.role },
      })

      return signedIn
    } finally {
      pending.value = false
    }
  }

  async function logout(): Promise<void> {
    pending.value = true
    const actor = auditActor()

    try {
      if (getAccessToken()) await authApi.logout()
    } catch {
      // Local session must be cleared even when the server is unreachable.
    } finally {
      if (actor) {
        await recordAuditEvent({ actor, action: 'auth.logout', target: '控制台退出' })
      }
      pending.value = false
      clearSession()
    }
  }

  async function updateProfile(input: ProfileInput): Promise<AuthUser> {
    if (!user.value) throw new Error('Authentication required.')

    pending.value = true
    try {
      const response = await authApi.updateProfile(input)
      const previous = user.value
      user.value = response.user

      await recordAuditEvent({
        actor: {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          role: response.user.role,
        },
        action: 'settings.profile',
        target: '更新个人资料',
        metadata: { from: previous.name, to: response.user.name },
      })

      return response.user
    } finally {
      pending.value = false
    }
  }

  async function changePassword(input: PasswordInput): Promise<void> {
    const actor = auditActor()
    pending.value = true
    try {
      await authApi.changePassword(input)

      if (actor) {
        await recordAuditEvent({ actor, action: 'settings.password', target: '修改登录密码' })
      }

      clearSession()
    } finally {
      pending.value = false
    }
  }

  function handleUnauthorized(): void {
    clearSession()
  }

  return {
    user,
    status,
    initialized,
    pending,
    isAuthenticated,
    role,
    permissions,
    displayName,
    bootstrap,
    login,
    logout,
    updateProfile,
    changePassword,
    handleUnauthorized,
  }
})
