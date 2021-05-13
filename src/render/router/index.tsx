import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'

export interface RouteMeta {
  icon?: JSX.Element
  name?: string
}

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/pages/home'),
    meta: {
      // icon: null,
      name: '首页',
    },
  }
]

export default createRouter({
  routes,
  history: createWebHashHistory(), // 这里使用 hash 模式，确保打包后正常加载
})
