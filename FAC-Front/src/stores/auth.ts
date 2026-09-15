import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { authApi, type AuthUser, type LoginPayload, type RegisterPayload } from '@/api/auth'
import { clearTokens } from '@/api/client'

export const useAuthStore = defineStore('auth', () => {
  // ─── State ─────────────────────────────────────────────────────────────────

  const user         = ref<AuthUser | null>(null)
  const accessToken  = ref<string | null>(localStorage.getItem('accessToken'))
  const refreshToken = ref<string | null>(localStorage.getItem('refreshToken'))
  const isLoading    = ref(false)
  const error        = ref<string | null>(null)

  // ─── Getters ───────────────────────────────────────────────────────────────

  const isAuthenticated = computed(() => !!accessToken.value)
  const currentUser     = computed(() => user.value)

  // ─── Helpers ───────────────────────────────────────────────────────────────

  function saveTokens(access: string, refresh: string) {
    accessToken.value  = access
    refreshToken.value = refresh
    localStorage.setItem('accessToken', access)
    localStorage.setItem('refreshToken', refresh)
  }

  // ─── Actions ───────────────────────────────────────────────────────────────

  async function login(payload: LoginPayload) {
    isLoading.value = true
    error.value = null
    try {
      const { data } = await authApi.login(payload)
      saveTokens(data.data.accessToken, data.data.refreshToken)
      user.value = data.data.user
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })
        ?.response?.data?.error ?? 'Erreur de connexion'
      error.value = msg
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function register(payload: RegisterPayload) {
    isLoading.value = true
    error.value = null
    try {
      const { data } = await authApi.register(payload)
      saveTokens(data.data.accessToken, data.data.refreshToken)
      user.value = data.data.user
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: string } } })
        ?.response?.data?.error ?? 'Erreur lors de l\'inscription'
      error.value = msg
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    try {
      if (refreshToken.value) await authApi.logout(refreshToken.value)
    } finally {
      user.value = null
      clearTokens()
      accessToken.value  = null
      refreshToken.value = null
    }
  }

  async function fetchMe() {
    if (!accessToken.value) return
    try {
      const { data } = await authApi.getMe()
      user.value = data.data
    } catch {
      // Token invalide → on nettoie
      await logout()
    }
  }

  return {
    // State
    user,
    accessToken,
    refreshToken,
    isLoading,
    error,
    // Getters
    isAuthenticated,
    currentUser,
    // Actions
    login,
    register,
    logout,
    fetchMe,
  }
})
