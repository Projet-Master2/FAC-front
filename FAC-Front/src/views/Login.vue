<template>
  <div class="login-container">
    <div class="login-card">
      <!-- Menu de sélection -->
      <div class="form-tabs">
        <button 
          type="button"
          :class="['tab-button', { active: activeForm === 'login' }]"
          @click="activeForm = 'login'"
        >
          Connexion
        </button>
        <button 
          type="button"
          :class="['tab-button', { active: activeForm === 'signup' }]"
          @click="activeForm = 'signup'"
        >
          Inscription
        </button>
      </div>

      <!-- Formulaire de connexion -->
      <form v-if="activeForm === 'login'" @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="login-email">Email</label>
          <input 
            type="email" 
            id="login-email" 
            v-model="loginData.email" 
            placeholder="Entrez votre email"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="login-password">Mot de passe</label>
          <input 
            type="password" 
            id="login-password" 
            v-model="loginData.password" 
            placeholder="Entrez votre mot de passe"
            required
          />
        </div>
        
        <div class="checkbox-group">
          <input 
            type="checkbox" 
            id="stay-connected" 
            v-model="loginData.stayConnected"
          />
          <label for="stay-connected">Rester connecté</label>
        </div>
        
        <button type="submit" class="btn-submit">Se connecter</button>
        
        <div class="form-footer">
          <a href="#" class="link">Mot de passe oublié ?</a>
        </div>
      </form>

      <!-- Formulaire d'inscription -->
      <div v-else>
        <!-- Étape 1: Informations obligatoires -->
        <form v-if="signupStep === 1" @submit.prevent="handleSignup" class="login-form">
          <div class="form-group">
            <label for="signup-name">Nom complet</label>
            <input 
              type="text" 
              id="signup-name" 
              v-model="signupData.name" 
              placeholder="Entrez votre nom"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="signup-email">Email</label>
            <input 
              type="email" 
              id="signup-email" 
              v-model="signupData.email" 
              placeholder="Entrez votre email"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="signup-password">Mot de passe</label>
            <input 
              type="password" 
              id="signup-password" 
              v-model="signupData.password" 
              placeholder="Créez un mot de passe"
              required
              minlength="6"
            />
          </div>
          
          <div class="form-group">
            <label for="signup-confirm">Confirmer le mot de passe</label>
            <input 
              type="password" 
              id="signup-confirm" 
              v-model="signupData.confirmPassword" 
              placeholder="Confirmez votre mot de passe"
              required
              minlength="6"
            />
          </div>
          
          <button type="submit" class="btn-submit">S'inscrire</button>
          
          <div class="form-footer">
            <a 
              href="#" 
              class="link" 
              @click.prevent="signupStep = 2"
            >
              Informations optionnelles
            </a>
          </div>
        </form>

        <!-- Étape 2: Informations optionnelles -->
        <div v-else class="login-form">
          <div class="form-group">
            <label for="signup-pseudo">Pseudo (optionnel)</label>
            <input 
              type="text" 
              id="signup-pseudo" 
              v-model="signupData.pseudo" 
              placeholder="Choisissez un pseudo"
            />
          </div>
          
          <div class="form-group">
            <label for="signup-age">Âge (optionnel)</label>
            <input 
              type="number" 
              id="signup-age" 
              v-model="signupData.age" 
              placeholder="Votre âge"
              min="1"
              max="120"
            />
          </div>
          
          <div class="form-footer">
            <a 
              href="#" 
              class="link" 
              @click.prevent="signupStep = 1"
            >
              ← Retour
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineOptions({
  name: 'LoginView'
})

const activeForm = ref<'login' | 'signup'>('login')
const signupStep = ref(1)

const loginData = ref({
  email: '',
  password: '',
  stayConnected: false
})

const signupData = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  pseudo: '',
  age: null as number | null
})

const handleLogin = () => {
  console.log('Login attempt:', loginData.value)
  // TODO: Implémenter la logique de connexion
}

const handleSignup = () => {
  if (signupData.value.password !== signupData.value.confirmPassword) {
    alert('Les mots de passe ne correspondent pas')
    return
  }
  console.log('Signup attempt:', signupData.value)
  // TODO: Implémenter la logique d'inscription
}
</script>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  background: white;
  padding: 0;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 420px;
  overflow: hidden;
}

.form-tabs {
  display: flex;
  background: #f5f5f5;
}

.tab-button {
  flex: 1;
  padding: 1rem;
  border: none;
  background: transparent;
  color: #666;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.tab-button:hover {
  background: rgba(102, 126, 234, 0.1);
}

.tab-button.active {
  color: #667eea;
  background: white;
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
  font-size: 1.5rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-weight: 500;
  color: #555;
  font-size: 0.9rem;
}

input {
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

input:focus {
  outline: none;
  border-color: #667eea;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: -0.5rem;
}

.checkbox-group input[type="checkbox"] {
  width: auto;
  cursor: pointer;
  accent-color: #667eea;
}

.checkbox-group label {
  font-weight: 400;
  font-size: 0.9rem;
  cursor: pointer;
  margin: 0;
}

.btn-submit {
  padding: 0.875rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  margin-top: 0.5rem;
}

.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

.btn-submit:active {
  transform: translateY(0);
}

.form-footer {
  display: flex;
  justify-content: center;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.link:hover {
  text-decoration: underline;
}
</style>
