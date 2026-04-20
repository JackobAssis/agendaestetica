/**
 * Dashboard Page Logic - Complete Implementation
 * Reference: paginadoprofissional.md (FONTE PRINCIPAL DE REGRAS)
 * 
 * Módulos:
 * - Visão Geral (agenda do dia, próximos atendimentos, alertas)
 * - Agenda
 * - Clientes
 * - Cursos (Premium)
 * - Personalização (Premium)
 * - Monetização
 * - Configurações
 * 
 * CORRIGIDO para Firebase v9+ modular
 */

import { 
    getFirebaseDB, 
    doc, 
    getDoc, 
    getDocs, 
    collection, 
    query, 
    where, 
    orderBy,
    updateDoc 
} from '../modules/firebase.js';
import { obterUsuarioAtual, logout } from '../modules/auth.js';
import { obterPlano, temFeature } from '../modules/permissions.js';
import { applyTheme, getTheme, setTheme } from '../modules/theme.js';

/**
 * ============================================
 * MÓDULO 1: VISÃO GERAL (HOME DO DASHBOARD)
 * ============================================
 */

// Dados do profissional
let dadosProfissional = null;
let agendaHoje = [];
let proximosAgendamentos = [];
const stats = {
    agendamentosHoje: 0,
    totalClientes: 0,
    agendamentosPendentes: 0,
    receitaHoje: 0
};

/**
 * Inicializar dashboard completo
 */
async function inicializarDashboard() {
    try {
        const usuario = obterUsuarioAtual();
        
        if (!usuario) {
            window.location.href = '/login';
            return;
        }
        
        // Carregar dados do profissional
        dadosProfissional = await carregarDadosProfissional(usuario.empresaId);
        
        if (!dadosProfissional) {
            console.error('Profissional não encontrado');
            return;
        }
        
        // Atualizar UI básica
        atualizarInfoUsuario(usuario, dadosProfissional);
        
        // Obter plano e features
        const plano = await obterPlano();
        const features = await carregarFeatures(dadosProfissional);
        
        // Renderizar módulos baseados no plano
        await renderizarVisaoGeral(usuario.empresaId, plano, features);
        renderizarModulosCondicionais(features, plano);
        
        // Carregar contagem de notificações
        await carregarContagemNotificacoes(usuario.empresaId);
        
        // Event listeners
        setupEventListeners();
        setupThemeListener(usuario.empresaId);
        
        console.log('Dashboard inicializado com sucesso');
        
    } catch (error) {
        console.error('Erro ao inicializar dashboard:', error);
        mostrarErro('Erro ao carregar dados do dashboard');
    }
}

/**
 * Carregar dados do profissional do Firestore
 */
