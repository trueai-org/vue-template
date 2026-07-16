import type { App } from 'vue'
import { createPinia } from 'pinia'

const pinia = createPinia()

/** 在应用实例上安装 Pinia */
export function setupStore(app: App) {
  app.use(pinia)
}

export { pinia }