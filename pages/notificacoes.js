
/**
 * Notificações Page - com Push Notifications
 * Reference: ROADMAP-IMPLEMENTACAO.md - Semana 4
 * 
 * Funcionalidades:
 * - Notificações in-app
 * - Push Notifications via Firebase Cloud Messaging
 * - Badge de notificações não lidas
 * - Filtros por status
 */

import { notifyInApp } from '../modules/notifications.js';
import { obterUsuarioAtual } from '../modules/auth.js';
import { 
    getFirebaseDB, 
    doc, 
    getDoc, 
    collection, 
    query, 
    orderBy, 
    limit, 
    getDocs, 
    updateDoc,
    setDoc
} from '../modules/firebase.js';

const listaNotificacoes = document.getElementById('lista-notificacoes');
const mensagem = document.getElementById('mensagem');
const modalDetalhes = document.getElementById('modal-detalhes');
const btnMarcarTodas = document.getElementById('btn-marcar-todas');
const pushToggle = document.getElementById('push-enabled');

let notificacoes = [];
let filtroAtual = 'nao-lidas';
let notifSelecionada = null;
let pushEnabled = false;
let firebaseMessaging = null;

/**
 * Initialize page
 */
async function init() {
    setupEventListeners();
    await carregarConfiguracaoPush();
    await carregarNotificacoes();
    setupFirebaseMessaging();
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Tabs
    document.querySelectorAll('.tab').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(b => b.classList.remove('tab--active'));
            btn.classList.add('tab--active');
            filtroAtual = btn.dataset.tab;
            renderNotificacoes();
        });
    });

    // Marcar todas como lidas
    btnMarcarTodas.addEventListener('click', marcarTodasComoLidas);

    // Push toggle
    pushToggle.addEventListener('change', togglePushNotifications);

    // Modal
    document.getElementById('fechar-modal').addEventListener('click', () => {
        modalDetalhes.classList.add('hidden');
    });
    modalDetalhes.addEventListener('click', (e) => {
        if (e.target === modalDetalhes) {
            modalDetalhes.classList.add('hidden');
        }
    });
}

/**
 * Carregar configuração de push do usuário
 */
async function carregarConfiguracaoPush() {
    const usuario = obterUsuarioAtual();
    if (!usuario || !usuario.empresaId) return;

    try {
        const db = getFirebaseDB();
        const configRef = doc(db, 'empresas', usuario.empresaId, 'configuracoes', 'push');
        const configSnap = await getDoc(configRef);

        if (configSnap.exists()) {
            pushEnabled = configSnap.data().enabled || false;
            pushToggle.checked = pushEnabled;
        }
    } catch (error) {
        console.warn('Erro ao carregar configuração push:', error);
    }
}

/**
 * Setup Firebase Cloud Messaging
 */
async function setupFirebaseMessaging() {
    try {
        // Check if Firebase is initialized
        if (!window.firebaseApp) {
            console.warn('Firebase não inicializado');
            return;
        }

        // Dynamic import of Firebase Messaging
        const { getMessaging, onMessage } = await import('https://www.gstatic.com/firebasejs/10.5.0/firebase-messaging.js');
        
        firebaseMessaging = getMessaging(window.firebaseApp);

        // Listen for messages
        onMessage(firebaseMessaging, (payload) => {
            console.log('Message received:', payload);
            
            // Add to notifications list
            const novaNotif = {
                id: 'push-' + Date.now(),
                title: payload.notification?.title || 'Nova Notificação',
                body: payload.notification?.body || '',
                tipo: payload.data?.tipo || 'default',
                read: false,
                createdAt: new Date().toISOString(),
                meta: payload.data || {}
            };
            
            notificacoes.unshift(novaNotif);
            renderNotificacoes();
            atualizarBadgeContagem();
            
            // Show toast
            showToast(novaNotif.title, 'info');
        });

        console.log('Firebase Messaging configurado');
    } catch (error) {
        console.warn('Firebase Messaging não disponível:', error);
    }
}

/**
 * Toggle push notifications
 */
async function togglePushNotifications() {
    const enabled = pushToggle.checked;
    const usuario = obterUsuarioAtual();
    
    if (!usuario || !usuario.empresaId) {
        pushToggle.checked = !enabled;
        return;
    }

    try {
        if (enabled) {
            // Request permission and get token
            const permission = await Notification.requestPermission();
            
            if (permission === 'granted') {
                await salvarTokenPush(usuario.empresaId);
                pushEnabled = true;
                showToast('Notificações push ativadas!', 'success');
            } else {
                pushToggle.checked = false;
                showToast('Permissão de notificações negada', 'error');
            }
        } else {
            // Disable push
            await removerTokenPush(usuario.empresaId);
            pushEnabled = false;
            showToast('Notificações push desativadas', 'info');
        }

        // Save configuration
        await salvarConfiguracaoPush(usuario.empresaId, pushEnabled);
    } catch (error) {
        console.error('Erro ao configurar push:', error);
        pushToggle.checked = !enabled;
        showToast('Erro ao configurar notificações', 'error');
    }
}

