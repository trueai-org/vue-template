/**
 * 通用纯函数工具：无框架依赖，可随时迁移到任意项目。
 */

/** 深拷贝（JSON 兜底，适用于可序列化数据） */
export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

/** 防抖 */
export function debounce<A extends unknown[]>(fn: (...args: A) => void, delay = 300) {
  let timer: ReturnType<typeof setTimeout> | undefined
  return (...args: A) => {
    if (timer)
      clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

/** 本地化日期时间格式化 */
export function formatDateTime(value: number | Date, locale = 'zh-CN') {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(value)
}