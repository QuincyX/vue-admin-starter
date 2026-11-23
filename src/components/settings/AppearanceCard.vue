<script setup lang="ts">
import { Monitor, Moon, Sun } from '@lucide/vue'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTheme, type ThemeMode } from '@/composables/useTheme'
import { cn } from '@/lib/utils'

const { mode, setMode } = useTheme()

const options: { value: ThemeMode; label: string; description: string; icon: typeof Sun }[] = [
  { value: 'light', label: '浅色', description: '明亮清爽', icon: Sun },
  { value: 'dark', label: '深色', description: '低光环境', icon: Moon },
  { value: 'system', label: '跟随系统', description: '随系统切换', icon: Monitor },
]
</script>

<template>
  <Card class="gap-0 py-0">
    <CardHeader class="p-5 pb-4">
      <CardTitle class="text-sm font-semibold">外观</CardTitle>
      <CardDescription class="mt-1 text-xs">主题即时生效，并保存到当前浏览器。</CardDescription>
    </CardHeader>

    <CardContent class="p-5 pt-0">
      <div class="grid grid-cols-3 gap-2" role="group" aria-label="主题模式">
        <button
          v-for="option in options"
          :key="option.value"
          type="button"
          :aria-pressed="mode === option.value"
          :data-testid="`theme-${option.value}`"
          :class="
            cn(
              'flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
              mode === option.value
                ? 'border-primary/60 bg-accent text-accent-foreground'
                : 'hover:bg-accent/50',
            )
          "
          @click="setMode(option.value)"
        >
          <component :is="option.icon" class="size-4" aria-hidden="true" />
          <span class="text-xs font-medium">{{ option.label }}</span>
          <span class="text-[10px] text-muted-foreground">{{ option.description }}</span>
        </button>
      </div>
    </CardContent>
  </Card>
</template>
