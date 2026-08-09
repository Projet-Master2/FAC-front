<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usersApi, type UpdateUserPayload } from '@/api/users'
import type { RecipeSummary } from '@/api/recipes'
import Navbar from '@/components/Navbar.vue'
import RecipeCard from '@/components/RecipeCard.vue'
import AppInput from '@/components/AppInput.vue'
import AppButton from '@/components/AppButton.vue'

defineOptions({ name: 'ProfileView' })

const auth   = useAuthStore()
const router = useRouter()

// ── Favoris ───────────────────────────────────────────────────────────────────
const favorites     = ref<RecipeSummary[]>([])
const loadingFav    = ref(false)
const favPage       = ref(1)
const FAV_PER_PAGE  = 3

const totalFavPages = computed(() => Math.ceil(favorites.value.length / FAV_PER_PAGE))

const pagedFavorites = computed(() => {
  const start = (favPage.value - 1) * FAV_PER_PAGE
  return favorites.value.slice(start, start + FAV_PER_PAGE)
})

async function loadFavorites() {
  if (!auth.user) return
  loadingFav.value = true
  try {
    const { data } = await usersApi.getFavorites(auth.user.id)
    favorites.value = data.data
  } catch {
    favorites.value = []
  } finally {
    loadingFav.value = false
  }
}

async function removeFavorite(id: string) {
  const { recipesApi } = await import('@/api/recipes')
  await recipesApi.removeFavorite(id)
  favorites.value = favorites.value.filter(r => r.id !== id)
  if (favPage.value > totalFavPages.value && favPage.value > 1) favPage.value--
}

// ── Edition du profil ─────────────────────────────────────────────────────────
const isEditing   = ref(false)
const saveLoading = ref(false)
const saveError   = ref<string | null>(null)
const avatarPreview = ref<string | null>(null)
const avatarFile    = ref<File | null>(null)

const editForm = ref({
  name:   '',
  pseudo: '',
  email:  '',
  bio:    '',
})

const editErrors = ref({ name: '', pseudo: '', email: '' })

function toggleEdit() {
  if (isEditing.value) {
    cancelEdit()
  } else {
    openEdit()
  }
}

function openEdit() {
  editForm.value = {
    name:   auth.user?.name   ?? '',
    pseudo: auth.user?.pseudo ?? '',
    email:  auth.user?.email  ?? '',
    bio:    auth.user?.bio    ?? '',
  }
  editErrors.value = { name: '', pseudo: '', email: '' }
  saveError.value  = null
  avatarPreview.value = null
  avatarFile.value    = null
  isEditing.value     = true
}

function cancelEdit() {
  isEditing.value     = false
  avatarPreview.value = null
  avatarFile.value    = null
}

function handleAvatarChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  avatarFile.value    = file
  avatarPreview.value = URL.createObjectURL(file)
}

function validateEdit(): boolean {
  editErrors.value = { name: '', pseudo: '', email: '' }
  let ok = true
  if (!editForm.value.name.trim())  { editErrors.value.name  = 'Le nom est requis' ; ok = false }
  if (!editForm.value.email.trim()) { editErrors.value.email = "L'email est requis" ; ok = false }
  return ok
}

async function saveProfile() {
  if (!validateEdit() || !auth.user) return
  saveLoading.value = true
  saveError.value   = null
  try {
    // 1. Upload avatar si un fichier a été sélectionné
    if (avatarFile.value) {
      const { data: avatarData } = await usersApi.uploadAvatar(auth.user.id, avatarFile.value)
      if (auth.user) auth.user.avatar = avatarData.data.avatar
      avatarFile.value    = null
      avatarPreview.value = null
    }

    // 2. Mise à jour des infos textuelles
    const payload: UpdateUserPayload = {
      name:   editForm.value.name,
      pseudo: editForm.value.pseudo || undefined,
      bio:    editForm.value.bio    || undefined,
    }
    const { data } = await usersApi.updateUser(auth.user.id, payload)
    if (auth.user) {
      auth.user.name   = data.data.name
      auth.user.pseudo = data.data.pseudo
      auth.user.bio    = data.data.bio ?? null
    }
    isEditing.value = false
  } catch (e: unknown) {
    saveError.value = (e as { response?: { data?: { error?: string } } })
      ?.response?.data?.error ?? 'Erreur lors de la sauvegarde'
  } finally {
    saveLoading.value = false
  }
}

