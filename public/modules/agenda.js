/**
 * Agenda Module - Firebase v9+ Modular SDK
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

    await updateDoc(doc(db, 'empresas', empresaId), payload);
    return payload.agendaConfig;
}

export async function getAgendaConfig(empresaId) {
    if (!empresaId) throw new Error('empresaId é obrigatório');
    const db = getFirebaseDB();
    
    const docRef = doc(db, 'empresas', empresaId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;
    return docSnap.data().agendaConfig || null;
}

export async function createBlock(empresaId, block) {
    if (!empresaId) throw new Error('empresaId é obrigatório');
    if (!block || !block.inicioISO || !block.fimISO) throw new Error('Block inválido');

    const db = getFirebaseDB();
    
    const payload = {
        inicio: block.inicioISO,
        fim: block.fimISO,
        motivo: block.motivo || 'Bloqueio manual',
        criadoEm: new Date().toISOString(),
    };

    const ref = await addDoc(collection(db, 'empresas', empresaId, 'bloqueios'), payload);
    return { id: ref.id, ...payload };
}

export async function checkConflict(empresaId, inicioISO, fimISO) {
    if (!empresaId) throw new Error('empresaId é obrigatório');
    const db = getFirebaseDB();

    const agendamentosRef = collection(db, 'empresas', empresaId, 'agendamentos');
    const bloqueiosRef = collection(db, 'empresas', empresaId, 'bloqueios');

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

        const conflict = await checkConflict(empresaId, inicioISO, fimISO);
        if (!conflict) slots.push({ inicioISO, fimISO });

        cursor = new Date(slotEnd);
    }

    return slots;
}

export async function createAppointment(empresaId, agendamento) {
    const db = getFirebaseDB();
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

