<template>
  <div class="home">

    <Navbar />

    <!-- Hero avec top recettes notees -->
    <section class="home-hero">
      <div class="home-hero__inner">
        <h1 class="home-hero__title">Recettes etudiantes</h1>
        <p class="home-hero__subtitle">Simples, rapides et economiques</p>

        <h2 class="home-hero__section-title">Top recettes du moment</h2>

        <div class="home-hero__cards">
          <div
            v-for="recipe in topRated"
            :key="recipe.id"
            class="hero-card"
            role="button"
            tabindex="0"
            @click="openRecipeDetail(recipe.id)"
            @keydown.enter="openRecipeDetail(recipe.id)"
          >
            <div class="hero-card__cover">
              <div class="hero-card__rank">{{ recipe.rank }}</div>
            </div>
            <div class="hero-card__body">
              <h3 class="hero-card__title">{{ recipe.title }}</h3>
              <p class="hero-card__desc">{{ recipe.description }}</p>
              <div class="hero-card__meta">
                <span>{{ recipe.time }}</span>
                <span>{{ recipe.cost }}</span>
                <span class="hero-card__stars">{{ recipe.rating }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Grille 3 colonnes -->
    <main class="home-columns container">

      <section v-if="loading" class="home-info">Chargement des recettes...</section>
      <section v-else-if="error" class="home-info home-info--error">{{ error }}</section>

      <!-- Les plus vues -->
      <div class="home-col">
        <h2 class="home-col__title">Les plus vues</h2>
        <div class="home-col__list">
          <RecipeCard
            v-for="recipe in mostViewed"
            :key="recipe.id"
            :recipe="recipe"
            :is-favorite="false"
            @click="openRecipeDetail(recipe.id)"
          />
        </div>
      </div>

      <!-- Les plus recentes -->
      <div class="home-col">
        <h2 class="home-col__title">Les plus recentes</h2>
        <div class="home-col__list">
          <RecipeCard
            v-for="recipe in mostRecent"
            :key="recipe.id"
            :recipe="recipe"
            :is-favorite="false"
            @click="openRecipeDetail(recipe.id)"
          />
        </div>
      </div>

      <!-- Petit budget -->
      <div class="home-col">
        <h2 class="home-col__title">Petit budget</h2>
        <div class="home-col__list">
          <RecipeCard
            v-for="recipe in cheapest"
            :key="recipe.id"
            :recipe="recipe"
            :is-favorite="false"
            @click="openRecipeDetail(recipe.id)"
          />
        </div>
      </div>

    </main>

    <footer class="home-footer">
      <p>FAC &copy; 2026 &mdash; Tous droits reserves</p>
    </footer>

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import RecipeCard from '@/components/RecipeCard.vue'
import { recipesApi, type RecipeSummary } from '@/api/recipes'

defineOptions({ name: 'HomeView' })
const router = useRouter()

const loading = ref(true)
const error = ref<string | null>(null)

const topRecipes = ref<RecipeSummary[]>([])
const mostViewed = ref<RecipeSummary[]>([])
const mostRecent = ref<RecipeSummary[]>([])
const cheapest = ref<RecipeSummary[]>([])

const topRated = computed(() =>
  topRecipes.value.map((recipe, index) => {
    const totalTime = recipe.prepTime + recipe.cookTime
    const estimatedCost = recipe.estimatedCost == null
      ? 'N/A'
      : `${recipe.estimatedCost.toFixed(2)} €/pers`

    return {
      id: recipe.id,
      rank: `#${index + 1}`,
      title: recipe.title,
      description: recipe.description,
      time: `${totalTime} min`,
      cost: estimatedCost,
      rating: `★ ${recipe._count.ratings}`,
    }
  })
)

async function loadHomeRecipes() {
  loading.value = true
  error.value = null

  try {
    const [topRatedRes, popularRes, recentRes, cheapestRes] = await Promise.all([
      recipesApi.getRecipes({ sort: 'rating', limit: 3 }),
      recipesApi.getRecipes({ sort: 'rating', limit: 3 }),
      recipesApi.getRecipes({ sort: 'recent', limit: 3 }),
      recipesApi.getRecipes({ sort: 'cheapest', limit: 3 }),
    ])

    topRecipes.value = topRatedRes.data.data.recipes
    mostViewed.value = popularRes.data.data.recipes
    mostRecent.value = recentRes.data.data.recipes
    cheapest.value = cheapestRes.data.data.recipes
  } catch {
    error.value = 'Impossible de charger les recettes pour le moment.'
  } finally {
    loading.value = false
  }
}

onMounted(loadHomeRecipes)

function openRecipeDetail(recipeId: string) {
  void router.push(`/recipes/${recipeId}`)
}
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: var(--color-bg);
  display: flex;
  flex-direction: column;
}

