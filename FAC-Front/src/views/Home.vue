<template>
  <div class="home">
    <!-- Navbar -->
    <Navbar />

    <section class="welcome-section">
      <h1>Bienvenue sur FAC</h1>
      <p>Découvrez toutes les fonctionnalités de notre plateforme</p>
    </section>

    <section class="grid-section">
      <div class="grid-container">
        <div v-for="index in 9" :key="index" class="grid-item">
          <div class="placeholder-content">
            <div class="placeholder-icon">📊</div>
            <h3>Données {{ index }}</h3>
            <p>Contenu à venir</p>
          </div>
        </div>
      </div>
    </section>

    <footer class="footer">
      <p>&copy; 2026 FAC. Tous droits réservés.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import Navbar from '../components/Navbar.vue'

defineOptions({
  name: 'HomeView',
})
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: #f5f7fa;
}

.welcome-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4rem 2rem;
  text-align: center;
}

.welcome-section h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.welcome-section p {
  font-size: 1.2rem;
  opacity: 0.95;
}

.grid-section {
  padding: 3rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.grid-item {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
}

.grid-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.placeholder-content {
  text-align: center;
}

.placeholder-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.placeholder-content h3 {
  font-size: 1.25rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.placeholder-content p {
  color: #666;
  font-size: 0.95rem;
}

.footer {
  background: #6c757d;
  color: white;
  text-align: center;
  padding: 1.5rem 2rem;
  margin-top: auto;
}

.footer p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.9;
}

@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
  
  .welcome-section h1 {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .grid-container {
    grid-template-columns: 1fr;
  }
}
</style>