// ── Initiales avatar ──────────────────────────────────────────────────────────
const initials = computed(() => {
  const name = auth.user?.name ?? ''
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
})

// ── Pagination helper ─────────────────────────────────────────────────────────
const paginationRange = computed(() => {
  const range: number[] = []
  const start = Math.max(1, favPage.value - 1)
  const end   = Math.min(totalFavPages.value, favPage.value + 1)
  for (let i = start; i <= end; i++) range.push(i)
  return range
})

// ── Suppression du compte ────────────────────────────────────────────────────
const showDeleteConfirm = ref(false)
const deleteLoading     = ref(false)
const deleteError       = ref<string | null>(null)

async function deleteAccount() {
  if (!auth.user) return
  deleteLoading.value = true
  deleteError.value   = null
  try {
    await usersApi.deleteUser(auth.user.id)
    auth.logout()
    router.push('/')
  } catch (e: unknown) {
    deleteError.value = (e as { response?: { data?: { error?: string } } })
      ?.response?.data?.error ?? 'Erreur lors de la suppression du compte'
  } finally {
    deleteLoading.value = false
  }
}

onMounted(loadFavorites)
</script>

<template>
  <div class="profile-page">
    <Navbar />

    <main class="profile-main container">

      <!-- ── Header profil ── -->
      <section class="profile-header">
        <div class="profile-avatar">
          <img v-if="auth.user?.avatar" :src="auth.user.avatar" :alt="auth.user?.name" />
          <span v-else class="profile-avatar__initials">{{ initials }}</span>
        </div>

        <div class="profile-info">
          <h1 class="profile-name">{{ auth.user?.name }}</h1>
          <p v-if="auth.user?.pseudo" class="profile-pseudo">@{{ auth.user.pseudo }}</p>
          <p v-if="auth.user?.bio" class="profile-bio">{{ auth.user.bio }}</p>
          <p class="profile-email">{{ auth.user?.email }}</p>
        </div>

        <AppButton variant="secondary" size="sm" @click="toggleEdit">
          Modifier mon profil
        </AppButton>
      </section>

      <!-- ── Formulaire d'edition (inline) ── -->
      <Transition name="slide">
        <section v-if="isEditing" class="profile-edit">
          <h2 class="profile-edit__title">Modifier mon profil</h2>

          <div v-if="saveError" class="profile-edit__error">{{ saveError }}</div>

          <!-- Avatar upload -->
          <div class="profile-edit__avatar">
            <div class="profile-edit__avatar-preview">
              <img v-if="avatarPreview || auth.user?.avatar" :src="avatarPreview ?? auth.user?.avatar ?? ''" alt="Avatar" />
              <span v-else class="profile-avatar__initials">{{ initials }}</span>
            </div>
            <div class="profile-edit__avatar-actions">
              <label class="profile-edit__avatar-btn" for="avatar-upload">
                Choisir une photo
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                class="profile-edit__avatar-input"
                @change="handleAvatarChange"
              />
              <span v-if="avatarPreview" class="profile-edit__avatar-hint">Nouvelle photo selectionnée</span>
            </div>
          </div>

          <div class="profile-edit__grid">
            <AppInput
              v-model="editForm.name"
              label="Nom complet"
              placeholder="Votre nom"
              :error="editErrors.name"
              required
            />
            <AppInput
              v-model="editForm.pseudo"
              label="Pseudo"
              placeholder="Votre pseudo (optionnel)"
              :error="editErrors.pseudo"
            />
            <AppInput
              v-model="editForm.email"
              label="Email"
              type="email"
              placeholder="votre@email.com"
              :error="editErrors.email"
              required
            />
            <AppInput
              v-model="editForm.bio"
              label="Bio"
              placeholder="Quelques mots sur vous (optionnel)"
            />
          </div>

          <div class="profile-edit__actions">
            <AppButton variant="ghost" @click="cancelEdit">Annuler</AppButton>
            <AppButton :loading="saveLoading" @click="saveProfile">Enregistrer</AppButton>
          </div>
        </section>
      </Transition>

      <!-- ── Stats ── -->
      <section class="profile-stats">
        <div class="profile-stat">
          <span class="profile-stat__value">{{ favorites.length }}</span>
          <span class="profile-stat__label">Recettes en favoris</span>
        </div>
        <div class="profile-stat">
          <span class="profile-stat__value">—</span>
          <span class="profile-stat__label">Recettes publiées</span>
        </div>
        <div class="profile-stat">
          <span class="profile-stat__value">—</span>
          <span class="profile-stat__label">Commentaires</span>
        </div>
      </section>

      <!-- ── Section favoris ── -->
      <section class="profile-favorites">
        <h2 class="profile-section-title">Mes recettes favorites</h2>

        <!-- Chargement -->
        <div v-if="loadingFav" class="profile-favorites__grid">
          <div v-for="i in 3" :key="i" class="recipe-skeleton" />
        </div>

        <!-- Etat vide -->
        <div v-else-if="favorites.length === 0" class="profile-empty">
          <p class="profile-empty__icon">🍽️</p>
          <h3>Aucune recette encore sauvegardée</h3>
              <p>Explorez notre site et ajoutez vos recettes préférées !</p>
          <AppButton class="profile-empty__btn" @click="router.push('/search')">
            Explorer les recettes
          </AppButton>
        </div>

        <!-- Grille -->
        <template v-else>
          <div class="profile-favorites__grid">
            <RecipeCard
              v-for="recipe in pagedFavorites"
              :key="recipe.id"
              :recipe="recipe"
              :is-favorite="true"
              @favorite="removeFavorite"
            />
          </div>

          <!-- Pagination -->
          <div v-if="totalFavPages > 1" class="profile-pagination">
            <button
              class="pagination-btn"
              :disabled="favPage === 1"
              @click="favPage--"
            >
              Precedent
            </button>

            <div class="pagination-pages">
              <button
                v-for="p in paginationRange"
                :key="p"
                class="pagination-page"
                :class="{ 'pagination-page--active': p === favPage }"
                @click="favPage = p"
              >
                {{ p }}
              </button>
            </div>

            <button
              class="pagination-btn"
              :disabled="favPage === totalFavPages"
              @click="favPage++"
            >
              Suivant
            </button>
          </div>
        </template>
      </section>

      <!-- ── Zone de danger ── -->
      <section class="profile-danger">
        <h2 class="profile-section-title profile-section-title--danger">Zone de danger</h2>
        
        <div class="profile-danger__content">
          <div class="profile-danger__info">
            <h3 class="profile-danger__subtitle">Supprimer mon compte</h3>
            <p class="profile-danger__text">
              Cette action est irreversible. Toutes vos donnees (recettes, commentaires, favoris) seront definitivement supprimees.
            </p>
          </div>
          <AppButton variant="ghost" size="sm" @click="showDeleteConfirm = true">
            Supprimer mon compte
          </AppButton>
        </div>

        <!-- Modale de confirmation -->
        <Transition name="fade">
          <div v-if="showDeleteConfirm" class="modal-overlay" @click="showDeleteConfirm = false">
            <div class="modal-content" @click.stop>
              <h3 class="modal-title">Confirmer la suppression</h3>
              <p class="modal-text">
                Etes-vous sur de vouloir supprimer definitivement votre compte ?
                Cette action ne peut pas etre annulee.
              </p>
              <div v-if="deleteError" class="modal-error">{{ deleteError }}</div>
              <div class="modal-actions">
                <AppButton variant="ghost" :disabled="deleteLoading" @click="showDeleteConfirm = false">
                  Annuler
                </AppButton>
                <AppButton variant="primary" :loading="deleteLoading" @click="deleteAccount">
                  Supprimer mon compte
                </AppButton>
              </div>
            </div>
          </div>
        </Transition>
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
  gap: var(--space-10);
}

