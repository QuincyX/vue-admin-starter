<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronDown, LogOut, Settings, ShieldCheck, UserRound } from '@lucide/vue'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ROLE_LABELS } from '@/constants/permissions'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import { useLoadingStore } from '@/stores/loading'

const auth = useAuthStore()
const loading = useLoadingStore()
const router = useRouter()
const { toast } = useToast()

const displayName = computed(() => auth.user?.name ?? '未登录')
const displayEmail = computed(() => auth.user?.email ?? '')
const roleLabel = computed(() => (auth.role ? ROLE_LABELS[auth.role] : '游客'))
const initials = computed(() => displayName.value.trim().charAt(0).toUpperCase() || 'A')

async function signOut(): Promise<void> {
  await loading.run(async () => {
    await auth.logout()
    await router.push({ name: 'login' })
  }, '正在退出…')

  toast({ title: '已退出登录', variant: 'success' })
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button
        variant="ghost"
        class="h-11 gap-2 px-2"
        aria-label="账号菜单"
        data-testid="user-menu-trigger"
      >
        <Avatar class="size-8">
          <AvatarFallback>{{ initials }}</AvatarFallback>
        </Avatar>
        <span class="hidden text-left xl:block">
          <span class="block max-w-32 truncate text-xs font-semibold">{{ displayName }}</span>
          <span class="block text-[10px] text-muted-foreground">{{ roleLabel }}</span>
        </span>
        <ChevronDown class="size-4 text-muted-foreground" aria-hidden="true" />
      </Button>
    </DropdownMenuTrigger>

    <DropdownMenuContent align="end" class="w-60">
      <DropdownMenuLabel>
        <span class="block text-xs font-semibold text-foreground">{{ displayName }}</span>
        <span class="block truncate text-[11px] font-normal">{{ displayEmail }}</span>
      </DropdownMenuLabel>

      <div class="px-2 pb-2">
        <Badge variant="secondary" class="gap-1">
          <ShieldCheck class="size-3" aria-hidden="true" />
          {{ roleLabel }}
        </Badge>
      </div>

      <DropdownMenuSeparator />

      <DropdownMenuItem as-child>
        <RouterLink to="/settings" class="flex w-full items-center gap-2">
          <UserRound aria-hidden="true" />
          个人资料
        </RouterLink>
      </DropdownMenuItem>

      <DropdownMenuItem as-child>
        <RouterLink to="/settings" class="flex w-full items-center gap-2">
          <Settings aria-hidden="true" />
          系统设置
        </RouterLink>
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <DropdownMenuItem variant="destructive" data-testid="sign-out" @select="signOut">
        <LogOut aria-hidden="true" />
        退出登录
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
