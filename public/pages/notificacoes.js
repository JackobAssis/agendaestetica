/**
 * Notificações Page - Firebase v9+ Modular SDK
 * Page to view and manage user notifications
 */

import { notifyInApp } from '../modules/notifications.js';
import { obterUsuarioAtual } from '../modules/auth.js';

// ============================================================
// Firebase v9+ Modular SDK Imports
// ============================================================

import { 
    getFirestore, 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    updateDoc, 
    query, 
    where, 
    orderBy,
    limit,
    writeBatch,
    serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js';

// ============================================================
// Firebase Instance Factory
// ============================================================

/**
 * Obter instância do Firestore - USA a instância global do index.html
 */
function getFirebaseDB() {
    if (typeof window !== 'undefined' && window.firebaseApp) {
        return getFirestore(window.firebaseApp);
    }
    throw new Error('Firebase Firestore não inicializado. Verifique index.html');
}

// ============================================================
// Notification Page Functions
// ============================================================

// DOM Elements
const listaNotificacoes = document.getElementById('lista-notificacoes');
const mensagem = document.getElementById('mensagem');
const modalDetalhes = document.getElementById('modal-detalhes');
const btnMarcarTodas = document.getElementById('btn-marcar-todas');

// State
let notificacoes = [];
let filtroAtual = 'nao-lidas';
let notifSelecionada = null;

function showMsg(text, type = 'success') {
    mensagem.className = type === 'success' ? 'success-message' : 'error-message';
    mensagem.textContent = text;
    mensagem.classList.remove('hidden');
    setTimeout(() => mensagem.classList.add('hidden'), 5000);
}

function formatDateTime(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `Há ${diffMins} min`;
    if (diffHours < 24) return `Há ${diffHours}h`;
    if (diffDays < 7) return `Há ${diffDays}d`;

    return date.toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getIconForType(tipo) {
    const icons = {
        'novo_agendamento': '📅',
        'confirmacao': '✅',
        'cancelamento': '❌',
        'troca_pendente': '🔄',
        'troca_aceita': '🔄',
        'troca_rejeitada': '❌',
        'lembrete': '⏰',
        'default': '🔔'
    };
    return icons[tipo] || icons['default'];
}

async function carregarNotificacoes() {
    const usuario = obterUsuarioAtual();
    if (!usuario) {
        window.location.href = '/login';
        return;
    }

    // Determinar empresaId baseado no role
    let empresaId = null;
    if (usuario.role === 'profissional') {
        empresaId = usuario.empresaId;
    } else if (usuario.clienteUid) {
        // Cliente - precisaria buscar empresa do agendamento
        // Por enquanto, we'll show placeholder
    }

    // show loading
    listaNotificacoes.textContent = '';
    const loadingEl = document.createElement('div');
    loadingEl.className = 'loading';
    loadingEl.textContent = 'Carregando notificações...';
    listaNotificacoes.appendChild(loadingEl);

    try {
        if (!empresaId) {
            // Para clientes ou sem empresa, mostrar estado vazio
            listaNotificacoes.textContent = '';
            const empty = document.createElement('div');
            empty.className = 'empty-state';
            const p = document.createElement('p');
            p.textContent = 'As notificações aparecerão aqui quando houver atualizações sobre seus agendamentos.';
            const a = document.createElement('a');
            a.href = '/';
            a.className = 'btn-primary';
            a.textContent = 'Ver Profissionais';
            empty.appendChild(p);
            empty.appendChild(a);
            listaNotificacoes.appendChild(empty);
            return;
        }

        const db = getFirebaseDB();
        const notifRef = collection(db, 'empresas', empresaId, 'notificacoes');
        const q = query(notifRef, orderBy('createdAt', 'desc'), limit(50));
        
        const snapshot = await getDocs(q);

        notificacoes = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        renderNotificacoes();
    } catch (error) {
        console.error('Erro ao carregar notificações:', error);
        listaNotificacoes.textContent = '';
        const err = document.createElement('div');
        err.className = 'error-state';
        err.textContent = 'Erro ao carregar notificações.';
        listaNotificacoes.appendChild(err);
    }
}

function renderNotificacoes() {
    const filtradas = filtroAtual === 'nao-lidas'
        ? notificacoes.filter(n => !n.read)
        : notificacoes;

    if (filtradas.length === 0) {
        listaNotificacoes.textContent = '';
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        const pmsg = document.createElement('p');
        pmsg.textContent = filtroAtual === 'nao-lidas' ? 'Você não tem notificações não lidas.' : 'Você não tem notificações ainda.';
        emptyState.appendChild(pmsg);
        listaNotificacoes.appendChild(emptyState);
        return;
    }
    // render notifications safely
    listaNotificacoes.textContent = '';
    filtradas.forEach(notif => {
        const card = document.createElement('div');
        card.className = `notificacao-card ${notif.read ? '' : 'unread'}`;
        card.dataset.id = notif.id;

        const icon = document.createElement('div');
        icon.className = 'notificacao-icon';
        icon.textContent = getIconForType(notif.tipo);

        const content = document.createElement('div');
        content.className = 'notificacao-content';

        const header = document.createElement('div');
        header.className = 'notificacao-header';
        const strong = document.createElement('strong');
        strong.textContent = notif.title || 'Notificação';
        const time = document.createElement('span');
        time.className = 'notificacao-tempo';
        time.textContent = formatDateTime(notif.createdAt);
        header.appendChild(strong);
        header.appendChild(time);

        const body = document.createElement('p');
        body.className = 'notificacao-body';
        body.textContent = notif.body || '';

        content.appendChild(header);
        content.appendChild(body);

        const actions = document.createElement('div');
        actions.className = 'notificacao-actions';
        if (!notif.read) {
            const badge = document.createElement('span');
            badge.className = 'badge badge-warning';
            badge.textContent = 'Nova';
            actions.appendChild(badge);
        }

        card.appendChild(icon);
        card.appendChild(content);
        card.appendChild(actions);

        card.addEventListener('click', () => mostrarDetalhes(notif));

        listaNotificacoes.appendChild(card);
    });
}

function mostrarDetalhes(notif) {
    notifSelecionada = notif;

    document.getElementById('modal-titulo').textContent = notif.title || 'Notificação';
    const modalCorpo = document.getElementById('modal-corpo');
    modalCorpo.textContent = '';
    const detalhes = document.createElement('div');
    detalhes.className = 'notif-detalhes';
    const pBody = document.createElement('p');
    pBody.textContent = notif.body || '';
    const pTempo = document.createElement('p');
    pTempo.className = 'notif-tempo';
    pTempo.textContent = `Recebida em ${new Date(notif.createdAt).toLocaleString('pt-BR')}`;
    detalhes.appendChild(pBody);
    detalhes.appendChild(pTempo);
    modalCorpo.appendChild(detalhes);

    // Botão ver agendamento se houver referência
    const btnVer = document.getElementById('btn-ver-agendamento');
    if (notif.meta && notif.meta.agendamentoId) {
        btnVer.style.display = 'inline-block';
        btnVer.onclick = () => {
            // Redirecionar para agendamento
            window.location.href = `/agendamentos?id=${notif.meta.agendamentoId}`;
        };
    } else {
        btnVer.style.display = 'none';
    }

    modalDetalhes.classList.remove('hidden');

    // Marcar como lida
    if (!notif.read) {
        marcarComoLida(notif.id);
    }
}

async function marcarComoLida(notificacaoId) {
    try {
        const usuario = obterUsuarioAtual();
        if (!usuario || !usuario.empresaId) return;

        const db = getFirebaseDB();
        const notifRef = doc(db, 'empresas', usuario.empresaId, 'notificacoes', notificacaoId);
        await updateDoc(notifRef, { read: true });

        // Update local state
        const notif = notificacoes.find(n => n.id === notificacaoId);
        if (notif) notif.read = true;

        renderNotificacoes();
    } catch (error) {
        console.error('Erro ao marcar como lida:', error);
    }
}

async function marcarTodasComoLidas() {
    const naoLidas = notificacoes.filter(n => !n.read);
    if (naoLidas.length === 0) {
        showMsg('Não há notificações não lidas', 'info');
        return;
    }

    try {
        const usuario = obterUsuarioAtual();
        if (!usuario || !usuario.empresaId) return;

        const db = getFirebaseDB();
        const batch = writeBatch(db);

        naoLidas.forEach(notif => {
            const ref = doc(db, 'empresas', usuario.empresaId, 'notificacoes', notif.id);
            batch.update(ref, { read: true });
        });

        await batch.commit();

        // Update local state
        naoLidas.forEach(n => n.read = true);

        showMsg('Todas marcadas como lidas', 'success');
        renderNotificacoes();
    } catch (error) {
        console.error('Erro ao marcar todas como lidas:', error);
        showMsg('Erro ao atualizar notificações', 'error');
    }
}

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filtroAtual = btn.dataset.tab;
        renderNotificacoes();
    });
});

// Events
if (btnMarcarTodas) {
    btnMarcarTodas.addEventListener('click', marcarTodasComoLidas);
}
document.getElementById('fechar-modal').addEventListener('click', () => {
    modalDetalhes.classList.add('hidden');
});
modalDetalhes.addEventListener('click', (e) => {
    if (e.target === modalDetalhes) {
        modalDetalhes.classList.add('hidden');
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', carregarNotificacoes);

