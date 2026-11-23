<script setup lang="ts">
import { computed } from 'vue'
import { LoaderCircle, RefreshCw, Server } from '@lucide/vue'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { env } from '@/config/env'
import { useHealthStore } from '@/stores/health'
import { apiErrorCodeMessage } from '@/utils/apiError'
import { formatDateTime } from '@/utils/date'

const health = useHealthStore()

const statusText = computed(() => {
  if (health.isLoading) return '检测中…'
  if (health.isHealthy) return `连接正常（${health.latencyMs ?? 0} ms）`
  if (health.status === 'error')
    return health.errorCode ? apiErrorCodeMessage(health.errorCode) : '连接失败'
  return '尚未检测'
})

const checkedAt = computed(() => (health.checkedAt ? formatDateTime(health.checkedAt) : '—'))
</script>

<template>
  <Card class="gap-0 py-0">
    <CardHeader class="p-5 pb-4">
      <CardTitle class="flex items-center gap-2 text-sm font-semibold">
        <Server class="size-4 text-primary" aria-hidden="true" />
        后端连接
      </CardTitle>
      <CardDescription class="mt-1 text-xs">
        Axios 实例与拦截器已就绪，这里请求 <code class="font-mono">GET /health</code> 验证链路。
      </CardDescription>
    </CardHeader>

    <CardContent class="space-y-3 p-5 pt-0">
      <div class="rounded-md bg-muted/50 px-3 py-2">
        <p class="text-[10px] tracking-wide text-muted-foreground uppercase">API 地址</p>
        <p class="mt-0.5 font-mono text-xs break-all">{{ env.VITE_API_BASE_URL }}</p>
      </div>

      <div class="flex items-center justify-between gap-3">
        <div class="min-w-0">
          <p class="text-xs font-medium">{{ statusText }}</p>
          <p class="mt-0.5 text-[11px] text-muted-foreground">最近检测：{{ checkedAt }}</p>
          <p v-if="health.requestId" class="mt-0.5 font-mono text-[10px] text-muted-foreground">
            请求 ID：{{ health.requestId }}
          </p>
          <p v-if="health.status === 'error'" class="mt-0.5 text-[10px] text-muted-foreground">
            本地开发由 <code class="font-mono">server/admin-api-mock.ts</code> 提供接口。
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          :disabled="health.isLoading"
          data-testid="health-check"
          @click="health.check()"
        >
          <LoaderCircle v-if="health.isLoading" class="animate-spin" aria-hidden="true" />
          <RefreshCw v-else aria-hidden="true" />
          测试连接
        </Button>
      </div>
    </CardContent>
  </Card>
</template>
