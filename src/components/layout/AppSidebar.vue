<script setup lang="ts">
import { PanelLeftClose, PanelLeftOpen } from '@lucide/vue'

import AppLogo from '@/components/brand/AppLogo.vue'
import SidebarNav from '@/components/layout/SidebarNav.vue'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useSidebar } from '@/composables/useSidebar'
import { cn } from '@/lib/utils'

/**
 * Desktop-only application sidebar. There is no mobile drawer by design: this
 * template targets admin workstations (see `docs/architecture.md` §10).
 */
const { collapsed, widthClass, toggle } = useSidebar()
</script>

<template>
  <aside
    data-testid="app-sidebar"
    :class="
      cn(
        'fixed inset-y-0 left-0 z-30 flex flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200',
        widthClass,
      )
    "
  >
    <div
      class="flex h-16 shrink-0 items-center border-b border-sidebar-border px-4"
      :class="collapsed && 'justify-center px-0'"
    >
      <AppLogo :compact="collapsed" />
    </div>

    <SidebarNav :collapsed="collapsed" />

    <div class="shrink-0 border-t border-sidebar-border p-2">
      <Tooltip v-if="collapsed">
        <TooltipTrigger as-child>
          <Button
            variant="ghost"
            size="icon"
            class="w-full text-sidebar-foreground/80"
            aria-label="展开侧边栏"
            data-testid="sidebar-toggle"
            @click="toggle"
          >
            <PanelLeftOpen aria-hidden="true" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">展开侧边栏</TooltipContent>
      </Tooltip>

      <Button
        v-else
        variant="ghost"
        size="sm"
        class="w-full justify-start gap-2 text-sidebar-foreground/70"
        data-testid="sidebar-toggle"
        @click="toggle"
      >
        <PanelLeftClose aria-hidden="true" />
        收起侧边栏
      </Button>
    </div>
  </aside>
</template>
