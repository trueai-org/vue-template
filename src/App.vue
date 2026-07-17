<script setup lang="ts"></script>

<template>
  <div>
    <nav class="flex gap-4 p-4 border-b border-gray-300">
      <RouterLink
        to="/"
        class="text-blue-500 hover:underline"
      >
        首页
      </RouterLink>
      <RouterLink
        to="/about"
        class="text-blue-500 hover:underline"
      >
        关于
      </RouterLink>
      <!-- @module:utils -->
      <RouterLink
        to="/utils"
        class="text-blue-500 hover:underline"
      >
        工具演示
      </RouterLink>
      <!-- @end -->
    </nav>
    <RouterView />
  </div>
</template>
