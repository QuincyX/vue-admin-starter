<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { DatabaseBackup, TriangleAlert } from '@lucide/vue'

import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { usePermission } from '@/composables/usePermission'
import { useToast } from '@/composables/useToast'
import { MemberRuleError, useMemberStore } from '@/stores/members'
import { useAuditStore } from '@/stores/audit'

const memberStore = useMemberStore()
const auditStore = useAuditStore()
const { can } = usePermission()
const { toast } = useToast()

const canManage = computed(() => can('system:manage'))
const confirmOpen = ref(false)
const resetting = ref(false)

onMounted(() => {
  void memberStore.hydrate()
  void auditStore.hydrate()
})

async function resetDemoData(): Promise<void> {
  resetting.value = true
  try {
    await memberStore.resetToSeed()
    await auditStore.hydrate(true)
    toast({ title: '示例成员数据已恢复', variant: 'success' })
  } catch (error) {
    toast({
      title: '重置失败',
      description: error instanceof MemberRuleError ? error.message : '请稍后重试。',
      variant: 'error',
    })
  } finally {
    resetting.value = false
    confirmOpen.value = false
  }
}
</script>

<template>
  <Card class="gap-0 py-0">
    <CardHeader class="p-5 pb-4">
      <CardTitle class="flex items-center gap-2 text-sm font-semibold">
        <DatabaseBackup class="size-4 text-primary" aria-hidden="true" />
        演示数据
      </CardTitle>
      <CardDescription class="mt-1 text-xs">
        数据保存在当前浏览器的 localStorage，仅用于演示；操作日志是追加写入的，不会被清空。
      </CardDescription>
    </CardHeader>

    <CardContent class="space-y-3 p-5 pt-0">
      <div class="grid grid-cols-2 gap-2">
        <div class="rounded-md bg-muted/50 px-3 py-2">
          <p class="text-[10px] tracking-wide text-muted-foreground uppercase">成员</p>
          <p class="mt-0.5 text-lg font-semibold tabular-nums">{{ memberStore.total }}</p>
        </div>
        <div class="rounded-md bg-muted/50 px-3 py-2">
          <p class="text-[10px] tracking-wide text-muted-foreground uppercase">审计记录</p>
          <p class="mt-0.5 text-lg font-semibold tabular-nums">{{ auditStore.total }}</p>
        </div>
      </div>

      <div class="flex items-center justify-between gap-3">
        <p class="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <TriangleAlert class="size-3.5 text-amber-500" aria-hidden="true" />
          重置会覆盖成员表的当前内容。
        </p>

        <Badge v-if="!canManage" variant="secondary" class="shrink-0">需要系统管理权限</Badge>
        <Button
          v-else
          variant="outline"
          size="sm"
          :disabled="resetting"
          data-testid="reset-demo-data"
          @click="confirmOpen = true"
        >
          恢复示例数据
        </Button>
      </div>
    </CardContent>

    <ConfirmDialog
      v-model:open="confirmOpen"
      title="恢复示例成员数据？"
      description="当前的成员增删改会被替换为 24 条示例数据，已创建的内容将丢失。"
      confirm-label="确认恢复"
      destructive
      @confirm="resetDemoData"
    />
  </Card>
</template>
