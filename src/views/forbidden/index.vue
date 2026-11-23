<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, ShieldAlert } from '@lucide/vue'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ROLE_LABELS } from '@/constants/permissions'
import { useAuthStore } from '@/stores/auth'
import { useLoadingStore } from '@/stores/loading'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const loading = useLoadingStore()

const requestedPath = computed(() =>
  typeof route.query.from === 'string' ? route.query.from : '该页面',
)

const roleLabel = computed(() => (auth.role ? ROLE_LABELS[auth.role] : '当前角色'))

async function switchAccount(): Promise<void> {
  await loading.run(async () => {
    await auth.logout()
    await router.push({ name: 'login' })
  }, '正在退出…')
}
</script>

<template>
  <div class="flex min-h-[60vh] items-center justify-center">
    <Card class="w-full max-w-lg gap-0 py-0">
      <CardContent class="p-8 text-center">
        <span
          class="mx-auto grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive"
          aria-hidden="true"
        >
          <ShieldAlert class="size-6" />
        </span>

        <p class="mt-4 text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
          403 · Forbidden
        </p>
        <h1 class="mt-1 text-xl font-semibold tracking-tight">当前角色没有访问权限</h1>
        <p class="mt-2 text-sm text-muted-foreground">
          {{ roleLabel }}角色无权访问
          <code class="rounded bg-muted px-1 py-0.5 font-mono text-xs">{{ requestedPath }}</code>
          。如需访问，请让拥有者调整你的角色。
        </p>

        <div class="mt-6 flex items-center justify-center gap-2">
          <Button variant="outline" @click="router.push('/')">
            <ArrowLeft aria-hidden="true" />
            返回数据总览
          </Button>
          <Button data-testid="switch-account" @click="switchAccount">切换账号</Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