/* ── Header ── */
.profile-header {
  display: flex;
  align-items: flex-start;
  gap: var(--space-6);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  box-shadow: var(--shadow-sm);
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--color-primary-bg);
  border: 3px solid var(--color-primary);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.profile-avatar img { width: 100%; height: 100%; object-fit: cover; }

.profile-avatar__initials {
  font-family: var(--font-heading);
  font-size: var(--text-xl);
  font-weight: var(--font-weight-extrabold);
  color: var(--color-primary);
}

.profile-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.profile-name {
  font-family: var(--font-heading);
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin: 0;
}

.profile-pseudo {
  font-size: var(--text-sm);
  color: var(--color-primary);
  font-weight: var(--font-weight-medium);
  margin: 0;
}

.profile-bio {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin: var(--space-1) 0 0;
}

.profile-email {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin: 0;
}

/* ── Stats ── */
.profile-stats {
  display: flex;
  gap: var(--space-4);
}

.profile-stat {
  flex: 1;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  text-align: center;
  box-shadow: var(--shadow-xs);
}

.profile-stat__value {
  display: block;
  font-family: var(--font-heading);
  font-size: var(--text-3xl);
  font-weight: var(--font-weight-extrabold);
  color: var(--color-primary);
  margin-bottom: var(--space-1);
}

