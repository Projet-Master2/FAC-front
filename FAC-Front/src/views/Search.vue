<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { recipesApi, type RecipeSummary, type RecipesQuery } from '@/api/recipes'
import Navbar from '@/components/Navbar.vue'
import RecipeCard from '@/components/RecipeCard.vue'
import FilterSidebar from '@/components/FilterSidebar.vue'

defineOptions({ name: 'SearchView' })

const route  = useRoute()
const router = useRouter()
const auth   = useAuthStore()

// Etat
const recipes    = ref<RecipeSummary[]>([])
const total      = ref(0)
const totalPages = ref(1)
const page       = ref(1)
const loading    = ref(false)
const favorites  = ref<Set<string>>(new Set())

// Filtres initialises depuis les query params (deep link)
const filters = ref<RecipesQuery>({
  q:    (route.query.q as string) ?? '',
  sort: 'recent',
})

const paginationRange = computed(() => {
  const range: number[] = []
  const start = Math.max(1, page.value - 2)
  const end   = Math.min(totalPages.value, page.value + 2)
  for (let i = start; i <= end; i++) range.push(i)
  return range
})

// Barre de recherche separee pour le debounce
const searchInput = ref(filters.value.q ?? '')
let debounceTimer: ReturnType<typeof setTimeout>

function onSearchInput(val: string) {
  searchInput.value = val
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    filters.value = { ...filters.value, q: val }
    page.value = 1
  }, 350)
}

async function fetchRecipes() {
  loading.value = true
  try {
    const { data } = await recipesApi.getRecipes({ ...filters.value, page: page.value, limit: 9 })
    recipes.value    = data.data.recipes
    total.value      = data.data.total
    totalPages.value = data.data.totalPages
    // Sync URL
    router.replace({ query: { ...filters.value } })
  } catch {
    recipes.value = []
  } finally {
    loading.value = false
  }
}

async function loadFavorites() {
  if (!auth.user) return
  try {
    const { data } = await import('@/api/users').then(m => m.usersApi.getFavorites(auth.user!.id))
    favorites.value = new Set(data.data.map((r: RecipeSummary) => r.id))
  } catch { /* silencieux */ }
}

async function toggleFavorite(id: string) {
  if (!auth.isAuthenticated) { router.push('/login') ; return }
  try {
    if (favorites.value.has(id)) {
      await recipesApi.removeFavorite(id)
      favorites.value.delete(id)
    } else {
      await recipesApi.addFavorite(id)
      favorites.value.add(id)
    }
    favorites.value = new Set(favorites.value)
  } catch { /* silencieux */ }
}

watch(filters, () => { page.value = 1 ; fetchRecipes() }, { deep: true })
watch(page, fetchRecipes)

onMounted(() => {
  fetchRecipes()
  loadFavorites()
})
</script>

<template>
  <div class="search-page">
    <Navbar />

    <!-- Barre de recherche -->
    <section class="search-hero">
      <div class="search-hero__inner">
        <h1 class="search-hero__title">Rechercher une recette</h1>
        <div class="search-hero__bar">
          <span class="search-hero__icon">🔍</span>
          <input
            class="search-hero__input"
            type="text"
            placeholder="Nom de recette ou ingredient..."
            :value="searchInput"
            @input="onSearchInput(($event.target as HTMLInputElement).value)"
          />
          <button v-if="searchInput" class="search-hero__clear" @click="onSearchInput('')">✕</button>
        </div>
        <p v-if="!loading && total > 0" class="search-hero__count">
          {{ total }} recette{{ total > 1 ? 's' : '' }} trouvée{{ total > 1 ? 's' : '' }}
        </p>
      </div>
    </section>

    <!-- Layout principal -->
    <div class="search-layout container">

      <!-- Sidebar mobile toggle -->
      <div class="search-filter-toggle">
        <FilterSidebar v-model="filters" />
      </div>

      <!-- Sidebar desktop -->
      <FilterSidebar v-model="filters" class="search-sidebar-desktop" />

      <!-- Contenu -->
      <main class="search-content">

        <!-- Grille skeleton -->
        <div v-if="loading" class="search-grid">
          <div v-for="i in 9" :key="i" class="recipe-skeleton" />
        </div>

        <!-- Etat vide -->
        <div v-else-if="recipes.length === 0" class="search-empty">
          <p class="search-empty__icon">🍽️</p>
          <h3>Aucune recette trouvée</h3>
          <p>Essayez d'autres mots-cles ou reinitialisez les filtres</p>
        </div>

        <!-- Grille de recettes -->
        <div v-else class="search-grid">
          <RecipeCard
            v-for="recipe in recipes"
            :key="recipe.id"
            :recipe="recipe"
            :is-favorite="favorites.has(recipe.id)"
            @favorite="toggleFavorite"
            @click="router.push(`/recipes/${recipe.id}`)"
          />
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="search-pagination">
          <button class="pagination-btn" :disabled="page === 1" @click="page--">
            Precedent
          </button>

          <div class="pagination-pages">
            <button
              v-for="p in paginationRange"
              :key="p"
              class="pagination-page"
              :class="{ 'pagination-page--active': p === page }"
              @click="page = p"
            >
              {{ p }}
            </button>
          </div>

          <button class="pagination-btn" :disabled="page === totalPages" @click="page++">
            Suivant
          </button>
        </div>

      </main>
    </div>

  </div>
