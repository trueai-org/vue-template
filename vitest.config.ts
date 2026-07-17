import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

// Vitest 配置：独立于 vite.config.ts，保持 test 模块可整体移除
// https://vitest.dev/config/
export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom', // 组件渲染测试需要 DOM 环境
    include: ['src/__tests__/**/*.spec.ts'],
  },
})
