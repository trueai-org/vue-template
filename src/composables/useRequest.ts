import { ref, shallowRef, type ShallowRef } from 'vue'
import type { AxiosRequestConfig } from 'axios'
import { http } from '@/api/request'

interface UseRequestOptions<T> {
  /** 创建时立即请求 */
  immediate?: boolean
  /** 初始值 */
  initialValue?: T
}

/**
 * 通用请求组合式：管理 loading / error / data。
 * data 用 shallowRef：避免深度响应式解包导致泛型 T 退化为 unknown，
 * 同时对接口返回的大对象性能更友好。
 */
export function useRequest<T>(
  url: string,
  config?: AxiosRequestConfig,
  options: UseRequestOptions<T> = {},
) {
  const data: ShallowRef<T | undefined> = shallowRef(options.initialValue)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  async function execute() {
    loading.value = true
    error.value = null
    try {
      data.value = await http.get<T>(url, config)
    }
    catch (e) {
      error.value = e as Error
    }
    finally {
      loading.value = false
    }
  }

  if (options.immediate)
    execute()

  return { data, loading, error, execute }
}