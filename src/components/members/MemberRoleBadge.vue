<script setup lang="ts">
import { computed } from 'vue'

import { Badge } from '@/components/ui/badge'
import { ROLE_LABELS } from '@/constants/permissions'
import { ROLE_BADGE_CLASS } from '@/constants/member'
import { cn } from '@/lib/utils'
import type { Role } from '@/types/auth'

const props = defineProps<{
  role: Role
}>()

const label = computed(() => ROLE_LABELS[props.role])
</script>

<template>
  <Badge variant="outline" :class="cn('font-medium', ROLE_BADGE_CLASS[role])">
    {{ label }}
  </Badge>
</template>
