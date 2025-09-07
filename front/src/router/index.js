import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import Home from '@/views/HomeView.vue'

const routes = [
  {
    meta: {
      title: 'Home',
      requiresAuth: true,
    },
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    // Document title tag
    // We combine it with defaultDocumentTitle set in `src/main.js` on router.afterEach hook
    meta: {
      title: 'Dashboard',
      requiresAuth: true,
    },
    path: '/dashboard',
    name: 'dashboard',
    component: Home,
  },
  {
    meta: {
      title: 'Products',
      requiresAuth: true,
    },
    path: '/products',
    name: 'products',
    component: () => import('@/views/ProductView.vue'),
  },
  {
    meta: {
      title: 'Crawled Data',
      requiresAuth: true,
    },
    path: '/crawled-data',
    name: 'crawled-data',
    component: () => import('@/views/CrawledDataView.vue'),
  },
  {
    meta: {
      title: 'Deleted Products',
      requiresAuth: true,
    },
    path: '/deleted-products',
    name: 'deleted-products',
    component: () => import('@/views/DeletedProductsView.vue'),
  },
  {
    meta: {
      title: 'Profile',
      requiresAuth: true,
    },
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue'),
  },
  {
    meta: {
      title: 'Ui',
      requiresAuth: true,
    },
    path: '/ui',
    name: 'ui',
    component: () => import('@/views/UiView.vue'),
  },
  {
    meta: {
      title: 'Responsive layout',
      requiresAuth: true,
    },
    path: '/responsive',
    name: 'responsive',
    component: () => import('@/views/ResponsiveView.vue'),
  },
  {
    meta: {
      title: 'Login',
      requiresAuth: false,
    },
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
  },
  {
    meta: {
      title: 'Error',
      requiresAuth: false,
    },
    path: '/error',
    name: 'error',
    component: () => import('@/views/ErrorView.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 }
  },
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Initialize auth on first navigation
  if (!authStore.isAuthenticated) {
    authStore.initAuth()
  }
  
  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    if (authStore.isLoggedIn) {
      next() // Allow access
    } else {
      // Redirect to login if not authenticated
      next({ name: 'login' })
    }
  } else {
    // For non-protected routes (like login page)
    if (to.name === 'login' && authStore.isLoggedIn) {
      // If already logged in and trying to access login page, redirect to dashboard
      next({ name: 'dashboard' })
    } else {
      next() // Allow access
    }
  }
})

export default router
