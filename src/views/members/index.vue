<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Download, Ellipsis, Pencil, Plus, Trash2, UserCheck, UserX } from '@lucide/vue'

import PageHeader from '@/components/common/PageHeader.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import DataTable from '@/components/data-table/DataTable.vue'
import DataTablePagination from '@/components/data-table/DataTablePagination.vue'
import DataTableToolbar from '@/components/data-table/DataTableToolbar.vue'
import type { DataTableColumn } from '@/components/data-table/types'
import MemberFormDialog from '@/components/members/MemberFormDialog.vue'
import MemberRoleBadge from '@/components/members/MemberRoleBadge.vue'
import MemberStatusBadge from '@/components/members/MemberStatusBadge.vue'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { recordAuditEvent } from '@/api/audit'
import { usePermission } from '@/composables/usePermission'
import { useResourceList } from '@/composables/useResourceList'
import { useToast } from '@/composables/useToast'
import { DEPARTMENT_LABELS, MEMBER_STATUS_LABELS, ROLE_BADGE_CLASS } from '@/constants/member'
import { ROLE_LABELS } from '@/constants/permissions'
import { cn } from '@/lib/utils'
import { MemberRuleError, useMemberStore } from '@/stores/members'
import { useAuthStore } from '@/stores/auth'
import { ROLES, type Role } from '@/types/auth'
import { DEPARTMENTS, MEMBER_STATUSES, type Member, type MemberStatus } from '@/types/member'
import { downloadCsv, toCsv } from '@/utils/csv'
import { formatDate, formatRelativeTime, toDateKey } from '@/utils/date'
import { apiErrorMessage } from '@/utils/apiError'

const memberStore = useMemberStore()
const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const { toast } = useToast()
const { can } = usePermission()

const canWrite = computed(() => can('members:write'))
const collator = new Intl.Collator('zh-CN')

const ROLE_WEIGHT: Record<Role, number> = { owner: 0, admin: 1, viewer: 2 }
const STATUS_WEIGHT: Record<MemberStatus, number> = { active: 0, invited: 1, suspended: 2 }

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
  selectedIds,
  setSort,
  setPage,
  setPageSize,
  clearSelection,
  removeFromSelection,
  reset,
} = useResourceList<Member>({
  rows: computed(() => memberStore.members),
  rowId: (member) => member.id,
  search: (member) => [member.name, member.email, member.title],
  filters: {
    role: (member, value) => member.role === value,
    status: (member, value) => member.status === value,
    department: (member, value) => member.department === value,
  },
  sorters: {
    name: (a, b) => collator.compare(a.name, b.name),
    role: (a, b) => ROLE_WEIGHT[a.role] - ROLE_WEIGHT[b.role],
    status: (a, b) => STATUS_WEIGHT[a.status] - STATUS_WEIGHT[b.status],
    department: (a, b) =>
      collator.compare(DEPARTMENT_LABELS[a.department], DEPARTMENT_LABELS[b.department]),
    lastActiveAt: (a, b) => {
      if (!a.lastActiveAt && !b.lastActiveAt) return 0
      if (!a.lastActiveAt) return 1
      if (!b.lastActiveAt) return -1
      return a.lastActiveAt.localeCompare(b.lastActiveAt)
    },
    createdAt: (a, b) => a.createdAt.localeCompare(b.createdAt),
  },
  defaultSort: 'createdAt:desc',
  filterDefaults: { role: 'all', status: 'all', department: 'all' },
  allowed: {
    role: ['all', ...ROLES],
    status: ['all', ...MEMBER_STATUSES],
    department: ['all', ...DEPARTMENTS],
  },
})

const columns = computed<DataTableColumn[]>(() => [
  { key: 'member', header: '成员', sortable: true },
  { key: 'role', header: '角色', sortable: true },
  { key: 'status', header: '状态', sortable: true },
  { key: 'department', header: '部门 / 职位', sortable: true },
  { key: 'lastActiveAt', header: '最近活跃', sortable: true, align: 'right' },
  { key: 'createdAt', header: '创建时间', sortable: true, align: 'right' },
  ...(canWrite.value ? [{ key: 'actions', header: '操作', align: 'right' as const }] : []),
])

/** `#cell-member` sorts by name, so the clickable header must use the same key. */
function onSort(key: string): void {
  setSort(key === 'member' ? 'name' : key)
}

const sortForTable = computed(() => ({
  key: sortKey.value === 'name' ? 'member' : sortKey.value,
  dir: sortDir.value,
}))

const formOpen = ref(false)
const editing = ref<Member | null>(null)

const deleteTarget = ref<Member | null>(null)
const deleteOpen = ref(false)
const bulkDeleteOpen = ref(false)

const resultText = computed(() => `共 ${total.value} 位成员`)

