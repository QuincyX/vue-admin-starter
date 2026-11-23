<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { NAV_GROUPS } from '@/constants/navigation'
import { usePermission } from '@/composables/usePermission'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const props = defineProps<{
  collapsed: boolean
}>()

const route = useRoute()
const { can } = usePermission()

/** Hiding an item the role cannot open keeps the sidebar honest about RBAC. */
const groups = computed(() =>
  NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => can(item.permission)),
  })).filter((group) => group.items.length > 0),
)

function isActive(path: string): boolean {
  return path === '/' ? route.path === '/' : route.path.startsWith(path)
}
</script>

<template>
  <nav class="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-3 py-4" aria-label="主导航">
    <div v-for="group in groups" :key="group.title">
      <p
        v-if="!props.collapsed"
        class="px-2 pb-2 text-[10px] font-semibold tracking-[0.16em] text-muted-foreground/80 uppercase"
      >
        {{ group.title }}
      </p>
      <div v-else class="mx-2 mb-2 h-px bg-sidebar-border" aria-hidden="true" />

      <ul class="space-y-1">
        <li v-for="item in group.items" :key="item.to">
          <Tooltip v-if="props.collapsed" :delay-duration="100">
            <TooltipTrigger as-child>
              <RouterLink
                :to="item.to"
                class="flex h-10 items-center justify-center rounded-lg text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-[3px] focus-visible:ring-sidebar-ring focus-visible:outline-none"
                :class="
                  cn(
                    isActive(item.to) &&
                      'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground',
                  )
                "
                :aria-current="isActive(item.to) ? 'page' : undefined"
                :aria-label="item.label"
              >
                <component :is="item.icon" class="size-5 shrink-0" aria-hidden="true" />
              </RouterLink>
            </TooltipTrigger>
            <TooltipContent side="right">{{ item.label }}</TooltipContent>
          </Tooltip>

          <RouterLink
            v-else
            :to="item.to"
            class="flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-[3px] focus-visible:ring-sidebar-ring focus-visible:outline-none"
            :class="
              cn(
                isActive(item.to) &&
                  'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm hover:bg-sidebar-primary hover:text-sidebar-primary-foreground',
              )
            "
            :aria-current="isActive(item.to) ? 'page' : undefined"
          >
            <component :is="item.icon" class="size-[18px] shrink-0" aria-hidden="true" />
            <span class="truncate">{{ item.label }}</span>
          </RouterLink>
        </li>
      </ul>
    </div>
  </nav>
</template>
