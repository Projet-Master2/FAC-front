<template>
  <nav class="navbar">
    <div class="navbar-container">
      <div class="navbar-logo">
        <router-link to="/" class="logo-link">FAC</router-link>
      </div>

      <div class="navbar-search">
        <input 
          type="text" 
          placeholder="Rechercher..." 
          class="search-input"
          v-model="searchQuery"
        />
        <span class="search-icon">🔍</span>
      </div>

      <div class="navbar-actions">
        <router-link to="/profile" class="profile-icon">
          <span class="icon">👤</span>
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineOptions({
  name: 'NavbarComponent',
})

const searchQuery = ref('')
</script>

<style scoped>
.navbar {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-logo {
  font-size: 1.5rem;
  font-weight: 700;
}

.logo-link {
  color: #667eea;
  text-decoration: none;
  transition: color 0.3s;
}

.logo-link:hover {
  color: #764ba2;
}

.navbar-search {
  flex: 1;
  max-width: 500px;
  margin: 0 2rem;
  position: relative;
}

.search-input {
  width: 100%;
  padding: 0.625rem 2.5rem 0.625rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 25px;
  font-size: 0.95rem;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.2rem;
  pointer-events: none;
  opacity: 0.5;
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.profile-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f5f5f5;
  transition: background 0.3s, transform 0.2s;
  text-decoration: none;
}

.profile-icon:hover {
  background: #e0e0e0;
  transform: scale(1.05);
}

.icon {
  font-size: 1.5rem;
}

@media (max-width: 768px) {
  .navbar-container {
    padding: 0.75rem 1rem;
  }
  
  .navbar-logo {
    font-size: 1.25rem;
  }

  .navbar-search {
    margin: 0 1rem;
    max-width: 300px;
  }
}

@media (max-width: 600px) {
  .navbar-search {
    display: none;
  }
}
</style>
