<script setup>
import { ref, computed, onMounted } from 'vue'
import { db, auth } from '../firebase/config'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { Pie, Bar } from 'vue-chartjs'
import {
    Chart as ChartJS, Title, Tooltip, Legend, ArcElement,
    CategoryScale, LinearScale, BarElement
} from 'chart.js'

// Registrar componentes do Chart.js
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, BarElement)

const dadosBrutos = ref([])
const tipoGrafico = ref('pizza') // 'pizza' ou 'coluna'

// Buscar dados em tempo real
onMounted(() => {
    if (auth.currentUser) {
        const q = query(collection(db, 'financas'), where('userId', '==', auth.currentUser.uid))
        onSnapshot(q, (snapshot) => {
            dadosBrutos.value = snapshot.docs.map(doc => doc.data())
        })
    }
})

// Lógica de Soma
const totais = computed(() => {
    const resumo = { custo: 0, investimento: 0 }
    dadosBrutos.value.forEach(item => {
        // Se você não tiver o campo 'tipo', ele somará tudo em custo por padrão
        if (item.tipo === 'Investimento') {
            resumo.investimento += item.valor
        } else {
            resumo.custo += item.valor
        }
    })
    return resumo
})

// Configuração do Gráfico
const chartData = computed(() => ({
    labels: ['Custos', 'Investimentos'],
    datasets: [{
        label: 'Total (R$)',
        data: [totais.value.custo, totais.value.investimento],
        backgroundColor: ['#ff4444', '#0095ff'],
        borderColor: '#1c1c21',
        borderWidth: 2
    }]
}))

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { labels: { color: '#8e8e9e' } }
    }
}
</script>

<template>
    <div class="home-container">
        <header class="dash-header">
            <div class="title-group">
                <h1>Dashboard <span>Financeiro</span></h1>
                <p>Resumo de Custos vs Investimentos</p>
            </div>

            <button class="btn-toggle" @click="tipoGrafico = tipoGrafico === 'pizza' ? 'coluna' : 'pizza'">
                <i class="fa-solid" :class="tipoGrafico === 'pizza' ? 'fa-chart-bar' : 'fa-chart-pie'"></i>
                VER EM {{ tipoGrafico === 'pizza' ? 'COLUNAS' : 'PIZZA' }}
            </button>
        </header>

        <section class="stats-grid">
            <div class="stat-card red">
                <label>TOTAL CUSTOS</label>
                <h2>R$ {{ totais.custo.toFixed(2) }}</h2>
            </div>
            <div class="stat-card blue">
                <label>TOTAL INVESTIMENTOS</label>
                <h2>R$ {{ totais.investimento.toFixed(2) }}</h2>
            </div>
        </section>

        <section class="chart-section">
            <div v-if="dadosBrutos.length > 0" class="chart-wrapper">
                <Pie v-if="tipoGrafico === 'pizza'" :data="chartData" :options="chartOptions"
                    :key="'pie-' + dadosBrutos.length" />
                <Bar v-else :data="chartData" :options="chartOptions" :key="'bar-' + dadosBrutos.length" />
            </div>
            <div v-else class="empty-state">
                <p>Nenhum dado encontrado para gerar o gráfico.</p>
            </div>
        </section>
        <section class="details-legend">
            <div class="legend-column">
                <h3 class="title-custo"><i class="fa-solid fa-circle-arrow-down"></i> Meus Custos</h3>
                <ul>
                    <li v-for="item in dadosBrutos.filter(i => i.tipo !== 'Investimento')" :key="item.id">
                        <span>{{ item.descricao }}</span>
                        <span class="valor-item">R$ {{ item.valor.toFixed(2) }}</span>
                    </li>
                    <li v-if="!dadosBrutos.filter(i => i.tipo !== 'Investimento').length" class="empty-muted">
                        Nenhum custo registrado.
                    </li>
                </ul>
            </div>

            <div class="legend-column">
                <h3 class="title-investimento"><i class="fa-solid fa-circle-arrow-up"></i> Meus Investimentos</h3>
                <ul>
                    <li v-for="item in dadosBrutos.filter(i => i.tipo === 'Investimento')" :key="item.id">
                        <span>{{ item.descricao }}</span>
                        <span class="valor-item">R$ {{ item.valor.toFixed(2) }}</span>
                    </li>
                    <li v-if="!dadosBrutos.filter(i => i.tipo === 'Investimento').length" class="empty-muted">
                        Nenhum investimento registrado.
                    </li>
                </ul>
            </div>
        </section>
    </div>
</template>

<style scoped>
.home-container {
    padding: 40px;
    background-color: #0a0a0c;
    min-height: 100vh;
    color: white;
}

.dash-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    border-bottom: 1px solid #2d2d35;
    padding-bottom: 20px;
}

.title-group h1 span {
    color: #0095ff;
}

.btn-toggle {
    background: #1c1c21;
    border: 1px solid #0095ff;
    color: #0095ff;
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: bold;
    cursor: pointer;
    transition: 0.3s;
    display: flex;
    align-items: center;
    gap: 10px;
}

.btn-toggle:hover {
    background: #0095ff;
    color: white;
}

.stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 30px;
}

.stat-card {
    background: #141417;
    padding: 20px;
    border-radius: 12px;
    border: 1px solid #2d2d35;
}

.stat-card.red {
    border-left: 5px solid #ff4444;
}

.stat-card.blue {
    border-left: 5px solid #0095ff;
}

.stat-card label {
    font-size: 0.7rem;
    color: #8e8e9e;
}

.chart-section {
    background: #141417;
    padding: 30px;
    border-radius: 12px;
    border: 1px solid #2d2d35;
    height: 450px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.chart-wrapper {
    width: 100%;
    height: 100%;
}

.empty-state {
    color: #6a6a7a;
    text-align: center;
}

/* --- LEGENDA DETALHADA --- */
.details-legend {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #2d2d35;
}

.legend-column h3 {
    font-size: 0.9rem;
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    gap: 10px;
}

.title-custo { color: #ff4444; }
.title-investimento { color: #0095ff; }

.legend-column ul {
    list-style: none;
    padding: 0;
    margin: 0;
    max-height: 250px;
    overflow-y: auto; /* Adiciona scroll se a lista crescer muito */
}

/* Estilização da barra de scroll (Opcional) */
.legend-column ul::-webkit-scrollbar {
    width: 5px;
}
.legend-column ul::-webkit-scrollbar-thumb {
    background: #2d2d35;
    border-radius: 10px;
}

.legend-column li {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid #1c1c21;
    font-size: 0.9rem;
    color: #d1d1d6;
}

.legend-column li:last-child {
    border-bottom: none;
}

.valor-item {
    font-weight: bold;
    font-family: 'Courier New', Courier, monospace; /* Toque de terminal */
}

.empty-muted {
    color: #4a4a5a;
    font-style: italic;
    font-size: 0.8rem;
    padding: 10px 0;
}
</style>