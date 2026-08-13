import { createRouter, createWebHistory } from 'vue-router'
import { particlesState } from '@/stores/particles'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { title: '首页', particles: 'high' },
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/AboutView.vue'),
      meta: { title: '关于', particles: 'low' },
    },
    {
      path: '/projects',
      name: 'projects',
      component: () => import('@/views/ProjectsView.vue'),
      meta: { title: '项目', particles: 'low' },
    },
    {
      path: '/blog',
      name: 'blog',
      component: () => import('@/views/BlogListView.vue'),
      meta: { title: '博客', particles: 'low' },
    },
    {
      path: '/blog/:slug',
      name: 'blog-post',
      component: () => import('@/views/BlogPostView.vue'),
      meta: { title: '文章', particles: 'off' },
    },
  ],
})

router.afterEach((to) => {
  const siteName = '个人网站'
  document.title = to.meta.title ? `${to.meta.title} | ${siteName}` : siteName
  particlesState.density = to.meta.particles ?? 'low'
})

export default router