/* Hero */
.home-hero {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
  padding: var(--space-12) var(--space-6) var(--space-16);
}

.home-hero__inner {
  max-width: var(--max-width-xl);
  margin: 0 auto;
}

.home-hero__title {
  font-family: var(--font-heading);
  font-size: var(--text-3xl);
  font-weight: var(--font-weight-extrabold);
  color: #fff;
  text-align: center;
  margin: 0 0 var(--space-2);
}

.home-hero__subtitle {
  text-align: center;
  color: rgba(255,255,255,0.85);
  font-size: var(--text-md);
  margin: 0 0 var(--space-10);
}

.home-hero__section-title {
  font-family: var(--font-heading);
  font-size: var(--text-lg);
  font-weight: var(--font-weight-bold);
  color: rgba(255,255,255,0.9);
  text-align: center;
  margin: 0 0 var(--space-6);
}

.home-hero__cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-5);
}

/* Hero card */
.hero-card {
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.25);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: transform var(--transition-base);
  cursor: pointer;
}

.hero-card:hover { transform: translateY(-4px); }

.hero-card__cover {
  height: 100px;
  background: rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-card__rank {
  font-family: var(--font-heading);
  font-size: var(--text-3xl);
  font-weight: var(--font-weight-extrabold);
  color: rgba(255,255,255,0.4);
}

.hero-card__body {
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.hero-card__title {
  font-family: var(--font-heading);
  font-size: var(--text-md);
  font-weight: var(--font-weight-bold);
  color: #fff;
  margin: 0;
}

.hero-card__desc {
  font-size: var(--text-sm);
  color: rgba(255,255,255,0.75);
  line-height: var(--line-height-normal);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hero-card__meta {
  display: flex;
  gap: var(--space-3);
  font-size: var(--text-xs);
  color: rgba(255,255,255,0.7);
  margin-top: var(--space-1);
  flex-wrap: wrap;
}

.hero-card__stars { color: #ffd700; }

/* Colonnes */
.home-columns {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-8);
  padding-top: var(--space-12);
  padding-bottom: var(--space-16);
  flex: 1;
}

.home-info {
  grid-column: 1 / -1;
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
}

.home-info--error {
  color: var(--color-error);
  border-color: var(--color-error);
}

.home-col__title {
  font-family: var(--font-heading);
  font-size: var(--text-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin: 0 0 var(--space-5);
  padding-bottom: var(--space-3);
  border-bottom: 2px solid var(--color-primary);
}

.home-col__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* Footer */
.home-footer {
  text-align: center;
  padding: var(--space-8);
  border-top: 1px solid var(--color-border);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

/* Responsive */
@media (max-width: 1024px) {
  .home-hero__cards { grid-template-columns: 1fr; max-width: 400px; margin: 0 auto; }
  .home-columns { grid-template-columns: 1fr; }
}

@media (max-width: 640px) {
  .home-hero { padding: var(--space-8) var(--space-4) var(--space-10); }
  .home-hero__title { font-size: var(--text-2xl); }
}
</style>
