<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { collection, addDoc, onSnapshot, query, where, doc, deleteDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/config'
import { onAuthStateChanged } from 'firebase/auth'


// Estado da Lista e Formuário
const custos = ref([])
const descricao = ref('')
const valor = ref('')
const aviso = ref('')
const showModal = ref(false) // Controle de visibilidade do Modal
const carregando = ref(true)

let unsubscribe = null

// Função para abrir/fechar modal
const toggleModal = () => {
    showModal.value = !showModal.value
    aviso.value = ''
    if (!showModal.value) {
        descricao.value = ''
        valor.value = ''
    }
}

// Salvar no Firebase
const SalvarCusto = async () => {
    if (!descricao.value || !valor.value) {
        aviso.value = 'Preencha todos os campos.'
        return
    }

    try {
        await addDoc(collection(db, 'financas'), {
            descricao: descricao.value,
            valor: Number(valor.value),
            userId: auth.currentUser.uid,
            data: new Date().toLocaleDateString('pt-BR'),
            tipo: 'Custo'
        })

        toggleModal()

    } catch (e) {
        console.error(e)
        aviso.value = 'Erro ao salvar no banco de dados.'
    }

}

const DeletarCusto = async (id) => {
    // Confirmação simples para evitar deletar sem querer
    const confirmar = confirm("Tem certeza que deseja excluir este custo?")

    if (confirmar) {
        try {
            // Referencia o documento específico pelo ID e deleta
            await deleteDoc(doc(db, 'financas', id))
            console.log("Custo deletado:", id)
        } catch (e) {
            console.error("Erro ao deletar:", e)
            alert("Não foi possível excluir o item.")
        }
    }
}
// Escutar dados em tempo real
onMounted(() => {
    // Em vez de um "if" seco, usamos o observador que "espera" o login carregar
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Agora sim! O Firebase confirmou que o usuário carregou
            const q = query(
                collection(db, 'financas'),
                where('userId', '==', user.uid)
            )

            unsubscribe = onSnapshot(q, (snapshot) => {
                custos.value = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))
                carregando.value = false
            })
        } else {
            // Se o usuário não estiver logado de verdade, mandamos para o login
            router.push('/')
        }
    })
})

onUnmounted(() => {
    if (unsubscribe) unsubscribe()
})
</script>

<template>
    <div class="view-container">
        <header class="view-header">
            <div class="title-group">
                <h1>Meus <span>Custos</span></h1>
                <p>Gerenciamento de despesas em tempo real</p>
            </div>
            <button class="btn-add" @click="toggleModal">
                <i class="fa-solid fa-plus"></i> ADICIONAR
            </button>
        </header>

        <section class="table-card">
            <div v-if="carregando" class="msg">Carregando...</div>
            <table v-else-if="custos.length" class="custom-table">
                <thead>
                    <tr>
                        <th>DESCRIÇÃO</th>
                        <th>DATA</th>
                        <th>VALOR</th>
                        <th class="text-center">AÇÕES</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in custos.filter(i => i.tipo !== 'Investimento')" :key="item.id">
                        <td>{{ item.descricao }}</td>
                        <td>{{ item.data }}</td>
                        <td class="valor-verde">R$ {{ item.valor.toFixed(2) }}</td>
                        <td class="text-center">
                            <button class="btn-delete" @click="DeletarCusto(item.id)" title="Excluir">
                                <i class="fa-solid fa-trash-can"></i>
                                <span>Excluir</span>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div v-else class="msg">Nenhum custo encontrado.</div>
        </section>

        <Transition name="fade">
            <div v-if="showModal" class="modal-overlay" @click.self="toggleModal">
                <div class="modal-content">
                    <header class="modal-header">
                        <h2>Novo Lançamento</h2>
                        <button @click="toggleModal" class="close-btn">&times;</button>
                    </header>

                    <div class="modal-body">
                        <label>Descrição</label>
                        <input v-model="descricao" type="text" placeholder="Ex: Servidor AWS" />

                        <label>Valor (R$)</label>
                        <input v-model="valor" type="number" step="0.01" placeholder="0.00" />

                        <p v-if="aviso" class="error-text">{{ aviso }}</p>
                    </div>

                    <footer class="modal-footer">
                        <button class="btn-cancel" @click="toggleModal">CANCELAR</button>
                        <button class="btn-save" @click="SalvarCusto">SALVAR CUSTO</button>
                    </footer>
                </div>
            </div>
        </Transition>
    </div>
</template>

<style scoped>
/* --- CONTAINER PRINCIPAL --- */
.view-container {
    padding: 40px;
    color: white;
    min-height: 100vh;
    background-color: #0a0a0c;
}

