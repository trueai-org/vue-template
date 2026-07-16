import type { App } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'
import { setupGuards } from './guards'

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_APP_BASE),
  routes,
})

/** 在应用实例上安装路由，并注册守卫 */
export function setupRouter(app: App) {
  setupGuards(router)
  app.use(router)
}

export { router }