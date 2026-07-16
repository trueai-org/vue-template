/** 统一响应结构（按后端约定调整此类型即可） */
export interface ApiResult<T = unknown> {
  code: number
  message: string
  data: T
}