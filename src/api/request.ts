import axios from 'axios'

const request = axios.create({
  baseURL: import.meta.env.VITE_APP_API_BASEURL ?? '/api',
  timeout: 15000,
})

// 请求/响应拦截器可在此处按需添加

export default request