async function carregarDadosProfissional(empresaId) {
    try {
        const db = getFirebaseDB();
        const docRef = doc(db, 'empresas', empresaId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        
        return null;
    } catch (error) {
        console.error('Erro ao carregar dados do profissional:', error);
        return null;
    }
}

/**
 * Carregar features do profissional
 */
async function carregarFeatures(dados) {
    return dados.features || {
        customTheme: false,
        backgroundImage: false,
        courses: false,
        rewards: false,
        advancedReports: false
    };
}

/**
 * Atualizar informações do usuário na UI
 */
function atualizarInfoUsuario(usuario, dados) {
    // Header
    const usuarioInfo = document.getElementById('usuario-info');
    if (usuarioInfo) {
        usuarioInfo.textContent = `${dados.nome || usuario.nome} (${dados.profissao || 'Profissional'})`;
    }
    
    // Welcome message
    const welcomeMessage = document.getElementById('welcome-message');
    if (welcomeMessage) {
        const hora = new Date().getHours();
        let saudacao = 'Boa noite';
        if (hora >= 6 && hora < 12) saudacao = 'Bom dia';
        else if (hora >= 12 && hora < 18) saudacao = 'Boa tarde';
        
        welcomeMessage.textContent = `${saudacao}, ${dados.nome || usuario.nome}! Aqui está o resumo do seu dia.`;
    }
    
    // Nome no sidebar ou header
    const nomeSidebar = document.getElementById('profissional-nome');
    if (nomeSidebar) {
        nomeSidebar.textContent = dados.nome || usuario.nome;
    }
}

/**
 * ============================================
 * MÓDULO 2: VISÃO GERAL - AGENDA DO DIA
 * ============================================
 */

/**
 * Renderizar visão geral com agenda do dia
 */
async function renderizarVisaoGeral(empresaId, plano, features) {
    await carregarEstatisticas(empresaId);
    renderizarCardsEstatisticas();
    await renderizarAgendaHoje(empresaId);
    await renderizarProximosAtendimentos(empresaId);
    await renderizarAlertas(empresaId);
    renderizarInfoPlano(plano);
    renderizarLinkPublico(dadosProfissional);
}

/**
 * Carregar estatísticas do profissional
 */
async function carregarEstatisticas(empresaId) {
    try {
        const db = getFirebaseDB();
        const hoje = new Date();
        const inicioDoDia = new Date(hoje.setHours(0, 0, 0, 0)).toISOString();
        const fimDoDia = new Date(hoje.setHours(23, 59, 59, 999)).toISOString();
        
        // Agendamentos de hoje
        const agQuery = query(
            collection(db, 'empresas', empresaId, 'agendamentos'),
            where('inicio', '>=', inicioDoDia),
            where('inicio', '<=', fimDoDia),
            orderBy('inicio', 'asc')
        );
        const agSnapshot = await getDocs(agQuery);
        agendaHoje = agSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        stats.agendamentosHoje = agendaHoje.length;
        
        // Próximos agendamentos (próximos 7 dias)
        const fimProximo = new Date();
        fimProximo.setDate(fimProximo.getDate() + 7);
        const fimProximoISO = fimProximo.toISOString();
        
        const proximosQuery = query(
            collection(db, 'empresas', empresaId, 'agendamentos'),
            where('inicio', '>', fimDoDia),
            where('inicio', '<=', fimProximoISO),
            orderBy('inicio', 'asc')
        );
        const proximosSnapshot = await getDocs(proximosQuery);
        proximosAgendamentos = proximosSnapshot.docs.slice(0, 5).map(d => ({ id: d.id, ...d.data() }));
        
        // Total de clientes
        const clientesQuery = query(
            collection(db, 'empresas', empresaId, 'clientes')
        );
        const clientesSnapshot = await getDocs(clientesQuery);
        stats.totalClientes = clientesSnapshot.size;
        
        // Agendamentos pendentes
        const pendentesQuery = query(
            collection(db, 'empresas', empresaId, 'agendamentos'),
            where('status', '==', 'pendente')
        );
        const pendentesSnapshot = await getDocs(pendentesQuery);
        stats.agendamentosPendentes = pendentesSnapshot.size;
        
        // Receita de hoje (agendamentos confirmados)
        stats.receitaHoje = agendaHoje
            .filter(a => a.status === 'confirmado')
            .reduce((total, a) => total + (a.valor || 0), 0);
        
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
}

/**
 * Renderizar cards de estatísticas
 */
function renderizarCardsEstatisticas() {
    // Agendamentos Hoje
    const countHoje = document.getElementById('count-hoje');
    if (countHoje) {
        countHoje.textContent = stats.agendamentosHoje;
    }
    
    // Total de Clientes
    const countClientes = document.getElementById('count-clientes');
    if (countClientes) {
        countClientes.textContent = stats.totalClientes;
    }
    
    // Plano Atual
    const planoElement = document.getElementById('plano-atual');
    if (planoElement) {
        planoElement.textContent = dadosProfissional?.plano || 'Free';
    }
    
    // Status do Perfil
    const statusPerfil = document.getElementById('status-perfil');
    if (statusPerfil) {
        const completo = dadosProfissional?.onboardingCompleto;
        statusPerfil.textContent = completo ? '✅ Completo' : '⚠️ Incompleto';
        statusPerfil.className = 'status-number ' + (completo ? 'success' : 'warning');
    }
    
    // Receita Hoje (novo card)
    const receitaHoje = document.getElementById('receita-hoje');
    if (receitaHoje) {
        receitaHoje.textContent = `R$ ${stats.receitaHoje.toFixed(2)}`;
    }
    
    // Pendentes (novo card)
    const pendentes = document.getElementById('count-pendentes');
    if (pendentes) {
        pendentes.textContent = stats.agendamentosPendentes;
    }
}

/**
 * Renderizar agenda do dia
 */
async function renderizarAgendaHoje(empresaId) {
    const container = document.getElementById('agenda-hoje-container');
    if (!container) return;
    
    if (agendaHoje.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>📅 Nenhum agendamento para hoje</p>
                <p class="hint">Que tal divulgar seus serviços para novos clientes?</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = agendaHoje.map(ag => `
        <div class="agendamento-card" data-id="${ag.id}">
            <div class="ag-time">${formatarHora(ag.inicio)}</div>
            <div class="ag-info">
                <strong>${ag.clienteNome || 'Cliente não identificado'}</strong>
                <span class="ag-servico">${ag.servico || 'Serviço'}</span>
            </div>
            <div class="ag-status status-${ag.status || 'pendente'}">
                ${ag.status || 'pendente'}
            </div>
        </div>
    `).join('');
}

/**
 * Renderizar próximos atendimentos
 */
async function renderizarProximosAtendimentos(empresaId) {
    const container = document.getElementById('proximos-container');
    if (!container) return;
    
    if (proximosAgendamentos.length === 0) {
        container.innerHTML = `
            <div class="empty-state small">
                <p>📅 Nenhum agendamento futuro</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = proximosAgendamentos.map(ag => `
        <div class="proximo-card">
            <div class="pc-date">${formatarDataProxima(ag.inicio)}</div>
            <div class="pc-info">
                <strong>${ag.clienteNome || 'Cliente'}</strong>
                <span>${ag.servico || 'Serviço'}</span>
            </div>
        </div>
    `).join('');
}

/**
 * Renderizar alertas importantes
 */
async function renderizarAlertas(empresaId) {
    const container = document.getElementById('alertas-container');
    if (!container) return;
    
    const alertas = [];
    
    // Alerta: agendamentos pendentes
    if (stats.agendamentosPendentes > 0) {
        alertas.push({
            tipo: 'warning',
            icon: '⏰',
            mensagem: `${stats.agendamentosPendentes} agendamento(s) pendente(s) de confirmação`
        });
    }
    
    // Alerta: perfil incompleto
    if (!dadosProfissional?.onboardingCompleto) {
        alertas.push({
            tipo: 'info',
            icon: '📝',
            mensagem: 'Complete seu perfil para oferecer uma melhor experiência aos clientes'
        });
    }
    
    // Alerta: agenda não configurada
    if (!dadosProfissional?.agendaConfig) {
        alertas.push({
            tipo: 'warning',
            icon: '⚙️',
            mensagem: 'Configure sua agenda para começar a receber agendamentos'
        });
    }
    
    // Alerta: plano Free com recursos bloqueados
    const plano = dadosProfissional?.plano || 'free';
    if (plano === 'free') {
        alertas.push({
            tipo: 'info',
            icon: '⭐',
            mensagem: 'Faça upgrade para Premium e desbloqueie recursos exclusivos'
        });
    }
    
    if (alertas.length === 0) {
        container.innerHTML = `
            <div class="empty-state small">
                <p>✅ Tudo em dia!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = alertas.map(a => `
        <div class="alerta-card ${a.tipo}">
            <span class="alerta-icon">${a.icon}</span>
            <span class="alerta-mensagem">${a.mensagem}</span>
        </div>
    `).join('');
}

/**
 * ============================================
 * MÓDULO 3: MÓDULOS CONDICIONAIS (Premium)
 * ============================================
 */

/**
 * Renderizar módulos baseados em features e plano
 */
function renderizarModulosCondicionais(features, plano) {
    renderizarModuloCursos(features.courses);
    renderizarModuloPersonalizacao(features, plano);
    renderizarModuloMonetizacao(plano);
    renderizarModuloConfiguracoes();
}

/**
 * Módulo Cursos (Premium)
 */
function renderizarModuloCursos(temCursos) {
    const container = document.getElementById('modulo-cursos');
    if (!container) return;
    
    if (temCursos) {
        container.innerHTML = `
            <div class="modulo-card premium">
                <div class="modulo-header">
                    <span class="modulo-icon">📚</span>
                    <h4>Cursos</h4>
                    <span class="badge-premium">Premium</span>
                </div>
                <p>Gerencie seus cursos e formações</p>
                <a href="/cursos" class="btn-modulo">Acessar Cursos</a>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="modulo-card locked">
                <div class="modulo-header">
                    <span class="modulo-icon">📚</span>
                    <h4>Cursos</h4>
                    <span class="badge-locked">🔒 Premium</span>
                </div>
                <p>Crie cursos e forme novos profissionais</p>
                <button class="btn-upgrade" onclick="window.location.href='/perfil?upgrade=true'">
                    fazer Upgrade
                </button>
            </div>
        `;
    }
}

/**
 * Módulo Personalização (Premium)
 */
function renderizarModuloPersonalizacao(features, plano) {
    const container = document.getElementById('modulo-personalizacao');
    if (!container) return;
    
    const temPersonalizacao = features.customTheme || features.backgroundImage;
    
    if (plano === 'premium' || temPersonalizacao) {
        container.innerHTML = `
            <div class="modulo-card premium">
                <div class="modulo-header">
                    <span class="modulo-icon">🎨</span>
                    <h4>Personalização</h4>
                    <span class="badge-premium">${plano === 'premium' ? 'Premium' : 'ativo'}</span>
                </div>
                <p>Personalize cores, imagens e sua página pública</p>
                <a href="/personalizacao" class="btn-modulo">Personalizar</a>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="modulo-card locked">
                <div class="modulo-header">
                    <span class="modulo-icon">🎨</span>
                    <h4>Personalização</h4>
                    <span class="badge-locked">🔒 Premium</span>
                </div>
                <p>Personalize cores, imagens e sua página pública</p>
                <button class="btn-upgrade" onclick="window.location.href='/perfil?upgrade=true'">
                    fazer Upgrade
                </button>
            </div>
        `;
    }
}

/**
 * Módulo Monetização
 */
function renderizarModuloMonetizacao(plano) {
    const container = document.getElementById('modulo-monetizacao');
    if (!container) return;
    
    const recursosBloqueados = [];
    
    if (plano === 'free') {
        recursosBloqueados.push('Tema Avançado');
        recursosBloqueados.push('Cursos');
        recursosBloqueados.push('Relatórios Avançados');
        recursosBloqueados.push('Integração com Calendários');
    }
    
    container.innerHTML = `
        <div class="modulo-card monetizacao">
            <div class="modulo-header">
                <span class="modulo-icon">💰</span>
                <h4>Monetização</h4>
                <span class="badge plano-${plano}">${plano === 'premium' ? 'Premium' : 'Free'}</span>
            </div>
            <div class="plano-atual">
                <p>Plano atual: <strong>${plano === 'premium' ? 'Premium' : 'Gratuito'}</strong></p>
            </div>
            ${recursosBloqueados.length > 0 ? `
                <div class="recursos-bloqueados">
                    <p class="label">Recursos bloqueados:</p>
                    <ul>
                        ${recursosBloqueados.map(r => `<li>🔒 ${r}</li>`).join('')}
                    </ul>
                </div>
                ${plano === 'free' ? `
                    <button class="btn-upgrade btn-upgrade-primary" onclick="window.location.href='/perfil?upgrade=true'">
                        fazer Upgrade para Premium
                    </button>
                ` : ''}
            ` : ''}
        </div>
    `;
}

/**
 * Módulo Configurações
 */
function renderizarModuloConfiguracoes() {
    const container = document.getElementById('modulo-configuracoes');
    if (!container) return;
    
    container.innerHTML = `
        <div class="modulo-card configuracoes">
            <div class="modulo-header">
                <span class="modulo-icon">⚙️</span>
                <h4>Configurações</h4>
            </div>
            <div class="config-opcoes">
                <a href="/perfil" class="config-item">
                    <span>👤</span>
                    <span>Editar Perfil</span>
                </a>
                <a href="/agenda" class="config-item">
                    <span>📅</span>
                    <span>Configurar Agenda</span>
                </a>
                <a href="/notificacoes" class="config-item">
                    <span>🔔</span>
                    <span>Notificações</span>
                </a>
                <a href="/solicitacoes-troca" class="config-item">
                    <span>🔄</span>
                    <span>Solicitações de Troca</span>
                </a>
            </div>
        </div>
    `;
}

/**
 * ============================================
 * MÓDULO 4: INFORMAÇÕES DO PLANO E LINK PÚBLICO
 * ============================================
 */

/**
 * Renderizar informações do plano
 */
function renderizarInfoPlano(plano) {
    const planoElement = document.getElementById('plano-atual');
    if (planoElement) {
        planoElement.textContent = plano.charAt(0).toUpperCase() + plano.slice(1);
    }
}

/**
 * Renderizar link público do profissional
 */
function renderizarLinkPublico(dados) {
    const container = document.getElementById('link-publico-container');
    if (!container) return;
    
    const slug = dados.slug || dados.empresaId || 'sem-slug';
    const linkCompleto = `https://agendaestetica.app/p/${slug}`;
    
    container.innerHTML = `
        <div class="link-publico-card">
            <div class="modulo-header">
                <span class="modulo-icon">🔗</span>
                <h4>Seu Link Público</h4>
            </div>
            <p>Compartilhe este link com seus clientes:</p>
            <div class="link-input-group">
                <input type="text" id="link-publico-input" value="${linkCompleto}" readonly>
                <button class="btn-copy" onclick="copiarLinkPublico()">📋 Copiar</button>
            </div>
            <div class="link-actions">
                <a href="${linkCompleto}" target="_blank" class="btn-preview">
                    👁️ Ver Página
                </a>
                <a href="/perfil#slug" class="btn-edit-slug">
                    ✏️ Editar Slug
                </a>
            </div>
        </div>
    `;
}

/**
 * Copiar link público para clipboard
 */
function copiarLinkPublico() {
    const input = document.getElementById('link-publico-input');
    if (input) {
        input.select();
        document.execCommand('copy');
        alert('Link copiado para a área de transferência!');
    }
}

// Expor função globalmente
window.copiarLinkPublico = copiarLinkPublico;

/**
 * ============================================
 * EVENT LISTENERS E UTILIDADES
 * ============================================
 */

/**
 * Configurar event listeners
 */
function setupEventListeners() {
    // Logout
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', async (e) => {
            e.preventDefault();
            if (confirm('Tem certeza que deseja sair?')) {
                await logout();
            }
        });
    }
    
    // Navegação
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            window.location.href = link.getAttribute('href');
        });
    });
    
    // Mobile menu toggle
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    if (mobileToggle && sidebar) {
        mobileToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }
}

