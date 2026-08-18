<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { recipesApi, type CreateRecipePayload } from '@/api/recipes'
import { ingredientsApi, type Ingredient } from '@/api/ingredients'
import type { Difficulty } from '@/api/recipes'
import Navbar from '@/components/Navbar.vue'
import AppInput from '@/components/AppInput.vue'
import AppButton from '@/components/AppButton.vue'

defineOptions({ name: 'RecipeCreateView' })

const router = useRouter()

// ── Infos generales ───────────────────────────────────────────────────────────
const form = ref({
  title:         '',
  description:   '',
  difficulty:    'EASY' as Difficulty,
  prepTime:      '' as unknown as number,
  cookTime:      '' as unknown as number,
  servings:      '' as unknown as number,
  estimatedCost: '' as unknown as number,
})

const errors = ref({ title: '', description: '', prepTime: '', cookTime: '' })

// ── Image ─────────────────────────────────────────────────────────────────────
const imageFile    = ref<File | null>(null)
const imagePreview = ref<string | null>(null)

function handleImageChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  imageFile.value    = file
  imagePreview.value = URL.createObjectURL(file)
}

// ── Ingredients ───────────────────────────────────────────────────────────────
interface IngredientRow { ingredient: Ingredient; quantity: string; unit: string }

const ingredients   = ref<IngredientRow[]>([])
const searchQuery   = ref('')
const searchResults = ref<Ingredient[]>([])
const showDropdown  = ref(false)
const searchLoading = ref(false)
let searchTimer: ReturnType<typeof setTimeout>

const newIngQty  = ref('')
const newIngUnit = ref('g')

const UNITS = ['g', 'kg', 'ml', 'L', 'piece', 'c. a soupe', 'c. a cafe', 'tasse', 'sachet']

async function onSearchInput(val: string) {
  searchQuery.value = val
  clearTimeout(searchTimer)
  if (!val.trim()) { searchResults.value = [] ; showDropdown.value = false ; return }
  searchTimer = setTimeout(async () => {
    searchLoading.value = true
    try {
      const { data } = await ingredientsApi.search(val)
      searchResults.value = data.data
      showDropdown.value  = true
    } catch { searchResults.value = [] }
    finally { searchLoading.value = false }
  }, 300)
}

async function selectIngredient(ing: Ingredient) {
  if (ingredients.value.find(r => r.ingredient.id === ing.id)) return
  ingredients.value.push({ ingredient: ing, quantity: newIngQty.value, unit: newIngUnit.value })
  searchQuery.value  = ''
  newIngQty.value    = ''
  showDropdown.value = false
}

async function createAndAdd() {
  if (!searchQuery.value.trim()) return
  try {
    const { data } = await ingredientsApi.create(searchQuery.value.trim())
    selectIngredient(data.data)
  } catch { /* ingredient peut deja exister */ }
}

function removeIngredient(i: number) {
  ingredients.value.splice(i, 1)
}

// ── Etapes ────────────────────────────────────────────────────────────────────
const steps = ref([{ description: '' }])

function addStep()           { steps.value.push({ description: '' }) }
function removeStep(i: number) { if (steps.value.length > 1) steps.value.splice(i, 1) }
function moveUp(i: number)   { if (i > 0) { const t = steps.value[i-1] ; steps.value[i-1] = steps.value[i] ; steps.value[i] = t } }
function moveDown(i: number) { if (i < steps.value.length - 1) { const t = steps.value[i+1] ; steps.value[i+1] = steps.value[i] ; steps.value[i] = t } }

// ── Validation ────────────────────────────────────────────────────────────────
function validate(): boolean {
  errors.value = { title: '', description: '', prepTime: '', cookTime: '' }
  let ok = true
  if (!form.value.title.trim())       { errors.value.title       = 'Le nom est requis' ; ok = false }
  if (!form.value.description.trim()) { errors.value.description = 'La description est requise' ; ok = false }
  if (!form.value.prepTime)           { errors.value.prepTime    = 'Le temps de preparation est requis' ; ok = false }
  return ok
}

// ── Soumission ────────────────────────────────────────────────────────────────
const submitting  = ref(false)
const submitError = ref<string | null>(null)

const hasFilledSteps = computed(() => steps.value.some(s => s.description.trim()))

