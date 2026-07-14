<script setup lang="ts">
/**
 * AppInput — Champ de formulaire réutilisable
 *
 * Props :
 *   - modelValue  : valeur liée (v-model)
 *   - label       : libellé affiché au-dessus
 *   - type        : type HTML (text, email, password…)
 *   - placeholder
 *   - error       : message d'erreur affiché en rouge sous le champ
 *   - hint        : texte d'aide gris sous le champ
 *   - disabled
 *   - required
 */

interface Props {
  modelValue?: string
  label?:      string
  type?:       string
  placeholder?: string
  error?:       string
  hint?:        string
  disabled?:    boolean
  required?:    boolean
}

withDefaults(defineProps<Props>(), {
  type:     'text',
  disabled: false,
  required: false,
})

defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div class="app-input">
    <label v-if="label" class="app-input__label">
      {{ label }}
      <span v-if="required" class="app-input__required">*</span>
    </label>

    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :class="['app-input__field', { 'app-input__field--error': error }]"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />

    <p v-if="error" class="app-input__error">{{ error }}</p>
    <p v-else-if="hint" class="app-input__hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.app-input {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.app-input__label {
  font-family: var(--font-heading);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
}

.app-input__required {
  color: var(--color-primary);
  margin-left: 2px;
}

.app-input__field {
  padding: 11px 14px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: var(--text-base);
  color: var(--color-text);
  background: var(--color-bg);
  outline: none;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  width: 100%;
}

.app-input__field:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(255, 65, 65, 0.15);
}

.app-input__field--error {
  border-color: var(--color-error);
  box-shadow: 0 0 0 3px rgba(255, 59, 48, 0.12);
}

.app-input__field:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  background: var(--color-border);
}

.app-input__error {
  font-size: var(--text-xs);
  color: var(--color-error);
  margin: 0;
}

.app-input__hint {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin: 0;
}
</style>
