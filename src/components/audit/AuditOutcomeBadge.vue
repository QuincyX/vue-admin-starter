<script setup lang="ts">
import { computed } from 'vue'

import { Badge } from '@/components/ui/badge'
import { AUDIT_OUTCOME_LABELS } from '@/constants/audit'
import { cn } from '@/lib/utils'
import type { AuditOutcome } from '@/types/audit'

const props = defineProps<{
  outcome: AuditOutcome
}>()

const label = computed(() => AUDIT_OUTCOME_LABELS[props.outcome])
</script>

<template>
  <Badge
    variant="outline"
    :class="
      cn(
        'gap-1 font-medium',
        outcome === 'success'
          ? 'border-transparent bg-emerald-500/12 text-emerald-700 dark:text-emerald-400'
          : 'border-transparent bg-rose-500/12 text-rose-700 dark:text-rose-400',
      )
    "
  >
    <span
      class="size-1.5 rounded-full"
      :class="outcome === 'success' ? 'bg-emerald-500' : 'bg-rose-500'"
      aria-hidden="true"
    />
    {{ label }}
  </Badge>
</template>
