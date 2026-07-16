import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUserInfo, type UserInfo } from './api'

/**
 * home 模块状态。
 * 模块自包含：api + store + view + route 聚合在同一目录，可整体替换/迁移。
 */
export const useHomeStore = defineStore('home', () => {
  const user = ref<UserInfo | null>(null)
  const loading = ref(false)

  async function fetchUser() {
    loading.value = true
    try {
      user.value = await getUserInfo()
    }
    finally {
      loading.value = false
    }
  }

  return { user, loading, fetchUser }
})