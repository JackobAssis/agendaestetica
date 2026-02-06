/**
 * Página do Cliente
 * 
 * Responsibilities:
 * - Exibir dados do profissional (identidade visual)
 * - Mostrar próximo agendamento do cliente
 * - Permitir solicitação de troca de data/horário
 * - Permitir cancelamento de agendamento
 * - Exibir histórico de agendamentos
 * - Exibir cursos (condicional)
 * 
 * Reference: paginadocliente.md e prompt_paginadocliente.md
 */

import { 
    obterUsuarioAtual, 
    logout, 
    verificarSessao 
} from '../modules/auth.js';

import { 
    listAgendamentosCliente, 
    solicitarRemarcacao, 
    cancelarAgendamento 
} from '../modules/agendamentos.js';

import { 
    generateSlotsForDate 
} from '../modules/agenda.js';

import { 
    getFirebaseDB, 
    doc, 
    getDoc 
} from '../modules/firebase.js';

// ============================================================
// DOM Elements
// ============================================================

const loadingState = document.getElementById('loading-state');
const errorState = document.getElementById('error-state');
const errorMessage = document.getElementById('error-message');
const mainContent = document.getElementById('main-content');
const feedbackMessage = document.getElementById('feedback-message');

// Profissional elements
const profissionalBanner = document.getElementById('profissional-banner');
const bannerInitial = document.getElementById('banner-initial');
const profissionalNome = document.getElementById('profissional-nome');
const profissionalProfissao = document.getElementById('profissional-profissao');

// Agendamento elements
const comAgendamento = document.getElementById('com-agendamento');
const semAgendamento = document.getElementById('sem-agendamento');
const agendamentoDataHora = document.getElementById('agendamento-data-hora');
const agendamentoServico = document.getElementById('agendamento-servico');
const agendamentoStatus = document.getElementById('agendamento-status');
const btnSolicitarTroca = document.getElementById('btn-solicitar-troca');
const btnCancelarAgendamento = document.getElementById('btn-cancelar-agendamento');

// Histórico elements
const historicoLista = document.getElementById('historico-lista');

// Cursos elements
const secaoCursos = document.getElementById('secao-cursos');
const cursosLista = document.getElementById('cursos-lista');

// Perfil elements
const clienteNome = document.getElementById('cliente-nome');
const clienteEmail = document.getElementById('cliente-email');
const clienteTelefone = document.getElementById('cliente-telefone');
const btnSair = document.getElementById('btn-sair');

// Modal Troca elements
const modalTroca = document.getElementById('modal-troca');
const trocaAtual = document.getElementById('troca-atual');
const trocaData = document.getElementById('troca-data');
const trocaHora = document.getElementById('troca-hora');
const trocaMotivo = document.getElementById('troca-motivo');
const enviarTroca = document.getElementById('enviar-troca');
const fecharModalTroca = document.getElementById('fechar-modal-troca');
const cancelarModalTroca = document.getElementById('cancelar-modal-troca');

// Modal Cancelar elements
const modalCancelar = document.getElementById('modal-cancelar');
const fecharModalCancelar = document.getElementById('fechar-modal-cancelar');
const naoCancelar = document.getElementById('nao-cancelar');
const confirmarCancelar = document.getElementById('confirmar-cancelar');

// ============================================================
// State
// ============================================================

let usuario = null;
let empresaId = null;
let agendamentoSelecionado = null;
let todosAgendamentos = [];

// ============================================================
// Utility Functions
// ============================================================

/**
 * Show feedback message to user
 */
function showFeedback(text, type = 'success') {
    feedbackMessage.textContent = text;
    feedbackMessage.className = `feedback-message feedback-${type}`;
    feedbackMessage.classList.remove('hidden');
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        feedbackMessage.classList.add('hidden');
    }, 5000);
}

/**
 * Show loading state
 */
