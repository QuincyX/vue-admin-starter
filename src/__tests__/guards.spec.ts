import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { beforeEach, describe, expect, it } from 'vitest'
import { setActivePinia } from 'pinia'

import { installGuards } from '@/router/guards'
import { useAuthStore } from '@/stores/auth'
import { pinia } from '@/stores/pinia'
import type { Role } from '@/types/auth'

const Stub = defineComponent({ render: () => h('div') })

function buildRouter() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/login',
        name: 'login',
        component: Stub,
        meta: { title: '登录', layout: 'auth', guestOnly: true },
      },
      {
        path: '/',
        name: 'dashboard',
        component: Stub,
        meta: { title: '数据总览', requiresAuth: true, permission: 'dashboard:read' },
      },
      {
        path: '/members',
        name: 'members',
        component: Stub,
        meta: { title: '成员管理', requiresAuth: true, permission: 'members:read' },
      },
      {
        path: '/system',
        name: 'system',
        component: Stub,
        meta: { title: '系统管理', requiresAuth: true, permission: 'system:manage' },
      },
      {
        path: '/403',
        name: 'forbidden',
        component: Stub,
        meta: { title: '无访问权限', requiresAuth: true },
      },
    ],
  })

  installGuards(router)
  return router
}

function signInAs(role: Role): void {
  const auth = useAuthStore(pinia)
  auth.user = { id: 'usr_guard', name: '守卫测试', email: 'guard@aurora.dev', role }
  auth.status = 'authenticated'
  auth.initialized = true
}

function signOut(): void {
  const auth = useAuthStore(pinia)
  auth.user = null
  auth.status = 'guest'
  auth.initialized = true
}

describe('route guards', () => {
  beforeEach(() => {
    window.localStorage.clear()
    setActivePinia(pinia)
  })

  it('sends anonymous deep links to the login page with the original path', async () => {
    signOut()
    const router = buildRouter()

    await router.push('/members?role=viewer')

    expect(router.currentRoute.value.name).toBe('login')
    expect(router.currentRoute.value.query.redirect).toBe('/members?role=viewer')
  })

  it('lets a viewer open a route their role can read', async () => {
    signInAs('viewer')
    const router = buildRouter()

    await router.push('/members')

    expect(router.currentRoute.value.name).toBe('members')
  })

  it('routes a missing permission to /403 with the requested path', async () => {
    signInAs('admin')
    const router = buildRouter()

    await router.push('/system')

    expect(router.currentRoute.value.name).toBe('forbidden')
    expect(router.currentRoute.value.query.from).toBe('/system')
  })

  it('lets the owner open the same route', async () => {
    signInAs('owner')
    const router = buildRouter()

    await router.push('/system')

    expect(router.currentRoute.value.name).toBe('system')
  })

  it('keeps signed-in users off the login page', async () => {
    signInAs('viewer')
    const router = buildRouter()

    await router.push('/login')

    expect(router.currentRoute.value.name).toBe('dashboard')
  })

  it('refuses an external redirect target after login', async () => {
    signInAs('viewer')
    const router = buildRouter()

    await router.push('/login?redirect=https://evil.example.com')

    expect(router.currentRoute.value.name).toBe('dashboard')
  })

  it('restores the session before deciding (bootstrap runs once)', async () => {
    signOut()
    const auth = useAuthStore(pinia)
    auth.initialized = false

    const router = buildRouter()
    await router.push('/')

    expect(auth.initialized).toBe(true)
    expect(router.currentRoute.value.name).toBe('login')
  })
})

// Mounting is not needed for guard tests, but `useRoute`-free guards still require
// an installed router in the app context for `router.push` to resolve components.
describe('guard harness', () => {
  it('mounts a component with the same router to prove the guard setup is usable', async () => {
    signInAs('viewer')
    const router = buildRouter()
    await router.push('/members')
    await router.isReady()

    const wrapper = mount(defineComponent({ render: () => h('div', 'ok') }), {
      global: { plugins: [router] },
    })

    expect(wrapper.text()).toBe('ok')
  })
})
