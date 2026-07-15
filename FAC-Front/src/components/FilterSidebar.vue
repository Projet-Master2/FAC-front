<script setup lang="ts">
import { ref } from 'vue'
import type { RecipesQuery } from '@/api/recipes'

interface Props {
  modelValue: RecipesQuery
}

defineProps<Props>()
const emit = defineEmits<{ 'update:modelValue': [value: RecipesQuery] }>()

// Sections depliables
const openSections = ref({ difficulty: true, time: true, cost: true, sort: true })

function toggle(section: keyof typeof openSections.value) {
  openSections.value[section] = !openSections.value[section]
}

// Sidebar mobile
const mobileOpen = ref(false)

function update(field: keyof RecipesQuery, value: unknown) {
  emit('update:modelValue', { ...currentValue(), [field]: value || undefined })
}

function reset() {
  emit('update:modelValue', { q: currentValue().q, sort: 'recent' })
}

// Accede au modelValue depuis le parent
import { getCurrentInstance } from 'vue'
function currentValue(): RecipesQuery {
  return getCurrentInstance()?.props.modelValue as RecipesQuery ?? {}
}
</script>

<template>
  <!-- Bouton mobile -->
  <button class="filter-mobile-btn" @click="mobileOpen = !mobileOpen">
    <span class="filter-mobile-btn__icon">☰</span>
    Filtres
    <span v-if="mobileOpen" class="filter-mobile-btn__close">✕</span>
  </button>

  <!-- Panneau -->
  <aside class="filter-sidebar" :class="{ 'filter-sidebar--open': mobileOpen }">

    <div class="filter-sidebar__header">
      <h2 class="filter-sidebar__title">Filtres</h2>
      <button class="filter-reset" @click="reset">Tout effacer</button>
    </div>

    <!-- Difficulte -->
    <div class="filter-section">
      <button class="filter-section__toggle" @click="toggle('difficulty')">
        <span>Difficulte</span>
        <span>{{ openSections.difficulty ? '▲' : '▼' }}</span>
      </button>
      <div v-if="openSections.difficulty" class="filter-section__body">
        <label v-for="opt in difficultyOptions" :key="opt.value" class="filter-radio">
          <input
            type="radio"
            name="difficulty"
            :value="opt.value"
            :checked="modelValue.difficulty === opt.value"
            @change="update('difficulty', opt.value)"
          />
          <span class="filter-radio__dot" :style="{ background: opt.color }" />
          {{ opt.label }}
        </label>
        <label class="filter-radio">
          <input
            type="radio"
            name="difficulty"
            value=""
            :checked="!modelValue.difficulty"
            @change="update('difficulty', '')"
          />
          <span class="filter-radio__dot" style="background: var(--color-border)" />
          Toutes
        </label>
      </div>
    </div>

    <!-- Temps total -->
    <div class="filter-section">
      <button class="filter-section__toggle" @click="toggle('time')">
        <span>Temps de preparation</span>
        <span>{{ openSections.time ? '▲' : '▼' }}</span>
      </button>
      <div v-if="openSections.time" class="filter-section__body">
        <label v-for="opt in timeOptions" :key="opt.value" class="filter-chip-label">
          <input
            type="radio"
            name="maxTime"
            :value="opt.value"
            :checked="modelValue.maxTime === opt.value"
            @change="update('maxTime', opt.value)"
          />
          <span class="filter-chip" :class="{ 'filter-chip--active': modelValue.maxTime === opt.value }">
            {{ opt.label }}
          </span>
        </label>
        <label class="filter-chip-label">
          <input type="radio" name="maxTime" value="" :checked="!modelValue.maxTime" @change="update('maxTime', '')" />
          <span class="filter-chip" :class="{ 'filter-chip--active': !modelValue.maxTime }">Tout</span>
        </label>
      </div>
    </div>

    <!-- Budget -->
    <div class="filter-section">
      <button class="filter-section__toggle" @click="toggle('cost')">
        <span>Budget par portion</span>
        <span>{{ openSections.cost ? '▲' : '▼' }}</span>
      </button>
      <div v-if="openSections.cost" class="filter-section__body">
        <label v-for="opt in costOptions" :key="opt.value" class="filter-chip-label">
          <input
            type="radio"
            name="maxCost"
            :value="opt.value"
            :checked="modelValue.maxCost === opt.value"
            @change="update('maxCost', opt.value)"
          />
          <span class="filter-chip" :class="{ 'filter-chip--active': modelValue.maxCost === opt.value }">
            {{ opt.label }}
          </span>
        </label>
        <label class="filter-chip-label">
          <input type="radio" name="maxCost" value="" :checked="!modelValue.maxCost" @change="update('maxCost', '')" />
          <span class="filter-chip" :class="{ 'filter-chip--active': !modelValue.maxCost }">Tout</span>
        </label>
      </div>
    </div>

    <!-- Tri -->
    <div class="filter-section">
      <button class="filter-section__toggle" @click="toggle('sort')">
        <span>Trier par</span>
        <span>{{ openSections.sort ? '▲' : '▼' }}</span>
      </button>
      <div v-if="openSections.sort" class="filter-section__body">
        <label v-for="opt in sortOptions" :key="opt.value" class="filter-radio">
          <input
            type="radio"
            name="sort"
            :value="opt.value"
            :checked="(modelValue.sort ?? 'recent') === opt.value"
            @change="update('sort', opt.value)"
          />
          {{ opt.label }}
        </label>
      </div>
    </div>

  </aside>