function showLoading() {
    loadingState.classList.remove('hidden');
    errorState.classList.add('hidden');
    mainContent.classList.add('hidden');
}

/**
 * Show error state
 */
function showError(message) {
    loadingState.classList.add('hidden');
    errorState.classList.remove('hidden');
    mainContent.classList.add('hidden');
    errorMessage.textContent = message || 'Não foi possível carregar seus dados.';
}

/**
 * Show main content
 */
function showMainContent() {
    loadingState.classList.add('hidden');
    errorState.classList.add('hidden');
    mainContent.classList.remove('hidden');
}

/**
 * Format date for display
 */
function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

/**
 * Format time for display
 */
function formatTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Format date and time together
 */
function formatDateTime(isoString) {
    return `${formatDate(isoString)} às ${formatTime(isoString)}`;
}

/**
 * Get status badge class
 */
function getStatusClass(status) {
    const classes = {
        'solicitado': 'status-pendente',
        'confirmado': 'status-confirmado',
        'cancelado': 'status-cancelado',
        'remarcado': 'status-remarcado',
        'concluido': 'status-concluido',
        'remarcacao-solicitada': 'status-remarcacao-solicitada'
    };
    return classes[status] || 'status-pendente';
}

/**
 * Get status display text
 */
function getStatusText(status) {
    const texts = {
        'solicitado': 'Pendente',
        'confirmado': 'Confirmado',
        'cancelado': 'Cancelado',
        'remarcado': 'Remarcado',
        'concluido': 'Concluído',
        'remarcacao-solicitada': 'Aguardando confirmação'
    };
    return texts[status] || status;
}

// ============================================================
// Data Loading Functions
// ============================================================

/**
 * Load empresa (profissional) data
 */
async function loadEmpresaData() {
    if (!empresaId) return null;
    
    const db = getFirebaseDB();
    const empresaDoc = await getDoc(doc(db, 'empresas', empresaId));
    
    if (empresaDoc.exists()) {
        return empresaDoc.data();
    }
    return null;
}

/**
 * Render empresa (profissional) data
 */
function renderEmpresaData(empresa) {
    if (!empresa) return;
    
    profissionalNome.textContent = empresa.nome || 'Profissional';
    profissionalProfissao.textContent = empresa.profissao || '';
    
    // Banner
    if (empresa.bannerUrl) {
        profissionalBanner.innerHTML = `<img src="${empresa.bannerUrl}" alt="Banner de ${empresa.nome}">`;
    } else {
        const initial = (empresa.nome || 'P')[0].toUpperCase();
        bannerInitial.textContent = initial;
    }
    
    // Apply theme if exists
    if (empresa.tema) {
        applyTheme(empresa.tema);
    }
}

/**
 * Apply custom theme from empresa
 */
function applyTheme(tema) {
    const root = document.documentElement;
    
    if (tema.primary) {
        root.style.setProperty('--color-primary', tema.primary);
        root.style.setProperty('--color-primary-light', tema.primaryLight || tema.primary);
        root.style.setProperty('--color-primary-dark', tema.primaryDark || tema.primary);
    }
    
    if (tema.secondary) {
        root.style.setProperty('--color-secondary', tema.secondary);
        root.style.setProperty('--color-secondary-light', tema.secondaryLight || tema.secondary);
        root.style.setProperty('--color-secondary-dark', tema.secondaryDark || tema.secondary);
    }
}

/**
 * Load all client data
 */
async function loadClientData() {
    // Verify authentication
    const sessao = await verificarSessao();
    
    if (!sessao.logado) {
        // Redirect to login
        window.location.href = '/login';
        return false;
    }
    
    usuario = sessao.usuario;
    
    // Check if user is a client
    if (usuario.role !== 'cliente') {
        // Redirect based on role
        if (usuario.role === 'profissional') {
            window.location.href = '/dashboard';
        } else {
            window.location.href = '/login';
        }
        return false;
    }
    
    return true;
}

