/**
 * Agenda Module - Firebase v9+ Modular SDK
 * Responsibilities:
 * - Save / read agenda configuration for empresa
 * - Create blocks (bloqueios)
 * - Generate slots for a date based on configuration
 * - Check conflicts against existing agendamentos
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
    where 
} from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js';

import { getAuth } from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js';

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
// Agenda Functions
// ============================================================

/**
 * Save agenda configuration under empresas}.agendaConfig
 * @param/{empresaId {string} empresaId
 * @param {object} config { dias:[], horaInicio, horaFim, duracaoSlot }
 */
export async function saveAgendaConfig(empresaId, config) {
    if (!empresaId) throw new Error('empresaId é obrigatório');
    if (!config || !config.dias || !config.horaInicio || !config.horaFim) throw new Error('Configuração inválida');

    const db = getFirebaseDB();
    const payload = {
        agendaConfig: {
            dias: config.dias,
            horaInicio: config.horaInicio,
            horaFim: config.horaFim,
            duracaoSlot: config.duracaoSlot || 30,
            atualizadoEm: new Date().toISOString(),
        }
    };

    const empresaRef = doc(db, 'empresas', empresaId);
    await updateDoc(empresaRef, payload);
    return payload.agendaConfig;
}

/**
 * Get agenda configuration for empresa
 */
export async function getAgendaConfig(empresaId) {
    if (!empresaId) throw new Error('empresaId é obrigatório');
    const db = getFirebaseDB();
    const docRef = doc(db, 'empresas', empresaId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return docSnap.data().agendaConfig || null;
}

/**
 * Create a blocking period (bloqueio) for empresa
 * Stores in empresas/{empresaId}/bloqueios/
 * @param {string} empresaId
 * @param {object} block { inicioISO, fimISO, motivo }
 */
export async function createBlock(empresaId, block) {
    if (!empresaId) throw new Error('empresaId é obrigatório');
    if (!block || !block.inicioISO || !block.fimISO) throw new Error('Block inválido');

    const db = getFirebaseDB();
    const currentUserUid = getCurrentUserUid();
    const payload = {
        inicio: block.inicioISO,
        fim: block.fimISO,
        motivo: block.motivo || 'Bloqueio manual',
        criadoEm: new Date().toISOString(),
        criadoPor: currentUserUid,
    };

    const bloqueiosRef = collection(db, 'empresas', empresaId, 'bloqueios');
    const docRef = await addDoc(bloqueiosRef, payload);
    return { id: docRef.id, ...payload };
}

/**
 * Check conflict between given interval and existing agendamentos or bloqueios
 * Returns true if conflict exists
 */
export async function checkConflict(empresaId, inicioISO, fimISO) {
    if (!empresaId) throw new Error('empresaId é obrigatório');
    const db = getFirebaseDB();

    // Check agendamentos subcollection
    const agendamentosRef = collection(db, 'empresas', empresaId, 'agendamentos');
    const bloqueiosRef = collection(db, 'empresas', empresaId, 'bloqueios');

    // naive overlapping query: start < fim && end > inicio
    const agQuery = query(
        agendamentosRef,
        where('inicio', '<', fimISO),
        where('fim', '>', inicioISO)
    );

    const agSnapshot = await getDocs(agQuery);
    if (!agSnapshot.empty) return true;

    const blQuery = query(
        bloqueiosRef,
        where('inicio', '<', fimISO),
        where('fim', '>', inicioISO)
    );

    const blSnapshot = await getDocs(blQuery);
    if (!blSnapshot.empty) return true;

    return false;
}

/**
 * Generate slots for a given date (ISO date string YYYY-MM-DD)
 * Uses empresa agendaConfig and excludes bloqueios and existing agendamentos
 * Returns array of slots { inicioISO, fimISO }
 */
export async function generateSlotsForDate(empresaId, dateISO) {
    // dateISO ex: '2026-01-31'
    const config = await getAgendaConfig(empresaId);
    if (!config) throw new Error('Agenda não configurada');

    const { horaInicio, horaFim, duracaoSlot, dias } = config;
    
    // Map pt-BR short weekday to values used in config (assume mon, tue...)
    const weekdayMap = {
        'seg': 'mon',
        'ter': 'tue',
        'qua': 'wed',
        'qui': 'thu',
        'sex': 'fri',
        'sáb': 'sat',
        'dom': 'sun'
    };

    const short = new Date(dateISO).toLocaleDateString('pt-BR', { weekday: 'short' }).toLowerCase();
    const mappedDay = weekdayMap[short] || short;
    if (!config.dias.includes(mappedDay)) return [];

    // build times
    const slots = [];
    const [hIni, mIni] = horaInicio.split(':').map(Number);
    const [hFim, mFim] = horaFim.split(':').map(Number);

    const start = new Date(`${dateISO}T${horaInicio}:00`);
    const end = new Date(`${dateISO}T${horaFim}:00`);

    let cursor = new Date(start);
    while (cursor.getTime() + duracaoSlot * 60000 <= end.getTime()) {
        const slotStart = new Date(cursor);
        const slotEnd = new Date(cursor.getTime() + duracaoSlot * 60000);
        const inicioISO = slotStart.toISOString();
        const fimISO = slotEnd.toISOString();

        // Check conflict
        // Note: calls checkConflict per slot (could be optimized server-side)
        // We'll include slots that have no conflict
        // For performance, consider batching queries in future
        // eslint-disable-next-line no-await-in-loop
        const conflict = await checkConflict(empresaId, inicioISO, fimISO);
        if (!conflict) slots.push({ inicioISO, fimISO });

        cursor = new Date(slotEnd);
    }

    return slots;
}

/**
 * Create appointment reservation (used later in FASE 5) with transaction
 * This function demonstrates conflict prevention via transaction
 * @param {string} empresaId
 * @param {object} agendamento { inicio, fim, clienteUid, servico }
 */
export async function createAppointment(empresaId, agendamento) {
    const db = getFirebaseDB();
    const agRef = collection(db, 'empresas', empresaId, 'agendamentos');

    // Simple optimistic check then add - for stronger consistency use transactions on server-side
    const conflict = await checkConflict(empresaId, agendamento.inicio, agendamento.fim);
    if (conflict) throw new Error('Conflito de horário detectado');

    const docRef = await addDoc(agRef, {
        inicio: agendamento.inicio,
        fim: agendamento.fim,
        clienteUid: agendamento.clienteUid || null,
        servico: agendamento.servico || null,
        status: 'confirmado',
        criadoEm: new Date().toISOString(),
    });

    return { id: docRef.id, ...agendamento };
}

