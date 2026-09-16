import { usePermission } from '@/composables/usePermission'
import { useUserStore } from '@/stores/user'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login/LoginView.vue'),
      meta: { title: '登录', requiresAuth: false },
    },
    {
      path: '/403',
      name: '403',
      component: () => import('@/views/Error/ForbiddenView.vue'),
      meta: { title: '403', requiresAuth: false },
    },
    {
      path: '/',
      name: 'layout',
      component: () => import('@/layouts/DefaultLayout.vue'),
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/views/Home/DashboardView.vue'),
          // meta 是侧边栏菜单动态生成的数据源（Task 5），icon 对应 @element-plus/icons-vue 组件名
          meta: { title: '仪表盘', icon: 'Odometer' },
        },
        {
          path: 'user/list',
          name: 'userList',
          // route level code-splitting: children 全部懒加载，访问时才拉取对应 chunk
          component: () => import('@/views/User/UserListView.vue'),
          meta: { title: '用户列表', icon: 'User', roles: ['admin'] },
        },
      ],
    },
  ],
})
router.beforeEach((to) => {
  const userStore = useUserStore()

  // 白名单：不需要鉴权的路由
  if (to.meta.requiresAuth === false) {
    // 已登录访问登录页踢回首页
    if (to.name === 'login' && userStore.token) return { path: '/' }
    return true
  }

  // 需要鉴权但无 token → 去登录
  if (!userStore.token) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  const { hasRole } = usePermission()
  if (!hasRole(to.meta.roles)) {
    return { path: '/403' }
  }
  return true
})
export default router
