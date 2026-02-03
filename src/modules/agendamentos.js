/**
 * Agendamentos Module - Firebase v9+ Modular SDK
 * Responsibilities:
 * - Client solicita agendamento (status: 'solicitado')
 * - Profissional confirma (status: 'confirmado')
 * - Cancelamento, remarcação (requests), notas internas
 * - Listagens para empresa e cliente
 * - Criação de agendamento com transação para prevenir conflitos
 */

// ============================================================
// Firebase v9+ Modular SDK Imports
// ============================================================

import { 
    getFirestore, 
    collection, 
    doc, 
    addDoc, 
    getDoc, 
    getDocs, 
    updateDoc, 
    query, 
    where, 
    orderBy,
    runTransaction,
    serverTimestamp,
    arrayUnion 
} from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js';

import { getAuth, getIdToken } from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js';

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

/**
 * Obter instância do Auth - USA a instância global do index.html
 */
function getFirebaseAuth() {
    if (typeof window !== 'undefined' && window.firebaseApp) {
        return getAuth(window.firebaseApp);
    }
    throw new Error('Firebase Auth não inicializado. Verifique index.html');
}

/**
 * Obter UID do usuário atual
 */
function getCurrentUserUid() {
    try {
        const auth = getFirebaseAuth();
        return auth.currentUser ? auth.currentUser.uid : null;
    } catch (error) {
        console.warn('Erro ao obter usuário atual:', error);
        return null;
    }
}

// ============================================================
// Agendamentos Functions
// ============================================================

/**
 * Solicitar agendamento (cliente)
 * @param {string} empresaId
 * @param {object} payload { inicioISO, fimISO, clienteUid, nomeCliente, telefone, servico }
 */
export async function solicitarAgendamento(empresaId, payload) {
    if (!empresaId) throw new Error('empresaId é obrigatório');
    if (!payload || !payload.inicioISO || !payload.fimISO) throw new Error('Intervalo inválido');

    const db = getFirebaseDB();
    const agRef = collection(db, 'empresas', empresaId, 'agendamentos');

    // criar documento com status 'solicitado'
    const docRef = await addDoc(agRef, {
        inicio: payload.inicioISO,
        fim: payload.fimISO,
        clienteUid: payload.clienteUid || null,
        nomeCliente: payload.nomeCliente || null,
        telefone: payload.telefone || null,
        servico: payload.servico || null,
        status: 'solicitado',
        criadoEm: new Date().toISOString(),
        notas: [],
    });

    return { id: docRef.id, ...payload, status: 'solicitado' };
}

/**
 * Confirmar agendamento (profissional)
 * Usa transação para prevenir conflitos
 * @param {string} empresaId
 * @param {string} agendamentoId
 */
export async function confirmarAgendamento(empresaId, agendamentoId) {
    if (!empresaId || !agendamentoId) throw new Error('empresaId e agendamentoId obrigatórios');
    
    const db = getFirebaseDB();
    const agDocRef = doc(db, 'empresas', empresaId, 'agendamentos', agendamentoId);
    
    // If a Cloud Function URL is configured, delegate confirmation to it for atomic handling
    const remoteUrl = window.APP_CONFIG && window.APP_CONFIG.confirmAgendamentoFunctionUrl;
    if (remoteUrl) {
        // Ensure user is authenticated and obtain idToken
        const auth = getFirebaseAuth();
        const user = auth.currentUser;
        if (!user) throw new Error('Usuário não autenticado');
        const idToken = await getIdToken(user);

        const resp = await fetch(remoteUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({ empresaId, agendamentoId })
        });

        const body = await resp.json();
        if (!resp.ok) throw new Error(body.error || 'Erro ao confirmar via Cloud Function');
        return body.result || body;
    }

    // Fallback: Transactional confirm (client-side)
    return await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(agDocRef);
        if (!snap.exists) throw new Error('Agendamento não encontrado');
        const data = snap.data();

        // Check conflicts
        const agendamentosRef = collection(db, 'empresas', empresaId, 'agendamentos');
        const conflictQuery = query(
            agendamentosRef,
            where('inicio', '<', data.fim),
            where('fim', '>', data.inicio),
            where('status', '==', 'confirmado')
        );

        const conflictSnap = await transaction.get(conflictQuery);
        if (!conflictSnap.empty) throw new Error('Conflito de horário detectado ao confirmar');

        transaction.update(agDocRef, { status: 'confirmado', confirmadoEm: new Date().toISOString() });
        return { id: agendamentoId, status: 'confirmado' };
    });
}

/**
 * Cancelar agendamento
 * @param {string} empresaId
 * @param {string} agendamentoId
 * @param {string} motivo
 */
export async function cancelarAgendamento(empresaId, agendamentoId, motivo) {
    if (!empresaId || !agendamentoId) throw new Error('empresaId e agendamentoId obrigatórios');
    
    const db = getFirebaseDB();
    const agDocRef = doc(db, 'empresas', empresaId, 'agendamentos', agendamentoId);

    await updateDoc(agDocRef, { 
        status: 'cancelado', 
        canceladoEm: new Date().toISOString(), 
        motivoCancelamento: motivo || null 
    });
    
    return { id: agendamentoId, status: 'cancelado' };
}

