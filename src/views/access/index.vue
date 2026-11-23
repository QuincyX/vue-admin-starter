<script setup lang="ts">
import { computed } from 'vue'
import { Check, Minus, ShieldCheck } from '@lucide/vue'

import PageHeader from '@/components/common/PageHeader.vue'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DEMO_ACCOUNTS } from '@/constants/demoAccounts'
import {
  PERMISSION_LABELS,
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
  ROLE_PERMISSIONS,
} from '@/constants/permissions'
import { usePermission } from '@/composables/usePermission'
import { PERMISSIONS, ROLES } from '@/types/auth'

const { role } = usePermission()

const matrix = computed(() =>
  PERMISSIONS.map((permission) => ({
    permission,
    label: PERMISSION_LABELS[permission],
    grants: ROLES.map((candidate) => ({
      role: candidate,
      allowed: ROLE_PERMISSIONS[candidate].includes(permission),
    })),
  })),
)

const roles = ROLES.map((candidate) => ({
  role: candidate,
  label: ROLE_LABELS[candidate],
  description: ROLE_DESCRIPTIONS[candidate],
  permissions: ROLE_PERMISSIONS[candidate].length,
}))

const currentRole = computed(() => role.value)
</script>

<template>
  <div class="space-y-4">
    <PageHeader
      title="访问控制"
      description="权限表的唯一来源是 src/constants/permissions.ts；路由守卫、侧边栏与页面按钮都从这里派生。"
    />

    <Card class="gap-0 py-0">
      <CardHeader class="p-5 pb-4">
        <CardTitle class="flex items-center gap-2 text-sm font-semibold">
          <ShieldCheck class="size-4 text-primary" aria-hidden="true" />
          角色与权限矩阵
        </CardTitle>
        <CardDescription class="mt-1 text-xs">
          只有拥有者可以进入本页、调整成员角色或重置演示数据。
        </CardDescription>
      </CardHeader>

      <CardContent class="p-0">
        <Table>
          <TableHeader>
            <TableRow class="hover:bg-transparent">
              <TableHead class="pl-5">权限</TableHead>
              <TableHead class="font-mono text-[11px]">权限码</TableHead>
              <TableHead v-for="candidate in roles" :key="candidate.role" class="text-center">
                {{ candidate.label }}
                <span
                  v-if="candidate.role === currentRole"
                  class="ml-1 rounded bg-accent px-1 text-[10px] text-accent-foreground"
                >
                  当前
                </span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="row in matrix" :key="row.permission">
              <TableCell class="pl-5 text-xs font-medium">{{ row.label }}</TableCell>
              <TableCell class="font-mono text-[11px] text-muted-foreground">
                {{ row.permission }}
              </TableCell>
              <TableCell
                v-for="grant in row.grants"
                :key="`${row.permission}-${grant.role}`"
                class="text-center"
              >
                <Check
                  v-if="grant.allowed"
                  class="mx-auto size-4 text-emerald-600 dark:text-emerald-400"
                  aria-label="授权"
                />
                <Minus v-else class="mx-auto size-4 text-muted-foreground/40" aria-label="未授权" />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <div class="grid grid-cols-2 gap-4">
      <Card class="gap-0 py-0">
        <CardHeader class="p-5 pb-3">
          <CardTitle class="text-sm font-semibold">角色说明</CardTitle>
          <CardDescription class="mt-1 text-xs">角色由后端下发，前端只做投影。</CardDescription>
        </CardHeader>
        <CardContent class="space-y-3 p-5 pt-0">
          <div
            v-for="candidate in roles"
            :key="candidate.role"
            class="rounded-lg border p-3"
            :class="candidate.role === currentRole && 'border-primary/50 bg-accent/40'"
          >
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs font-semibold">{{ candidate.label }}</span>
              <Badge variant="secondary" class="text-[10px]">
                {{ candidate.permissions }} 项权限
              </Badge>
            </div>
            <p class="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              {{ candidate.description }}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card class="gap-0 py-0">
        <CardHeader class="p-5 pb-3">
          <CardTitle class="text-sm font-semibold">演示账号</CardTitle>
          <CardDescription class="mt-1 text-xs">
            密码由本地 mock 服务提供，仅用于开发与演示。
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-2 p-5 pt-0">
          <div
            v-for="account in DEMO_ACCOUNTS"
            :key="account.email"
            class="flex items-start justify-between gap-3 rounded-lg border p-3"
          >
            <div class="min-w-0">
              <p class="truncate font-mono text-xs">{{ account.email }}</p>
              <p class="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                {{ account.note }}
              </p>
            </div>
            <Badge variant="outline" class="shrink-0">{{ ROLE_LABELS[account.role] }}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