function openCreate(): void {
  editing.value = null
  formOpen.value = true
}

function openEdit(member: Member): void {
  editing.value = member
  formOpen.value = true
}

function askDelete(member: Member): void {
  deleteTarget.value = member
  deleteOpen.value = true
}

function reportError(error: unknown): void {
  toast({
    title: '操作失败',
    description: error instanceof MemberRuleError ? error.message : apiErrorMessage(error),
    variant: 'error',
  })
}

async function toggleStatus(member: Member): Promise<void> {
  const nextStatus: MemberStatus = member.status === 'suspended' ? 'active' : 'suspended'

  try {
    await memberStore.updateMember(member.id, {
      name: member.name,
      email: member.email,
      role: member.role,
      status: nextStatus,
      department: member.department,
      title: member.title,
    })

    toast({
      title: nextStatus === 'active' ? '账号已启用' : '账号已停用',
      description: member.name,
      variant: 'success',
    })
  } catch (error) {
    reportError(error)
  }
}

async function confirmDelete(): Promise<void> {
  const target = deleteTarget.value
  if (!target) return

  try {
    await memberStore.removeMember(target.id)
    removeFromSelection([target.id])
    toast({ title: '成员已移除', description: target.name, variant: 'success' })
  } catch (error) {
    reportError(error)
  } finally {
    deleteOpen.value = false
    deleteTarget.value = null
  }
}

async function confirmBulkDelete(): Promise<void> {
  const ids = [...selectedIds.value]

  try {
    for (const id of ids) {
      await memberStore.removeMember(id)
    }

    removeFromSelection(ids)
    toast({ title: `已移除 ${ids.length} 位成员`, variant: 'success' })
  } catch (error) {
    reportError(error)
  } finally {
    bulkDeleteOpen.value = false
  }
}

function exportCsv(): void {
  const exportRows = filteredRows.value

  const content = toCsv(exportRows, [
    { header: '姓名', value: (member) => member.name },
    { header: '邮箱', value: (member) => member.email },
    { header: '角色', value: (member) => ROLE_LABELS[member.role] },
    { header: '状态', value: (member) => MEMBER_STATUS_LABELS[member.status] },
    { header: '部门', value: (member) => DEPARTMENT_LABELS[member.department] },
    { header: '职位', value: (member) => member.title },
    {
      header: '最近活跃',
      value: (member) => (member.lastActiveAt ? formatDate(member.lastActiveAt) : ''),
    },
    { header: '创建时间', value: (member) => formatDate(member.createdAt) },
  ])

  downloadCsv(`members-${toDateKey(new Date())}.csv`, content)
  toast({
    title: '已导出成员列表',
    description: `共 ${exportRows.length} 条记录`,
    variant: 'success',
  })

  if (auth.user) {
    void recordAuditEvent({
      actor: { ...auth.user },
      action: 'data.export',
      target: '导出成员列表',
      metadata: { rows: String(exportRows.length), format: 'csv' },
    })
  }
}

/**
 * Deep links: `?new=1` opens the create dialog and `?edit=<id>` opens one row.
 * The parameters are removed after opening so refreshing does not reopen them.
 */
let appliedDeepLink = ''

function clearDeepLink(): void {
  const query = { ...route.query }
  delete query.new
  delete query.edit
  void router.replace({ query })
}

function applyDeepLink(): void {
  const query = route.query
  const signature = `${query.new ?? ''}|${query.edit ?? ''}`
  if (signature === '|' || signature === appliedDeepLink) return

  if (query.new === '1') {
    appliedDeepLink = signature
    openCreate()
    clearDeepLink()
    return
  }

  if (typeof query.edit === 'string') {
    const member = memberStore.findById(query.edit)
    if (!member) return

    appliedDeepLink = signature
    openEdit(member)
    clearDeepLink()
  }
}

watch(() => route.query, applyDeepLink)

onMounted(async () => {
  await memberStore.hydrate()
  applyDeepLink()
})
</script>

