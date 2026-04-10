<script setup>
// 1. TODAS AS IMPORTAÇÕES NO TOPO
import { computed } from 'vue'
import { useAuthStore } from '../src/store/authStore' // Verifique se o caminho está correto
import { useRouter } from 'vue-router'

// 2. TODA A LÓGICA DE CONSTANTES E FUNÇÕES
const authStore = useAuthStore()
const router = useRouter()

// Computada para pegar o email do usuário logado
const userEmail = computed(() => authStore.user?.email || 'Deslogado')

// Função de Logout
const handleLogout = async () => {
  try {
    await authStore.logout() // Chama o logout na sua store
    router.push('/')    // Redireciona para a tela de login
  } catch (error) {
    console.error("Erro ao sair:", error)
  }
}

</script>

<template>
  <div class="layout">
    <header class="topbar">
      <div class="brand">
        <i class="fa-solid fa-fire logo-icon"></i>
        <h2>CONTROL EXPENSES</h2>
      </div>

      <div v-if="authStore.user" class="user-status">
        <span class="user-email">{{ userEmail }}</span>
      </div>
    </header>

    <nav v-if="authStore.user" class="menu-nav">
      <div class="nav-links">
        <router-link to="/home"><i class="fa-solid fa-house"></i> Início</router-link>
        <router-link to="/custos"><i class="fa-solid fa-chart-line"></i> Custos</router-link>
        <router-link to="/investimentos"><i class="fa-solid fa-user-gear"></i> Investimentos</router-link>
      </div>

      <button class="logout-btn" @click="handleLogout">
        <i class="fa-solid fa-right-from-bracket"></i> Sair
      </button>
    </nav>

    <main class="content">
      <router-view></router-view>
    </main>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body,
#app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  background-color: #0a0a0c;
  /* Cor de fundo padrão */
}

/* Adicione aqui os estilos que passei anteriormente para a topbar e menu-nav */
.topbar {
  display: flex;
  justify-content: space-between;
  padding: 15px 40px;
  background: #0a0a0c;
  color: white;
  border-bottom: 1px solid #2d2d35;
}

.menu-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #141417;
  padding: 10px 40px;
  border-bottom: 1px solid #2d2d35;
}

.nav-links {
  display: flex;
  gap: 20px;
}

.nav-links a {
  color: #8e8e9e;
  text-decoration: none;
  font-weight: 600;
}

.nav-links a:hover,
.router-link-active {
  color: #0095ff;
}

.logout-btn {
  background: transparent;
  border: 1px solid #e53e3e;
  color: #e53e3e;
  padding: 5px 15px;
  border-radius: 6px;
  cursor: pointer;
}

.logout-btn:hover {
  background: #e53e3e;
  color: white;
}
</style>