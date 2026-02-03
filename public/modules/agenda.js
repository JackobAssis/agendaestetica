/**
 * Agenda Module - Firebase v9+ Modular SDK
 * Responsibilities:
 * - Save / read agenda configuration for empresa
 * - Create blocks (bloqueios)
 * - Generate slots for a date based on configuration
 * - Check conflicts against existing agendamentos
 * 
 * CORRIGIDO para Firebase v9+ modular
 */

import { 
    getFirebaseDB, 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    getDocs, 
    query, 
    where, 
    updateDoc,
    addDoc,
    orderBy
} from '../modules/firebase.js';

/**
 * Save agenda configuration under empresas/{empresaId}.agendaConfig
 */
export async function saveAgendaConfig(empresaId, config) {
    if (!empresaId) throw new Error('empresaId é obrigatório');
    if (!config || !config.dias || !config.horaInicio || !config.horaFim) throw new Error('Configuração inválida');

    const db = getFirebaseDB();  // ✅ v9+
    const payload = {
        agendaConfig: {
            dias: config.dias,
            horaInicio: config.horaInicio,
            horaFim: config.horaFim,
            duracaoSlot: config.duracaoSlot || 30,
            atualizadoEm: new Date().toISOString(),
        }
    };

    // ✅ Firebase v9+: updateDoc(doc(db, collection, id), data)
    await updateDoc(doc(db, 'empresas', empresaId), payload);
    return payload.agendaConfig;
}

/**
 * Get agenda configuration for empresa
 */
export async function getAgendaConfig(empresaId) {
    if (!empresaId) throw new Error('empresaId é obrigatório');
    const db = getFirebaseDB();  // ✅ v9+
    
    // ✅ Firebase v9+: getDoc(doc(db, collection, id))
    const docRef = doc(db, 'empresas', empresaId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;
    return docSnap.data().agendaConfig || null;
}

/**
 * Create a blocking period (bloqueio) for empresa
 * Stores in empresas/{empresaId}/bloqueios/
 */
export async function createBlock(empresaId, block) {
    if (!empresaId) throw new Error('empresaId é obrigatório');
    if (!block || !block.inicioISO || !block.fimISO) throw new Error('Block inválido');

    const db = getFirebaseDB();  // ✅ v9+
    
    const payload = {
        inicio: block.inicioISO,
        fim: block.fimISO,
        motivo: block.motivo || 'Bloqueio manual',
        criadoEm: new Date().toISOString(),
        // Não precisamos do currentUser aqui para simplificação
    };

    // ✅ Firebase v9+: addDoc(collection(db, path), data)
    const ref = await addDoc(collection(db, 'empresas', empresaId, 'bloqueios'), payload);
    return { id: ref.id, ...payload };
}

/**
 * Check conflict between given interval and existing agendamentos or bloqueios
 */
export async function checkConflict(empresaId, inicioISO, fimISO) {
    if (!empresaId) throw new Error('empresaId é obrigatório');
    const db = getFirebaseDB();  // ✅ v9+

    const agendamentosRef = collection(db, 'empresas', empresaId, 'agendamentos');
    const bloqueiosRef = collection(db, 'empresas', empresaId, 'bloqueios');

    // Query para agendamentos
    const agQuery = query(
        agendamentosRef,
        where('inicio', '<', fimISO),
        where('fim', '>', inicioISO)
    );
    const agSnapshot = await getDocs(agQuery);
    if (!agSnapshot.empty) return true;

    // Query para bloqueios
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
 * Generate slots for a given date
 */
export async function generateSlotsForDate(empresaId, dateISO) {
    const config = await getAgendaConfig(empresaId);
    if (!config) throw new Error('Agenda não configurada');

    const { horaInicio, horaFim, duracaoSlot, dias } = config;
    
    const weekdayMap = {
        'seg': 'mon', 'ter': 'tue', 'qua': 'wed',
        'qui': 'thu', 'sex': 'fri', 'sáb': 'sat', 'dom': 'sun'
    };

    const short = new Date(dateISO).toLocaleDateString('pt-BR', { weekday: 'short' }).toLowerCase();
    const mappedDay = weekdayMap[short] || short;
    if (!config.dias.includes(mappedDay)) return [];

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

        // eslint-disable-next-line no-await-in-loop
        const conflict = await checkConflict(empresaId, inicioISO, fimISO);
        if (!conflict) slots.push({ inicioISO, fimISO });

        cursor = new Date(slotEnd);
    }

    return slots;
}

/**
 * Create appointment reservation
 */
export async function createAppointment(empresaId, agendamento) {
    const db = getFirebaseDB();  // ✅ v9+
    const agRef = collection(db, 'empresas', empresaId, 'agendamentos');

    const conflict = await checkConflict(empresaId, agendamento.inicio, agendamento.fim);
    if (conflict) throw new Error('Conflito de horário detectado');

    const res = await addDoc(agRef, {
        inicio: agendamento.inicio,
        fim: agendamento.fim,
        clienteUid: agendamento.clienteUid || null,
        servico: agendamento.servico || null,
        status: 'confirmado',
        criadoEm: new Date().toISOString(),
    });

    return { id: res.id, ...agendamento };
}

