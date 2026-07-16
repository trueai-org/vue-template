import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import type { ApiResult } from './types'

const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_API_BASEURL,
  timeout: 15000,
})

// 请求拦截：注入 token 等公共头
request.interceptors.request.use(
  (config) => {
    return config
  },
  error => Promise.reject(error),
)

// 响应拦截：统一业务错误出口，不解包（由 http 封装提取 data）
request.interceptors.response.use(
  (response: AxiosResponse<ApiResult>) => {
    const res = response.data
    if (res.code !== 0) {
      return Promise.reject(new Error(res.message || 'Request Error'))
    }
    return response
  },
  error => Promise.reject(error),
)

/**
 * 业务层使用的 http 封装：返回值已解包为 data。
 * 通过 .then 提取 res.data.data，类型安全。
 */
export const http = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    request.get<ApiResult<T>>(url, config).then(res => res.data.data),
  post: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request.post<ApiResult<T>>(url, data, config).then(res => res.data.data),
  put: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request.put<ApiResult<T>>(url, data, config).then(res => res.data.data),
  delete: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    request.delete<ApiResult<T>>(url, config).then(res => res.data.data),
}

export default request