async function submit() {
  if (!validate()) return
  submitting.value  = true
  submitError.value = null

  try {
    // 1. Creer la recette
    const payload: CreateRecipePayload = {
      title:       form.value.title.trim(),
      description: form.value.description.trim(),
      difficulty:  form.value.difficulty,
      prepTime:    Number(form.value.prepTime),
      cookTime:    Number(form.value.cookTime),
      ...(form.value.servings      && { servings:      Number(form.value.servings)      }),
      ...(form.value.estimatedCost && { estimatedCost: Number(form.value.estimatedCost) }),
    }
    const { data: recipeData } = await recipesApi.createRecipe(payload)
    const recipeId = recipeData.data.id

    // 2. Upload image
    if (imageFile.value) {
      await recipesApi.uploadImage(recipeId, imageFile.value)
    }

    // 3. Ajouter les ingredients
    for (const row of ingredients.value) {
      await recipesApi.addIngredient(recipeId, {
        ingredientId: row.ingredient.id,
        ...(row.quantity && { quantity: Number(row.quantity) }),
        ...(row.unit     && { unit: row.unit }),
      })
    }

    // 4. Ajouter les etapes
    const filledSteps = steps.value.filter(s => s.description.trim())
    for (let i = 0; i < filledSteps.length; i++) {
      await recipesApi.addStep(recipeId, { order: i, description: filledSteps[i].description.trim() })
    }

    // 5. Publier
    await recipesApi.publish(recipeId)

    router.push('/')
  } catch (e: unknown) {
    submitError.value = (e as { response?: { data?: { error?: string } } })
      ?.response?.data?.error ?? 'Erreur lors de la creation'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="create-page">
    <Navbar />

    <main class="create-main container">
      <div class="create-header">
        <h1 class="create-title">Creer une recette</h1>
        <p class="create-subtitle">Partagez votre recette avec la communaute</p>
      </div>

      <form class="create-form" @submit.prevent="submit" novalidate>

        <!-- ── Section 1 : Informations ── -->
        <section class="form-section">
          <h2 class="form-section__title">Informations generales</h2>
          <div class="form-section__body">
            <AppInput
              v-model="form.title"
              label="Nom de la recette"
              :error="errors.title"
              required
            />
            <div class="form-group">
              <label class="form-label">Description <span class="required">*</span></label>
              <textarea
                v-model="form.description"
                class="form-textarea"
                :class="{ 'form-textarea--error': errors.description }"
                placeholder="Decrivez votre recette en quelques phrases..."
                rows="3"
              />
              <p v-if="errors.description" class="form-error">{{ errors.description }}</p>
            </div>
          </div>
        </section>

        <!-- ── Section 2 : Details ── -->
        <section class="form-section">
          <h2 class="form-section__title">Details</h2>
          <div class="form-section__grid">
            <div class="form-group">
              <label class="form-label">Difficulte</label>
              <select v-model="form.difficulty" class="form-select">
                <option value="EASY">Facile</option>
                <option value="MEDIUM">Moyen</option>
                <option value="HARD">Difficile</option>
              </select>
            </div>
            <AppInput
              v-model="form.prepTime"
              label="Temps de preparation (min)"
              type="number"
              :error="errors.prepTime"
              required
            />
            <AppInput
              v-model="form.cookTime"
              label="Temps de cuisson (min)"
              type="number"
            />
            <AppInput
              v-model="form.servings"
              label="Nombre de portions"
              type="number"
            />
            <AppInput
              v-model="form.estimatedCost"
              label="Cout estime par portion (€)"
              type="number"
            />
          </div>
        </section>

        <!-- ── Section 3 : Image ── -->
        <section class="form-section">
          <h2 class="form-section__title">Image</h2>
          <div class="image-upload">
            <div class="image-upload__preview">
              <img v-if="imagePreview" :src="imagePreview" alt="Apercu" />
              <div v-else class="image-upload__placeholder">
                <span>📷</span>
                <p>Aucune image selectionnee</p>
              </div>
            </div>
            <div class="image-upload__actions">
              <label class="image-upload__btn" for="recipe-image">
                Choisir une image
              </label>
              <input
                id="recipe-image"
                type="file"
                accept="image/*"
                class="image-upload__input"
                @change="handleImageChange"
              />
              <p class="image-upload__hint">Format accepte : JPG, PNG, WebP — max 5 Mo</p>
            </div>
          </div>
        </section>

        <!-- ── Section 4 : Ingredients ── -->
        <section class="form-section">
          <h2 class="form-section__title">Ingredients</h2>

          <!-- Recherche + ajout -->
          <div class="ingredient-search">
            <div class="ingredient-search__row">
              <div class="ingredient-search__input-wrapper">
                <input
                  class="ingredient-search__input"
                  type="text"
                  :value="searchQuery"
                  placeholder="Chercher ou creer un ingredient..."
                  @input="onSearchInput(($event.target as HTMLInputElement).value)"
                  @blur="setTimeout(() => showDropdown = false, 150)"
                  @focus="showDropdown = searchResults.length > 0"
                />
                <!-- Dropdown -->
                <div v-if="showDropdown" class="ingredient-dropdown">
                  <button
                    v-for="ing in searchResults"
                    :key="ing.id"
                    type="button"
                    class="ingredient-dropdown__item"
                    @mousedown.prevent="selectIngredient(ing)"
                  >
                    {{ ing.name }}
                  </button>
                  <button
                    v-if="searchQuery.trim() && !searchResults.find(r => r.name.toLowerCase() === searchQuery.toLowerCase())"
                    type="button"
                    class="ingredient-dropdown__item ingredient-dropdown__item--create"
                    @mousedown.prevent="createAndAdd"
                  >
                    Creer "{{ searchQuery }}"
                  </button>
                  <p v-if="searchResults.length === 0 && !searchQuery.trim()" class="ingredient-dropdown__empty">
                    Tapez pour rechercher
                  </p>
                </div>
              </div>

              <input
                v-model="newIngQty"
                class="ingredient-search__qty"
                type="number"
                placeholder="Qte"
                min="0"
              />
              <select v-model="newIngUnit" class="ingredient-search__unit">
                <option v-for="u in UNITS" :key="u" :value="u">{{ u }}</option>
              </select>
            </div>
          </div>

          <!-- Liste des ingredients ajoutes -->
          <ul v-if="ingredients.length > 0" class="ingredient-list">
            <li v-for="(row, i) in ingredients" :key="row.ingredient.id" class="ingredient-item">
              <span class="ingredient-item__name">{{ row.ingredient.name }}</span>
              <span v-if="row.quantity" class="ingredient-item__qty">{{ row.quantity }} {{ row.unit }}</span>
              <button type="button" class="ingredient-item__remove" @click="removeIngredient(i)">✕</button>
            </li>
          </ul>
          <p v-else class="form-hint-empty">Aucun ingredient ajoute</p>
        </section>

        <!-- ── Section 5 : Etapes ── -->
        <section class="form-section">
          <h2 class="form-section__title">Etapes de preparation</h2>

          <div class="steps-list">
            <div v-for="(step, i) in steps" :key="i" class="step-row">
              <div class="step-row__num">{{ i + 1 }}</div>
              <textarea
                v-model="step.description"
                class="step-row__textarea"
                :placeholder="`Decrivez l'etape ${i + 1}...`"
                rows="2"
              />
              <div class="step-row__actions">
                <button type="button" class="step-btn" :disabled="i === 0" @click="moveUp(i)">↑</button>
                <button type="button" class="step-btn" :disabled="i === steps.length - 1" @click="moveDown(i)">↓</button>
                <button type="button" class="step-btn step-btn--remove" :disabled="steps.length === 1" @click="removeStep(i)">✕</button>
              </div>
            </div>
          </div>

          <button type="button" class="steps-add-btn" @click="addStep">
            + Ajouter une etape
          </button>
        </section>

        <!-- ── Erreur globale ── -->
        <div v-if="submitError" class="create-error">{{ submitError }}</div>

        <!-- ── Actions ── -->
        <div class="create-actions">
          <AppButton variant="ghost" type="button" @click="router.back()">Annuler</AppButton>
          <AppButton type="submit" size="lg" :loading="submitting">
            Publier la recette
          </AppButton>
        </div>

      </form>
    </main>
  </div>
</template>

<style scoped>
.create-page { min-height: 100vh; background: var(--color-bg); }

.create-main {
  padding-top: var(--space-10);
  padding-bottom: var(--space-16);
  max-width: 800px;
}

.create-header { margin-bottom: var(--space-8); }

.create-title {
  font-family: var(--font-heading);
  font-size: var(--text-3xl);
  font-weight: var(--font-weight-extrabold);
  color: var(--color-text);
  margin: 0 0 var(--space-2);
}

.create-subtitle { color: var(--color-text-secondary); margin: 0; }

/* Sections */
.create-form { display: flex; flex-direction: column; gap: var(--space-8); }

.form-section {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-8) var(--space-8);
  box-shadow: var(--shadow-xs);
}

.form-section__title {
  font-family: var(--font-heading);
  font-size: var(--text-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin: 0 0 var(--space-6);
  padding-bottom: var(--space-3);
  border-bottom: 2px solid var(--color-primary);
}

.form-section__body { display: flex; flex-direction: column; gap: var(--space-5); }

.form-section__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-5);
}

