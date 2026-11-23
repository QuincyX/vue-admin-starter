<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { DropdownMenuItem, useForwardProps, type DropdownMenuItemProps } from 'reka-ui'
import { reactiveOmit } from '@vueuse/core'

import { cn } from '@/lib/utils'

const props = withDefaults(
  defineProps<
    DropdownMenuItemProps & {
      class?: HTMLAttributes['class']
      inset?: boolean
      variant?: 'default' | 'destructive'
    }
  >(),
  {
    variant: 'default',
  },
)

const delegatedProps = reactiveOmit(props, 'class', 'inset', 'variant')
const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <DropdownMenuItem
    v-bind="forwardedProps"
    :class="
      cn(
        'relative flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4',
        'focus:bg-accent focus:text-accent-foreground',
        inset && 'pl-8',
        variant === 'destructive' &&
          'text-destructive focus:bg-destructive/10 focus:text-destructive',
        props.class,
      )
    "
  >
    <slot />
  </DropdownMenuItem>
</template>
