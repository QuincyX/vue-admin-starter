<script setup lang="ts">
import { computed } from 'vue'

import { Badge } from '@/components/ui/badge'
import { AUDIT_ACTION_LABELS, AUDIT_ACTION_TONES } from '@/constants/audit'
import { cn } from '@/lib/utils'
import type { AuditAction } from '@/types/audit'

const props = defineProps<{
  action: AuditAction
}>()

const TONE_CLASS = {
  neutral: 'border-transparent bg-muted text-muted-foreground',
  accent: 'border-transparent bg-primary/12 text-primary',
  danger: 'border-transparent bg-rose-500/12 text-rose-700 dark:text-rose-400',
} as const

const label = computed(() => AUDIT_ACTION_LABELS[props.action])
const toneClass = computed(() => TONE_CLASS[AUDIT_ACTION_TONES[props.action]])
</script>

<template>
  <Badge variant="outline" :class="cn('font-medium', toneClass)">{{ label }}</Badge>
</template>
