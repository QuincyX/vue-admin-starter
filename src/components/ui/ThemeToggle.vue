<script setup lang="ts">
import { Moon, Sun } from '@lucide/vue'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useTheme } from '@/composables/useTheme'

const { isDark, toggle } = useTheme()
</script>

<template>
  <Tooltip>
    <TooltipTrigger as-child>
      <Button
        variant="ghost"
        size="icon"
        data-testid="theme-toggle"
        :data-state="isDark ? 'dark' : 'light'"
        :aria-label="isDark ? '切换到浅色模式' : '切换到深色模式'"
        @click="toggle"
      >
        <Sun v-if="isDark" aria-hidden="true" />
        <Moon v-else aria-hidden="true" />
      </Button>
    </TooltipTrigger>
    <TooltipContent>{{ isDark ? '切换到浅色模式' : '切换到深色模式' }}</TooltipContent>
  </Tooltip>
</template>
