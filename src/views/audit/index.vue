<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Download, Eye } from '@lucide/vue'

import AuditActionBadge from '@/components/audit/AuditActionBadge.vue'
import AuditDetailDialog from '@/components/audit/AuditDetailDialog.vue'
import AuditOutcomeBadge from '@/components/audit/AuditOutcomeBadge.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import DataTable from '@/components/data-table/DataTable.vue'
import DataTablePagination from '@/components/data-table/DataTablePagination.vue'
import DataTableToolbar from '@/components/data-table/DataTableToolbar.vue'
import type { DataTableColumn } from '@/components/data-table/types'
import { recordAuditEvent } from '@/api/audit'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { usePermission } from '@/composables/usePermission'
import { useResourceList } from '@/composables/useResourceList'
import { useToast } from '@/composables/useToast'
import { AUDIT_ACTIONS_SORTED, AUDIT_ACTION_LABELS, AUDIT_OUTCOME_LABELS } from '@/constants/audit'
import { ROLE_LABELS } from '@/constants/permissions'
import { useAuditStore } from '@/stores/audit'
import { useAuthStore } from '@/stores/auth'
import { AUDIT_ACTIONS, AUDIT_OUTCOMES, type AuditAction, type AuditEvent } from '@/types/audit'
import { downloadCsv, toCsv } from '@/utils/csv'
import { formatDateTime, toDateKey } from '@/utils/date'

const auditStore = useAuditStore()
const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const { toast } = useToast()
const { can } = usePermission()

const canExport = computed(() => can('audit:export'))

const ACTION_ORDER: Record<AuditAction, number> = Object.fromEntries(
  AUDIT_ACTIONS_SORTED.map((action, index) => [action, index]),
) as Record<AuditAction, number>

const {
  filters,
  rows,
  filteredRows,
  total,
  page,
  pageSize,
  pageCount,
  sortKey,
  sortDir,
  isDirty,
  setSort,
  setPage,
  setPageSize,
  reset,
} = useResourceList<AuditEvent>({
  rows: computed(() => auditStore.events),
  rowId: (event) => event.id,
  search: (event) => [event.actor.name, event.actor.email, event.target, event.ip],
  filters: {
    action: (event, value) => event.action === value,
    outcome: (event, value) => event.outcome === value,
    from: (event, value) => toDateKey(event.at) >= value,
    to: (event, value) => toDateKey(event.at) <= value,
  },
  sorters: {
    at: (a, b) => a.at.localeCompare(b.at),
    action: (a, b) => ACTION_ORDER[a.action] - ACTION_ORDER[b.action],
    outcome: (a, b) => a.outcome.localeCompare(b.outcome),
    actor: (a, b) => a.actor.name.localeCompare(b.actor.name, 'zh-CN'),
  },
  defaultSort: 'at:desc',
  defaultPageSize: 20,
  filterDefaults: { action: 'all', outcome: 'all', from: '', to: '' },
  allowed: {
    action: ['all', ...AUDIT_ACTIONS],
    outcome: ['all', ...AUDIT_OUTCOMES],
  },
})

const columns: DataTableColumn[] = [
  { key: 'at', header: '时间', sortable: true },
  { key: 'action', header: '操作', sortable: true },
  { key: 'target', header: '对象' },
  { key: 'actor', header: '操作人', sortable: true },
  { key: 'outcome', header: '结果', sortable: true },
  { key: 'ip', header: '来源 IP', align: 'right' },
  { key: 'detail', header: '详情', align: 'right' },
]

const detailOpen = ref(false)
const detailEvent = ref<AuditEvent | null>(null)

const resultText = computed(() => `共 ${total.value} 条记录`)

function openDetail(event: AuditEvent): void {
  detailEvent.value = event
  detailOpen.value = true
  void router.replace({ query: { ...route.query, detail: event.id } })
}

watch(detailOpen, (open) => {
  if (open) return
  const query = { ...route.query }
  delete query.detail
  void router.replace({ query })
})

/** `?detail=<id>` is a shareable link to one record, used by the dashboard table. */
function applyDeepLink(): void {
  const id = route.query.detail
  if (typeof id !== 'string' || detailOpen.value) return

  const event = auditStore.events.find((candidate) => candidate.id === id)
  if (!event) return

  detailEvent.value = event
  detailOpen.value = true
}

watch(() => route.query.detail, applyDeepLink)

