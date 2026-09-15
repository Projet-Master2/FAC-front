<script setup lang="ts">
/**
 * ImageSlideshow — Fond plein écran avec défilement d'images
 * Utilisable sur n'importe quelle page (login, landing, etc.)
 *
 * Props :
 *   - images   : tableau de chemins vers les images
 *   - interval : durée entre chaque changement (ms, défaut 7000)
 *   - overlay  : opacité de l'overlay sombre (0-1, défaut 0.45)
 */

import { ref, onMounted, onUnmounted } from 'vue'

interface Props {
  images:    string[]
  interval?: number
  overlay?:  number
}

const props = withDefaults(defineProps<Props>(), {
  interval: 7000,
  overlay:  0.45,
})

const currentSlide = ref(0)
let timer: ReturnType<typeof setInterval>

onMounted(() => {
  timer = setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % props.images.length
  }, props.interval)
})

onUnmounted(() => clearInterval(timer))
</script>

<template>
  <div class="slideshow">
    <div
      v-for="(img, i) in images"
      :key="i"
      class="slideshow__slide"
      :class="{ 'slideshow__slide--active': i === currentSlide }"
      :style="{ backgroundImage: `url(${img})` }"
    />
    <div
      class="slideshow__overlay"
      :style="{ background: `rgba(0,0,0,${overlay})` }"
    />

    <!-- Indicateurs -->
    <div class="slideshow__indicators">
      <button
        v-for="(_, i) in images"
        :key="i"
        class="slideshow__dot"
        :class="{ 'slideshow__dot--active': i === currentSlide }"
        :aria-label="`Image ${i + 1}`"
        @click="currentSlide = i"
      />
    </div>
  </div>
</template>

<style scoped>
.slideshow {
  position: fixed;
  inset: 0;
  z-index: 0;
}

.slideshow__slide {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  opacity: 0;
  transition: opacity 1.2s ease-in-out;
}

.slideshow__slide--active { opacity: 1; }

.slideshow__overlay {
  position: absolute;
  inset: 0;
}

.slideshow__indicators {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 1;
}

.slideshow__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.45);
  cursor: pointer;
  padding: 0;
  transition: all var(--transition-fast);
}

.slideshow__dot--active {
  background: #fff;
  width: 24px;
  border-radius: var(--radius-full);
}
</style>
