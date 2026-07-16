<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { routes } from '@/router/routes'

/** 从路由聚合中派生菜单项：新增模块即自动出现在菜单 */
const menuItems = computed(() => {
  const children = routes[0]?.children ?? []
  return children
    .filter(r => !r.meta?.hidden)
    .map(r => ({
      path: r.path,
      title: r.meta?.title ?? (typeof r.name === 'string' ? r.name : r.path),
      icon: r.meta?.icon,
    }))
})
</script>

<template>
  <aside class="w-52 shrink-0 border-r border-[var(--c-border)] flex flex-col">
    <div class="h-12 flex items-center px-4 border-b border-[var(--c-border)] font-bold">
      <span class="i-carbon-cube-view text-xl mr-2" />
      Vue Template
    </div>
    <nav class="flex-1 p-2 flex flex-col gap-1 overflow-auto">
      <RouterLink
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="btn-ghost justify-start"
        active-class="!bg-[var(--c-fill)]"
      >
        <span v-if="item.icon" :class="item.icon" />
        {{ item.title }}
      </RouterLink>
    </nav>
  </aside>
</template>