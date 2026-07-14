<template>
  <div class="login-page">

    <!-- Fond slideshow -->
    <ImageSlideshow :images="slides" :interval="7000" />

    <!-- Card -->
    <div class="login-card-wrapper">
      <div class="login-card">

        <div class="login-card__top" />

        <div class="login-card__body">

          <!-- Logo -->
          <div class="login-card__logo">
            <span class="login-card__logo-text">FAC</span>
          </div>

          <!-- Onglets -->
          <div class="login-tabs" role="tablist">
            <button
              role="tab"
              :aria-selected="activeTab === 'login'"
              :class="['login-tabs__tab', { 'login-tabs__tab--active': activeTab === 'login' }]"
              @click="switchTab('login')"
            >
              Connexion
            </button>
            <button
              role="tab"
              :aria-selected="activeTab === 'register'"
              :class="['login-tabs__tab', { 'login-tabs__tab--active': activeTab === 'register' }]"
              @click="switchTab('register')"
            >
              Inscription
            </button>
          </div>

          <!-- Erreur globale API -->
          <div v-if="auth.error" class="login-card__error" role="alert">
            {{ auth.error }}
          </div>

          <!-- Formulaire connexion -->
          <form v-if="activeTab === 'login'" class="login-form" @submit.prevent="handleLogin" novalidate>
            <AppInput
              v-model="loginForm.email"
              label="Email"
              type="email"
              placeholder="votre@email.com"
              :error="loginErrors.email"
              required
            />
            <AppInput
              v-model="loginForm.password"
              label="Mot de passe"
              type="password"
              placeholder="Entrez votre mot de passe"
              :error="loginErrors.password"
              required
            />
            <div class="login-form__forgot">
              <router-link to="/forgot-password" class="login-form__link">
                Mot de passe oublié ?
              </router-link>
            </div>
            <AppButton type="submit" :loading="auth.isLoading" full-width size="lg">
              Se connecter
            </AppButton>
          </form>

          <!-- Formulaire inscription -->
          <form v-else class="login-form" @submit.prevent="handleRegister" novalidate>
            <AppInput
              v-model="registerForm.name"
              label="Nom complet"
              placeholder="Votre prénom et nom"
              :error="registerErrors.name"
              required
            />
            <AppInput
              v-model="registerForm.pseudo"
              label="Pseudo"
              placeholder="Visible par les autres (optionnel)"
              :error="registerErrors.pseudo"
            />
            <AppInput
              v-model="registerForm.email"
              label="Email"
              type="email"
              placeholder="votre@email.com"
              :error="registerErrors.email"
              required
            />
            <AppInput
              v-model="registerForm.password"
              label="Mot de passe"
              type="password"
              placeholder="Minimum 8 caractères"
              :error="registerErrors.password"
              required
            />
            <AppInput
              v-model="registerForm.confirmPassword"
              label="Confirmer le mot de passe"
              type="password"
              placeholder="Confirmez votre mot de passe"
              :error="registerErrors.confirmPassword"
              required
            />
            <AppButton type="submit" :loading="auth.isLoading" full-width size="lg">
              Créer mon compte
            </AppButton>
          </form>

          <!-- Switch bas de card -->
          <p class="login-card__switch">
            <template v-if="activeTab === 'login'">
              Pas encore de compte ?
              <button class="login-card__switch-btn" @click="switchTab('register')">S'inscrire</button>
            </template>
            <template v-else>
              Déjà un compte ?
              <button class="login-card__switch-btn" @click="switchTab('login')">Se connecter</button>
            </template>
          </p>

        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppInput from '@/components/AppInput.vue'
import AppButton from '@/components/AppButton.vue'
import ImageSlideshow from '@/components/ImageSlideshow.vue'

defineOptions({ name: 'LoginView' })

const router = useRouter()
const route  = useRoute()
const auth   = useAuthStore()

// â”€â”€ Onglet actif â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const activeTab = ref<'login' | 'register'>('login')

// â”€â”€ Formulaire connexion â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const loginForm   = ref({ email: '', password: '' })
const loginErrors = ref({ email: '', password: '' })

