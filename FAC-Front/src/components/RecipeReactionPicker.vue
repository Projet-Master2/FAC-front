<script setup lang="ts">
const props = defineProps<{
  likeActive?: boolean
  dislikeActive?: boolean
  loveActive?: boolean
  loading?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  (event: 'toggle-like'): void
  (event: 'toggle-dislike'): void
  (event: 'toggle-love'): void
}>()

const options = [
  { key: 'like', type: 'LIKE', emoji: '👍', label: 'J’aime' },
  { key: 'dislike', type: 'DISLIKE', emoji: '👎', label: 'Je n’aime pas' },
  { key: 'love', type: 'LOVE', emoji: '❤️', label: 'Cœur' },
] as const
</script>

<template>
  <div class="reaction-picker">
    <p class="reaction-picker__label">Réagissez à cette recette :</p>

    <div class="reaction-picker__options">
      <button
        v-for="option in options"
        :key="option.key"
        type="button"
        class="reaction-picker__button"
        :class="{
          'reaction-picker__button--active': option.key === 'like' ? props.likeActive : option.key === 'dislike' ? props.dislikeActive : props.loveActive,
        }"
        :disabled="props.disabled || props.loading"
        @click="option.key === 'like' ? emit('toggle-like') : option.key === 'dislike' ? emit('toggle-dislike') : emit('toggle-love')"
      >
        <span class="reaction-picker__emoji">{{ option.emoji }}</span>
        <span class="reaction-picker__label-text">{{ option.label }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.reaction-picker {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
}

.reaction-picker__label {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}

.reaction-picker__options {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.reaction-picker__button {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-full);
  background: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.reaction-picker__button:hover:not(:disabled) {
  border-color: var(--color-primary);
  transform: translateY(-1px);
}

.reaction-picker__button--active {
  border-color: var(--color-primary);
  background: linear-gradient(135deg, #fef2f2 0%, #fff7ed 100%);
  color: var(--color-primary-dark);
  box-shadow: 0 0 0 1px rgba(234, 88, 12, 0.15);
}

.reaction-picker__button:disabled {
  opacity: 0.6;
  cursor: wait;
}

.reaction-picker__emoji {
  font-size: 18px;
  line-height: 1;
}

.reaction-picker__label-text {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
}

.reaction-picker__thanks {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-success);
  font-weight: var(--font-weight-medium);
}
</style>
