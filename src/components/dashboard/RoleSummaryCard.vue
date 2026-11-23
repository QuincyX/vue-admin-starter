<script setup lang="ts">
import { computed } from 'vue'
import { ShieldCheck } from '@lucide/vue'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PERMISSION_LABELS, ROLE_DESCRIPTIONS, ROLE_LABELS } from '@/constants/permissions'
import { usePermission } from '@/composables/usePermission'

/**
 * Shows the current role and the permissions it grants. It doubles as the demo's
 * explanation of why a button is missing on another page: the same table drives
 * the route guard, the sidebar and this list.
 */
const { role, permissions } = usePermission()

const roleLabel = computed(() => (role.value ? ROLE_LABELS[role.value] : '未登录'))
const roleDescription = computed(() => (role.value ? ROLE_DESCRIPTIONS[role.value] : ''))
</script>

<template>
  <Card class="gap-0 py-0">
    <CardHeader class="p-5 pb-3">
      <CardTitle class="flex items-center gap-2 text-sm font-semibold">
        <ShieldCheck class="size-4 text-primary" aria-hidden="true" />
        当前角色权限
      </CardTitle>
      <CardDescription class="mt-1 text-xs">{{ roleDescription }}</CardDescription>
    </CardHeader>

    <CardContent class="space-y-3 p-5 pt-0">
      <Badge variant="secondary" class="text-xs" data-testid="current-role">{{ roleLabel }}</Badge>

      <ul class="space-y-1.5">
        <li
          v-for="permission in permissions"
          :key="permission"
          class="flex items-center justify-between gap-2 rounded-md bg-muted/50 px-2.5 py-1.5"
        >
          <span class="text-xs text-foreground">{{ PERMISSION_LABELS[permission] }}</span>
          <code class="font-mono text-[10px] text-muted-foreground">{{ permission }}</code>
        </li>
      </ul>
    </CardContent>
  </Card>
</template>
