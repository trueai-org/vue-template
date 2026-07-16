<script setup lang="ts">
import { useAppStore } from '@/stores/app'

const app = useAppStore()
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-2">
      关于
    </h1>
    <p class="text-[var(--c-text-soft)]">
      {{ app.title }} 基于 Vue3 + Vite + Pinia + UnoCSS，UI 无关、模块可替换。
    </p>
  </div>
</template>