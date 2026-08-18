import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Search from '../views/Search.vue'
import Profile from '../views/Profile.vue'
// import LoginMockup from '../views/LoginMockup.vue' // Mockup — décommenter si besoin

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { guestOnly: true },
    },
    {
      path: '/search',
      name: 'search',
      component: Search,
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile,
      meta: { requiresAuth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
    // Route mockup — décommenter pour réactiver (/mockup/login)
    // {
    //   path: '/mockup/login',
    //   name: 'mockup-login',
    //   component: LoginMockup,
    // },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (auth.accessToken && !auth.user) {
    try {
      await auth.fetchMe()
    } catch {
      // Le store gère déjà le nettoyage des tokens si nécessaire.
    }
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'home' }
  }
})

export default router

