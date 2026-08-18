<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHead } from '@unhead/vue'
import { useAuthStore } from '@/stores/auth'
import { recipesApi, type RecipeDetail, type RecipeReactionType } from '@/api/recipes'
import { commentsApi, type Comment } from '@/api/comments'
import Navbar from '@/components/Navbar.vue'
import AppButton from '@/components/AppButton.vue'
import RecipeReactionPicker from '@/components/RecipeReactionPicker.vue'

defineOptions({ name: 'RecipeDetailView' })

const route  = useRoute()
const router = useRouter()
const auth   = useAuthStore()
const id     = route.params.id as string

// Recette
const recipe  = ref<RecipeDetail | null>(null)
const loading = ref(true)
const error   = ref<string | null>(null)

const isAuthor = computed(() =>
  auth.user && recipe.value && auth.user.id === recipe.value.author.id
)

const coverImage = computed(() => recipe.value?.media?.[0]?.url ?? null)

const difficultyMap = {
  EASY:   { label: 'Facile',    color: 'var(--color-success)'  },
  MEDIUM: { label: 'Moyen',     color: 'var(--color-warning)'  },
  HARD:   { label: 'Difficile', color: 'var(--color-primary)'  },
}

function formatTime(min: number): string {
  if (min <= 0) return ''
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${h}h`
}

function formatDate(iso: string): string {
  const diff = Math.round((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  return new Intl.RelativeTimeFormat('fr', { numeric: 'auto' }).format(diff, 'day')
}

async function loadRecipe() {
  loading.value = true
  try {
    const { data } = await recipesApi.getRecipe(id)
    recipe.value = data.data as unknown as RecipeDetail
    currentServings.value = recipe.value.servings
    const reactionTypes = recipe.value.reactions?.map(reaction => reaction.type) ?? []
    liked.value = reactionTypes.includes('LIKE')
    disliked.value = reactionTypes.includes('DISLIKE')
    loved.value = reactionTypes.includes('LOVE')
  } catch {
    error.value = 'Recette introuvable'
  } finally {
    loading.value = false
  }
}

// Meta tags SEO dynamiques
watch(recipe, (newRecipe) => {
  if (newRecipe) {
    const description = newRecipe.description.slice(0, 160)
    const imageUrl = newRecipe.media?.[0]?.url || 'https://fac.app/og-image.jpg'
    const difficulty = difficultyMap[newRecipe.difficulty as keyof typeof difficultyMap]?.label || ''
    const totalTime = newRecipe.prepTime + newRecipe.cookTime
    
    useHead({
      title: `${newRecipe.title} - FAC`,
      meta: [
        { name: 'description', content: description },
        { name: 'keywords', content: `recette ${newRecipe.title.toLowerCase()}, ${difficulty.toLowerCase()}, ${totalTime} min` },
        // Open Graph
        { property: 'og:title', content: `${newRecipe.title} - FAC` },
        { property: 'og:description', content: description },
        { property: 'og:image', content: imageUrl },
        { property: 'og:type', content: 'article' },
        // Twitter
        { name: 'twitter:title', content: `${newRecipe.title} - FAC` },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: imageUrl },
      ],
    })
  }
})

// Portions
const currentServings = ref(1)

function scaledQty(qty: number): string {
  if (!recipe.value || !qty) return ''
  const base    = recipe.value.servings || 1
  const scaled  = qty * (currentServings.value / base)
  return scaled % 1 === 0 ? String(scaled) : scaled.toFixed(1)
}

// Notation
const userRating    = ref(0)
const hoverRating   = ref(0)
const ratingLoading = ref(false)
const ratingDone    = ref(false)

const reactionLoading = ref(false)
const liked = ref(false)
const disliked = ref(false)
const loved = ref(false)

const reactionSummary = computed(() => {
  if (!recipe.value?.reactions?.length) return []

  return (['LIKE', 'DISLIKE', 'LOVE'] as RecipeReactionType[]).map(type => {
    const count = recipe.value?.reactions?.filter(reaction => reaction.type === type).length ?? 0
    return { type, count }
  }).filter(item => item.count > 0)
})

const avgRating = computed(() => {
  if (!recipe.value?.ratings?.length) return null
  const sum = recipe.value.ratings.reduce((s, r) => s + r.score, 0)
  return (sum / recipe.value.ratings.length).toFixed(1)
})

async function submitRating(score: number) {
  if (!auth.isAuthenticated) { router.push('/login') ; return }
  if (ratingLoading.value) return
  ratingLoading.value = true
  try {
    await recipesApi.rateRecipe(id, score)
    userRating.value = score
    ratingDone.value = true
    if (recipe.value) recipe.value.ratings.push({ score })
  } finally {
    ratingLoading.value = false
  }
}

async function toggleReaction(type: RecipeReactionType) {
  if (!auth.isAuthenticated) { router.push('/login') ; return }
  if (reactionLoading.value) return

  reactionLoading.value = true
  try {
    if (type === 'LIKE') {
      if (liked.value) {
        liked.value = false
        await recipesApi.removeReaction(id, 'LIKE').catch(() => undefined)
      } else {
        liked.value = true
        disliked.value = false
        await recipesApi.addReaction(id, 'LIKE').catch(() => undefined)
      }
    } else if (type === 'DISLIKE') {
      if (disliked.value) {
        disliked.value = false
        await recipesApi.removeReaction(id, 'DISLIKE').catch(() => undefined)
      } else {
        disliked.value = true
        liked.value = false
        await recipesApi.addReaction(id, 'DISLIKE').catch(() => undefined)
      }
    } else if (type === 'LOVE') {
      if (loved.value) {
        loved.value = false
        await recipesApi.removeReaction(id, 'LOVE').catch(() => undefined)
      } else {
        loved.value = true
        await recipesApi.addReaction(id, 'LOVE').catch(() => undefined)
      }
    }
  } finally {
    reactionLoading.value = false
  }
}

// Commentaires
const comments           = ref<Comment[]>([])
const commentsTotal      = ref(0)
const commentsPage       = ref(1)
const commentsTotalPages = ref(1)
const commentsLoading    = ref(false)
const newComment         = ref('')
const commentError       = ref<string | null>(null)
const commentSending     = ref(false)

async function loadComments() {
  commentsLoading.value = true
  try {
    const { data } = await commentsApi.getComments(id, commentsPage.value)
    comments.value           = data.data.comments
    commentsTotal.value      = data.data.total
    commentsTotalPages.value = data.data.totalPages
  } finally {
    commentsLoading.value = false
  }
}

async function submitComment() {
  if (!newComment.value.trim()) return
  if (!auth.isAuthenticated) { router.push('/login') ; return }
  commentSending.value = true
  commentError.value   = null
  try {
    const { data } = await commentsApi.addComment(id, newComment.value.trim())
    comments.value.unshift(data.data)
    commentsTotal.value++
    newComment.value = ''
  } catch (e: unknown) {
    commentError.value = (e as { response?: { data?: { error?: string } } })
      ?.response?.data?.error ?? "Erreur lors de l'envoi"
  } finally {
    commentSending.value = false
  }
}

async function deleteComment(commentId: string) {
  try {
    await commentsApi.deleteComment(commentId)
    comments.value = comments.value.filter(c => c.id !== commentId)
    commentsTotal.value--
  } catch { /* silencieux */ }
}

// Suppression de recette
const showDeleteConfirm = ref(false)
const deleteLoading     = ref(false)
const deleteError       = ref<string | null>(null)

async function deleteRecipe() {
  if (!recipe.value) return
  deleteLoading.value = true
  deleteError.value   = null
  try {
    await recipesApi.deleteRecipe(recipe.value.id)
    router.push('/')
  } catch (e: unknown) {
    deleteError.value = (e as { response?: { data?: { error?: string } } })
      ?.response?.data?.error ?? 'Erreur lors de la suppression'
  } finally {
    deleteLoading.value = false
  }
}

onMounted(() => { loadRecipe() ; loadComments() })
</script>

<template>
  <div class="recipe-page">
    <Navbar />

    <div v-if="loading" class="recipe-loading container">
      <div class="skeleton skeleton--hero" />
      <div class="skeleton skeleton--text" />
      <div class="skeleton skeleton--text" style="width:60%" />
    </div>

    <div v-else-if="error" class="recipe-error container">
      <p>{{ error }}</p>
      <AppButton @click="router.push('/')">Retour a l'accueil</AppButton>
    </div>

    <template v-else-if="recipe">

      <!-- Image hero -->
      <div class="recipe-hero">
        <img v-if="coverImage" :src="coverImage" :alt="recipe.title" class="recipe-hero__img" />
        <div v-else class="recipe-hero__placeholder"><span>FAC</span></div>
      </div>

      <main class="recipe-main container">

        <!-- Infos -->
        <section class="recipe-header">
          <div class="recipe-header__top">
            <div class="recipe-header__badges">
              <span class="recipe-badge" :style="{ background: difficultyMap[recipe.difficulty].color }">
                {{ difficultyMap[recipe.difficulty].label }}
              </span>
              <span v-for="t in recipe.tags" :key="t.tag.id" class="recipe-badge recipe-badge--tag">
                {{ t.tag.name }}
              </span>
            </div>
            <div class="recipe-header__actions">
              <AppButton variant="ghost" size="sm" @click="router.push('/search')">
                ← Retour
              </AppButton>
              <template v-if="isAuthor">
                <AppButton variant="secondary" size="sm" @click="router.push(`/recipes/${recipe.id}/edit`)">
                  Modifier
                </AppButton>
                <AppButton variant="ghost" size="sm" @click="showDeleteConfirm = true">
                  Supprimer
                </AppButton>
              </template>
            </div>
          </div>

          <h1 class="recipe-title">{{ recipe.title }}</h1>

          <div class="recipe-meta">
            <div v-if="recipe.prepTime || recipe.cookTime" class="recipe-meta__item">
              <span class="recipe-meta__icon">⏱</span>
              <span>{{ formatTime(recipe.prepTime + recipe.cookTime) }}</span>
            </div>
            <div v-if="recipe.estimatedCost" class="recipe-meta__item">
              <span class="recipe-meta__icon">€</span>
              <span>{{ recipe.estimatedCost.toFixed(2) }} / pers.</span>
            </div>
            <div class="recipe-meta__item">
              <span class="recipe-meta__icon">🍽</span>
              <span>{{ recipe.servings }} portion{{ recipe.servings > 1 ? 's' : '' }}</span>
            </div>
            <div v-if="avgRating" class="recipe-meta__item">
              <span class="recipe-meta__icon">★</span>
              <span>{{ avgRating }} ({{ recipe._count.ratings }} notes)</span>
            </div>
          </div>

          <div class="recipe-author">
            <div class="recipe-author__avatar">
              <img v-if="recipe.author.avatar" :src="recipe.author.avatar" :alt="recipe.author.name" />
              <span v-else>{{ recipe.author.name[0] }}</span>
            </div>
            <span class="recipe-author__name">
              {{ recipe.author.pseudo ? `@${recipe.author.pseudo}` : recipe.author.name }}
            </span>
          </div>
        </section>

        <!-- Description -->
        <section class="recipe-section">
          <h2 class="recipe-section__title">Description</h2>
          <p class="recipe-description">{{ recipe.description }}</p>
        </section>

        <!-- Ingredients avec controle de portions -->
        <section class="recipe-section">
          <h2 class="recipe-section__title">
            Ingredients
            <div class="portion-control">
              <button class="portion-btn" :disabled="currentServings <= 1" @click="currentServings--">-</button>
              <span class="portion-control__label">
                {{ currentServings }} portion{{ currentServings > 1 ? 's' : '' }}
              </span>
              <button class="portion-btn" @click="currentServings++">+</button>
            </div>
          </h2>
          <ul class="ingredient-list">
            <li v-for="row in recipe.ingredients" :key="row.id" class="ingredient-item">
              <span class="ingredient-item__icon">🥄</span>
              <span class="ingredient-item__name">{{ row.ingredient.name }}</span>
              <span v-if="row.quantity > 0" class="ingredient-item__qty">
                {{ scaledQty(row.quantity) }} {{ row.unit }}
              </span>
            </li>
          </ul>
        </section>

        <!-- Etapes -->
        <section v-if="recipe.steps.length > 0" class="recipe-section">
          <h2 class="recipe-section__title">Etapes</h2>
          <ol class="steps-list">
            <li v-for="step in recipe.steps" :key="step.id" class="step-item">
              <div class="step-item__num">{{ step.order + 1 }}</div>
              <p class="step-item__text">{{ step.description }}</p>
            </li>
          </ol>
        </section>

        <!-- Notation -->
        <section class="recipe-section recipe-rating">
          <h2 class="recipe-section__title">Note</h2>

          <div class="rating-display">
            <div class="rating-display__stars">
              <span
                v-for="i in 5" :key="i"
                class="rating-star"
                :class="{ 'rating-star--filled': avgRating && i <= Math.round(Number(avgRating)) }"
              >★</span>
            </div>
            <span class="rating-display__value">
              {{ avgRating ? `${avgRating} / 5` : 'Pas encore note' }}
              <span v-if="recipe._count.ratings > 0" class="rating-display__count">
                ({{ recipe._count.ratings }} note{{ recipe._count.ratings > 1 ? 's' : '' }})
              </span>
            </span>
          </div>

          <div class="rating-user">
            <p class="rating-user__label">{{ ratingDone ? 'Votre note :' : 'Notez cette recette :' }}</p>
            <div class="rating-user__stars">
              <button
                v-for="i in 5" :key="i"
                type="button"
                class="rating-star rating-star--interactive"
                :class="{
                  'rating-star--filled':   i <= (hoverRating || userRating),
                  'rating-star--selected': ratingDone && i <= userRating,
                }"
                @mouseenter="hoverRating = i"
                @mouseleave="hoverRating = 0"
                @click="submitRating(i)"
              >★</button>
            </div>
            <span v-if="ratingDone" class="rating-user__thanks">Merci pour votre note !</span>
          </div>

          <div class="reaction-section">
            <div v-if="reactionSummary.length > 0" class="reaction-summary">
              <span v-for="item in reactionSummary" :key="item.type" class="reaction-summary__item">
                <span class="reaction-summary__emoji">{{ item.type === 'LIKE' ? '👍' : item.type === 'DISLIKE' ? '👎' : '❤️' }}</span>
                <span>{{ item.count }}</span>
              </span>
            </div>

            <RecipeReactionPicker
              :like-active="liked"
              :dislike-active="disliked"
              :love-active="loved"
              :loading="reactionLoading"
              :disabled="!auth.isAuthenticated"
              @toggle-like="toggleReaction('LIKE')"
              @toggle-dislike="toggleReaction('DISLIKE')"
              @toggle-love="toggleReaction('LOVE')"
            />
          </div>
        </section>

        <!-- Commentaires -->
        <section class="recipe-section">
          <h2 class="recipe-section__title">
            Commentaires
            <span class="recipe-section__count">{{ commentsTotal }}</span>
          </h2>

          <div v-if="auth.isAuthenticated" class="comment-form">
            <textarea
              v-model="newComment"
              class="comment-form__input"
              placeholder="Laissez un commentaire..."
              rows="3"
            />
            <div v-if="commentError" class="comment-form__error">{{ commentError }}</div>
            <div class="comment-form__actions">
              <AppButton :loading="commentSending" :disabled="!newComment.trim()" @click="submitComment">
                Envoyer
              </AppButton>
            </div>
          </div>
          <p v-else class="comment-login-hint">
            <router-link to="/login">Connectez-vous</router-link> pour laisser un commentaire.
          </p>

          <div v-if="commentsLoading" class="comment-loading">Chargement...</div>
          <div v-else-if="comments.length === 0" class="comment-empty">
            Aucun commentaire pour l'instant. Soyez le premier !
          </div>
          <ul v-else class="comment-list">
            <li v-for="comment in comments" :key="comment.id" class="comment-item">
              <div class="comment-item__header">
                <div class="comment-item__avatar">
                  <img v-if="comment.user.avatar" :src="comment.user.avatar" :alt="comment.user.name" />
                  <span v-else>{{ comment.user.name[0] }}</span>
                </div>
                <div class="comment-item__meta">
                  <span class="comment-item__author">
                    {{ comment.user.pseudo ? `@${comment.user.pseudo}` : comment.user.name }}
                  </span>
                  <span class="comment-item__date">{{ formatDate(comment.createdAt) }}</span>
                </div>
                <button
                  v-if="auth.user?.id === comment.user.id"
                  class="comment-item__delete"
                  @click="deleteComment(comment.id)"
                >✕</button>
              </div>
              <p class="comment-item__text">{{ comment.content }}</p>
            </li>
          </ul>

          <div v-if="commentsTotalPages > 1" class="comment-pagination">
            <button class="pagination-btn" :disabled="commentsPage === 1" @click="commentsPage-- ; loadComments()">
              Precedent
            </button>
            <span>{{ commentsPage }} / {{ commentsTotalPages }}</span>
            <button class="pagination-btn" :disabled="commentsPage === commentsTotalPages" @click="commentsPage++ ; loadComments()">
              Suivant
            </button>
          </div>
        </section>

      </main>

      <!-- Modale de confirmation suppression -->
      <Transition name="fade">
        <div v-if="showDeleteConfirm" class="modal-overlay" @click="showDeleteConfirm = false">
          <div class="modal-content" @click.stop>
            <h3 class="modal-title">Supprimer cette recette ?</h3>
            <p class="modal-text">
              Cette action est irreversible. Toutes les donnees (ingredients, etapes, commentaires) seront definitivement supprimees.
            </p>
            <div v-if="deleteError" class="modal-error">{{ deleteError }}</div>
            <div class="modal-actions">
              <AppButton variant="ghost" :disabled="deleteLoading" @click="showDeleteConfirm = false">
                Annuler
              </AppButton>
              <AppButton variant="primary" :loading="deleteLoading" @click="deleteRecipe">
                Supprimer la recette
              </AppButton>
            </div>
          </div>
        </div>
      </Transition>

    </template>
  </div>
</template>

<style scoped>
.recipe-page { min-height: 100vh; background: var(--color-bg); }

.recipe-loading, .recipe-error {
  padding-top: var(--space-10);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.skeleton { background: var(--color-border); border-radius: var(--radius-md); animation: pulse 1.5s ease-in-out infinite; }
.skeleton--hero  { height: 300px; border-radius: var(--radius-lg); }
.skeleton--text  { height: 24px; }
@keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.5 } }

/* Hero */
.recipe-hero { width: 100%; height: 360px; overflow: hidden; background: var(--color-primary-bg); }
.recipe-hero__img { width: 100%; height: 100%; object-fit: cover; }
.recipe-hero__placeholder {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-heading); font-size: var(--text-4xl);
  font-weight: var(--font-weight-extrabold); color: var(--color-primary-light); letter-spacing: 6px;
}

/* Main */
.recipe-main { padding-top: var(--space-8); padding-bottom: var(--space-16); max-width: 800px; display: flex; flex-direction: column; gap: var(--space-10); }

/* Header */
.recipe-header { display: flex; flex-direction: column; gap: var(--space-4); }
.recipe-header__top { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-3); }
.recipe-header__badges { display: flex; gap: var(--space-2); flex-wrap: wrap; }
.recipe-header__actions { display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap; }

.recipe-badge {
  padding: 4px 12px; border-radius: var(--radius-full);
  font-family: var(--font-heading); font-size: var(--text-xs); font-weight: var(--font-weight-semibold); color: #fff;
}
.recipe-badge--tag { background: var(--color-primary-bg); color: var(--color-primary-dark); }

.recipe-title {
  font-family: var(--font-heading); font-size: var(--text-3xl);
  font-weight: var(--font-weight-extrabold); color: var(--color-text); margin: 0;
}

.recipe-meta { display: flex; flex-wrap: wrap; gap: var(--space-5); }
.recipe-meta__item { display: flex; align-items: center; gap: var(--space-2); font-size: var(--text-sm); color: var(--color-text-secondary); font-weight: var(--font-weight-medium); }
.recipe-meta__icon { font-size: 16px; }

.recipe-author { display: flex; align-items: center; gap: var(--space-3); }
.recipe-author__avatar {
  width: 32px; height: 32px; border-radius: 50%; background: var(--color-primary-bg);
  overflow: hidden; display: flex; align-items: center; justify-content: center;
  font-size: var(--text-xs); font-weight: var(--font-weight-bold); color: var(--color-primary); flex-shrink: 0;
}
.recipe-author__avatar img { width: 100%; height: 100%; object-fit: cover; }
.recipe-author__name { font-size: var(--text-sm); color: var(--color-text-secondary); }

/* Sections */
.recipe-section { display: flex; flex-direction: column; gap: var(--space-5); }

.recipe-section__title {
  font-family: var(--font-heading); font-size: var(--text-xl); font-weight: var(--font-weight-bold);
  color: var(--color-text); margin: 0; padding-bottom: var(--space-3); border-bottom: 2px solid var(--color-primary);
  display: flex; align-items: center; justify-content: space-between;
}

.recipe-section__count {
  background: var(--color-primary-bg); color: var(--color-primary-dark);
  font-size: var(--text-sm); padding: 2px 8px; border-radius: var(--radius-full);
}

.recipe-description { font-size: var(--text-md); color: var(--color-text-secondary); line-height: var(--line-height-relaxed); margin: 0; }

/* Controle portions */
.portion-control {
  display: flex; align-items: center; gap: var(--space-3);
  font-size: var(--text-sm);
}

.portion-control__label {
  font-size: var(--text-sm); font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary); min-width: 80px; text-align: center;
}

.portion-btn {
  width: 28px; height: 28px; border-radius: 50%;
  border: 1.5px solid var(--color-border); background: var(--color-surface);
  font-size: var(--text-md); font-weight: var(--font-weight-bold);
  color: var(--color-text); cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all var(--transition-fast); line-height: 1;
}
.portion-btn:hover:not(:disabled) { border-color: var(--color-primary); color: var(--color-primary); background: var(--color-primary-bg); }
.portion-btn:disabled { opacity: 0.35; cursor: not-allowed; }

/* Ingredients */
.ingredient-list { list-style: none; display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-3); }
.ingredient-item {
  display: flex; align-items: center; gap: var(--space-3);
  padding: var(--space-3) var(--space-4); background: var(--color-surface);
  border: 1px solid var(--color-border); border-radius: var(--radius-md);
}
.ingredient-item__icon { font-size: 20px; flex-shrink: 0; }
.ingredient-item__name { flex: 1; font-size: var(--text-sm); font-weight: var(--font-weight-medium); text-transform: capitalize; }
.ingredient-item__qty  { font-size: var(--text-xs); color: var(--color-text-muted); white-space: nowrap; }

/* Etapes */
.steps-list { list-style: none; display: flex; flex-direction: column; gap: var(--space-4); }
.step-item { display: flex; gap: var(--space-5); padding: var(--space-5); background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); }
.step-item__num {
  width: 36px; height: 36px; border-radius: 50%; background: var(--color-primary); color: #fff;
  font-family: var(--font-heading); font-size: var(--text-sm); font-weight: var(--font-weight-bold);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.step-item__text { font-size: var(--text-base); color: var(--color-text); line-height: var(--line-height-relaxed); margin: 0; padding-top: 6px; }

/* Notation */
.recipe-rating { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-xl); padding: var(--space-6); }
.reaction-section { display: flex; flex-direction: column; gap: var(--space-3); padding-top: var(--space-4); border-top: 1px solid var(--color-border); }
.reaction-summary { display: flex; flex-wrap: wrap; gap: var(--space-2); }
.reaction-summary__item { display: inline-flex; align-items: center; gap: var(--space-1); padding: 4px 8px; border-radius: var(--radius-full); background: var(--color-primary-bg); color: var(--color-primary-dark); font-size: var(--text-sm); font-weight: var(--font-weight-medium); }
.reaction-summary__emoji { font-size: 16px; line-height: 1; }
.rating-display { display: flex; align-items: center; gap: var(--space-4); }
.rating-display__stars { display: flex; gap: 4px; }
.rating-star { font-size: 28px; color: var(--color-border); line-height: 1; transition: color var(--transition-fast); }
.rating-star--filled { color: #fbbf24; }
.rating-display__value { font-family: var(--font-heading); font-size: var(--text-lg); font-weight: var(--font-weight-bold); color: var(--color-text); }
.rating-display__count { font-size: var(--text-sm); color: var(--color-text-muted); font-weight: var(--font-weight-regular); }
.rating-user { display: flex; align-items: center; gap: var(--space-4); padding-top: var(--space-4); border-top: 1px solid var(--color-border); flex-wrap: wrap; }
.rating-user__label { font-size: var(--text-sm); color: var(--color-text-secondary); margin: 0; white-space: nowrap; }
.rating-user__stars { display: flex; gap: 4px; }
.rating-star--interactive { background: none; border: none; cursor: pointer; padding: 0; font-size: 32px; }
.rating-star--interactive:hover { color: #fbbf24; }
.rating-star--selected { color: #f59e0b; }
.rating-user__thanks { font-size: var(--text-sm); color: var(--color-success); font-weight: var(--font-weight-medium); }

/* Commentaires */
.comment-form { display: flex; flex-direction: column; gap: var(--space-3); }
.comment-form__input { padding: var(--space-3) var(--space-4); border: 1.5px solid var(--color-border); border-radius: var(--radius-md); font-family: var(--font-body); font-size: var(--text-base); resize: vertical; outline: none; transition: border-color var(--transition-fast); }
.comment-form__input:focus { border-color: var(--color-primary); }
.comment-form__error { font-size: var(--text-sm); color: var(--color-error); }
.comment-form__actions { display: flex; justify-content: flex-end; }
.comment-login-hint { font-size: var(--text-sm); color: var(--color-text-muted); }
.comment-login-hint a { color: var(--color-primary); font-weight: var(--font-weight-medium); }
.comment-loading, .comment-empty { text-align: center; padding: var(--space-8); color: var(--color-text-muted); font-size: var(--text-sm); }
.comment-list { list-style: none; display: flex; flex-direction: column; gap: var(--space-4); }
.comment-item { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-3); }
.comment-item__header { display: flex; align-items: center; gap: var(--space-3); }
.comment-item__avatar {
  width: 32px; height: 32px; border-radius: 50%; background: var(--color-primary-bg);
  overflow: hidden; display: flex; align-items: center; justify-content: center;
  font-size: var(--text-xs); font-weight: var(--font-weight-bold); color: var(--color-primary); flex-shrink: 0;
}
.comment-item__avatar img { width: 100%; height: 100%; object-fit: cover; }
.comment-item__meta { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.comment-item__author { font-size: var(--text-sm); font-weight: var(--font-weight-semibold); color: var(--color-text); }
.comment-item__date { font-size: var(--text-xs); color: var(--color-text-muted); }
.comment-item__delete { background: none; border: none; color: var(--color-text-muted); cursor: pointer; font-size: 14px; padding: 4px 6px; border-radius: var(--radius-sm); transition: all var(--transition-fast); }
.comment-item__delete:hover { background: var(--color-error-bg); color: var(--color-error); }
.comment-item__text { font-size: var(--text-sm); color: var(--color-text); line-height: var(--line-height-relaxed); margin: 0; }

.comment-pagination { display: flex; align-items: center; justify-content: center; gap: var(--space-4); padding-top: var(--space-4); font-size: var(--text-sm); color: var(--color-text-secondary); }
.pagination-btn { padding: var(--space-2) var(--space-4); border: 1.5px solid var(--color-border); border-radius: var(--radius-full); background: var(--color-surface); font-family: var(--font-heading); font-size: var(--text-sm); font-weight: var(--font-weight-medium); color: var(--color-text); cursor: pointer; transition: all var(--transition-fast); }
.pagination-btn:hover:not(:disabled) { border-color: var(--color-primary); color: var(--color-primary); }
.pagination-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* Modal suppression */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  max-width: 480px;
  width: 90%;
  box-shadow: var(--shadow-lg);
}

.modal-title {
  font-family: var(--font-heading);
  font-size: var(--text-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin: 0 0 var(--space-4);
}

.modal-text {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-6);
  line-height: var(--line-height-relaxed);
}

.modal-error {
  background: var(--color-error-bg);
  color: var(--color-error);
  border: 1px solid var(--color-error);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-sm);
  margin-bottom: var(--space-5);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity var(--transition-base);
}
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 640px) {
  .recipe-hero { height: 220px; }
  .recipe-title { font-size: var(--text-2xl); }
  .ingredient-list { grid-template-columns: 1fr; }
}
</style>
