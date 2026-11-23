import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import { installGuards } from './guards'

/**
 * Routes stay flat and lazy: each view is a separate chunk, and the guard installs
 * the authentication + permission checks once (see `guards.ts`).
 *
 * `meta.permission` mirrors the sidebar's `permission` field, so a URL typed by
 * hand cannot bypass what the navigation hides.
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/index.vue'),
    meta: {
      title: '登录',
      description: '使用分配给您的后台账号登录',
      layout: 'auth',
      guestOnly: true,
    },
  },
  {
    path: '/',
    name: 'dashboard',
    component: () => import('@/views/home/index.vue'),
    meta: {
      title: '数据总览',
      description: '关键指标、流量趋势、操作分布与系统状态',
      requiresAuth: true,
      permission: 'dashboard:read',
    },
  },
  {
    path: '/members',
    name: 'members',
    component: () => import('@/views/members/index.vue'),
    meta: {
      title: '成员管理',
      description: '维护成员资料、角色与账号状态',
      requiresAuth: true,
      permission: 'members:read',
    },
  },
  {
    path: '/audit',
    name: 'audit',
    component: () => import('@/views/audit/index.vue'),
    meta: {
      title: '操作日志',
      description: '按操作类型、结果与时间范围检索审计流水',
      requiresAuth: true,
      permission: 'audit:read',
    },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/settings/index.vue'),
    meta: {
      title: '系统设置',
      description: '账号安全、外观偏好与演示数据管理',
      requiresAuth: true,
      permission: 'settings:read',
    },
  },
  {
    path: '/access',
    name: 'access',
    component: () => import('@/views/access/index.vue'),
    meta: {
      title: '访问控制',
      description: '角色与权限矩阵，仅拥有者可见',
      requiresAuth: true,
      permission: 'system:manage',
    },
  },
  {
    path: '/403',
    name: 'forbidden',
    component: () => import('@/views/forbidden/index.vue'),
    meta: {
      title: '无访问权限',
      description: '当前角色没有访问该页面的权限',
      requiresAuth: true,
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/not-found/index.vue'),
    meta: {
      title: '页面不存在',
      description: '请求的地址不存在',
      requiresAuth: true,
    },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
})

installGuards(router)

export default router
