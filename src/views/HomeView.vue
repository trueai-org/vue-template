<script setup lang="ts"></script>

<template>
  <section class="m-4 p-4 border border-gray-300 rounded-lg">
    <h1 class="text-2xl font-bold text-red-400 mb-2">
      Vue Template
    </h1>
    <p class="m-4 text-red-400 border border-gray-300 p-2">
      基于官方 create-vite，UI 无关、模块可替换。
    </p>
    <div class="mt-4 flex gap-2">
      <span class="px-2 py-1 bg-green-500 text-white rounded">UnoCSS</span>
      <span class="px-2 py-1 bg-blue-500 text-white rounded">Vue3</span>
    </div>
    <!-- @option:css.unocss -->
    <!-- 图标类（UnoCSS presetIcons）：依赖 @iconify-json/carbon，移除图标库时删除此块即可 -->
    <div class="mt-4 flex items-center gap-3 text-xl">
      <i class="i-carbon-home text-green-600" />
      <i class="i-carbon-information text-blue-600" />
      <i class="i-carbon-logo-github text-gray-800" />
    </div>
    <!-- @end -->
    <!-- @module:layer -->
    <!-- 图标组件（unplugin-icons + unplugin-vue-components）：依赖 @iconify/json，移除集成层时删除此块即可 -->
    <div class="mt-4 flex items-center gap-3 text-xl">
      <i-carbon-home class="text-green-600" />
      <i-carbon-information class="text-blue-600" />
      <i-carbon-logo-github class="text-gray-800" />
    </div>
    <!-- @end -->
  </section>
</template>
