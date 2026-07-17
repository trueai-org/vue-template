import { createRouter, createWebHistory } from 'vue-router'
// @module:utils
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// NProgress 配置：关闭旋转动画，保持最小进度条
NProgress.configure({ showSpinner: false })
// @end

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: () => import('../views/HomeView.vue') },
    { path: '/about', name: 'about', component: () => import('../views/AboutView.vue') },
    // @module:utils
    { path: '/utils', name: 'utils', component: () => import('../views/UtilsView.vue') },
    // @end
  ],
})

// @module:utils
// 路由进度条：切换页面时顶部加载条
// 依赖 nprogress；移除时删除本块 + 顶部 import
router.beforeEach(() => {
  NProgress.start()
})
router.afterEach(() => {
  NProgress.done()
})
// @end

export default router
