<script setup lang="ts">
import { RouterView } from 'vue-router'
import { ShieldCheck, TableProperties, TrendingUp } from '@lucide/vue'

import AppLogo from '@/components/brand/AppLogo.vue'

/**
 * Authentication shell: brand panel on the left, form on the right.
 * Desktop-only by design (see `docs/architecture.md` §10).
 */
const highlights = [
  {
    icon: ShieldCheck,
    title: '基于角色的访问控制',
    description: '路由守卫、侧边栏与操作按钮共用同一套权限表。',
  },
  {
    icon: TableProperties,
    title: '通用表格与列表管理',
    description: '搜索、筛选、排序、分页与批量选择开箱即用。',
  },
  {
    icon: TrendingUp,
    title: '总览图表与操作日志',
    description: 'ECharts 图表、KPI 卡片与可筛选的审计流水。',
  },
]
</script>

<template>
  <div class="grid min-h-dvh grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
    <aside
      class="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex"
    >
      <div
        class="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-primary-foreground/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        class="pointer-events-none absolute -bottom-32 -left-16 size-96 rounded-full bg-primary-foreground/10 blur-3xl"
        aria-hidden="true"
      />

      <div class="relative">
        <div class="flex items-center gap-2.5">
          <span class="grid size-9 place-items-center rounded-xl bg-primary-foreground/15">
            <svg viewBox="0 0 24 24" fill="none" class="size-5" aria-hidden="true">
              <path
                d="M4 18.5 12 4l8 14.5"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M8.2 14.5h7.6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </span>
          <span class="text-sm font-semibold tracking-tight">Aurora Admin</span>
        </div>

        <h1 class="mt-16 max-w-md text-3xl leading-tight font-semibold tracking-tight text-balance">
          把后台的重复工作，交给一套可信的起始模板。
        </h1>
        <p class="mt-4 max-w-md text-sm leading-relaxed text-primary-foreground/80">
          鉴权、权限、图表、操作日志与通用表格已经连通，登录后从数据总览开始。
        </p>

        <ul class="mt-10 space-y-5">
          <li v-for="item in highlights" :key="item.title" class="flex gap-3">
            <span
              class="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-primary-foreground/15"
            >
              <component :is="item.icon" class="size-4" aria-hidden="true" />
            </span>
            <span>
              <span class="block text-sm font-medium">{{ item.title }}</span>
              <span class="mt-0.5 block text-xs leading-relaxed text-primary-foreground/75">
                {{ item.description }}
              </span>
            </span>
          </li>
        </ul>
      </div>

      <p class="relative text-xs text-primary-foreground/70">演示环境 · 账号与数据仅保存在本机</p>
    </aside>

    <main class="flex items-center justify-center bg-background px-6 py-12">
      <div class="w-full max-w-sm">
        <div class="mb-8 lg:hidden">
          <AppLogo />
        </div>
        <RouterView />
      </div>
    </main>
  </div>
</template>
