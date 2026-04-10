<script setup>
// Tela de login simples com email e senha
// Aqui o aluno consegue criar conta e entrar sem complicacao.
// O objetivo e so testar o fluxo, nao fazer design perfeito.
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from 'firebase/auth'
import { auth } from '../firebase/config'

const router = useRouter()

// Campos do formulario (ligados nos inputs com v-model)
const email = ref('')
const senha = ref('')
const erro = ref('')
const criado = ref('') // Verifique se essa linha existe!

// Entrar com email e senha
// Se der erro, mostramos uma msg amigavel
const entrar = async () => {
    erro.value = ''
    try {
        // Firebase verifica email + senha
        await signInWithEmailAndPassword(auth, email.value, senha.value)
        // Deu certo? manda para o dashboard
        router.push('/home')
    } catch (e) {
        erro.value = 'Nao foi possivel entrar. Verifique email e senha.'
    }
}

// Criar conta simples
// Depois de cadastrar, ja manda pro dashboard
const registrar = async () => {
    erro.value = ''
    criado.value = ''
    try {
        // Firebase cria o usuario
        await createUserWithEmailAndPassword(auth, email.value, senha.value)
        // Depois de criar, ja vamos direto para o dashboard
        criado.value = 'Usuário criado com sucesso'
    } catch (e) {
        erro.value = 'Nao foi possivel cadastrar. Verifique os dados.'
    }
}


</script>

<template>
    <div class="login-container">
        <section class="auth-card">
            <div class="glow-effect"></div>

            <header class="auth-header">
                <i class="fa-solid fa-shield-halved logo-icon"></i>
                <h1>CONTROL <span>EXPENSES</span></h1>
                <p class="subtitle">Acesse o terminal de controle</p>
            </header>

            <div class="form-group">
                <label>IDENTIFICAÇÃO (EMAIL)</label>
                <div class="input-wrapper">
                    <i class="fa-solid fa-user"></i>
                    <input v-model="email" type="email" placeholder="usuario@cyber.com" />
                </div>
            </div>

            <div class="form-group">
                <label>CHAVE DE ACESSO (SENHA)</label>
                <div class="input-wrapper">
                    <i class="fa-solid fa-lock"></i>
                    <input v-model="senha" type="password" placeholder="••••••••" />
                </div>
            </div>

            <div class="actions">
                <button class="btn-primary" @click="entrar">
                    <span>ENTRAR NO SISTEMA</span>
                    <i class="fa-solid fa-bolt"></i>
                </button>

                <button class="btn-secondary" @click="registrar">
                    <span>REGISTRAR</span>
                    <i class="fa-solid fa-user-plus"></i>
                </button>
            </div>

            <transition name="fade">
                <p v-if="erro" class="error-msg">
                    <i class="fa-solid fa-circle-exclamation"></i> {{ erro }}
                </p>
            </transition>

            <transition name="fade">
                <p v-if="criado" class="certo-msg">
                    <i class="fa-solid fa-circle-check"></i> {{ criado }}
                </p>
            </transition>
        </section>
    </div>
</template>

<style scoped>
/* Fundo da tela */
.login-container {
    /* Ocupa a tela toda */
    width: 100vw;
    height: 100vh;

    /* Centraliza o card */
    display: flex;
    justify-content: center;
    align-items: center;

    /* Cor preta profunda */
    background-color: #0a0a0c;

    /* Garante que fique por cima de qualquer margem */
    position: fixed;
    top: 0;
    left: 0;
    z-index: 999;
}

/* Card Futurista */
.auth-card {
    position: relative;
    width: 100%;
    max-width: 400px;
    background: #141417;
    padding: 40px;
    border-radius: 16px;
    border: 1px solid #2d2d35;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
    overflow: hidden;
}

/* Efeito de brilho no topo */
.glow-effect {
    position: absolute;
    top: -50px;
    left: 50%;
    transform: translateX(-50%);
    width: 200px;
    height: 100px;
    background: radial-gradient(circle, rgba(0, 149, 255, 0.2) 0%, transparent 70%);
    pointer-events: none;
}

/* Cabeçalho */
.auth-header {
    text-align: center;
    margin-bottom: 30px;
}

.logo-icon {
    font-size: 2.5rem;
    color: #0095ff;
    margin-bottom: 15px;
    filter: drop-shadow(0 0 8px rgba(0, 149, 255, 0.5));
}

.auth-header h1 {
    color: white;
    font-size: 1.5rem;
    letter-spacing: 2px;
    margin: 0;
}

.auth-header h1 span {
    color: #0095ff;
}

.subtitle {
    color: #6a6a7a;
    font-size: 0.85rem;
    margin-top: 5px;
}

/* Inputs */
.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    color: #8e8e9e;
    font-size: 0.7rem;
    font-weight: 700;
    margin-bottom: 8px;
    letter-spacing: 1px;
}

.input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.input-wrapper i {
    position: absolute;
    left: 15px;
    color: #4a4a5a;
}

.input-wrapper input {
    width: 100%;
    padding: 12px 15px 12px 45px;
    background: #1c1c21;
    border: 1px solid #2d2d35;
    border-radius: 8px;
    color: white;
    transition: all 0.3s ease;
}

.input-wrapper input:focus {
    outline: none;
    border-color: #0095ff;
    background: #23232a;
    box-shadow: 0 0 10px rgba(0, 149, 255, 0.2);
}

/* Botão Azul Futurista */
.btn-primary {
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg, #007cf0 0%, #00dfd8 100%);
    /* Degradê Azul */
    border: none;
    border-radius: 8px;
    color: white;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    transition: all 0.3s ease;
    margin-top: 10px;
}

.btn-primary:hover {
    transform: translateY(-2px);
    filter: brightness(1.1);
    box-shadow: 0 8px 20px rgba(0, 149, 255, 0.4);
}

.btn-primary:active {
    transform: translateY(0);
}

/* Botão de Registrar Pequeno e Verde */
.btn-secondary {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    
    /* Tamanho menor */
    width: auto; 
    margin: 20px auto 0 auto; /* Centraliza e dá espaço do botão de cima */
    padding: 8px 20px;
    
    /* Estilo Verde Futurista */
    background: transparent;
    border: 1px solid #27ae60;
    border-radius: 20px; /* Bordas bem arredondadas */
    color: #27ae60;
    
    font-size: 0.75rem; /* Fonte menor */
    font-weight: 700;
    letter-spacing: 1px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-secondary:hover {
    background: rgba(39, 174, 96, 0.1);
    box-shadow: 0 0 12px rgba(39, 174, 96, 0.3);
    transform: translateY(-1px);
}

.btn-secondary i {
    font-size: 0.7rem;
}

/* Erro */
.error-msg {
    background: rgba(255, 68, 68, 0.1);
    color: #ff4444;
    padding: 10px;
    border-radius: 6px;
    font-size: 0.8rem;
    margin-top: 20px;
    text-align: center;
    border: 1px solid rgba(255, 68, 68, 0.2);
}
.certo-msg {
    background: rgba(46, 204, 132, 0.1);
    color: #2ecc71;
    padding: 10px;
    border-radius: 6px;
    font-size: 0.8rem;
    margin-top: 20px;
    text-align: center;
    border: 1px solid rgba(46, 204, 132, 0.2);
}

/* Animações */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>