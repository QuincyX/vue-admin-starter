<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Bell, ChevronRight, Home } from '@lucide/vue'

import UserMenu from '@/components/layout/UserMenu.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import ThemeToggle from '@/components/ui/ThemeToggle.vue'
import { useCurrentTime } from '@/composables/useCurrentTime'
import { NAV_GROUPS } from '@/constants/navigation'
import { formatDate } from '@/utils/date'

const route = useRoute()
const now = useCurrentTime()

const pageTitle = computed(() => route.meta.title)
const groupTitle = computed(() => {
  const path = route.path
  const group = NAV_GROUPS.find((candidate) =>
    candidate.items.some((item) => (item.to === '/' ? path === '/' : path.startsWith(item.to))),
  )
  return group?.title ?? '控制台'
})

const today = computed(() => formatDate(now.value))
</script>

<template>
  <header
    class="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b bg-background/85 px-6 backdrop-blur-xl"
  >
    <nav class="min-w-0" aria-label="面包屑">
      <ol class="flex items-center gap-1.5 text-xs text-muted-foreground">
        <li class="flex items-center gap-1.5">
          <RouterLink
            to="/"
            class="flex items-center gap-1 rounded-sm hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <Home class="size-3.5" aria-hidden="true" />
            <span class="sr-only">首页</span>
          </RouterLink>
        </li>
        <li aria-hidden="true"><ChevronRight class="size-3.5 opacity-60" /></li>
        <li>{{ groupTitle }}</li>
        <li aria-hidden="true"><ChevronRight class="size-3.5 opacity-60" /></li>
        <li class="truncate font-medium text-foreground" aria-current="page">{{ pageTitle }}</li>
      </ol>
    </nav>

    <div class="ml-auto flex items-center gap-1.5">
      <span class="mr-1 hidden text-xs text-muted-foreground tabular-nums xl:inline">
        {{ today }}
      </span>

      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="ghost" size="icon" class="relative" aria-label="通知">
            <Bell aria-hidden="true" />
            <span
              class="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-destructive"
              aria-hidden="true"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-72">
          <DropdownMenuLabel class="flex items-center justify-between">
            <span>待处理提醒</span>
            <Badge variant="secondary">2</Badge>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem as-child>
            <RouterLink
              to="/audit?outcome=failure"
              class="flex w-full flex-col items-start gap-0.5"
            >
              <span class="text-xs font-medium">最近 24 小时出现失败操作</span>
              <span class="text-[11px] text-muted-foreground">到操作日志中查看失败原因</span>
            </RouterLink>
          </DropdownMenuItem>
          <DropdownMenuItem as-child>
            <RouterLink
              to="/members?status=invited"
              class="flex w-full flex-col items-start gap-0.5"
            >
              <span class="text-xs font-medium">有成员待接受邀请</span>
              <span class="text-[11px] text-muted-foreground">跟进邀请状态或重新发送</span>
            </RouterLink>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem as-child>
            <RouterLink to="/audit" class="w-full text-xs text-muted-foreground">
              查看全部操作日志
            </RouterLink>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ThemeToggle />

      <Separator orientation="vertical" class="mx-1 h-6" />

      <UserMenu />
    </div>
  </header>
</template>