</template>

<script lang="ts">
const difficultyOptions = [
  { value: 'EASY',   label: 'Facile',     color: 'var(--color-success)' },
  { value: 'MEDIUM', label: 'Moyen',      color: 'var(--color-warning)' },
  { value: 'HARD',   label: 'Difficile',  color: 'var(--color-primary)' },
]

const timeOptions = [
  { value: 15,  label: '< 15 min' },
  { value: 30,  label: '< 30 min' },
  { value: 60,  label: '< 1h'     },
  { value: 120, label: '< 2h'     },
]

const costOptions = [
  { value: 2,  label: '< 2 €'  },
  { value: 5,  label: '< 5 €'  },
  { value: 10, label: '< 10 €' },
]

const sortOptions = [
  { value: 'recent',   label: 'Plus recentes'  },
  { value: 'rating',   label: 'Mieux notees'   },
  { value: 'quickest', label: 'Plus rapides'   },
  { value: 'cheapest', label: 'Moins cheres'   },
]
</script>

<style scoped>
/* Bouton mobile */
.filter-mobile-btn {
  display: none;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-5);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-full);
  background: var(--color-surface);
  font-family: var(--font-heading);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
  cursor: pointer;
  transition: border-color var(--transition-fast);
}

.filter-mobile-btn:hover { border-color: var(--color-primary); color: var(--color-primary); }
.filter-mobile-btn__icon { font-size: 18px; }
.filter-mobile-btn__close { margin-left: auto; font-size: 14px; color: var(--color-text-muted); }

/* Panneau sidebar */
.filter-sidebar {
  width: 260px;
  flex-shrink: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  height: fit-content;
  position: sticky;
  top: calc(var(--navbar-height) + var(--space-4));
}

.filter-sidebar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-5);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.filter-sidebar__title {
  font-family: var(--font-heading);
  font-size: var(--text-md);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin: 0;
}

.filter-reset {
  background: none;
  border: none;
  font-size: var(--text-xs);
  color: var(--color-primary);
  cursor: pointer;
  font-weight: var(--font-weight-medium);
  padding: 0;
}

/* Sections */
.filter-section {
  border-bottom: 1px solid var(--color-border);
  padding: var(--space-3) 0;
}

.filter-section:last-child { border-bottom: none; }

.filter-section__toggle {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: none;
  border: none;
  font-family: var(--font-heading);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  cursor: pointer;
  padding: var(--space-2) 0;
}

.filter-section__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-2) 0 var(--space-1);
}

/* Radio avec dot */
.filter-radio {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--text-sm);
  color: var(--color-text);
  cursor: pointer;
}

.filter-radio input { display: none; }

/* Dot coloré (difficulté) */
.filter-radio__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.filter-radio:has(input:checked) {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
}

/* Section tri — radio natif visible à la place des dots */
.filter-section:last-child .filter-radio input {
  display: inline-block;
  accent-color: var(--color-primary);
  width: 15px;
  height: 15px;
  cursor: pointer;
}

/* Chips */
.filter-chip-label { cursor: pointer; }
.filter-chip-label input { display: none; }

.filter-chip-label { display: inline-block; }

.filter-section__body:has(.filter-chip) {
  flex-direction: row;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.filter-chip {
  display: inline-block;
  padding: 4px 12px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
  cursor: pointer;
}

.filter-chip--active {
  border-color: var(--color-primary);
  background: var(--color-primary-bg);
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
}

/* Mobile */
@media (max-width: 768px) {
  .filter-mobile-btn { display: flex; }

  .filter-sidebar {
    display: none;
    position: fixed;
    top: var(--navbar-height);
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    border-radius: 0;
    border-top: 1px solid var(--color-border);
    overflow-y: auto;
    z-index: 50;
  }

  .filter-sidebar--open { display: block; }
}
</style>
