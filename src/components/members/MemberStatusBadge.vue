<script setup lang="ts">
import { computed } from 'vue'

import { Badge } from '@/components/ui/badge'
import { MEMBER_STATUS_BADGE_CLASS, MEMBER_STATUS_LABELS } from '@/constants/member'
import { cn } from '@/lib/utils'
import type { MemberStatus } from '@/types/member'

const props = defineProps<{
  status: MemberStatus
}>()

const label = computed(() => MEMBER_STATUS_LABELS[props.status])
</script>

<template>
  <Badge variant="outline" :class="cn('font-medium', MEMBER_STATUS_BADGE_CLASS[status])">
    {{ label }}
  </Badge>
</template>
