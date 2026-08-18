<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import Navbar from '@/components/Navbar.vue'
import SearchBar from '@/components/SearchBar.vue'
import RecipeCard from '@/components/RecipeCard.vue'
import { recipesApi, type RecipesQuery, type RecipeSummary } from '@/api/recipes'

defineOptions({ name: 'SearchView' })

const query = ref<RecipesQuery>({
  q: '',
  sort: 'recent',
  page: 1,
  limit: 12,
})

const recipes = ref<RecipeSummary[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const totalPages = ref(1)

async function loadRecipes() {
  loading.value = true
  error.value = null

  try {
    const { data } = await recipesApi.getRecipes(query.value)
    recipes.value = data.data.recipes
    totalPages.value = data.data.totalPages
  } catch {
    error.value = 'Impossible de charger les recettes.'
  } finally {
    loading.value = false
  }
}

watch(
  query,
  () => {
    void loadRecipes()
  },
  { deep: true }
)

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value) return
  query.value = { ...query.value, page }
}

onMounted(() => {
  void loadRecipes()
})
</script>

<template>
  <div class="search-page">
    <Navbar />

    <main class="search-main container">
      <header class="search-header">
        <h1>Recherche de recettes</h1>
        <p>Trouvez des recettes selon vos envies, votre temps et votre budget.</p>
      </header>

      <section class="search-controls">
        <SearchBar v-model="query" />
      </section>

      <section v-if="loading" class="search-info">Chargement des recettes...</section>
      <section v-else-if="error" class="search-info search-info--error">{{ error }}</section>

      <section v-else class="search-results">
        <div v-if="recipes.length === 0" class="search-empty">
          Aucune recette ne correspond a votre recherche.
        </div>

        <div v-else class="search-grid">
          <RecipeCard
            v-for="recipe in recipes"
            :key="recipe.id"
            :recipe="recipe"
          />
        </div>

        <div v-if="totalPages > 1" class="search-pagination">
          <button :disabled="(query.page ?? 1) <= 1" @click="goToPage((query.page ?? 1) - 1)">
            Precedent
          </button>
          <span>Page {{ query.page ?? 1 }} / {{ totalPages }}</span>
          <button :disabled="(query.page ?? 1) >= totalPages" @click="goToPage((query.page ?? 1) + 1)">
            Suivant
          </button>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.search-page {
  min-height: 100vh;
  background: var(--color-bg);
}

.search-main {
  padding-top: var(--space-10);
  padding-bottom: var(--space-16);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.search-header h1 {
  margin: 0 0 var(--space-2);
  font-family: var(--font-heading);
}

.search-header p {
  margin: 0;
  color: var(--color-text-secondary);
}

.search-info,
.search-empty {
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
}

.search-info--error {
  color: var(--color-error);
  border-color: var(--color-error);
}

.search-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-5);
}

.search-pagination {
  margin-top: var(--space-4);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
}

.search-pagination button {
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: var(--radius-md);
  cursor: pointer;
}

.search-pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 1024px) {
  .search-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .search-grid {
    grid-template-columns: 1fr;
  }
}
</style>