</template>

<style scoped>
.search-page {
  min-height: 100vh;
  background: var(--color-bg);
}

/* Hero recherche */
.search-hero {
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  padding: var(--space-8) var(--space-6);
}

.search-hero__inner {
  max-width: var(--max-width-xl);
  margin: 0 auto;
}

.search-hero__title {
  font-family: var(--font-heading);
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin: 0 0 var(--space-5);
}

.search-hero__bar {
  position: relative;
  display: flex;
  align-items: center;
}

.search-hero__icon {
  position: absolute;
  left: var(--space-4);
  font-size: 20px;
  pointer-events: none;
  opacity: 0.5;
}

.search-hero__input {
  width: 100%;
  padding: var(--space-4) var(--space-12) var(--space-4) 52px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-full);
  font-family: var(--font-body);
  font-size: var(--text-md);
  background: var(--color-bg);
  outline: none;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  box-shadow: var(--shadow-sm);
}

.search-hero__input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(255, 65, 65, 0.15);
}

.search-hero__clear {
  position: absolute;
  right: var(--space-4);
  background: none;
  border: none;
  font-size: 18px;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: color var(--transition-fast);
}

.search-hero__clear:hover { color: var(--color-primary); }

.search-hero__count {
  margin: var(--space-3) 0 0;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

/* Layout */
.search-layout {
  display: flex;
  gap: var(--space-8);
  padding-top: var(--space-8);
  padding-bottom: var(--space-16);
  align-items: flex-start;
}

.search-filter-toggle { display: none; }

.search-sidebar-desktop {
  width: 260px;
  flex-shrink: 0;
}

.search-content { flex: 1; min-width: 0; }

/* Grille */
.search-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-5);
}

/* Skeleton */
.recipe-skeleton {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  aspect-ratio: 3 / 4;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}

/* Vide */
.search-empty {
  text-align: center;
  padding: var(--space-16);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
}

.search-empty__icon { font-size: 56px; margin-bottom: var(--space-4); }

.search-empty h3 {
  font-family: var(--font-heading);
  font-size: var(--text-xl);
  color: var(--color-text);
  margin-bottom: var(--space-2);
}

.search-empty p { color: var(--color-text-muted); font-size: var(--text-sm); }

/* Pagination */
.search-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  margin-top: var(--space-10);
}

.pagination-btn {
  padding: var(--space-2) var(--space-5);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-full);
  background: var(--color-surface);
  font-family: var(--font-heading);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.pagination-btn:hover:not(:disabled) { border-color: var(--color-primary); color: var(--color-primary); }
.pagination-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.pagination-pages { display: flex; gap: var(--space-2); }

.pagination-page {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1.5px solid var(--color-border);
  background: var(--color-surface);
  font-family: var(--font-heading);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.pagination-page:hover { border-color: var(--color-primary); color: var(--color-primary); }
.pagination-page--active { background: var(--color-primary); border-color: var(--color-primary); color: #fff; }

/* Responsive */
@media (max-width: 768px) {
  .search-filter-toggle { display: block; margin-bottom: var(--space-4); }
  .search-sidebar-desktop { display: none; }
  .search-layout { flex-direction: column; gap: var(--space-4); }
  .search-grid { grid-template-columns: 1fr; }
}

@media (max-width: 1024px) and (min-width: 769px) {
  .search-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