/**
 * Load and render all agendamentos
 */
async function loadAgendamentos() {
    try {
        todosAgendamentos = await listAgendamentosCliente(usuario.uid);
        renderProximoAgendamento();
        renderHistorico();
    } catch (error) {
        console.error('Erro ao carregar agendamentos:', error);
        showError('Erro ao carregar agendamentos.');
    }
}

/**
 * Get next active appointment
 */
function getProximoAgendamento() {
    const agora = new Date();
    
    // Filter for future appointments that are not canceled
    const futuros = todosAgendamentos
        .filter(a => {
            const dataAgendamento = new Date(a.inicio);
            return dataAgendamento >= agora && a.status !== 'cancelado';
        })
        .sort((a, b) => new Date(a.inicio) - new Date(b.inicio));
    
    return futuros.length > 0 ? futuros[0] : null;
}

/**
 * Render next appointment
 */
function renderProximoAgendamento() {
    const proximo = getProximoAgendamento();
    
    if (!proximo) {
        comAgendamento.classList.add('hidden');
        semAgendamento.classList.remove('hidden');
        
        // Store empresaId from first appointment if exists
        if (todosAgendamentos.length > 0) {
            empresaId = todosAgendamentos[0].empresaId;
        }
        return;
    }
    
    // Store empresaId
    empresaId = proximo.empresaId;
    
    // Render appointment data
    agendamentoDataHora.textContent = formatDateTime(proximo.inicio);
    agendamentoServico.textContent = proximo.servico || 'Atendimento';
    agendamentoStatus.textContent = getStatusText(proximo.status);
    agendamentoStatus.className = `agendamento-status ${getStatusClass(proximo.status)}`;
    
    // Show/hide action buttons based on status
    const podeAcao = proximo.status === 'confirmado' || proximo.status === 'solicitado';
    
    if (podeAcao) {
        btnSolicitarTroca.classList.remove('hidden');
        btnCancelarAgendamento.classList.remove('hidden');
    } else {
        btnSolicitarTroca.classList.add('hidden');
        btnCancelarAgendamento.classList.add('hidden');
    }
    
    // Store selected appointment
    agendamentoSelecionado = proximo;
    
    // Show appointment section
    comAgendamento.classList.remove('hidden');
    semAgendamento.classList.add('hidden');
}

/**
 * Render appointment history
 */
function renderHistorico() {
    const agora = new Date();
    
    // Filter for past appointments or canceled ones
    const historico = todosAgendamentos
        .filter(a => {
            const dataAgendamento = new Date(a.inicio);
            return dataAgendamento < agora || a.status === 'cancelado';
        })
        .sort((a, b) => new Date(b.inicio) - new Date(a.inicio)); // Most recent first
    
    if (historico.length === 0) {
        historicoLista.innerHTML = '<p class="historico-vazio">Nenhum agendamento no histórico.</p>';
        return;
    }
    
    historicoLista.innerHTML = historico.map(ag => `
        <div class="historico-item">
            <div class="historico-info">
                <p class="historico-data">${formatDateTime(ag.inicio)}</p>
                <p class="historico-servico">${ag.servico || 'Atendimento'}</p>
            </div>
            <span class="historico-status ${getStatusClass(ag.status)}">
                ${getStatusText(ag.status)}
            </span>
        </div>
    `).join('');
}

// ============================================================
// Action Functions
// ============================================================

/**
 * Open exchange modal
 */
function abrirModalTroca() {
    if (!agendamentoSelecionado || !empresaId) {
        showFeedback('Erro ao abrir modal de troca.', 'error');
        return;
    }
    
    trocaAtual.textContent = formatDateTime(agendamentoSelecionado.inicio);
    trocaData.value = '';
    trocaHora.innerHTML = '<option value="">Selecione uma data primeiro</option>';
    trocaHora.disabled = true;
    trocaMotivo.value = '';
    
    modalTroca.classList.remove('hidden');
    carregarDatasDisponiveis();
}

