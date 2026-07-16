import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('./views/HomeView.vue'),
    meta: { title: '首页', icon: 'i-carbon-home' },
  },
]

export default routes