/* Champs generiques */
.form-group { display: flex; flex-direction: column; gap: var(--space-2); }

.form-label {
  font-family: var(--font-heading);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
}

.required { color: var(--color-primary); margin-left: 2px; }

.form-textarea {
  padding: var(--space-3) var(--space-4);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: var(--text-base);
  resize: vertical;
  outline: none;
  transition: border-color var(--transition-fast);
}

.form-textarea:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(255,65,65,0.15); }
.form-textarea--error { border-color: var(--color-error); }

.form-select {
  padding: 11px var(--space-4);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: var(--text-base);
  background: var(--color-surface);
  outline: none;
  cursor: pointer;
}

.form-error { font-size: var(--text-xs); color: var(--color-error); }
.form-hint-empty { font-size: var(--text-sm); color: var(--color-text-muted); margin: var(--space-3) 0 0; }

/* Image upload */
.image-upload { display: flex; flex-direction: column; gap: var(--space-5); align-items: center; text-align: center; }

.image-upload__preview {
  width: 200px;
  height: 133px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 2px dashed var(--color-border);
  flex-shrink: 0;
}

.image-upload__preview img { width: 100%; height: 100%; object-fit: cover; }

.image-upload__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  background: var(--color-bg);
}

.image-upload__placeholder span { font-size: 32px; }
.image-upload__placeholder p { font-size: var(--text-xs); color: var(--color-text-muted); margin: 0; }

