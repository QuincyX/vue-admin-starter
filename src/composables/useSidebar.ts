import { computed } from 'vue'
import { createGlobalState, useLocalStorage } from '@vueuse/core'

const SIDEBAR_STORAGE_KEY = 'aurora.sidebar.v1'

/**
 * Desktop sidebar collapse state.
 *
 * Persistence lives here rather than in the layout component: red line 3 keeps
 * `localStorage` out of views/components, and a UI preference still needs to
 * survive reloads. The template targets desktop viewports only, so this is the one
 * navigation state worth persisting.
 */
export const useSidebar = createGlobalState(() => {
  const collapsed = useLocalStorage<boolean>(SIDEBAR_STORAGE_KEY, false)

  const widthClass = computed(() => (collapsed.value ? 'w-[4.5rem]' : 'w-64'))
  const contentOffsetClass = computed(() => (collapsed.value ? 'pl-[4.5rem]' : 'pl-64'))

  function toggle(): void {
    collapsed.value = !collapsed.value
  }

  return { collapsed, widthClass, contentOffsetClass, toggle }
})
