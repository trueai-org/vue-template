import ky from 'ky'

// ky：基于 fetch 的轻量封装，prefixUrl / timeout / hooks 按需添加
// https://github.com/sindresorhus/ky
const request = ky.create({
  prefixUrl: import.meta.env.VITE_APP_API_BASEURL ?? '/api',
  timeout: 15000,
})

export default request
