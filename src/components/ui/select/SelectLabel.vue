<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { SelectLabel, type SelectLabelProps } from 'reka-ui'
import { reactiveOmit } from '@vueuse/core'

import { cn } from '@/lib/utils'

const props = defineProps<SelectLabelProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = reactiveOmit(props, 'class')
</script>

<template>
  <SelectLabel
    v-bind="delegatedProps"
    :class="cn('px-2 py-1.5 text-xs font-medium text-muted-foreground', props.class)"
  >
    <slot />
  </SelectLabel>
</template>
