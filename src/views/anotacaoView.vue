<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { collection, addDoc, onSnapshot, query, where, doc, deleteDoc, serverTimestamp, orderBy } from 'firebase/firestore'
import { auth, db } from '../firebase/config'
import { onAuthStateChanged } from 'firebase/auth'

// Estados
const notas = ref([])
const notaSelecionada = ref(null)
const showModal = ref(false)
const carregando = ref(true)

// Campos do Formulário
const titulo = ref('')
const conteudo = ref('')
const aviso = ref('')

let unsubscribe = null

const toggleModal = () => {
    showModal.value = !showModal.value
    if (!showModal.value) {
        titulo.value = ''
        conteudo.value = ''
        aviso.value = ''
    }
}

const selecionarNota = (nota) => {
    notaSelecionada.value = nota
}

// Salvar no Firebase
const SalvarNota = async () => {
    // 1. Validação básica
    if (!titulo.value.trim() || !conteudo.value.trim()) {
        aviso.value = 'Preencha o título e o conteúdo da nota.'
        return
    }

    try {
        console.log("Tentando salvar nota para o usuário:", auth.currentUser.uid);

        // 2. Gravação no banco
        await addDoc(collection(db, 'anotacoes'), {
            titulo: titulo.value,
            conteudo: conteudo.value,
            userId: auth.currentUser.uid, // O ID do usuário logado
            dataCriacao: serverTimestamp(), // Importe isso do 'firebase/firestore'
            dataFormatada: new Date().toLocaleDateString('pt-BR')
        })

        console.log("Nota salva com sucesso!");

        // 3. Limpar e fechar
        toggleModal()

    } catch (e) {
        console.error("Erro detalhado ao salvar:", e);
        aviso.value = 'Erro ao conectar com o Firebase. Verifique sua internet ou permissões.'
    }
}

const DeletarNota = async (id) => {
    if (confirm("Deseja excluir esta anotação?")) {
        try {
            await deleteDoc(doc(db, 'anotacoes', id))
            if (notaSelecionada.value?.id === id) notaSelecionada.value = null
        } catch (e) {
            console.error(e)
        }
    }
}

onMounted(() => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const q = query(
                collection(db, 'anotacoes'),
                where('userId', '==', user.uid),
                //orderBy('dataCriacao', 'desc')
            )

            unsubscribe = onSnapshot(q, (snapshot) => {
                notas.value = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))
                carregando.value = false
            })
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
                <h1>Minhas <span>Anotações</span></h1>
                <p>Anotações De Gastos Previstos</p>
            </div>
            <button class="btn-add" @click="toggleModal">
                <i class="fa-solid fa-plus"></i> NOVA NOTA
            </button>
        </header>

        <div class="main-layout">
            <section class="viewer-area">
                <Transition name="fade" mode="out-in">
                    <div v-if="notaSelecionada" :key="notaSelecionada.id" class="note-display">
                        <div class="note-display-header">
                            <span class="date-badge">{{ notaSelecionada.dataFormatada }}</span>
                            <h2>{{ notaSelecionada.titulo }}</h2>
                        </div>
                        <div class="note-display-body">
                            <p>{{ notaSelecionada.conteudo }}</p>
                        </div>
                        <button class="btn-delete-view" @click="DeletarNota(notaSelecionada.id)">
                            <i class="fa-solid fa-trash"></i> EXCLUIR ESTA NOTA
                        </button>
                    </div>
                    <div v-else class="empty-state">
                        <i class="fa-regular fa-sticky-note"></i>
                        <p>Selecione uma nota ao lado para visualizar os detalhes.</p>
                    </div>
                </Transition>
            </section>

            <aside class="cards-sidebar">
                <div v-if="carregando" class="msg">Carregando notas...</div>
                <div v-else class="scroll-area">
                    <div v-for="nota in notas" :key="nota.id" class="note-card"
                        :class="{ active: notaSelecionada?.id === nota.id }" @click="selecionarNota(nota)">
                        <div class="card-content">
                            <h3>{{ nota.titulo }}</h3>
                            <p>{{ nota.conteudo.substring(0, 60) }}{{ nota.conteudo.length > 60 ? '...' : '' }}</p>
                            <span class="card-date">{{ nota.dataFormatada }}</span>
                        </div>

                        <button class="btn-delete-card" @click.stop="DeletarNota(nota.id)" title="Excluir Nota">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                    <div v-if="!notas.length && !carregando" class="msg">Nenhuma nota criada.</div>
                </div>
            </aside>
        </div>

        <Transition name="fade">
            <div v-if="showModal" class="modal-overlay" @click.self="toggleModal">
                <div class="modal-content">
                    <header class="modal-header">
                        <h2>Nova Anotação</h2>
                        <button @click="toggleModal" class="close-modal-btn">
                            <i class="fa-solid fa-xmark">X</i>
                        </button>
                    </header>

                    <div class="modal-body">
                        <label>Título</label>
                        <input v-model="titulo" type="text" placeholder="Ex: Ideias para o TCC" />
                        <label>Conteúdo</label>
                        <textarea v-model="conteudo" rows="6" placeholder="Escreva sua nota aqui..."></textarea>
                        <p v-if="aviso" class="error-text">{{ aviso }}</p>
                    </div>

                    <footer class="modal-footer">
                        <button class="btn-cancel" @click="toggleModal">CANCELAR</button>
                        <button class="btn-save" @click="SalvarNota">SALVAR NOTA</button>
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
    display: flex;
    flex-direction: column;
}

/* --- CABEÇALHO (Espaçamento Corrigido) --- */
.view-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40px;
    border-bottom: 1px solid #2d2d35;
    padding-bottom: 25px;
}