/**
 * Close exchange modal
 */
function fecharModalTrocaHandler() {
    modalTroca.classList.add('hidden');
}

/**
 * Load available dates for exchange
 */
async function carregarDatasDisponiveis() {
    if (!empresaId) return;
    
    try {
        const db = getFirebaseDB();
        const empresaDoc = await getDoc(doc(db, 'empresas', empresaId));
        
        if (!empresaDoc.exists()) {
            throw new Error('Empresa não encontrada');
        }
        
        const empresa = empresaDoc.data();
        const agendaConfig = empresa.agendaConfig;
        
        if (!agendaConfig || !agendaConfig.dias) {
            throw new Error('Agenda não configurada');
        }
        
        // Generate available dates for next 30 days
        const dates = [];
        const today = new Date();
        
        for (let i = 1; i <= 30; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() + i);
            
            const weekdayMap = {
                'segunda': 'mon',
                'terça': 'tue', 
                'quarta': 'wed',
                'quinta': 'thu',
                'sexta': 'fri',
                'sábado': 'sat',
                'domingo': 'sun'
            };
            
            const dateStr = date.toLocaleDateString('pt-BR', { weekday: 'long' }).toLowerCase();
            const dayKey = weekdayMap[dateStr] || dateStr;
            
            if (agendaConfig.dias.includes(dayKey)) {
                dates.push(date.toISOString().split('T')[0]);
            }
        }
        
        // Populate date select
        trocaData.innerHTML = dates.map(d => {
            const displayDate = new Date(d).toLocaleDateString('pt-BR', {
                weekday: 'short',
                day: 'numeric',
                month: 'short'
            });
            return `<option value="${d}">${displayDate}</option>`;
        }).join('');
        
    } catch (error) {
        console.error('Erro ao carregar datas:', error);
        showFeedback('Erro ao carregar datas disponíveis.', 'error');
    }
}

/**
 * Load available time slots for selected date
 */
async function carregarHorariosDisponiveis() {
    const dataSelecionada = trocaData.value;
    
    if (!dataSelecionada || !empresaId) {
        trocaHora.innerHTML = '<option value="">Selecione uma data primeiro</option>';
        trocaHora.disabled = true;
        return;
    }
    
    try {
        const slots = await generateSlotsForDate(empresaId, dataSelecionada);
        
        if (slots.length === 0) {
            trocaHora.innerHTML = '<option value="">Nenhum horário disponível</option>';
            return;
        }
        
        trocaHora.innerHTML = slots.map(slot => {
            const time = formatTime(slot.inicioISO);
            return `<option value="${slot.inicioISO}">${time}</option>`;
        }).join('');
        
        trocaHora.disabled = false;
        
    } catch (error) {
        console.error('Erro ao carregar horários:', error);
        trocaHora.innerHTML = '<option value="">Erro ao carregar horários</option>';
    }
}

/**
 * Submit exchange request
 */
async function enviarSolicitacaoTrocaHandler() {
    const novoInicio = trocaHora.value;
    const motivo = trocaMotivo.value.trim();
    
    if (!novoInicio) {
        showFeedback('Selecione um novo horário.', 'error');
        return;
    }
    
    if (!agendamentoSelecionado || !empresaId) {
        showFeedback('Erro ao processar solicitação.', 'error');
        return;
    }
    
    try {
        // Calculate end time based on original duration
        const duracao = new Date(agendamentoSelecionado.fim) - new Date(agendamentoSelecionado.inicio);
        const novoFim = new Date(new Date(novoInicio).getTime() + duracao).toISOString();
        
        await solicitarRemarcacao(
            empresaId,
            agendamentoSelecionado.id,
            novoInicio,
            novoFim,
            motivo
        );
        
        showFeedback('Solicitação de troca enviada com sucesso!', 'success');
        fecharModalTrocaHandler();
        
        // Reload appointments
        await loadAgendamentos();
        
    } catch (error) {
        console.error('Erro ao solicitar troca:', error);
        showFeedback(error.message || 'Erro ao solicitar troca.', 'error');
    }
}

