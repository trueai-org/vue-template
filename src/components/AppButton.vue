<script setup lang="ts">
/**
 * 通用按钮：props 驱动 + UnoCSS shortcut + slot。
 * 展示「通用组件」的封装范式，可整体替换为任意实现。
 */
withDefaults(defineProps<{
  variant?: 'primary' | 'ghost'
  type?: 'button' | 'submit'
  disabled?: boolean
}>(), {
  variant: 'primary',
  type: 'button',
  disabled: false,
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="[
      variant === 'primary' ? 'btn-primary' : 'btn-ghost',
      disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
    ]"
  >
    <slot />
  </button>
</template>