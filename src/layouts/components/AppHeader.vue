<script setup lang="ts">
import { useAppStore } from '@/stores/app'

const app = useAppStore()
</script>

<template>
  <header class="h-12 flex items-center justify-between px-4 border-b border-[var(--c-border)]">
    <span class="text-sm text-[var(--c-text-soft)]">{{ app.title }}</span>
    <button class="btn-ghost px-2" title="切换主题" @click="app.toggleDark()">
      <span :class="app.isDark ? 'i-carbon-sun' : 'i-carbon-moon'" />
    </button>
  </header>
</template>