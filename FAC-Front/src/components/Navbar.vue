<template>
  <nav class="navbar" v-click-outside="closeMenu">
    <div class="navbar-container">

      <!-- Logo -->
      <router-link to="/" class="navbar-logo" @click="closeMenu">
        <img src="/images/FAC_Logo.jpg" alt="FAC" class="navbar-logo__img" />
        <span class="navbar-logo__name">Facil'&#192;Cuisiner</span>
      </router-link>

      <!-- Burger -->
      <div class="navbar-burger-wrapper">
        <button
          class="navbar-burger"
          :class="{ 'navbar-burger--open': isOpen }"
          :aria-expanded="isOpen"
          aria-label="Menu"
          @click="isOpen = !isOpen"
        >
          <span class="navbar-burger__bar" />
          <span class="navbar-burger__bar" />
          <span class="navbar-burger__bar" />
        </button>

        <!-- Dropdown menu -->
        <Transition name="menu">
          <div v-if="isOpen" class="navbar-menu">
            <router-link class="navbar-menu__item" to="/" @click="closeMenu">
              Accueil
            </router-link>
            <router-link class="navbar-menu__item" to="/search" @click="closeMenu">
              Recherche
            </router-link>
            <router-link
              class="navbar-menu__item"
              :class="{ 'navbar-menu__item--disabled': !auth.isAuthenticated }"
              to="/recipes/create"
              @click="closeMenu"
            >
              Créer une recette
            </router-link>
            <router-link
              class="navbar-menu__item"
              :class="{ 'navbar-menu__item--disabled': !auth.isAuthenticated }"
              to="/profile"
              @click="closeMenu"
            >
              Profil
            </router-link>
            <div class="navbar-menu__divider" />
            <button v-if="auth.isAuthenticated" class="navbar-menu__item navbar-menu__item--logout" @click="handleLogout">
              Deconnexion
            </button>
            <router-link v-else class="navbar-menu__item navbar-menu__item--login" to="/login" @click="closeMenu">
              Connexion
            </router-link>
          </div>
        </Transition>
      </div>

    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

defineOptions({ name: 'NavbarComponent' })

const auth   = useAuthStore()
const router = useRouter()
const isOpen = ref(false)

function closeMenu() { isOpen.value = false }

async function handleLogout() {
  closeMenu()
  await auth.logout()
  router.push('/login')
}

// Directive v-click-outside
const vClickOutside = {
  mounted(el: HTMLElement & { _clickOutside?: (e: Event) => void }, binding: { value: () => void }) {
    el._clickOutside = (e: Event) => {
      if (!el.contains(e.target as Node)) binding.value()
    }
    document.addEventListener('click', el._clickOutside)
  },
  unmounted(el: HTMLElement & { _clickOutside?: (e: Event) => void }) {
    if (el._clickOutside) document.removeEventListener('click', el._clickOutside)
  },
}
</script>

<style scoped>
.navbar {
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow-sm);
}

.navbar-container {
  max-width: var(--max-width-xl);
  margin: 0 auto;
  padding: 0 var(--space-6);
  height: var(--navbar-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Logo */
.navbar-logo {
  text-decoration: none;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.navbar-logo__img {
  height: 40px;
  width: auto;
  display: block;
}

.navbar-logo__name {
  font-family: var(--font-heading);
  font-size: var(--text-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  white-space: nowrap;
}

/* Burger wrapper */
.navbar-burger-wrapper { position: relative; }

/* Burger button */
.navbar-burger {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  width: 40px;
  height: 40px;
  border: none;
  background: none;
  cursor: pointer;
  padding: 4px;
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
}

.navbar-burger:hover { background: var(--color-primary-bg); }

.navbar-burger__bar {
  display: block;
  width: 22px;
  height: 2px;
  background: var(--color-text);
  border-radius: 2px;
  transition: transform var(--transition-fast), opacity var(--transition-fast);
  transform-origin: center;
}

.navbar-burger--open .navbar-burger__bar:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.navbar-burger--open .navbar-burger__bar:nth-child(2) { opacity: 0; transform: scaleX(0); }
.navbar-burger--open .navbar-burger__bar:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

/* Dropdown */
.navbar-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 200px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: var(--space-2);
  display: flex;
  flex-direction: column;
}

.navbar-menu__item {
  display: block;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  font-family: var(--font-heading);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
  text-decoration: none;
  border: none;
  background: none;
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition: background var(--transition-fast), color var(--transition-fast);
}

.navbar-menu__item:hover { background: var(--color-bg); color: var(--color-primary); }

/* Page active (classe injectee automatiquement par Vue Router) */
.navbar-menu__item.router-link-exact-active {
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
  background: var(--color-primary-bg);
}

/* Items inaccessibles (non connecte) — gris visuel, mais cliquable (route guard redirige vers login) */
.navbar-menu__item--disabled {
  color: var(--color-text-muted) !important;
  opacity: 0.6;
}

.navbar-menu__item--login { color: var(--color-primary); font-weight: var(--font-weight-semibold); }

.navbar-menu__item--logout { color: var(--color-error); }
.navbar-menu__item--logout:hover { background: var(--color-error-bg); color: var(--color-error); }

.navbar-menu__divider {
  height: 1px;
  background: var(--color-border);
  margin: var(--space-2) var(--space-1);
}

/* Transition */
.menu-enter-active, .menu-leave-active {
  transition: opacity var(--transition-fast), transform var(--transition-fast);
}
.menu-enter-from, .menu-leave-to { opacity: 0; transform: translateY(-8px); }

@media (max-width: 480px) {
  .navbar-container { padding: 0 var(--space-4); }
  .navbar-logo__name { display: none; }
}
</style>