.title-group h1 {
    font-size: 2.2rem;
    margin: 0;
    line-height: 1.2;
}

.title-group h1 span {
    color: #0095ff;
}

.title-group p {
    color: #8e8e9e;
    font-size: 1rem;
    margin-top: 12px;
    /* Espaço entre título e subtítulo */
    letter-spacing: 0.5px;
}

/* --- LAYOUT PRINCIPAL --- */
.main-layout {
    display: flex;
    gap: 35px;
    flex: 1;
    min-height: 550px;
}

/* ÁREA DE LEITURA (ESQUERDA) */
.viewer-area {
    flex: 1;
    background: #141417;
    border-radius: 16px;
    border: 1px solid #2d2d35;
    padding: 45px;
    min-height: 450px;
    overflow-y: auto;
    box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.2);
}

.note-display h2 {
    font-size: 2rem;
    color: #0095ff;
    margin-bottom: 20px;
}

.date-badge {
    background: #1c1c21;
    padding: 5px 12px;
    border-radius: 6px;
    font-size: 0.8rem;
    color: #8e8e9e;
    margin-bottom: 10px;
    display: inline-block;
}

.btn-delete-view {
    margin-top: 30px;
    background: transparent;
    border: 1px solid #ff4444;
    color: #ff4444;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
    transition: 0.3s;
}

.btn-delete-view:hover {
    background: rgba(255, 68, 68, 0.1);
}

/* BARRA LATERAL (DIREITA) */
.cards-sidebar {
    width: 380px;
    display: flex;
    flex-direction: column;
}

.scroll-area {
    overflow-y: auto;
    max-height: calc(100vh - 280px);
    padding-right: 10px;
}

/* --- ESTILO DO CARD --- */
.note-card {
    background: #1c1c21;
    border: 1px solid #2d2d35;
    padding: 22px;
    border-radius: 14px;
    margin-bottom: 18px;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    
    /* AJUSTES DE ALINHAMENTO */
    display: flex;
    flex-direction: row; /* Mantém ícone e texto na mesma linha se necessário */
    justify-content: flex-start; /* Alinha o conteúdo no início (esquerda) */
    align-items: flex-start; /* Alinha os itens no topo */
    text-align: left; /* Garante que o texto dentro dele vá para a esquerda */
    
    padding-right: 55px;
}

.note-card:hover {
    border-color: #0095ff;
    background: #25252b;
    transform: translateY(-2px);
}

.note-card.active {
    border-left: 5px solid #0095ff;
    background: #25252b;
    box-shadow: 0 4px 15px rgba(0, 149, 255, 0.1);
}

.card-content {
    display: flex;
    flex-direction: column;
    align-items: flex-start; /* Força os elementos internos (h3, p, span) para a esquerda */
    width: 100%;
}

.card-content h3 {
    font-size: 1.1rem;
    margin-bottom: 5px;
    text-align: left; /* Alinhamento explícito do título */
    width: 100%;
}

.card-content p {
    font-size: 0.9rem;
    color: #8e8e9e;
    margin-bottom: 8px;
}

.card-date {
    font-size: 0.75rem;
    color: #6a6a7a;
}

/* BOTÃO LIXEIRA NO CARD */
.btn-delete-card {
    position: absolute;
    top: 18px;
    right: 18px;
    background: transparent;
    border: none;
    color: #4a4a5a;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 6px;
    border-radius: 8px;
    transition: all 0.2s ease;
}

.btn-delete-card:hover {
    background: rgba(255, 68, 68, 0.15);
    color: #ff4444 !important;
}

/* --- MODAL --- */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    backdrop-filter: blur(10px);
}

.modal-content {
    background: #1c1c21;
    width: 90%;
    max-width: 550px;
    padding: 35px;
    border-radius: 20px;
    border: 1px solid #3d3d45;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.close-modal-btn {
    background: #2d2d35;
    border: none;
    color: #8e8e9e;
    width: 35px;
    height: 35px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.3s ease;
}

.close-modal-btn:hover {
    background: #ff4444;
    color: white;
    transform: rotate(90deg);
}

/* --- FORMULÁRIO DO MODAL --- */
.modal-body {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.modal-body label {
    font-size: 0.85rem;
    font-weight: bold;
    color: #8e8e9e;
    text-transform: uppercase;
}

.modal-body input,
.modal-body textarea {
    background: #0a0a0c;
    border: 1px solid #2d2d35;
    padding: 12px;
    color: white;
    border-radius: 10px;
}

.modal-footer {
    display: flex;
    gap: 15px;
    margin-top: 30px;
}

.btn-cancel {
    flex: 1;
    background: transparent;
    border: 1px solid #2d2d35;
    color: #8e8e9e;
    padding: 12px;
    border-radius: 10px;
    cursor: pointer;
}

.btn-save {
    flex: 2;
    background: #0095ff;
    border: none;
    color: white;
    padding: 12px;
    border-radius: 10px;
    font-weight: bold;
    cursor: pointer;
}

/* --- BOTÃO NOVA NOTA --- */
.btn-add {
    background: #0095ff;
    color: white;
    padding: 12px 24px;
    border-radius: 10px;
    border: none;
    font-weight: bold;
    cursor: pointer;
    transition: 0.3s;
}

.btn-add:hover {
    filter: brightness(1.1);
}

/* --- MENSAGENS E ESTADOS --- */
.msg {
    text-align: center;
    color: #6a6a7a;
    padding: 20px;
}

.error-text {
    color: #ff4444;
    font-size: 0.85rem;
}

.empty-state {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: #4a4a5a;
    gap: 15px;
}

.empty-state i {
    font-size: 3.5rem;
}
</style>