.image-upload__actions { display: flex; flex-direction: column; gap: var(--space-3); align-items: center; }

.image-upload__btn {
  display: inline-flex;
  padding: var(--space-3) var(--space-5);
  border: 1.5px solid var(--color-primary);
  border-radius: var(--radius-full);
  font-family: var(--font-heading);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-primary);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.image-upload__btn:hover { background: var(--color-primary-bg); }
.image-upload__input { display: none; }
.image-upload__hint { font-size: var(--text-xs); color: var(--color-text-muted); margin: 0; }

/* Ingredients */
.ingredient-search { margin-bottom: var(--space-4); }

.ingredient-search__row { display: flex; gap: var(--space-3); align-items: flex-start; }

.ingredient-search__input-wrapper { flex: 1; position: relative; }

.ingredient-search__input {
  width: 100%;
  padding: 11px var(--space-4);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: var(--text-base);
  outline: none;
  transition: border-color var(--transition-fast);
}

.ingredient-search__input:focus { border-color: var(--color-primary); }

.ingredient-search__qty {
  width: 90px;
  padding: 11px var(--space-3);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  outline: none;
}

.ingredient-search__unit {
  padding: 11px var(--space-3);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  background: var(--color-surface);
  cursor: pointer;
}

/* Dropdown */
.ingredient-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  z-index: 10;
  max-height: 200px;
  overflow-y: auto;
}

.ingredient-dropdown__item {
  display: block;
  width: 100%;
  padding: var(--space-3) var(--space-4);
  text-align: left;
  border: none;
  background: none;
  font-size: var(--text-sm);
  color: var(--color-text);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.ingredient-dropdown__item:hover { background: var(--color-bg); }

.ingredient-dropdown__item--create {
  color: var(--color-primary);
  font-weight: var(--font-weight-medium);
  border-top: 1px solid var(--color-border);
}

.ingredient-dropdown__empty { padding: var(--space-3) var(--space-4); font-size: var(--text-sm); color: var(--color-text-muted); margin: 0; }

/* Liste ingredients */
.ingredient-list { list-style: none; display: flex; flex-direction: column; gap: var(--space-2); }

.ingredient-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.ingredient-item__name { flex: 1; font-size: var(--text-sm); font-weight: var(--font-weight-medium); }
.ingredient-item__qty { font-size: var(--text-sm); color: var(--color-text-secondary); }

.ingredient-item__remove {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: 14px;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.ingredient-item__remove:hover { background: var(--color-error-bg); color: var(--color-error); }

/* Etapes */
.steps-list { display: flex; flex-direction: column; gap: var(--space-4); margin-bottom: var(--space-5); }

.step-row {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
}

.step-row__num {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #fff;
  font-family: var(--font-heading);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-bold);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 6px;
}

.step-row__textarea {
  flex: 1;
  padding: var(--space-3) var(--space-4);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: var(--text-base);
  resize: vertical;
  outline: none;
  transition: border-color var(--transition-fast);
}

.step-row__textarea:focus { border-color: var(--color-primary); }

.step-row__actions { display: flex; flex-direction: column; gap: var(--space-1); margin-top: 4px; }

.step-btn {
  width: 28px;
  height: 28px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.step-btn:hover:not(:disabled) { border-color: var(--color-primary); color: var(--color-primary); }
.step-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.step-btn--remove:hover:not(:disabled) { border-color: var(--color-error); color: var(--color-error); }

.steps-add-btn {
  background: none;
  border: 1.5px dashed var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-5);
  width: 100%;
  font-family: var(--font-heading);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.steps-add-btn:hover { border-color: var(--color-primary); color: var(--color-primary); background: var(--color-primary-bg); }

/* Erreur + actions */
.create-error {
  background: var(--color-error-bg);
  color: var(--color-error);
  border: 1px solid var(--color-error);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-5);
  font-size: var(--text-sm);
}

.create-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-4);
  padding-top: var(--space-4);
}

/* Responsive */
@media (max-width: 640px) {
  .form-section__grid { grid-template-columns: 1fr; }
  .ingredient-search__row { flex-wrap: wrap; }
}
</style>
