import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: 'GitHub 用户探索' }
  },
  {
    path: '/user/:username',
    name: 'UserDetail',
    component: () => import('@/views/UserDetail.vue'),
    meta: { title: '用户详情' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})

router.beforeEach((to, from, next) => {
  const title = to.meta.title as string
  if (title) {
    document.title = `${title} | GitHub Explorer`
  }
  next()
})

export default router