/**
 * Salvar token push no Firestore
 */
async function salvarTokenPush(empresaId) {
    try {
        const { getMessaging, getToken } = await import('https://www.gstatic.com/firebasejs/10.5.0/firebase-messaging.js');
        const messaging = getMessaging(window.firebaseApp);
        
        const token = await getToken(messaging, {
            vapidKey: window.APP_CONFIG?.firebaseVapidKey || 'YOUR_VAPID_KEY'
        });

        const db = getFirebaseDB();
        const tokenRef = doc(db, 'empresas', empresaId, 'pushTokens', token);
        await setDoc(tokenRef, {
            token: token,
            createdAt: new Date().toISOString(),
            ativo: true
        });

        console.log('Token push salvo:', token.substring(0, 20) + '...');
        return token;
    } catch (error) {
        console.error('Erro ao salvar token:', error);
        throw error;
    }
}

/**
 * Remover token push
 */
async function removerTokenPush(empresaId) {
    try {
        const { getMessaging, getToken } = await import('https://www.gstatic.com/firebasejs/10.5.0/firebase-messaging.js');
        const messaging = getMessaging(window.firebaseApp);
        
        const token = await getToken(messaging).catch(() => null);
        
        if (token) {
            const db = getFirebaseDB();
            const tokenRef = doc(db, 'empresas', empresaId, 'pushTokens', token);
            await setDoc(tokenRef, { ativo: false });
        }
    } catch (error) {
        console.warn('Erro ao remover token:', error);
    }
}

/**
 * Salvar configuração de push
 */
async function salvarConfiguracaoPush(empresaId, enabled) {
    try {
        const db = getFirebaseDB();
        const configRef = doc(db, 'empresas', empresaId, 'configuracoes', 'push');
        await setDoc(configRef, {
            enabled: enabled,
            atualizadoEm: new Date().toISOString()
        });
    } catch (error) {
        console.warn('Erro ao salvar configuração push:', error);
    }
}

/**
 * Show message toast
 */
function showMsg(text, type = 'success') {
    mensagem.className = type === 'success' ? 'success-message' : 'error-message';
    mensagem.textContent = text;
    mensagem.classList.remove('hidden');
    setTimeout(() => mensagem.classList.add('hidden'), 5000);
}

/**
 * Show toast notification
 */
function showToast(text, type = 'info') {
    if (typeof showToastNotification === 'function') {
        showToastNotification(text, type);
    } else {
        // Fallback
        showMsg(text, type);
    }
}

/**
 * Format date for display
 */
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

/**
 * Get icon for notification type
 */
function getIconForType(tipo) {
    const icons = {
        'novo_agendamento': '📅',
        'confirmacao': '✅',
        'cancelamento': '❌',
        'troca_pendente': '🔄',
        'troca_aceita': '🔄',
        'troca_rejeitada': '❌',
        'lembrete': '⏰',
        'pagamento': '💰',
        'default': '🔔'
    };
    return icons[tipo] || icons['default'];
}

/**
 * Carregar notificações do Firestore
 */