function validateLogin(): boolean {
  loginErrors.value = { email: '', password: '' }
  let ok = true
  if (!loginForm.value.email)    { loginErrors.value.email    = "L'email est requis" ; ok = false }
  if (!loginForm.value.password) { loginErrors.value.password = 'Le mot de passe est requis' ; ok = false }
  return ok
}

async function handleLogin() {
  if (!validateLogin()) return
  try {
    await auth.login(loginForm.value)
    const redirect = route.query.redirect as string | undefined
    router.push(redirect ?? '/')
  } catch { /* erreur affichée via auth.error */ }
}

// â”€â”€ Formulaire inscription â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const registerForm = ref({
  name: '', email: '', password: '', confirmPassword: '', pseudo: '',
})
const registerErrors = ref({
  name: '', email: '', password: '', confirmPassword: '', pseudo: '',
})

function validateRegister(): boolean {
  registerErrors.value = { name: '', email: '', password: '', confirmPassword: '', pseudo: '' }
  let ok = true
  if (!registerForm.value.name.trim())               { registerErrors.value.name            = 'Le nom est requis' ; ok = false }
  if (!registerForm.value.email)                     { registerErrors.value.email           = "L'email est requis" ; ok = false }
  if (registerForm.value.password.length < 8)        { registerErrors.value.password        = 'Minimum 8 caractères' ; ok = false }
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    registerErrors.value.confirmPassword = 'Les mots de passe ne correspondent pas'
    ok = false
  }
  return ok
}

async function handleRegister() {
  if (!validateRegister()) return
  try {
    await auth.register({
      name:     registerForm.value.name,
      email:    registerForm.value.email,
      password: registerForm.value.password,
      pseudo:   registerForm.value.pseudo || undefined,
    })
    router.push('/')
  } catch { /* erreur affichée via auth.error */ }
}

// â”€â”€ Nettoyage erreurs au changement d'onglet â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function switchTab(tab: 'login' | 'register') {
  activeTab.value = tab
  auth.error = null
}

// â”€â”€ Slideshow â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const slides = [
  '/images/login-bg-1.webp',
  '/images/login-bg-2.webp',
  '/images/login-bg-3.webp',
]
</script>

<style scoped>
.login-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card-wrapper {
  position: relative;
  z-index: 1;
  padding: 24px;
  width: 100%;
  display: flex;
  justify-content: center;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-xl);
}

.login-card__top {
  height: 5px;
  background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
}

.login-card__body { padding: 32px 36px 36px; }

.login-card__logo {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.login-card__logo-text {
  font-family: var(--font-heading);
  font-size: var(--text-3xl);
  font-weight: var(--font-weight-extrabold);
  color: var(--color-primary);
  letter-spacing: 4px;
}

.login-tabs {
  display: flex;
  background: var(--color-primary-bg);
  border-radius: var(--radius-full);
  padding: 4px;
  margin-bottom: 24px;
}

.login-tabs__tab {
  flex: 1;
  padding: 9px;
  border: none;
  background: transparent;
  border-radius: var(--radius-full);
  font-family: var(--font-heading);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.login-tabs__tab--active {
  background: var(--color-primary);
  color: #fff;
  font-weight: var(--font-weight-semibold);
}

.login-card__error {
  background: var(--color-error-bg);
  color: var(--color-error);
  border: 1px solid var(--color-error);
  border-radius: var(--radius-md);
  padding: 10px 14px;
  font-size: var(--text-sm);
  margin-bottom: 16px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.login-form__forgot { text-align: right; margin-top: -8px; }

.login-form__link {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  transition: color var(--transition-fast);
}

.login-form__link:hover { color: var(--color-primary); }

.login-card__switch {
  text-align: center;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin-top: 20px;
}

.login-card__switch-btn {
  background: none;
  border: none;
  color: var(--color-primary);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  padding: 0;
  margin-left: 4px;
  text-decoration: underline;
  text-underline-offset: 2px;
}

@media (max-width: 480px) {
  .login-card__body { padding: 24px 20px 28px; }
}
</style>
