import { http } from '@/api/request'

export interface UserInfo {
  id: number
  name: string
}

/** 示例接口：按实际后端替换 URL 与类型即可 */
export function getUserInfo() {
  return http.get<UserInfo>('/api/user/info')
}