<template>
  <div class="space-y-4">
    <PageHeader
      title="成员管理"
      description="通用列表管理示例：搜索、筛选、排序、分页、批量选择与行内操作都复用同一套基础组件。"
    >
      <template #actions>
        <Button variant="outline" @click="exportCsv">
          <Download aria-hidden="true" />
          导出 CSV
        </Button>
        <Button v-if="canWrite" data-testid="member-create" @click="openCreate">
          <Plus aria-hidden="true" />
          新增成员
        </Button>
      </template>
    </PageHeader>

    <Card class="gap-0 py-0">
      <div class="border-b p-4">
        <DataTableToolbar
          v-model:search="filters.q"
          search-placeholder="搜索姓名、邮箱或职位"
          :result-text="resultText"
          :dirty="isDirty"
          @reset="reset"
        >
          <template #filters>
            <Select v-model="filters.role">
              <SelectTrigger class="h-9 w-32" aria-label="按角色筛选">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部角色</SelectItem>
                <SelectItem v-for="role in ROLES" :key="role" :value="role">
                  {{ ROLE_LABELS[role] }}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select v-model="filters.status">
              <SelectTrigger class="h-9 w-32" aria-label="按状态筛选">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem v-for="status in MEMBER_STATUSES" :key="status" :value="status">
                  {{ MEMBER_STATUS_LABELS[status] }}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select v-model="filters.department">
              <SelectTrigger class="h-9 w-32" aria-label="按部门筛选">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部部门</SelectItem>
                <SelectItem v-for="department in DEPARTMENTS" :key="department" :value="department">
                  {{ DEPARTMENT_LABELS[department] }}
                </SelectItem>
              </SelectContent>
            </Select>
          </template>

          <template #actions>
            <template v-if="selectedIds.length > 0 && canWrite">
              <span class="text-xs text-muted-foreground">已选 {{ selectedIds.length }} 项</span>
              <Button variant="outline" size="sm" @click="clearSelection">清除选择</Button>
              <Button
                variant="destructive"
                size="sm"
                data-testid="bulk-delete"
                @click="bulkDeleteOpen = true"
              >
                <Trash2 aria-hidden="true" />
                批量移除
              </Button>
            </template>
          </template>
        </DataTableToolbar>
      </div>

      <DataTable
        v-model:selected="selectedIds"
        :columns="columns"
        :rows="rows"
        :loading="memberStore.status === 'loading'"
        :sort="sortForTable"
        :selectable="canWrite"
        :row-label="(member) => member.name"
        empty-title="没有匹配的成员"
        empty-description="调整搜索或筛选条件，或创建一个新成员。"
        @sort="onSort"
      >
        <template #cell-member="{ row }">
          <div class="flex flex-col gap-0.5">
            <span class="text-sm font-medium text-foreground">{{ row.name }}</span>
            <span class="text-[11px] text-muted-foreground">{{ row.email }}</span>
          </div>
        </template>

        <template #cell-role="{ row }">
          <MemberRoleBadge :role="row.role" />
        </template>

        <template #cell-status="{ row }">
          <MemberStatusBadge :status="row.status" />
        </template>

        <template #cell-department="{ row }">
          <div class="flex flex-col gap-0.5">
            <span class="text-xs">{{ DEPARTMENT_LABELS[row.department] }}</span>
            <span class="text-[11px] text-muted-foreground">{{ row.title || '未设置职位' }}</span>
          </div>
        </template>

        <template #cell-lastActiveAt="{ row }">
          <span class="text-xs text-muted-foreground tabular-nums">
            {{ row.lastActiveAt ? formatRelativeTime(row.lastActiveAt) : '从未登录' }}
          </span>
        </template>

        <template #cell-createdAt="{ row }">
          <span class="text-xs text-muted-foreground tabular-nums">{{
            formatDate(row.createdAt)
          }}</span>
        </template>

        <template #cell-actions="{ row }">
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="ghost" size="icon-sm" :aria-label="`${row.name} 的操作`">
                <Ellipsis aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem @select="openEdit(row)">
                <Pencil aria-hidden="true" />
                编辑资料
              </DropdownMenuItem>
              <DropdownMenuItem @select="toggleStatus(row)">
                <UserX v-if="row.status !== 'suspended'" aria-hidden="true" />
                <UserCheck v-else aria-hidden="true" />
                {{ row.status === 'suspended' ? '启用账号' : '停用账号' }}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                :disabled="row.role === 'owner'"
                @select="askDelete(row)"
              >
                <Trash2 aria-hidden="true" />
                移除成员
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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

    <p class="text-xs text-muted-foreground">
      提示：筛选与排序状态保存在 URL 中，可直接复制地址分享当前视图。
      <span :class="cn('ml-1 font-medium', ROLE_BADGE_CLASS.owner)">拥有者</span>
      账号可调整其他成员的角色，管理员与观察员不能。
    </p>

    <MemberFormDialog v-model:open="formOpen" :member="editing" />

    <ConfirmDialog
      v-model:open="deleteOpen"
      title="移除该成员？"
      :description="`将删除 ${deleteTarget?.name ?? '该成员'} 的成员记录，此操作只影响当前浏览器中的演示数据。`"
      confirm-label="确认移除"
      destructive
      @confirm="confirmDelete"
    />

    <ConfirmDialog
      v-model:open="bulkDeleteOpen"
      title="批量移除成员？"
      :description="`将移除已选中的 ${selectedIds.length} 位成员，此操作不可撤销。`"
      confirm-label="确认移除"
      destructive
      @confirm="confirmBulkDelete"
    />
  </div>
</template>
