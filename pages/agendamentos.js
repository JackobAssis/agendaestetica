
/**
 * Agendamentos Page with Charts & Filters
 * Reference: ROADMAP-IMPLEMENTACAO.md - Semana 3
 */

import { obterUsuarioAtual } from '../modules/auth.js';
import { listAgendamentosEmpresa, confirmarAgendamento, cancelarAgendamento } from '../modules/agendamentos.js';
import { showToast } from '../modules/feedback.js';

const lista = document.getElementById('lista-agendamentos');
const btnFilter = document.getElementById('btn-filter');
const btnClear = document.getElementById('btn-clear');
const dateStart = document.getElementById('filter-date-start');
const dateEnd = document.getElementById('filter-date-end');
const filterStatus = document.getElementById('filter-status');
const countDisplay = document.getElementById('count-display');

let agendamentos = [];
let chartAgendamentosDia = null;
let chartStatus = null;

/**
 * Initialize page
 */
async function init() {
    setupEventListeners();
    await carregarLista();
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    btnFilter.addEventListener('click', () => filtrarLista());
    btnClear.addEventListener('click', () => limparFiltros());
    
    // Enter key on inputs
    dateStart.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') filtrarLista();
    });
    dateEnd.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') filtrarLista();
    });
    filterStatus.addEventListener('change', () => filtrarLista());
}

/**
 * Format date for display
 */
