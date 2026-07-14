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
          <div v-for="recipe in topRated" :key="recipe.id" class="hero-card">
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

      <!-- Les plus vues -->
      <div class="home-col">
        <h2 class="home-col__title">Les plus vues</h2>
        <div class="home-col__list">
          <RecipeCard
            v-for="recipe in mostViewed"
            :key="recipe.id"
            :recipe="recipe"
            :is-favorite="false"
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
import Navbar from '@/components/Navbar.vue'
import RecipeCard from '@/components/RecipeCard.vue'
import type { RecipeSummary } from '@/api/recipes'

defineOptions({ name: 'HomeView' })

// Placeholder pour le top rated dans le hero
const topRated = [
  { id: 'h1', rank: '#1', title: 'Pates a la carbonara', description: 'Le grand classique italien, cremeux et savoureux, pret en 20 minutes.', time: '20 min', cost: '2.50 €/pers', rating: '★ 4.9' },
  { id: 'h2', rank: '#2', title: 'Riz saute aux legumes', description: 'Un wok colore et equilibre avec ce que vous avez dans le frigo.', time: '15 min', cost: '1.80 €/pers', rating: '★ 4.7' },
  { id: 'h3', rank: '#3', title: 'Omelette au fromage', description: 'Rapide, proteinee et personnalisable a souhait pour le diner.', time: '10 min', cost: '1.20 €/pers', rating: '★ 4.6' },
]

// Mock recipes pour les 3 colonnes
function mockRecipe(overrides: Partial<RecipeSummary> & { id: string; title: string; description: string }): RecipeSummary {
  return {
    id: overrides.id,
    title: overrides.title,
    description: overrides.description,
    difficulty: overrides.difficulty ?? 'EASY',
    prepTime: overrides.prepTime ?? 10,
    cookTime: overrides.cookTime ?? 15,
    servings: 2,
    estimatedCost: overrides.estimatedCost ?? 3,
    createdAt: new Date().toISOString(),
    author: { id: '1', name: 'Alice Martin', pseudo: 'alice_cook', avatar: null },
    tags: [],
    media: [],
    _count: { ratings: overrides._count?.ratings ?? 12, comments: overrides._count?.comments ?? 3, favorites: overrides._count?.favorites ?? 5 },
  }
}

const mostViewed: RecipeSummary[] = [
  mockRecipe({ id: 'v1', title: 'Soupe de lentilles', description: 'Chaleureuse et nourrissante, parfaite pour les soirs d hiver.', difficulty: 'EASY', prepTime: 10, cookTime: 25, estimatedCost: 1.50 }),
  mockRecipe({ id: 'v2', title: 'Salade nicoise', description: 'Fraiche et coloree, un classique du sud de la France.', difficulty: 'EASY', prepTime: 15, cookTime: 0, estimatedCost: 4 }),
  mockRecipe({ id: 'v3', title: 'Gratin dauphinois', description: 'Fondant et croustillant, le confort food par excellence.', difficulty: 'MEDIUM', prepTime: 20, cookTime: 60, estimatedCost: 3 }),
]

const mostRecent: RecipeSummary[] = [
  mockRecipe({ id: 'r1', title: 'Wrap au poulet', description: 'Pratique et equilibre, ideal pour le dejeuner entre les cours.', difficulty: 'EASY', prepTime: 10, cookTime: 5, estimatedCost: 3.50 }),
  mockRecipe({ id: 'r2', title: 'Curry de pois chiches', description: 'Epice et vegetal, un voyage en Inde sans quitter sa cuisine.', difficulty: 'EASY', prepTime: 10, cookTime: 20, estimatedCost: 2 }),
  mockRecipe({ id: 'r3', title: 'Tarte aux pommes', description: 'Un dessert maison simple que tout le monde adore.', difficulty: 'MEDIUM', prepTime: 20, cookTime: 35, estimatedCost: 2.50 }),
]

const cheapest: RecipeSummary[] = [
  mockRecipe({ id: 'c1', title: 'Pates a la tomate', description: 'Le repas etudiant par essence, savoureux et ultra rapide.', difficulty: 'EASY', prepTime: 5, cookTime: 10, estimatedCost: 0.80 }),
  mockRecipe({ id: 'c2', title: 'Pain perdu', description: 'Un dessert anti-gaspi delicieux avec du pain rassis.', difficulty: 'EASY', prepTime: 5, cookTime: 5, estimatedCost: 0.60 }),
  mockRecipe({ id: 'c3', title: 'Gaspacho maison', description: 'Soupe froide espagnole, riche en legumes et zero cuisson.', difficulty: 'EASY', prepTime: 15, cookTime: 0, estimatedCost: 1.20 }),
]
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
