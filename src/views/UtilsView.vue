<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDark, useToggle, useMouse, useStorage, useDebounceFn } from '@vueuse/core'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

// dayjs 插件注册：relativeTime 提供 fromNow / toNow 等相对时间方法
dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

// ===== @vueuse/core 示例 =====

// 暗色模式：useDark 读写 <html class="dark">，useToggle 切换
const isDark = useDark()
const toggleDark = useToggle(isDark)

// 鼠标位置：响应式 x / y，自动清理监听器
const { x, y } = useMouse()

// 持久化存储：useStorage 自动同步到 localStorage
const note = useStorage('vue-template-note', '')

// 防抖：输入停止 500ms 后才触发
const searchText = ref('')
const debouncedResult = ref('')
const onSearch = useDebounceFn((val: string) => {
  debouncedResult.value = val
}, 500)

// ===== dayjs 示例 =====

const now = dayjs()
const formatted = now.format('YYYY-MM-DD HH:mm:ss')
const relative = now.fromNow() // "几秒前"

// 计算属性演示：两个日期差
const diffDays = computed(() => dayjs('2026-01-01').diff(now, 'day'))
</script>

<template>
  <section class="m-4 p-4 border border-gray-300 rounded-lg space-y-6">
    <h1 class="text-2xl font-bold mb-2">运行时工具演示</h1>

    <!-- @vueuse/core：暗色模式 -->
    <div class="space-y-2">
      <h2 class="text-lg font-semibold">@vueuse/core — useDark</h2>
      <p>当前模式：{{ isDark ? '暗色' : '亮色' }}</p>
      <button
        class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        @click="toggleDark()"
      >
        切换暗色模式
      </button>
    </div>

    <!-- @vueuse/core：鼠标位置 -->
    <div class="space-y-2">
      <h2 class="text-lg font-semibold">@vueuse/core — useMouse</h2>
      <p>x: {{ x }}, y: {{ y }}</p>
    </div>

    <!-- @vueuse/core：持久化存储 -->
    <div class="space-y-2">
      <h2 class="text-lg font-semibold">@vueuse/core — useStorage</h2>
      <input
        v-model="note"
        class="border border-gray-300 rounded px-2 py-1 w-full max-w-md"
        placeholder="输入内容会自动保存到 localStorage"
      />
      <p class="text-sm text-gray-500">已保存：{{ note || '(空)' }}（刷新页面后仍在）</p>
    </div>

    <!-- @vueuse/core：防抖 -->
    <div class="space-y-2">
      <h2 class="text-lg font-semibold">@vueuse/core — useDebounceFn</h2>
      <input
        v-model="searchText"
        class="border border-gray-300 rounded px-2 py-1 w-full max-w-md"
        placeholder="输入后 500ms 触发"
        @input="onSearch(searchText)"
      />
      <p class="text-sm text-gray-500">防抖结果：{{ debouncedResult || '(等待中...)' }}</p>
    </div>

    <!-- dayjs：日期格式化与相对时间 -->
    <div class="space-y-2">
      <h2 class="text-lg font-semibold">dayjs — 日期处理</h2>
      <p>当前时间：{{ formatted }}</p>
      <p>相对时间：{{ relative }}</p>
      <p>距 2026-01-01：{{ diffDays }} 天</p>
    </div>
  </section>
</template>
