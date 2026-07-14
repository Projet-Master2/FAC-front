<script setup lang="ts">
import type { RecipesQuery } from '@/api/recipes'

interface Props {
  modelValue: RecipesQuery
}

defineProps<Props>()
const emit = defineEmits<{ 'update:modelValue': [value: RecipesQuery] }>()

function update(field: keyof RecipesQuery, value: string | number | undefined) {
  emit('update:modelValue', { ...useModelValue(), [field]: value || undefined })
}

function reset() {
  emit('update:modelValue', { q: '' })
}

// Helper pour acceder au modelValue dans le setup
import { getCurrentInstance } from 'vue'
function useModelValue(): RecipesQuery {
  return getCurrentInstance()?.props.modelValue as RecipesQuery ?? {}
}
</script>

<template>
  <div class="search-bar">

    <!-- Champ texte -->
    <div class="search-bar__input-wrapper">
      <span class="search-bar__icon">🔍</span>
      <input
        class="search-bar__input"
        type="text"
        placeholder="Rechercher une recette, un ingredient..."
        :value="modelValue.q ?? ''"
        @input="update('q', ($event.target as HTMLInputElement).value)"
      />
    </div>

    <!-- Filtres -->
    <div class="search-bar__filters">

      <select
        class="search-bar__select"
        :value="modelValue.difficulty ?? ''"
        @change="update('difficulty', ($event.target as HTMLSelectElement).value as never)"
      >
        <option value="">Toutes les difficultes</option>
        <option value="EASY">Facile</option>
        <option value="MEDIUM">Moyen</option>
        <option value="HARD">Difficile</option>
      </select>

      <select
        class="search-bar__select"
        :value="modelValue.maxTime ?? ''"
        @change="update('maxTime', Number(($event.target as HTMLSelectElement).value))"
      >
        <option value="">Temps illimite</option>
        <option value="15">- de 15 min</option>
        <option value="30">- de 30 min</option>
        <option value="60">- de 1h</option>
        <option value="120">- de 2h</option>
      </select>

      <select
        class="search-bar__select"
        :value="modelValue.maxCost ?? ''"
        @change="update('maxCost', Number(($event.target as HTMLSelectElement).value))"
      >
        <option value="">Tous les prix</option>
        <option value="3">- de 3 €</option>
        <option value="5">- de 5 €</option>
        <option value="10">- de 10 €</option>
      </select>

      <select
        class="search-bar__select"
        :value="modelValue.sort ?? 'recent'"
        @change="update('sort', ($event.target as HTMLSelectElement).value as never)"
      >
        <option value="recent">Plus recentes</option>
        <option value="quickest">Plus rapides</option>
        <option value="cheapest">Moins cheres</option>
      </select>

      <button class="search-bar__reset" @click="reset">
        Reinitialiser
      </button>

    </div>
  </div>
</template>

<style scoped>
.search-bar {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* Champ principal */
.search-bar__input-wrapper {
  position: relative;
}

.search-bar__icon {
  position: absolute;
  left: var(--space-4);
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  pointer-events: none;
  opacity: 0.5;
}

.search-bar__input {
  width: 100%;
  padding: var(--space-4) var(--space-4) var(--space-4) 48px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-full);
  font-family: var(--font-body);
  font-size: var(--text-base);
  background: var(--color-surface);
  outline: none;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  box-shadow: var(--shadow-sm);
}

.search-bar__input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(255, 65, 65, 0.15);
}

/* Filtres */
.search-bar__filters {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
  align-items: center;
}

.search-bar__select {
  padding: var(--space-2) var(--space-4);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-full);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  background: var(--color-surface);
  color: var(--color-text);
  outline: none;
  cursor: pointer;
  transition: border-color var(--transition-fast);
}

.search-bar__select:focus {
  border-color: var(--color-primary);
}

.search-bar__reset {
  background: none;
  border: none;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  cursor: pointer;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-full);
  transition: color var(--transition-fast), background var(--transition-fast);
  margin-left: auto;
}

.search-bar__reset:hover {
  color: var(--color-primary);
  background: var(--color-primary-bg);
}

@media (max-width: 640px) {
  .search-bar__filters { gap: var(--space-2); }
  .search-bar__select { font-size: var(--text-xs); padding: var(--space-2) var(--space-3); }
}
</style>