/**
 * Configurar listener do tema
 */
async function setupThemeListener(empresaId) {
    const themeSelect = document.getElementById('theme-select');
    if (!themeSelect) return;
    
    // Carregar tema atual
    const currentTheme = await getTheme(empresaId);
    applyTheme(currentTheme);
    themeSelect.value = currentTheme;
    
    // Verificar permissão para tema premium
    const allowAdvanced = await temFeature('tema_avancado');
    
    if (!allowAdvanced && themeSelect.value === 'premium') {
        themeSelect.value = 'free';
    }
    
    // Desabilitar opção premium se não tiver permissão
    const premiumOption = themeSelect.querySelector('option[value="premium"]');
    if (premiumOption && !allowAdvanced) {
        premiumOption.disabled = true;
        premiumOption.text += ' (Bloqueado)';
    }
    
    // Listener de mudança
    themeSelect.addEventListener('change', async (e) => {
        const newTheme = e.target.value;
        
        if (newTheme === 'premium' && !allowAdvanced) {
            alert('Tema avançado disponível apenas no plano Premium. Acesse Perfil para fazer upgrade.');
            themeSelect.value = currentTheme;
            return;
        }
        
        applyTheme(newTheme);
        await setTheme(empresaId, newTheme);
    });
}

/**
 * ============================================
 * MÓDULO: NOTIFICAÇÕES
 * ============================================
 */

