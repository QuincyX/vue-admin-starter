<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight } from '@lucide/vue'

import DataTable from '@/components/data-table/DataTable.vue'
import type { DataTableColumn } from '@/components/data-table/types'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AUDIT_ACTION_LABELS, AUDIT_OUTCOME_LABELS } from '@/constants/audit'
import type { AuditEvent } from '@/types/audit'
import { formatDateTime } from '@/utils/date'

const props = defineProps<{
  events: AuditEvent[]
  loading?: boolean
}>()

const router = useRouter()

const columns: DataTableColumn[] = [
  { key: 'action', header: '操作' },
  { key: 'target', header: '对象' },
  { key: 'actor', header: '操作人' },
  { key: 'outcome', header: '结果' },
  { key: 'at', header: '时间', align: 'right' },
]

const rows = computed(() => props.events)

function openAudit(event: AuditEvent): void {
  void router.push({ name: 'audit', query: { detail: event.id } })
}
</script>

<template>
  <Card class="gap-0 py-0">
    <CardHeader class="flex flex-row items-center justify-between gap-3 space-y-0 p-5 pb-3">
      <div>
        <CardTitle class="text-sm font-semibold">最近操作</CardTitle>
        <CardDescription class="mt-1 text-xs">最新 6 条审计记录，点击行查看详情</CardDescription>
      </div>
      <Button variant="ghost" size="sm" as-child>
        <RouterLink to="/audit">
          查看全部
          <ArrowRight aria-hidden="true" />
        </RouterLink>
      </Button>
    </CardHeader>

    <DataTable
      :columns="columns"
      :rows="rows"
      :loading="loading"
      :row-label="(event) => `${event.actor.name} 的${AUDIT_ACTION_LABELS[event.action]}操作`"
      clickable-rows
      :skeleton-rows="4"
      empty-title="还没有操作记录"
      empty-description="执行一次成员或账号操作后，这里会出现审计流水。"
      @row-click="openAudit"
    >
      <template #cell-action="{ row }">
        <span class="text-xs font-medium">{{ AUDIT_ACTION_LABELS[row.action] }}</span>
      </template>
      <template #cell-target="{ row }">
        <span class="block max-w-56 truncate text-xs text-muted-foreground">{{ row.target }}</span>
      </template>
      <template #cell-actor="{ row }">
        <span class="text-xs">{{ row.actor.name }}</span>
      </template>
      <template #cell-outcome="{ row }">
        <span
          class="text-xs font-medium"
          :class="
            row.outcome === 'success'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-rose-600 dark:text-rose-400'
          "
        >
          {{ AUDIT_OUTCOME_LABELS[row.outcome] }}
        </span>
      </template>
      <template #cell-at="{ row }">
        <span class="text-xs text-muted-foreground tabular-nums">{{ formatDateTime(row.at) }}</span>
      </template>
    </DataTable>
  </Card>
</template>
