<script setup lang="ts">
/**
 * AppButton — Bouton réutilisable
 *
 * Props :
 *   - variant  : 'primary' | 'secondary' | 'ghost' (défaut: primary)
 *   - size     : 'sm' | 'md' | 'lg' (défaut: md)
 *   - type     : type HTML button (défaut: button)
 *   - loading  : affiche un spinner et désactive le bouton
 *   - disabled
 *   - fullWidth : prend toute la largeur disponible
 */

interface Props {
  variant?:   'primary' | 'secondary' | 'ghost'
  size?:      'sm' | 'md' | 'lg'
  type?:      'button' | 'submit' | 'reset'
  loading?:   boolean
  disabled?:  boolean
  fullWidth?: boolean
}

withDefaults(defineProps<Props>(), {
  variant:   'primary',
  size:      'md',
  type:      'button',
  loading:   false,
  disabled:  false,
  fullWidth: false,
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'app-btn',
      `app-btn--${variant}`,
      `app-btn--${size}`,
      { 'app-btn--full': fullWidth, 'app-btn--loading': loading }
    ]"
  >
    <span v-if="loading" class="app-btn__spinner" aria-hidden="true" />
    <slot />
  </button>
</template>

<style scoped>
.app-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: var(--radius-full);
  font-family: var(--font-heading);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition:
    background-color var(--transition-fast),
    box-shadow var(--transition-fast),
    transform var(--transition-fast),
    opacity var(--transition-fast);
  white-space: nowrap;
  user-select: none;
}

.app-btn:active:not(:disabled) { transform: scale(0.97); }

.app-btn--full { width: 100%; }

/* Variants */
.app-btn--primary {
  background: var(--color-primary);
  color: #fff;
  box-shadow: var(--shadow-primary);
}
.app-btn--primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
  box-shadow: 0 6px 20px rgba(255, 65, 65, 0.36);
}

.app-btn--secondary {
  background: transparent;
  color: var(--color-primary);
  border: 1.5px solid var(--color-primary);
}
.app-btn--secondary:hover:not(:disabled) {
  background: var(--color-primary-bg);
}

.app-btn--ghost {
  background: transparent;
  color: var(--color-text-secondary);
}
.app-btn--ghost:hover:not(:disabled) {
  background: var(--color-border);
  color: var(--color-text);
}

/* Tailles */
.app-btn--sm  { padding: 8px 16px;  font-size: var(--text-xs); }
.app-btn--md  { padding: 12px 24px; font-size: var(--text-sm); }
.app-btn--lg  { padding: 14px 32px; font-size: var(--text-base); }

/* Disabled */
.app-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Spinner */
.app-btn__spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

.app-btn--secondary .app-btn__spinner,
.app-btn--ghost .app-btn__spinner {
  border-color: rgba(0, 0, 0, 0.15);
  border-top-color: var(--color-primary);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
