<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ArrowLeft, FileQuestion } from '@lucide/vue'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const router = useRouter()
</script>

<template>
  <div class="flex min-h-[60vh] items-center justify-center">
    <Card class="w-full max-w-lg gap-0 py-0">
      <CardContent class="p-8 text-center">
        <span
          class="mx-auto grid size-12 place-items-center rounded-full bg-muted text-muted-foreground"
          aria-hidden="true"
        >
          <FileQuestion class="size-6" />
        </span>

        <p class="mt-4 text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
          404 · Not Found
        </p>
        <h1 class="mt-1 text-xl font-semibold tracking-tight">页面不存在</h1>
        <p class="mt-2 text-sm text-muted-foreground">
          你访问的地址不存在，或页面已被移动到别处。回到数据总览继续。
        </p>

        <Button class="mt-6" @click="router.push('/')">
          <ArrowLeft aria-hidden="true" />
          返回数据总览
        </Button>
      </CardContent>
    </Card>
  </div>
</template>
