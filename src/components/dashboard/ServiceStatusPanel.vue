<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { CircleAlert, CircleCheck, RefreshCw } from '@lucide/vue'

import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SERVICE_STATUSES } from '@/data/dashboard'
import { useHealthStore } from '@/stores/health'
import type { ServiceStatus } from '@/types/dashboard'
import { formatLatency } from '@/utils/format'

const health = useHealthStore()

const statusLabels: Record<ServiceStatus['status'], string> = {
  operational: '正常',
  degraded: '延迟偏高',
  down: '不可用',
}

const statusTone: Record<ServiceStatus['status'], string> = {
  operational: 'text-emerald-600 dark:text-emerald-400',
  degraded: 'text-amber-600 dark:text-amber-400',
  down: 'text-rose-600 dark:text-rose-400',
}

/**
 * The `api` row is measured live through the health store; the other rows are
 * illustrative in the demo. That mix is intentional: it shows how to fold one real
 * probe into a static panel without pretending the rest is real.
 */
const services = computed<ServiceStatus[]>(() =>
  SERVICE_STATUSES.map((service) => {
    if (service.id !== 'api') return service

    if (health.isLoading) return { ...service, latencyMs: null, status: 'operational' }
    if (health.status === 'error') return { ...service, latencyMs: null, status: 'down' }

    return { ...service, latencyMs: health.latencyMs, status: 'operational' }
  }),
)

onMounted(() => {
  void health.check()
})
</script>

<template>
  <Card class="gap-0 py-0">
    <CardHeader class="flex flex-row items-center justify-between gap-3 space-y-0 p-5 pb-3">
      <div>
        <CardTitle class="text-sm font-semibold">系统状态</CardTitle>
        <CardDescription class="mt-1 text-xs">API 网关实时探测，其余为演示数据</CardDescription>
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        :disabled="health.isLoading"
        aria-label="重新检测服务状态"
        @click="health.check()"
      >
        <RefreshCw :class="health.isLoading && 'animate-spin'" aria-hidden="true" />
      </Button>
    </CardHeader>

    <ul class="divide-y border-t">
      <li
        v-for="service in services"
        :key="service.id"
        class="flex items-center justify-between gap-3 px-5 py-3"
      >
        <span class="flex min-w-0 items-center gap-2">
          <CircleCheck
            v-if="service.status === 'operational'"
            :class="statusTone[service.status]"
            class="size-4 shrink-0"
            aria-hidden="true"
          />
          <CircleAlert
            v-else
            :class="statusTone[service.status]"
            class="size-4 shrink-0"
            aria-hidden="true"
          />
          <span class="truncate text-xs font-medium">{{ service.name }}</span>
        </span>

        <span class="flex shrink-0 items-center gap-3 text-[11px]">
          <span class="text-muted-foreground tabular-nums">{{
            formatLatency(service.latencyMs)
          }}</span>
          <span :class="statusTone[service.status]">{{ statusLabels[service.status] }}</span>
        </span>
      </li>
    </ul>
  </Card>
</template>
