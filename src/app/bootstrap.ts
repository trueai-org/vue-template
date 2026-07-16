import { createApp } from 'vue'
import App from './App.vue'
import { router, setupRouter } from '@/router'
import { setupStore } from '@/stores'
import { useAppStore } from '@/stores/app'

// UnoCSS 虚拟模块 + 全局基础样式
import 'virtual:uno.css'
import '@/styles/main.css'

/**
 * 应用组装入口：把各基础设施（store / router）装配到 app 实例。
 * main.ts 仅调用本函数，职责单一。
 */
export async function bootstrap() {
  const app = createApp(App)

  setupStore(app)
  setupRouter(app)

  // 初始化应用状态（跟随系统暗色模式）
  useAppStore().initDark()

  await router.isReady()
  app.mount('#app')

  return app
}