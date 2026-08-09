<script setup lang="ts">
import { computed } from 'vue'
import type { RecipeSummary } from '@/api/recipes'

interface Props {
  recipe: RecipeSummary
  isFavorite?: boolean
}

const props = withDefaults(defineProps<Props>(), { isFavorite: false })
const emit  = defineEmits<{ favorite: [id: string] }>()

const difficultyMap = {
  EASY:   { label: 'Facile',    color: 'var(--color-success)'  },
  MEDIUM: { label: 'Moyen',     color: 'var(--color-warning)'  },
  HARD:   { label: 'Difficile', color: 'var(--color-primary)'  },
}

const difficulty = computed(() => difficultyMap[props.recipe.difficulty])

const totalTime = computed(() => {
  const total = props.recipe.prepTime + props.recipe.cookTime
  if (total < 60) return `${total} min`
  const h = Math.floor(total / 60)
  const m = total % 60
  return m > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${h}h`
})

const avgRating = computed(() => {
  const r = (props.recipe as RecipeSummary & { avgRating?: number }).avgRating
  return r ? r.toFixed(1) : null
})

const likeCount = computed(() => {
  const reactions = (props.recipe as RecipeSummary & { reactions?: Array<{ type: string }> }).reactions ?? []
  return reactions.filter(reaction => reaction.type === 'LIKE').length
})

const loveCount = computed(() => {
  const reactions = (props.recipe as RecipeSummary & { reactions?: Array<{ type: string }> }).reactions ?? []
  return reactions.filter(reaction => reaction.type === 'LOVE').length
})

const coverImage = computed(() => props.recipe.media?.[0]?.url ?? null)

const authorName = computed(
  () => props.recipe.author.pseudo ?? props.recipe.author.name
)
</script>

<template>
  <article class="recipe-card">

    <!-- Image -->
    <div class="recipe-card__cover">
      <img v-if="coverImage" :src="coverImage" :alt="recipe.title" loading="lazy" />
      <div v-else class="recipe-card__cover-placeholder">
        <span>FAC</span>
      </div>

      <!-- Badge difficulte -->
      <span class="recipe-card__difficulty" :style="{ background: difficulty.color }">
        {{ difficulty.label }}
      </span>

      <div class="recipe-card__reaction-box">
        <span class="recipe-card__reaction-pill" title="Pouces levés">
          <span class="recipe-card__reaction-icon">👍</span>
          <span>{{ likeCount }}</span>
        </span>
        <span class="recipe-card__reaction-pill" title="Cœurs">
          <span class="recipe-card__reaction-icon">❤️</span>
          <span>{{ loveCount }}</span>
        </span>
      </div>

      <button
        class="recipe-card__favorite"
        :class="{ 'recipe-card__favorite--active': isFavorite }"
        :aria-label="isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'"
        @click.prevent.stop="emit('favorite', recipe.id)"
      >
        <!-- outlined -->
        <svg v-if="!isFavorite" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>
        <!-- filled -->
        <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>
      </button>
    </div>

    <!-- Contenu -->
    <div class="recipe-card__body">
      <h3 class="recipe-card__title">{{ recipe.title }}</h3>
      <p class="recipe-card__desc">{{ recipe.description }}</p>

      <!-- Metadata -->
      <div class="recipe-card__meta">
        <span class="recipe-card__meta-item" title="Temps total">
          <span class="meta-icon">⏱</span> {{ totalTime }}
        </span>
        <span v-if="recipe.estimatedCost" class="recipe-card__meta-item" title="Cout estime">
          <span class="meta-icon">€</span> {{ recipe.estimatedCost.toFixed(2) }}
        </span>
        <span v-if="avgRating" class="recipe-card__meta-item" title="Note moyenne">
          <span class="meta-icon">★</span> {{ avgRating }}
        </span>
        <span class="recipe-card__meta-item" title="Commentaires">
          <span class="meta-icon">💬</span> {{ recipe._count.comments }}
        </span>
      </div>

      <!-- Auteur -->
      <div class="recipe-card__author">
        <div class="recipe-card__author-avatar">
          <img v-if="recipe.author.avatar" :src="recipe.author.avatar" :alt="authorName" />
          <span v-else>{{ authorName[0]?.toUpperCase() }}</span>
        </div>
        <span class="recipe-card__author-name">{{ authorName }}</span>
      </div>
    </div>

  </article>
</template>

<style scoped>
.recipe-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow var(--transition-base), transform var(--transition-base);
  display: flex;
  flex-direction: column;
}

.recipe-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-3px);
}

/* Cover */
.recipe-card__cover {
  position: relative;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: var(--color-primary-bg);
}

.recipe-card__cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
}

.recipe-card:hover .recipe-card__cover img {
  transform: scale(1.04);
}

.recipe-card__cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-heading);
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-extrabold);
  color: var(--color-primary-light);
  letter-spacing: 3px;
}

/* Badge difficulte */
.recipe-card__difficulty {
  position: absolute;
  top: var(--space-3);
  left: var(--space-3);
  padding: 3px 10px;
  border-radius: var(--radius-full);
  font-family: var(--font-heading);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  color: #fff;
}

/* Réactions + favori */
.recipe-card__reaction-box {
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.recipe-card__reaction-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: var(--radius-full);
  background: rgba(255,255,255,0.92);
  color: var(--color-text);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.recipe-card__reaction-icon {
  font-size: 12px;
  line-height: 1;
}

.recipe-card__favorite {
  position: absolute;
  top: calc(var(--space-3) + 32px);
  left: var(--space-3);
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: rgba(255,255,255,0.95);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.35));
  transition: transform var(--transition-fast), color var(--transition-fast);
}

.recipe-card__favorite svg {
  width: 24px;
  height: 24px;
  pointer-events: none;
}

.recipe-card__favorite:hover { transform: scale(1.15); }

.recipe-card__favorite--active {
  color: var(--color-primary);
}

/* Corps */
.recipe-card__body {
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  flex: 1;
}

.recipe-card__title {
  font-family: var(--font-heading);
  font-size: var(--text-md);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  line-height: var(--line-height-tight);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.recipe-card__desc {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: var(--line-height-normal);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0;
}

/* Metadata */
.recipe-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.recipe-card__meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}

.meta-icon { font-size: 13px; }

/* Auteur */
.recipe-card__author {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: auto;
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border);
}

.recipe-card__author-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-primary-bg);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xs);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  flex-shrink: 0;
}

.recipe-card__author-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recipe-card__author-name {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}
</style>
