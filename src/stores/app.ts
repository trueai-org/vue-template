import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * 应用级状态：标题、暗色模式等。
 * 仅依赖浏览器 API，无 UI 框架耦合，可整体替换。
 */
export const useAppStore = defineStore('app', () => {
  const title = import.meta.env.VITE_APP_TITLE
  const isDark = ref(false)

  function applyDark(value: boolean) {
    isDark.value = value
    document.documentElement.classList.toggle('dark', value)
  }

  function toggleDark() {
    applyDark(!isDark.value)
  }

  /** 根据系统偏好初始化暗色模式 */
  function initDark() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    applyDark(prefersDark)
  }

  return { title, isDark, toggleDark, initDark }
})