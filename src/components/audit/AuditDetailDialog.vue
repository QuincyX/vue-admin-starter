<script setup lang="ts">
import { computed } from 'vue'

import AuditActionBadge from '@/components/audit/AuditActionBadge.vue'
import AuditOutcomeBadge from '@/components/audit/AuditOutcomeBadge.vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ROLE_LABELS } from '@/constants/permissions'
import type { AuditEvent } from '@/types/audit'
import { formatDateTime, formatRelativeTime } from '@/utils/date'

const props = defineProps<{
  open: boolean
  event: AuditEvent | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const metadataEntries = computed(() => (props.event ? Object.entries(props.event.metadata) : []))
</script>

<template>
  <Dialog :open="props.open" @update:open="(value) => emit('update:open', value)">
    <DialogContent class="sm:max-w-xl" data-testid="audit-detail">
      <DialogHeader>
        <DialogTitle>操作详情</DialogTitle>
        <DialogDescription>
          审计记录只读；生产环境由服务端写入，客户端不可篡改。
        </DialogDescription>
      </DialogHeader>

      <div v-if="event" class="space-y-4">
        <dl class="grid grid-cols-[6rem_1fr] gap-x-4 gap-y-2.5 text-sm">
          <dt class="text-muted-foreground">时间</dt>
          <dd class="font-mono text-xs tabular-nums">
            {{ formatDateTime(event.at) }}
            <span class="ml-1 text-muted-foreground">({{ formatRelativeTime(event.at) }})</span>
          </dd>

          <dt class="text-muted-foreground">操作</dt>
          <dd><AuditActionBadge :action="event.action" /></dd>

          <dt class="text-muted-foreground">对象</dt>
          <dd class="break-all">{{ event.target || '—' }}</dd>

          <dt class="text-muted-foreground">操作人</dt>
          <dd>
            {{ event.actor.name }}
            <span class="text-muted-foreground">· {{ event.actor.email }}</span>
            <span class="ml-1 text-xs text-muted-foreground"
              >({{ ROLE_LABELS[event.actor.role] }})</span
            >
          </dd>

          <dt class="text-muted-foreground">结果</dt>
          <dd><AuditOutcomeBadge :outcome="event.outcome" /></dd>

          <dt class="text-muted-foreground">来源 IP</dt>
          <dd class="font-mono text-xs">{{ event.ip }}</dd>

          <dt class="text-muted-foreground">记录 ID</dt>
          <dd class="font-mono text-xs break-all">{{ event.id }}</dd>
        </dl>

        <div>
          <p class="mb-2 text-xs font-medium text-muted-foreground">附加字段</p>
          <ul v-if="metadataEntries.length > 0" class="space-y-1">
            <li
              v-for="[key, value] in metadataEntries"
              :key="key"
              class="flex items-center justify-between gap-3 rounded-md bg-muted/50 px-3 py-1.5"
            >
              <code class="font-mono text-[11px] text-muted-foreground">{{ key }}</code>
              <span class="text-xs">{{ value }}</span>
            </li>
          </ul>
          <p v-else class="text-xs text-muted-foreground">无附加字段。</p>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