function exportCsv(): void {
  const exportRows = filteredRows.value
  const content = toCsv(exportRows, [
    { header: '时间', value: (event) => formatDateTime(event.at) },
    { header: '操作', value: (event) => AUDIT_ACTION_LABELS[event.action] },
    { header: '动作', value: (event) => event.action },
    { header: '对象', value: (event) => event.target },
    { header: '操作人', value: (event) => event.actor.name },
    { header: '邮箱', value: (event) => event.actor.email },
    { header: '角色', value: (event) => ROLE_LABELS[event.actor.role] },
    { header: '结果', value: (event) => AUDIT_OUTCOME_LABELS[event.outcome] },
    { header: '来源 IP', value: (event) => event.ip },
  ])

  downloadCsv(`audit-${toDateKey(new Date())}.csv`, content)
  toast({
    title: '已导出操作日志',
    description: `共 ${exportRows.length} 条记录`,
    variant: 'success',
  })

  if (auth.user) {
    void recordAuditEvent({
      actor: { ...auth.user },
      action: 'data.export',
      target: '导出操作日志',
      metadata: { rows: String(exportRows.length), format: 'csv' },
    })
  }
}

onMounted(async () => {
  await auditStore.hydrate(true)
  applyDeepLink()
})
</script>

<template>
  <div class="space-y-4">
    <PageHeader
      title="操作日志"
      description="按操作类型、结果与日期范围检索审计流水；筛选条件保存在 URL 中，可直接分享。"
    >
      <template #actions>
        <Button v-if="canExport" variant="outline" data-testid="audit-export" @click="exportCsv">
          <Download aria-hidden="true" />
          导出 CSV
        </Button>
      </template>
    </PageHeader>

    <Card class="gap-0 py-0">
      <div class="border-b p-4">
        <DataTableToolbar
          v-model:search="filters.q"
          search-placeholder="搜索操作人、对象或 IP"
          :result-text="resultText"
          :dirty="isDirty"
          @reset="reset"
        >
          <template #filters>
            <Select v-model="filters.action">
              <SelectTrigger class="h-9 w-36" aria-label="按操作类型筛选">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部操作</SelectItem>
                <SelectItem v-for="action in AUDIT_ACTIONS_SORTED" :key="action" :value="action">
                  {{ AUDIT_ACTION_LABELS[action] }}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select v-model="filters.outcome">
              <SelectTrigger class="h-9 w-32" aria-label="按结果筛选">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部结果</SelectItem>
                <SelectItem v-for="outcome in AUDIT_OUTCOMES" :key="outcome" :value="outcome">
                  {{ AUDIT_OUTCOME_LABELS[outcome] }}
                </SelectItem>
              </SelectContent>
            </Select>

            <div class="flex items-center gap-2">
              <Label for="audit-from" class="text-xs text-muted-foreground">从</Label>
              <Input
                id="audit-from"
                v-model="filters.from"
                type="date"
                class="h-9 w-36"
                aria-label="起始日期"
              />
              <Label for="audit-to" class="text-xs text-muted-foreground">到</Label>
              <Input
                id="audit-to"
                v-model="filters.to"
                type="date"
                class="h-9 w-36"
                aria-label="结束日期"
              />
            </div>
          </template>
        </DataTableToolbar>
      </div>

      <DataTable
        :columns="columns"
        :rows="rows"
        :loading="auditStore.status === 'loading'"
        :sort="{ key: sortKey, dir: sortDir }"
        :row-label="(event) => `${event.actor.name} 的${AUDIT_ACTION_LABELS[event.action]}操作`"
        clickable-rows
        empty-title="没有匹配的操作记录"
        empty-description="调整操作类型、结果或日期范围后重试。"
        @sort="setSort"
        @row-click="openDetail"
      >
        <template #cell-at="{ row }">
          <span class="text-xs text-muted-foreground tabular-nums">{{
            formatDateTime(row.at)
          }}</span>
        </template>

        <template #cell-action="{ row }">
          <AuditActionBadge :action="row.action" />
        </template>

        <template #cell-target="{ row }">
          <span class="block max-w-64 truncate text-xs">{{ row.target }}</span>
        </template>

        <template #cell-actor="{ row }">
          <div class="flex flex-col gap-0.5">
            <span class="text-xs font-medium">{{ row.actor.name }}</span>
            <span class="text-[11px] text-muted-foreground">{{ ROLE_LABELS[row.actor.role] }}</span>
          </div>
        </template>

        <template #cell-outcome="{ row }">
          <AuditOutcomeBadge :outcome="row.outcome" />
        </template>

        <template #cell-ip="{ row }">
          <span class="font-mono text-[11px] text-muted-foreground">{{ row.ip }}</span>
        </template>

        <template #cell-detail="{ row }">
          <Button
            variant="ghost"
            size="icon-sm"
            :aria-label="`查看 ${row.id} 的详情`"
            @click.stop="openDetail(row)"
          >
            <Eye aria-hidden="true" />
          </Button>
        </template>
      </DataTable>

      <DataTablePagination
        :page="page"
        :page-count="pageCount"
        :page-size="pageSize"
        :total="total"
        @update:page="setPage"
        @update:page-size="setPageSize"
      />
    </Card>

    <AuditDetailDialog v-model:open="detailOpen" :event="detailEvent" />
  </div>
</template>