/**
 * Solicitar remarcação (cliente)
 * grava em subcollection remarcacoes
 */
export async function solicitarRemarcacao(empresaId, agendamentoId, novoInicioISO, novoFimISO, motivo) {
    if (!empresaId || !agendamentoId) throw new Error('empresaId e agendamentoId obrigatórios');
    if (!novoInicioISO || !novoFimISO) throw new Error('Novo intervalo inválido');

    const db = getFirebaseDB();
    const remRef = collection(db, 'empresas', empresaId, 'agendamentos', agendamentoId, 'remarcacoes');

    const res = await addDoc(remRef, {
        novoInicio: novoInicioISO,
        novoFim: novoFimISO,
        motivo: motivo || null,
        status: 'pendente',
        criadoEm: new Date().toISOString(),
    });

    // marcar pedido de remarcação no documento principal
    const agDocRef = doc(db, 'empresas', empresaId, 'agendamentos', agendamentoId);
    await updateDoc(agDocRef, { temPedidoRemarcacao: true });

    return { id: res.id, status: 'pendente' };
}

/**
 * Aceitar remarcação (profissional) — aplica nova data/hora
 */
export async function aceitarRemarcacao(empresaId, agendamentoId, remarcacaoId) {
    if (!empresaId || !agendamentoId || !remarcacaoId) throw new Error('Parâmetros obrigatórios');
    
    const db = getFirebaseDB();
    const remRef = doc(db, 'empresas', empresaId, 'agendamentos', agendamentoId, 'remarcacoes', remarcacaoId);
    const agDocRef = doc(db, 'empresas', empresaId, 'agendamentos', agendamentoId);

    return await runTransaction(db, async (transaction) => {
        const remSnap = await transaction.get(remRef);
        if (!remSnap.exists) throw new Error('Remarcação não encontrada');
        const rem = remSnap.data();

        // check conflicts for new slot (against confirmed)
        const agendamentosRef = collection(db, 'empresas', empresaId, 'agendamentos');
        const conflictQuery = query(
            agendamentosRef,
            where('inicio', '<', rem.novoFim),
            where('fim', '>', rem.novoInicio),
            where('status', '==', 'confirmado')
        );

        const conflictSnap = await transaction.get(conflictQuery);
        if (!conflictSnap.empty) throw new Error('Conflito ao aceitar remarcação');

        transaction.update(agDocRef, { 
            inicio: rem.novoInicio, 
            fim: rem.novoFim, 
            temPedidoRemarcacao: false, 
            atualizadoEm: new Date().toISOString() 
        });
        transaction.update(remRef, { status: 'aceita', aceitaEm: new Date().toISOString() });

        return { id: agendamentoId, remarcacaoId, status: 'remarcado' };
    });
}

/**
 * Rejeitar remarcação
 */
export async function rejeitarRemarcacao(empresaId, agendamentoId, remarcacaoId, motivo) {
    const db = getFirebaseDB();
    const remRef = doc(db, 'empresas', empresaId, 'agendamentos', agendamentoId, 'remarcacoes', remarcacaoId);
    
    await updateDoc(remRef, { 
        status: 'rejeitada', 
        motivoRejeicao: motivo || null, 
        atualizadoEm: new Date().toISOString() 
    });
    
    const agDocRef = doc(db, 'empresas', empresaId, 'agendamentos', agendamentoId);
    await updateDoc(agDocRef, { temPedidoRemarcacao: false });
    
    return { id: remarcacaoId, status: 'rejeitada' };
}

/**
 * Listar agendamentos da empresa (filtro opcional: data)
 */
export async function listAgendamentosEmpresa(empresaId, opts = {}) {
    const db = getFirebaseDB();
    const agendamentosRef = collection(db, 'empresas', empresaId, 'agendamentos');
    
    let q = query(agendamentosRef, orderBy('inicio', 'asc'));

    if (opts.start && opts.end) {
        q = query(q, where('inicio', '>=', opts.start), where('inicio', '<=', opts.end));
    }

    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Listar agendamentos de um cliente
 */
export async function listAgendamentosCliente(clienteUid) {
    const db = getFirebaseDB();
    
    // Use collectionGroup for cross-collection query
    const q = query(
        collection(db, 'empresas'),
        where('agendamentos.clienteUid', '==', clienteUid),
        orderBy('inicio', 'asc')
    );
    
    // Note: collectionGroup queries require specific indexing
    // For simplicity, we'll iterate through empresas if needed
    // In production, consider using a dedicated collection for client appointments
    
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Adicionar nota interna ao agendamento
 */
export async function addNota(empresaId, agendamentoId, nota) {
    const db = getFirebaseDB();
    const agRef = doc(db, 'empresas', empresaId, 'agendamentos', agendamentoId);
    
    // Firebase v9+ way to use arrayUnion
    await updateDoc(agRef, { 
        notas: arrayUnion({
            texto: nota,
            criadoEm: new Date().toISOString(),
            criadoPor: getCurrentUserUid()
        })
    });
    
    return { sucesso: true };
}

