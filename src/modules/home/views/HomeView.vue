<script setup lang="ts">
import { useAppStore } from '@/stores/app'

const app = useAppStore()
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-2">
      {{ app.title }}
    </h1>
    <p class="text-[var(--c-text-soft)]">
      一个干净、UI 无关、可替换的 Vue3 模板起点。
    </p>

    <div class="mt-6 flex flex-wrap gap-2">
      <button class="btn-primary" @click="app.toggleDark()">
        切换{{ app.isDark ? '亮色' : '暗色' }}
      </button>
    </div>
  </div>
</template>