/**
 * Open cancel confirmation modal
 */
function abrirModalCancelar() {
    modalCancelar.classList.remove('hidden');
}

/**
 * Close cancel confirmation modal
 */
function fecharModalCancelarHandler() {
    modalCancelar.classList.add('hidden');
}

/**
 * Confirm appointment cancellation
 */
async function confirmarCancelamentoHandler() {
    if (!agendamentoSelecionado || !empresaId) {
        showFeedback('Erro ao processar cancelamento.', 'error');
        return;
    }
    
    try {
        await cancelarAgendamento(empresaId, agendamentoSelecionado.id, 'Cancelado pelo cliente');
        
        showFeedback('Agendamento cancelado com sucesso!', 'success');
        fecharModalCancelarHandler();
        
        // Reload appointments
        await loadAgendamentos();
        
    } catch (error) {
        console.error('Erro ao cancelar:', error);
        showFeedback(error.message || 'Erro ao cancelar agendamento.', 'error');
    }
}

/**
 * Render client profile
 */
function renderPerfil() {
    clienteNome.textContent = usuario.nome || '--';
    clienteEmail.textContent = usuario.email || '--';
    clienteTelefone.textContent = usuario.telefone || '--';
}

// ============================================================
// Initialization
// ============================================================

/**
 * Initialize page
 */
async function init() {
    showLoading();
    
    try {
        // Load client data
        const success = await loadClientData();
        if (!success) return;
        
        // Render profile
        renderPerfil();
        
        // Load empresa data if we have agendamentos
        await loadAgendamentos();
        
        if (empresaId) {
            const empresa = await loadEmpresaData();
            renderEmpresaData(empresa);
        }
        
        // Show main content
        showMainContent();
        
    } catch (error) {
        console.error('Erro na inicialização:', error);
        showError('Erro ao carregar dados. Tente novamente.');
    }
}

/**
 * Handle logout
 */
async function handleLogout() {
    try {
        await logout();
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
        // Fallback - clear localStorage and redirect
        localStorage.removeItem('usuarioAtual');
        window.location.href = '/login';
    }
}

// ============================================================
// Event Listeners
// ============================================================

// Navigation buttons
btnSair.addEventListener('click', handleLogout);

// Exchange modal
btnSolicitarTroca.addEventListener('click', abrirModalTroca);
fecharModalTroca.addEventListener('click', fecharModalTrocaHandler);
cancelarModalTroca.addEventListener('click', fecharModalTrocaHandler);
trocaData.addEventListener('change', carregarHorariosDisponiveis);
enviarTroca.addEventListener('click', enviarSolicitacaoTrocaHandler);

// Cancel modal
btnCancelarAgendamento.addEventListener('click', abrirModalCancelar);
fecharModalCancelar.addEventListener('click', fecharModalCancelarHandler);
naoCancelar.addEventListener('click', fecharModalCancelarHandler);
confirmarCancelar.addEventListener('click', confirmarCancelamentoHandler);

// Close modals on outside click
modalTroca.addEventListener('click', (e) => {
    if (e.target === modalTroca) fecharModalTrocaHandler();
});

modalCancelar.addEventListener('click', (e) => {
    if (e.target === modalCancelar) fecharModalCancelarHandler();
});

// Keyboard navigation for accessibility
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (!modalTroca.classList.contains('hidden')) {
            fecharModalTrocaHandler();
        }
        if (!modalCancelar.classList.contains('hidden')) {
            fecharModalCancelarHandler();
        }
    }
});

// ============================================================
// Start
// ============================================================

document.addEventListener('DOMContentLoaded', init);

