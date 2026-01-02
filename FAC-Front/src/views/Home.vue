<template>
  <div class="home">
    <h1>Bienvenue sur FAC</h1>
    <p>Page d'accueil</p>
  </div>
</template>

<script setup lang="ts">

defineOptions({
  name: 'HomeView',
})
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}
</style>
