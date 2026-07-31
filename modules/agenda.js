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

import { retryWithBackoff } from './utils.js';

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
    
    // Query para bloqueios
    const blQuery = query(
        bloqueiosRef,
        where('inicio', '<', fimISO),
        where('fim', '>', inicioISO)
    );

    // Executar queries com retry
    const [agSnapshot, blSnapshot] = await Promise.all([
        retryWithBackoff(() => getDocs(agQuery)),
        retryWithBackoff(() => getDocs(blQuery))
    ]);

    return !agSnapshot.empty || !blSnapshot.empty;
}

/**
 * Verifica em memória se [slotStart, slotEnd) cruza alguma ocupação.
 */
function isBlocked(ocupacoes, slotStart, slotEnd) {
    return ocupacoes.some(o => {
        const start = new Date(o.inicio);
        const end = new Date(o.fim);
        return start < slotEnd && end > slotStart;
    });
}

/**
 * Generate slots for a given date (with localStorage cache)
 * Otimizado: busca agendamentos + bloqueios do dia em 2 queries
 * e resolve conflitos em memória (antes: 2 queries por slot).
 *
 * Sem índice composto:
 *  - agendamentos: início dentro do dia (o modelo de dados garante início no dia)
 *  - bloqueios: fim após o início do dia (cobre bloqueio de dia inteiro e multi-dia)
 */
export async function generateSlotsForDate(empresaId, dateISO) {
    const config = await getAgendaConfig(empresaId);
    if (!config) throw new Error('Agenda não configurada');

    const { horaInicio, horaFim, duracaoSlot } = config;
    
    const weekdayMap = {
        'seg': 'mon', 'ter': 'tue', 'qua': 'wed',
        'qui': 'thu', 'sex': 'fri', 'sáb': 'sat', 'dom': 'sun'
    };

    const short = new Date(dateISO)
        .toLocaleDateString('pt-BR', { weekday: 'short' })
        .toLowerCase()
        .replace(/\.$/, '');
    const mappedDay = weekdayMap[short] || short;
    if (!config.dias.includes(mappedDay)) return [];

    const start = new Date(`${dateISO}T${horaInicio}:00`);
    const end = new Date(`${dateISO}T${horaFim}:00`);

    const dayStartISO = new Date(`${dateISO}T00:00:00`).toISOString();
    const dayEndISO = new Date(`${dateISO}T23:59:59.999`).toISOString();

    const db = getFirebaseDB();

    const [agendamentos, bloqueios] = await Promise.all([
        getDocs(query(
            collection(db, 'empresas', empresaId, 'agendamentos'),
            where('inicio', '>=', dayStartISO),
            where('inicio', '<=', dayEndISO)
        )).then(snap => snap.docs.map(d => ({ id: d.id, ...d.data() }))),
        getDocs(query(
            collection(db, 'empresas', empresaId, 'bloqueios'),
            where('fim', '>', dayStartISO)
        )).then(snap => snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    ]);

    const ocupacoes = [
        ...agendamentos.filter(a => a.status !== 'cancelado'),
        ...bloqueios,
    ];

    const slots = [];
    let cursor = new Date(start);
    while (cursor.getTime() + duracaoSlot * 60000 <= end.getTime()) {
        const slotStart = new Date(cursor);
        const slotEnd = new Date(cursor.getTime() + duracaoSlot * 60000);

        if (!isBlocked(ocupacoes, slotStart, slotEnd)) {
            slots.push({ inicioISO: slotStart.toISOString(), fimISO: slotEnd.toISOString() });
        }

        cursor = new Date(slotEnd);
    }

    return slots;
}

const SLOTS_CACHE_TTL = 3600000; // 1 hora em ms

/**
 * Read slots cache from Firestore empresa doc (server-side cache)
 * Reference: FIX-ETAPAS.md > Etapa 5.2 - Cache server-side para slots
 */
async function getSlotsCacheFromFirestore(empresaId, dateISO) {
    const db = getFirebaseDB();
    const docSnap = await getDoc(doc(db, 'empresas', empresaId));
    if (!docSnap.exists()) return null;

    const slotsCache = docSnap.data().slotsCache;
    if (!slotsCache || !slotsCache[dateISO]) return null;

    const entry = slotsCache[dateISO];
    if (!entry || !entry.slots || !entry.timestamp) return null;
    if (Date.now() - entry.timestamp >= SLOTS_CACHE_TTL) return null;

    return entry.slots;
}

/**
 * Save slots cache to Firestore empresa doc (best-effort)
 * Merge with existing entries, pruning stale ones.
 */
async function saveSlotsCacheToFirestore(empresaId, dateISO, slots) {
    const db = getFirebaseDB();
    const docRef = doc(db, 'empresas', empresaId);
    const docSnap = await getDoc(docRef);

    const now = Date.now();
    let merged = {};
    if (docSnap.exists() && docSnap.data().slotsCache) {
        const existing = docSnap.data().slotsCache;
        for (const [key, value] of Object.entries(existing)) {
            if (value && now - value.timestamp < SLOTS_CACHE_TTL) {
                merged[key] = value;
            }
        }
    }
    merged[dateISO] = { slots, timestamp: now };

    await updateDoc(docRef, { slotsCache: merged });
}

/**
 * Generate slots for a given date with layered cache:
 * 1. localStorage (fast, per-device)
 * 2. Firestore empresa doc slotsCache (shared, server-side)
 * 3. Fresh generation
 * Reference: FIX-ETAPAS.md > Etapa 5.2
 */
export async function getAgendaSlotsComCache(empresaId, dateISO) {
    const cacheKey = `slots:${empresaId}:${dateISO}`;

    try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            const { slots, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < SLOTS_CACHE_TTL) {
                return slots; // Retorno instantâneo do cache
            }
        }
    } catch (e) {
        // Ignorar erros de localStorage
    }

    // Cache server-side (Firestore) - compartilhado entre dispositivos
    try {
        const firestoreCache = await getSlotsCacheFromFirestore(empresaId, dateISO);
        if (firestoreCache) {
            // Popular cache local
            try {
                localStorage.setItem(cacheKey, JSON.stringify({
                    slots: firestoreCache,
                    timestamp: Date.now()
                }));
            } catch (e) { /* Ignorar erros de localStorage */ }
            return firestoreCache;
        }
    } catch (e) {
        // Ignorar erros de Firestore (permissão, rede, etc.)
    }

    // Buscar dados frescos
    const slots = await generateSlotsForDate(empresaId, dateISO);

    // Salvar no cache local
    try {
        localStorage.setItem(cacheKey, JSON.stringify({
            slots,
            timestamp: Date.now()
        }));
    } catch (e) {
        // Ignorar erros de localStorage (quota excedida, etc.)
    }

    // Salvar no cache server-side (best-effort)
    try {
        await saveSlotsCacheToFirestore(empresaId, dateISO, slots);
    } catch (e) {
        // Ignorar erros (usuário sem permissão de escrita, rede, etc.)
    }

    return slots;
}

/**
 * Create appointment reservation
 */
export async function createAppointment(empresaId, agendamento) {
    try {
        if (!empresaId) throw new Error('empresaId é obrigatório');
        if (!agendamento || !agendamento.inicio || !agendamento.fim) {
            throw new Error('Agendamento inválido: inicio e fim são obrigatórios');
        }

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
    } catch (error) {
        console.error('Erro ao criar agendamento:', error);
        throw new Error(`Falha ao criar agendamento: ${error.message}`);
    }
}