.profile-stat__label {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

/* ── Formulaire edition ── */
.profile-edit {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  box-shadow: var(--shadow-sm);
}

.profile-edit__title {
  font-family: var(--font-heading);
  font-size: var(--text-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin: 0 0 var(--space-6);
}

.profile-edit__error {
  background: var(--color-error-bg);
  color: var(--color-error);
  border: 1px solid var(--color-error);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-sm);
  margin-bottom: var(--space-5);
}

/* Avatar upload */
.profile-edit__avatar {
  display: flex;
  align-items: center;
  gap: var(--space-5);
  margin-bottom: var(--space-6);
  padding-bottom: var(--space-6);
  border-bottom: 1px solid var(--color-border);
}

.profile-edit__avatar-preview {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--color-primary-bg);
  border: 3px solid var(--color-primary);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.profile-edit__avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-edit__avatar-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.profile-edit__avatar-btn {
  display: inline-flex;
  align-items: center;
  padding: var(--space-2) var(--space-4);
  border: 1.5px solid var(--color-primary);
  border-radius: var(--radius-full);
  font-family: var(--font-heading);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-primary);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.profile-edit__avatar-btn:hover { background: var(--color-primary-bg); }

.profile-edit__avatar-input { display: none; }

.profile-edit__avatar-hint {
  font-size: var(--text-xs);
  color: var(--color-success);
}

.profile-edit__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-5);
  margin-bottom: var(--space-6);
}

.profile-edit__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
}

/* ── Favoris ── */
.profile-section-title {
  font-family: var(--font-heading);
  font-size: var(--text-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin: 0 0 var(--space-6);
  padding-bottom: var(--space-3);
  border-bottom: 2px solid var(--color-primary);
}

.profile-favorites__grid {
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

/* Etat vide */
.profile-empty {
  text-align: center;
  padding: var(--space-16) var(--space-6);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
}

.profile-empty__icon { font-size: 56px; margin-bottom: var(--space-4); }

.profile-empty h3 {
  font-family: var(--font-heading);
  font-size: var(--text-xl);
  color: var(--color-text);
  margin-bottom: var(--space-2);
}

.profile-empty p {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  margin-bottom: var(--space-6);
}

/* Pagination */
.profile-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  margin-top: var(--space-8);
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

/* Transition formulaire */
.slide-enter-active, .slide-leave-active {
  transition: opacity var(--transition-base), transform var(--transition-base);
}
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-12px); }

/* ── Zone de danger ── */
.profile-danger {
  background: var(--color-surface);
  border: 1px solid var(--color-error);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
}

.profile-section-title--danger {
  color: var(--color-error);
  border-bottom-color: var(--color-error);
}

.profile-danger__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-6);
}

.profile-danger__info { flex: 1; }

.profile-danger__subtitle {
  font-family: var(--font-heading);
  font-size: var(--text-md);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin: 0 0 var(--space-2);
}

.profile-danger__text {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

/* Modal */
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

/* Transition modal */
.fade-enter-active, .fade-leave-active {
  transition: opacity var(--transition-base);
}
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Responsive */
@media (max-width: 768px) {
  .profile-header { flex-direction: column; align-items: center; text-align: center; }
  .profile-stats { flex-direction: column; }
  .profile-edit__grid { grid-template-columns: 1fr; }
  .profile-favorites__grid { grid-template-columns: 1fr; }
}

@media (max-width: 1024px) {
  .profile-favorites__grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
