<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { AvatarFallback, type AvatarFallbackProps } from 'reka-ui'
import { reactiveOmit } from '@vueuse/core'

import { cn } from '@/lib/utils'

const props = defineProps<AvatarFallbackProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = reactiveOmit(props, 'class')
</script>

<template>
  <AvatarFallback
    v-bind="delegatedProps"
    :class="
      cn(
        'flex size-full items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground',
        props.class,
      )
    "
  >
    <slot />
  </AvatarFallback>
</template>
