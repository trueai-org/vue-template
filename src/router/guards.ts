import type { Router } from 'vue-router'
import { useAppStore } from '@/stores/app'

/** 注册全局前置守卫 */
export function setupGuards(router: Router) {
  router.beforeEach((to) => {
    const app = useAppStore()
    document.title = to.meta.title ? `${to.meta.title} - ${app.title}` : app.title
  })
}