function formatDate(iso) {
    const d = new Date(iso);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

/**
 * Format date for chart labels
 */
function formatDateChart(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

/**
 * Build agendamento card
 */
function buildCard(item) {
    const div = document.createElement('div');
    div.className = 'agendamento-card';
    div.innerHTML = `
        <div class="ag-header">
            <div class="ag-cliente">
                <strong>${item.nomeCliente || item.clienteUid || 'Cliente'}</strong>
                <span class="ag-servico">${item.servico || 'Serviço'}</span>
            </div>
            <div class="ag-status status-${item.status}">${item.status}</div>
        </div>
        <div class="ag-body">
            <div class="ag-time">
                <span class="ag-icon">📅</span>
                ${formatDate(item.inicio)} - ${formatDate(item.fim)}
            </div>
            ${item.valor ? `<div class="ag-valor">💰 R$ ${item.valor.toFixed(2)}</div>` : ''}
        </div>
        <div class="ag-actions">
            ${item.status === 'solicitado' ? '<button class="btn-confirm">✅ Confirmar</button>' : ''}
            ${item.status !== 'cancelado' ? '<button class="btn-cancel">❌ Cancelar</button>' : ''}
        </div>
    `;

    // Confirm handler
    if (item.status === 'solicitado') {
        const b = div.querySelector('.btn-confirm');
        b.addEventListener('click', async () => {
            try {
                b.disabled = true;
                b.textContent = 'Confirmando...';
                await confirmarAgendamento(obterUsuarioAtual().empresaId, item.id);
                showToast('Agendamento confirmado!', 'success');
                setTimeout(() => window.location.reload(), 1000);
            } catch (err) {
                console.error('Erro confirmar', err);
                showToast(err.message || 'Erro ao confirmar', 'error');
                b.disabled = false;
                b.textContent = '✅ Confirmar';
            }
        });
    }

    // Cancel handler
    const bc = div.querySelector('.btn-cancel');
    if (bc) {
        bc.addEventListener('click', async () => {
            if (!confirm('Tem certeza que deseja cancelar?')) return;
            try {
                bc.disabled = true;
                bc.textContent = 'Cancelando...';
                await cancelarAgendamento(obterUsuarioAtual().empresaId, item.id, 'Cancelado pelo profissional');
                showToast('Agendamento cancelado', 'info');
                setTimeout(() => window.location.reload(), 1000);
            } catch (err) {
                console.error('Erro cancelar', err);
                showToast(err.message || 'Erro ao cancelar', 'error');
                bc.disabled = false;
                bc.textContent = '❌ Cancelar';
            }
        });
    }

    return div;
}

/**
 * Carregar lista de agendamentos
 */
async function carregarLista() {
    lista.innerHTML = '<div class="loading-state">Carregando agendamentos...</div>';
    
    try {
        const usuario = obterUsuarioAtual();
        if (!usuario || !usuario.empresaId) {
            window.location.href = '/login';
            return;
        }

        const opts = {};
        if (dateStart.value && dateEnd.value) {
            opts.start = new Date(dateStart.value).toISOString();
            opts.end = new Date(dateEnd.value + 'T23:59:59').toISOString();
        }
        
        // Apply status filter locally if not provided by API
        agendamentos = await listAgendamentosEmpresa(usuario.empresaId, opts);
        
        renderizarLista();
        atualizarStats();
        renderizarCharts();
        
    } catch (err) {
        console.error('Erro carregar agendamentos', err);
        lista.innerHTML = '<div class="error-state">Erro ao carregar agendamentos</div>';
    }
}

/**
 * Filtrar lista
 */
function filtrarLista() {
    const statusFiltro = filterStatus.value;
    
    let filtrados = [...agendamentos];
    
    if (statusFiltro) {
        filtrados = filtrados.filter(a => a.status === statusFiltro);
    }
    
    renderizarListaFiltrada(filtrados);
}

/**
 * Limpar filtros
 */
function limparFiltros() {
    dateStart.value = '';
    dateEnd.value = '';
    filterStatus.value = '';
    renderizarLista();
}

/**
 * Renderizar lista completa
 */
function renderizarLista() {
    renderizarListaFiltrada(agendamentos);
    atualizarStats();
    renderizarCharts();
}

/**
 * Renderizar lista filtrada
 */
function renderizarListaFiltrada(items) {
    lista.innerHTML = '';
    
    countDisplay.textContent = `${items.length} agendamento${items.length !== 1 ? 's' : ''}`;
    
    if (!items.length) {
        lista.innerHTML = '<div class="empty-state">Nenhum agendamento encontrado</div>';
        return;
    }

    // Sort by date
    items.sort((a, b) => new Date(a.inicio) - new Date(b.inicio));
    
    items.forEach(a => {
        lista.appendChild(buildCard(a));
    });
}

/**
 * Atualizar estatísticas
 */
function atualizarStats() {
    const confirmados = agendamentos.filter(a => a.status === 'confirmado').length;
    const pendentes = agendamentos.filter(a => a.status === 'solicitado').length;
    const cancelados = agendamentos.filter(a => a.status === 'cancelado').length;
    
    document.getElementById('count-confirmados').textContent = confirmados;
    document.getElementById('count-pendentes').textContent = pendentes;
    document.getElementById('count-cancelados').textContent = cancelados;
    document.getElementById('count-total').textContent = agendamentos.length;
}

/**
 * Renderizar gráficos
 */
function renderizarCharts() {
    renderChartAgendamentosDia();
    renderChartStatus();
}

/**
 * Gráfico de agendamentos por dia
 */
function renderChartAgendamentosDia() {
    const ctx = document.getElementById('chart-agendamentos-dia');
    if (!ctx) return;

    // Group by day
    const porDia = {};
    agendamentos.forEach(a => {
        const dia = formatDateChart(a.inicio);
        porDia[dia] = (porDia[dia] || 0) + 1;
    });

    // Sort by date
    const labels = Object.keys(porDia).sort((a, b) => {
        const da = a.split('/').reverse().join('-');
        const db = b.split('/').reverse().join('-');
        return new Date(da) - new Date(db);
    });

    const data = labels.map(l => porDia[l]);

    if (chartAgendamentosDia) {
        chartAgendamentosDia.destroy();
    }

    chartAgendamentosDia = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Agendamentos',
                data: data,
                backgroundColor: 'rgba(107, 70, 193, 0.6)',
                borderColor: 'rgba(107, 70, 193, 1)',
                borderWidth: 1,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

/**
 * Gráfico de status
 */
function renderChartStatus() {
    const ctx = document.getElementById('chart-status');
    if (!ctx) return;

    const confirmados = agendamentos.filter(a => a.status === 'confirmado').length;
    const pendentes = agendamentos.filter(a => a.status === 'solicitado').length;
    const cancelados = agendamentos.filter(a => a.status === 'cancelado').length;

    if (chartStatus) {
        chartStatus.destroy();
    }

    chartStatus = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Confirmados', 'Pendentes', 'Cancelados'],
            datasets: [{
                data: [confirmados, pendentes, cancelados],
                backgroundColor: [
                    'rgba(72, 187, 120, 0.7)',
                    'rgba(236, 201, 75, 0.7)',
                    'rgba(245, 101, 101, 0.7)'
                ],
                borderColor: [
                    'rgba(72, 187, 120, 1)',
                    'rgba(236, 201, 75, 1)',
                    'rgba(245, 101, 101, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);

export { init, formatDate, buildCard, carregarLista, filtrarLista, limparFiltros };

