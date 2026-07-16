import type { RouteRecordRaw } from 'vue-router'

import homeRoutes from '@/modules/home/route'
import aboutRoutes from '@/modules/about/route'

/**
 * 路由聚合：每个业务模块导出自己的路由片段，在此拼装。
 * 新增模块只需 import 其 route.ts 并加入 children。
 */
export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: [
      ...homeRoutes,
      ...aboutRoutes,
    ],
  },
]