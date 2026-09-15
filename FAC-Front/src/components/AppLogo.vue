<script setup lang="ts">
/**
 * AppLogo – Composant logo FAC
 *
 * Variants disponibles :
 *   - "default"  : logo couleur rouge #ff4141 (fond clair)
 *   - "white"    : logo tout blanc            (fond coloré / navbar sombre)
 *   - "dark"     : logo noir/anthracite       (print, fond très clair)
 *   - "icon"     : icône seule sans texte     (favicon, avatar, espace réduit)
 *
 * Tailles prédéfinies :
 *   - "sm"  : 80px de large
 *   - "md"  : 120px de large  (défaut)
 *   - "lg"  : 180px de large
 *   - "xl"  : 240px de large
 *   Ou passer un nombre pour une largeur personnalisée (en px).
 *
 * Placement des fichiers logo à ajouter dans /public/ :
 *   /public/logo.png          → logo complet couleur (fond transparent)
 *   /public/logo-icon.png     → icône seule couleur  (fond transparent)
 *
 * Note : les variantes "white" et "dark" sont générées via filtre CSS
 *        à partir des fichiers de base – pas besoin de fichiers séparés.
 */

interface Props {
  variant?: 'default' | 'white' | 'dark' | 'icon'
  size?: 'sm' | 'md' | 'lg' | 'xl' | number
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
})

const SIZE_MAP: Record<string, number> = {
  sm:  80,
  md: 120,
  lg: 180,
  xl: 240,
}

const widthPx = typeof props.size === 'number'
  ? props.size
  : SIZE_MAP[props.size]

const src = props.variant === 'icon' ? '/logo-icon.png' : '/logo.png'

const alt = props.variant === 'icon' ? 'FAC icône' : 'FAC – Recettes étudiantes'

/**
 * Filtres CSS pour les variantes de couleur :
 *   - "white"  : brightness(0) invert(1)  → tout en blanc
 *   - "dark"   : brightness(0)             → tout en noir
 *   - "default": aucun filtre
 */
const FILTER_MAP: Record<string, string> = {
  default: 'none',
  white:   'brightness(0) invert(1)',
  dark:    'brightness(0)',
  icon:    'none',
}

const imgFilter = FILTER_MAP[props.variant]
</script>

<template>
  <img
    :src="src"
    :alt="alt"
    :width="widthPx"
    class="app-logo"
    :style="{
      width: widthPx + 'px',
      filter: imgFilter,
    }"
    draggable="false"
  />
</template>

<style scoped>
.app-logo {
  height: auto;
  display: block;
  user-select: none;
  flex-shrink: 0;
  transition: filter 200ms ease, opacity 200ms ease;
}

.app-logo:hover {
  opacity: 0.88;
}
</style>