async function carregarNotificacoes() {
    const usuario = obterUsuarioAtual();
    if (!usuario) {
        window.location.href = '/login';
        return;
    }

    let empresaId = null;
    if (usuario.role === 'profissional') {
        empresaId = usuario.empresaId;
    }

    listaNotificacoes.innerHTML = '<div class="loading">Carregando notificações...</div>';

    try {
        if (!empresaId) {
            listaNotificacoes.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🔔</div>
                    <h3>Sem notificações</h3>
                    <p>As notificações aparecerão aqui quando houver atualizações sobre seus agendamentos.</p>
                    <a href="/" class="btn-primary">Ver Profissionais</a>
                </div>
            `;
            return;
        }

        const db = getFirebaseDB();
        const notifRef = collection(db, 'empresas', empresaId, 'notificacoes');
        const q = query(notifRef, orderBy('createdAt', 'desc'), limit(100));
        const snapshot = await getDocs(q);

        notificacoes = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        renderNotificacoes();
        atualizarBadgeContagem();
    } catch (error) {
        console.error('Erro ao carregar notificações:', error);
        listaNotificacoes.innerHTML = '<div class="error-state">Erro ao carregar notificações.</div>';
    }
}

/**
 * Atualizar badge de contagem
 */
function atualizarBadgeContagem() {
    const naoLidas = notificacoes.filter(n => !n.read).length;
    const badge = document.getElementById('badge-nao-lidas');
    
    if (badge) {
        if (naoLidas > 0) {
            badge.textContent = naoLidas > 99 ? '99+' : naoLidas;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }
}

/**
 * Renderizar lista de notificações
 */
function renderNotificacoes() {
    const filtradas = filtroAtual === 'nao-lidas'
        ? notificacoes.filter(n => !n.read)
        : notificacoes;

    if (filtradas.length === 0) {
        const icon = filtroAtual === 'nao-lidas' ? '✅' : '🔔';
        listaNotificacoes.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">${icon}</div>
                <h3>${filtroAtual === 'nao-lidas' ? 'Tudo certo!' : 'Sem notificações'}</h3>
                <p>${filtroAtual === 'nao-lidas' 
                    ? 'Você não tem notificações não lidas.' 
                    : 'Você não tem notificações ainda.'}</p>
            </div>
        `;
        return;
    }

    listaNotificacoes.innerHTML = filtradas.map(notif => `
        <div class="notificacao-card ${notif.read ? '' : 'unread'}" data-id="${notif.id}">
            <div class="notificacao-icon">${getIconForType(notif.tipo)}</div>
            <div class="notificacao-content">
                <div class="notificacao-header">
                    <strong>${notif.title || 'Notificação'}</strong>
                    <span class="notificacao-tempo">${formatDateTime(notif.createdAt)}</span>
                </div>
                <p class="notificacao-body">${notif.body || ''}</p>
            </div>
            <div class="notificacao-actions">
                ${!notif.read ? '<span class="badge badge-warning">Nova</span>' : ''}
            </div>
        </div>
    `).join('');

    // Add click handlers
    document.querySelectorAll('.notificacao-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.dataset.id;
            const notif = notificacoes.find(n => n.id === id);
            if (notif) mostrarDetalhes(notif);
        });
    });
}

/**
 * Mostrar detalhes da notificação
 */
function mostrarDetalhes(notif) {
    notifSelecionada = notif;

    document.getElementById('modal-titulo').textContent = notif.title || 'Notificação';
    document.getElementById('modal-corpo').innerHTML = `
        <div class="notif-detalhes">
            <p>${notif.body || ''}</p>
            <p class="notif-tempo">Recebida em ${new Date(notif.createdAt).toLocaleString('pt-BR')}</p>
        </div>
    `;

    const btnVer = document.getElementById('btn-ver-agendamento');
    if (notif.meta && notif.meta.agendamentoId) {
        btnVer.style.display = 'inline-block';
        btnVer.onclick = () => {
            window.location.href = `/agendamentos?id=${notif.meta.agendamentoId}`;
        };
    } else {
        btnVer.style.display = 'none';
    }

    modalDetalhes.classList.remove('hidden');

    if (!notif.read) {
        marcarComoLida(notif.id);
    }
}

/**
 * Marcar notificação como lida
 */
async function marcarComoLida(notificacaoId) {
    try {
        const usuario = obterUsuarioAtual();
        if (!usuario || !usuario.empresaId) return;

        const db = getFirebaseDB();
        const docRef = doc(db, 'empresas', usuario.empresaId, 'notificacoes', notificacaoId);
        await updateDoc(docRef, { read: true });

        const notif = notificacoes.find(n => n.id === notificacaoId);
        if (notif) notif.read = true;

        renderNotificacoes();
        atualizarBadgeContagem();
    } catch (error) {
        console.error('Erro ao marcar como lida:', error);
    }
}

/**
 * Marcar todas como lidas
 */
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
        const promises = naoLidas.map(notif => {
            const docRef = doc(db, 'empresas', usuario.empresaId, 'notificacoes', notif.id);
            return updateDoc(docRef, { read: true });
        });

        await Promise.all(promises);

        naoLidas.forEach(n => n.read = true);

        showMsg('Todas marcadas como lidas', 'success');
        renderNotificacoes();
        atualizarBadgeContagem();
    } catch (error) {
        console.error('Erro ao marcar todas como lidas:', error);
        showMsg('Erro ao atualizar notificações', 'error');
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);

export { init, carregarNotificacoes, marcarComoLida, marcarTodasComoLidas };

