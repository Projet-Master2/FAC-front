<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import AppButton from '@/components/AppButton.vue'
import RecipeCard from '@/components/RecipeCard.vue'
import { useAuthStore } from '@/stores/auth'
import { usersApi } from '@/api/users'
import { recipesApi, type RecipeSummary } from '@/api/recipes'

defineOptions({ name: 'ProfileView' })

const auth = useAuthStore()
const router = useRouter()

const loading = ref(false)
const favorites = ref<RecipeSummary[]>([])
const error = ref<string | null>(null)

const initials = computed(() => {
  const name = auth.user?.name ?? ''
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
})

async function loadProfile() {
  if (!auth.accessToken) {
    router.push('/login')
    return
  }

  loading.value = true
  error.value = null

  try {
    if (!auth.user) {
      await auth.fetchMe()
    }

    if (!auth.user) {
      router.push('/login')
      return
    }

    const { data } = await usersApi.getFavorites(auth.user.id)
    favorites.value = data.data
  } catch {
    error.value = 'Impossible de charger le profil.'
  } finally {
    loading.value = false
  }
}

async function removeFavorite(recipeId: string) {
  try {
    await recipesApi.removeFavorite(recipeId)
    favorites.value = favorites.value.filter((recipe) => recipe.id !== recipeId)
  } catch {
    // Pas bloquant pour l utilisateur.
  }
}

onMounted(() => {
  void loadProfile()
})
</script>

<template>
  <div class="profile-page">
    <Navbar />

    <main class="profile-main container">
      <section class="profile-header">
        <div class="profile-avatar">
          <img v-if="auth.user?.avatar" :src="auth.user.avatar" :alt="auth.user.name" />
          <span v-else>{{ initials }}</span>
        </div>

        <div class="profile-user">
          <h1>{{ auth.user?.name ?? 'Profil' }}</h1>
          <p v-if="auth.user?.pseudo">@{{ auth.user.pseudo }}</p>
          <p>{{ auth.user?.email }}</p>
        </div>

        <AppButton variant="ghost" @click="router.push('/search')">Explorer</AppButton>
      </section>

      <section v-if="loading" class="profile-info">Chargement du profil...</section>
      <section v-else-if="error" class="profile-info profile-info--error">{{ error }}</section>

      <section v-else class="profile-favorites">
        <h2>Mes favoris</h2>

        <div v-if="favorites.length === 0" class="profile-info">
          Vous n avez pas encore de favoris.
        </div>

        <div v-else class="profile-grid">
          <RecipeCard
            v-for="recipe in favorites"
            :key="recipe.id"
            :recipe="recipe"
            :is-favorite="true"
            @favorite="removeFavorite"
          />
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: var(--color-bg);
}

.profile-main {
  padding-top: var(--space-10);
  padding-bottom: var(--space-16);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-5);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.profile-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--color-primary-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-heading);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-user h1 {
  margin: 0;
  font-family: var(--font-heading);
}

.profile-user p {
  margin: 0;
  color: var(--color-text-secondary);
}

.profile-info {
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
}

.profile-info--error {
  color: var(--color-error);
  border-color: var(--color-error);
}

.profile-favorites h2 {
  margin: 0 0 var(--space-4);
  font-family: var(--font-heading);
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-5);
}

@media (max-width: 1024px) {
  .profile-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .profile-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .profile-grid {
    grid-template-columns: 1fr;
  }
}
</style>
