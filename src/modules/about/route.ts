import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/about',
    name: 'About',
    component: () => import('./views/AboutView.vue'),
    meta: { title: '关于', icon: 'i-carbon-information' },
  },
]

export default routes