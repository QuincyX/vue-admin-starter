<script setup lang="ts">
import { Info } from '@lucide/vue'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { env } from '@/config/env'

const appVersion = __APP_VERSION__
const buildTime = __BUILD_TIME__

const stack = [
  'Vue 3.5 · Composition API',
  'Vite 8 · Rolldown',
  'TypeScript 7',
  'shadcn-vue · reka-ui',
  'Pinia · Vue Router',
  'ECharts 6',
  'Axios · Zod',
]

const rows = [
  { label: '应用版本', value: `v${appVersion}` },
  { label: '运行环境', value: env.VITE_APP_ENV },
  { label: '构建时间', value: new Date(buildTime).toLocaleString('zh-CN') },
]
</script>

<template>
  <Card class="gap-0 py-0">
    <CardHeader class="p-5 pb-4">
      <CardTitle class="flex items-center gap-2 text-sm font-semibold">
        <Info class="size-4 text-primary" aria-hidden="true" />
        关于 Aurora Admin
      </CardTitle>
      <CardDescription class="mt-1 text-xs">Web 管理后台起始模板。</CardDescription>
    </CardHeader>

    <CardContent class="space-y-3 p-5 pt-0">
      <dl class="space-y-2 text-xs">
        <div v-for="row in rows" :key="row.label" class="flex items-center justify-between gap-3">
          <dt class="text-muted-foreground">{{ row.label }}</dt>
          <dd class="font-mono text-[11px]">{{ row.value }}</dd>
        </div>
      </dl>

      <div class="border-t pt-3">
        <p class="mb-2 text-[10px] tracking-wide text-muted-foreground uppercase">技术栈</p>
        <ul class="flex flex-wrap gap-1.5">
          <li
            v-for="item in stack"
            :key="item"
            class="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
          >
            {{ item }}
          </li>
        </ul>
      </div>
    </CardContent>
  </Card>
</template>
