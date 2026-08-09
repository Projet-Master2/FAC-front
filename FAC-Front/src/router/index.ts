import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Profile from '../views/Profile.vue'
import Search from '../views/Search.vue'
import RecipeCreate from '../views/RecipeCreate.vue'
import RecipeEdit from '../views/RecipeEdit.vue'
import RecipeDetail from '../views/RecipeDetail.vue'
// import LoginMockup from '../views/LoginMockup.vue' // Mockup — décommenter si besoin

// Routes qui nécessitent d'être connecté
const authRequiredRoutes = ['home']

// Routes accessibles uniquement sans session (redirection si déjà connecté)
const guestOnlyRoutes = ['login']

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
      path: '/profile',
      name: 'profile',
      component: Profile,
      meta: { requiresAuth: true },
    },
    {
      path: '/search',
      name: 'search',
      component: Search,
    },
    {
      path: '/recipes/create',
      name: 'recipe-create',
      component: RecipeCreate,
      meta: { requiresAuth: true },
    },
    {
      path: '/recipes/:id/edit',
      name: 'recipe-edit',
      component: RecipeEdit,
      meta: { requiresAuth: true },
    },
    {
      path: '/recipes/:id',
      name: 'recipe-detail',
      component: RecipeDetail,
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
    await auth.fetchMe()
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'home' }
  }
})

export default router