.view-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    border-bottom: 1px solid #2d2d35;
    padding-bottom: 20px;
}

.title-group h1 {
    font-size: 1.8rem;
    margin: 0;
}

.title-group h1 span {
    color: #0095ff;
}

.title-group p {
    color: #6a6a7a;
    font-size: 0.9rem;
    margin-top: 5px;
}


/* --- BOTÃO ADICIONAR (VERDE) --- */
.btn-add {
    background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
    color: white;
    border: none;
    padding: 12px 25px;
    border-radius: 8px;
    font-weight: bold;
    font-size: 0.8rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(46, 204, 113, 0.2);
}

.btn-add:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(46, 204, 113, 0.4);
}

/* --- TABELA CORRIGIDA E ALINHADA --- */
.table-card {
    background: #141417;
    border-radius: 12px;
    border: 1px solid #2d2d35;
    overflow: hidden;
    width: 100%;
    margin-top: 20px;
}

.custom-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    /* Força as colunas a respeitarem as larguras definidas */
}

.custom-table th {
    padding: 18px;
    background: #1c1c21;
    color: #8e8e9e;
    font-size: 0.75rem;
    letter-spacing: 1px;
    text-transform: uppercase;
    border-bottom: 2px solid #2d2d35;
    text-align: left;
    /* Alinhamento padrão */
}

.custom-table td {
    padding: 16px 18px;
    border-bottom: 1px solid #1c1c21;
    color: #d1d1d6;
    font-size: 0.95rem;
    vertical-align: middle;
    text-align: left;
    /* Alinhamento padrão */
}

/* --- CLASSES DE ALINHAMENTO ESPECÍFICO --- */
/* Use estas classes tanto no <th> quanto no <td> correspondente */
.text-center {
    text-align: center !important;
}

.text-right {
    text-align: right !important;
    padding-right: 30px !important;
}

/* Descrição */
.custom-table th:nth-child(1),
.custom-table td:nth-child(1) {
    width: 35%;
}


.custom-table th:nth-child(2),
.custom-table td:nth-child(2) {
    width: 20%;
}

/* Valor */
.custom-table th:nth-child(3),
.custom-table td:nth-child(3) {
    width: 20%;
}

/* Ações */
.custom-table th:nth-child(4),
.custom-table td:nth-child(4) {
    width: 20%;
}


.valor-verde {
    color: #2ecc71;
    font-weight: bold;
}

.custom-table tr:last-child td {
    border-bottom: none;
}

/* --- BOTÃO DELETAR --- */
.btn-delete {
    background: transparent;
    border: 1px solid #3d3d45;
    color: #8e8e9e;

    /* Aumentei o padding e o tamanho da fonte */
    padding: 10px 20px;
    font-size: 0.95rem;
    font-weight: 600;

    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    gap: 10px;

    /* Centraliza o botão dentro da célula se ela tiver largura fixa */
    margin: 0 auto;
}

.btn-delete i {
    font-size: 1.1rem;
    /* Ícone maior */
}

.btn-delete:hover {
    background: rgba(255, 68, 68, 0.15);
    border-color: #ff4444;
    color: #ff4444;
    transform: scale(1.05);
}

/* --- MODAL --- */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    backdrop-filter: blur(5px);
}

.modal-content {
    background: #1c1c21;
    width: 90%;
    max-width: 450px;
    border-radius: 16px;
    border: 1px solid #2d2d35;
    padding: 30px;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
}

.close-btn {
    background: none;
    border: none;
    color: #6a6a7a;
    font-size: 1.8rem;
    cursor: pointer;
}

.close-btn:hover {
    color: #ff4444;
}

.modal-body {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.modal-body label {
    font-size: 0.75rem;
    font-weight: bold;
    color: #8e8e9e;
    text-transform: uppercase;
}

.modal-body input {
    background: #0a0a0c;
    border: 1px solid #2d2d35;
    padding: 12px;
    color: white;
    border-radius: 8px;
}

.modal-body input:focus {
    outline: none;
    border-color: #0095ff;
}

.modal-footer {
    display: flex;
    gap: 12px;
    margin-top: 35px;
}

.btn-cancel {
    flex: 1;
    background: transparent;
    color: #8e8e9e;
    border: 1px solid #2d2d35;
    padding: 12px;
    border-radius: 8px;
    cursor: pointer;
}

.btn-save {
    flex: 2;
    background: #0095ff;
    color: white;
    border: none;
    padding: 12px;
    border-radius: 8px;
    font-weight: bold;
    cursor: pointer;
}

.btn-save:hover {
    filter: brightness(1.2);
}

/* --- ANIMAÇÕES --- */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>