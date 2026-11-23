<script setup lang="ts">
import { watchEffect } from 'vue'
import { RouterView, useRoute } from 'vue-router'

import AppHeader from '@/components/layout/AppHeader.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import { useSidebar } from '@/composables/useSidebar'
import { env } from '@/config/env'

const route = useRoute()
const { contentOffsetClass } = useSidebar()

watchEffect(() => {
  document.title = `${route.meta.title} · ${env.VITE_APP_TITLE}`
})
</script>

<template>
  <div class="min-h-dvh bg-background">
    <a
      href="#main-content"
      class="sr-only rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
    >
      跳到主要内容
    </a>

    <AppSidebar />

    <div
      :class="contentOffsetClass"
      class="flex min-h-dvh flex-col transition-[padding] duration-200"
    >
      <AppHeader />

      <main id="main-content" tabindex="-1" class="flex-1 outline-none">
        <div class="mx-auto w-full max-w-[110rem] px-6 py-6">
          <RouterView v-slot="{ Component }">
            <Transition name="page" mode="out-in">
              <component :is="Component" :key="route.path" />
            </Transition>
          </RouterView>
        </div>
      </main>

      <footer class="px-6 pb-5">
        <div
          class="mx-auto flex max-w-[110rem] items-center justify-between border-t pt-4 text-[11px] text-muted-foreground"
        >
          <p>Aurora Admin · Vue 3 / Vite / TypeScript / shadcn-vue</p>
          <p>演示数据保存在当前浏览器</p>
        </div>
      </footer>
    </div>
  </div>
</template>
