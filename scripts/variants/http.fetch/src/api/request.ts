const BASE_URL = import.meta.env.VITE_APP_API_BASEURL ?? '/api'

// 原生 fetch 薄封装：统一 baseURL 与 JSON 解析，不做过度封装（规则 4）
// https://developer.mozilla.org/docs/Web/API/Fetch_API
async function request(path: string, options?: RequestInit): Promise<unknown> {
  const res = await fetch(`${BASE_URL}${path}`, options)
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
  return res.json()
}

export default request