/**
 * Carregar contagem de notificações não lidas
 */
async function carregarContagemNotificacoes(empresaId) {
    try {
        if (!empresaId) return;
        
        const db = getFirebaseDB();
        const notifRef = collection(db, 'empresas', empresaId, 'notificacoes');
        const q = query(notifRef, where('read', '==', false));
        const snapshot = await getDocs(q);
        
        const count = snapshot.size;
        const badge = document.getElementById('nav-notif-badge');
        
        if (badge) {
            if (count > 0) {
                badge.textContent = count > 99 ? '99+' : count;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
        
        return count;
    } catch (error) {
        console.warn('Erro ao carregar contagem de notificações:', error);
        return 0;
    }
}

/**
 * ============================================
 * UTILIDADES
 * ============================================
 */

/**
 * Formatar hora para display
 */
function formatarHora(isoString) {
    const date = new Date(isoString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Formatar data para "próximos" display
 */
function formatarDataProxima(isoString) {
    const date = new Date(isoString);
    const hoje = new Date();
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);
    
    if (date.toDateString() === hoje.toDateString()) {
        return 'Hoje';
    } else if (date.toDateString() === amanha.toDateString()) {
        return 'Amanhã';
    } else {
        return date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });
    }
}

/**
 * Mostrar erro na UI
 */
function mostrarErro(mensagem) {
    const container = document.getElementById('main-content');
    if (container) {
        container.innerHTML = `
            <div class="error-state">
                <h2>😕 Ocorreu um erro</h2>
                <p>${mensagem}</p>
                <button onclick="window.location.reload()">Tentar novamente</button>
            </div>
        `;
    }
}

/**
 * ============================================
 * INICIALIZAÇÃO
 * ============================================
 */

document.addEventListener('DOMContentLoaded', () => {
    inicializarDashboard();
});

// Exportar funções úteis
export {
    inicializarDashboard,
    carregarDadosProfissional,
    renderizarVisaoGeral,
    formatarHora,
    formatarDataProxima
};

