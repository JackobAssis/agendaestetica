/**
 * Agendamentos Module - Firebase v9+ Modular SDK
 * CORRIGIDO para Firebase v9+ modular
 */

import { 
    getFirebaseDB, 
    getFirebaseAuth,
    collection, 
    collectionGroup,
    doc, 
    addDoc, 
    getDoc, 
    getDocs, 
    query, 
    where, 
    updateDoc,
    orderBy,
    runTransaction,
    getIdToken
} from '../modules/firebase.js';

/**
 * Solicitar agendamento (cliente)
 */
export async function solicitarAgendamento(empresaId, payload) {
    if (!empresaId) throw new Error('empresaId é obrigatório');
    if (!payload || !payload.inicioISO || !payload.fimISO) throw new Error('Intervalo inválido');

    const db = getFirebaseDB();  // ✅ v9+
    const agRef = collection(db, 'empresas', empresaId, 'agendamentos');

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
 */
export async function confirmarAgendamento(empresaId, agendamentoId) {
    if (!empresaId || !agendamentoId) throw new Error('empresaId e agendamentoId obrigatórios');
    
    const db = getFirebaseDB();  // ✅ v9+
    const agDocRef = doc(db, 'empresas', empresaId, 'agendamentos', agendamentoId);
    
    // Remote URL for Cloud Function (if configured)
    const remoteUrl = window.APP_CONFIG && window.APP_CONFIG.confirmAgendamentoFunctionUrl;
    if (remoteUrl) {
        const auth = getFirebaseAuth();  // ✅ v9+
        const user = auth.currentUser;
        if (!user) throw new Error('Usuário não autenticado');
        
        const idToken = await getIdToken(user);  // ✅ v9+

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

    // Fallback: Transactional confirm
    return await runTransaction(db, async (transaction) => {  // ✅ v9+
        const snap = await transaction.get(agDocRef);
        if (!snap.exists) throw new Error('Agendamento não encontrado');
        const data = snap.data();

        const conflictQuery = query(
            collection(db, 'empresas', empresaId, 'agendamentos'),
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
 */
export async function cancelarAgendamento(empresaId, agendamentoId, motivo) {
    if (!empresaId || !agendamentoId) throw new Error('empresaId e agendamentoId obrigatórios');
    
    const db = getFirebaseDB();  // ✅ v9+
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
 */
export async function solicitarRemarcacao(empresaId, agendamentoId, novoInicioISO, novoFimISO, motivo) {
    if (!empresaId || !agendamentoId) throw new Error('empresaId e agendamentoId obrigatórios');
    if (!novoInicioISO || !novoFimISO) throw new Error('Novo intervalo inválido');

    const db = getFirebaseDB();  // ✅ v9+
    const remRef = collection(db, 'empresas', empresaId, 'agendamentos', agendamentoId, 'remarcacoes');

    const res = await addDoc(remRef, {
        novoInicio: novoInicioISO,
        novoFim: novoFimISO,
        motivo: motivo || null,
        status: 'pendente',
        criadoEm: new Date().toISOString(),
    });

    const agDocRef = doc(db, 'empresas', empresaId, 'agendamentos', agendamentoId);
    await updateDoc(agDocRef, { temPedidoRemarcacao: true });

    return { id: res.id, status: 'pendente' };
}

/**
 * Aceitar remarcação (profissional)
 */
export async function aceitarRemarcacao(empresaId, agendamentoId, remarcacaoId) {
    if (!empresaId || !agendamentoId || !remarcacaoId) throw new Error('Parâmetros obrigatórios');
    
    const db = getFirebaseDB();  // ✅ v9+
    const remRef = doc(db, 'empresas', empresaId, 'agendamentos', agendamentoId, 'remarcacoes', remarcacaoId);
    const agDocRef = doc(db, 'empresas', empresaId, 'agendamentos', agendamentoId);

    return await runTransaction(db, async (transaction) => {  // ✅ v9+
        const remSnap = await transaction.get(remRef);
        if (!remSnap.exists) throw new Error('Remarcação não encontrada');
        const rem = remSnap.data();

        const conflictQuery = query(
            collection(db, 'empresas', empresaId, 'agendamentos'),
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
        transaction.update(remRef, { 
            status: 'aceita', 
            aceitaEm: new Date().toISOString() 
        });

        return { id: agendamentoId, remarcacaoId, status: 'remarcado' };
    });
}

/**
 * Rejeitar remarcação
 */
export async function rejeitarRemarcacao(empresaId, agendamentoId, remarcacaoId, motivo) {
    const db = getFirebaseDB();  // ✅ v9+
    const remRef = doc(db, 'empresas', empresaId, 'agendamentos', agendamentoId, 'remarcacoes', remarcacaoId);
    const agDocRef = doc(db, 'empresas', empresaId, 'agendamentos', agendamentoId);

    await updateDoc(remRef, { 
        status: 'rejeitada', 
        motivoRejeicao: motivo || null, 
        atualizadoEm: new Date().toISOString() 
    });
    
    await updateDoc(agDocRef, { temPedidoRemarcacao: false });
    
    return { id: remarcacaoId, status: 'rejeitada' };
}

/**
 * Listar agendamentos da empresa
 */
export async function listAgendamentosEmpresa(empresaId, opts = {}) {
    const db = getFirebaseDB();  // ✅ v9+
    let q = query(
        collection(db, 'empresas', empresaId, 'agendamentos'),
        orderBy('inicio', 'asc')
    );

    if (opts.start && opts.end) {
        q = query(q, where('inicio', '>=', opts.start), where('inicio', '<=', opts.end));
    }

    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Listar agendamentos de um cliente
 * Busca em todas as empresas usando a estrutura do Firestore
 */
export async function listAgendamentosCliente(clienteUid) {
    const db = getFirebaseDB();
    
    // Approach 1: Try collectionGroup query (requires composite index)
    // This is the most efficient but requires Firestore composite index
    try {
        // Using collectionGroup requires importing from firebase
        const { collectionGroup } = await import('../modules/firebase.js');
        
        const q = query(
            collectionGroup(db, 'agendamentos'),
            where('clienteUid', '==', clienteUid),
            orderBy('inicio', 'asc')
        );
        
        const snap = await getDocs(q);
        return snap.docs.map(d => ({
            id: d.id,
            ...d.data(),
            refPath: d.ref.path,
            // Extrair empresaId do path: empresas/{empresaId}/agendamentos/{agendamentoId}
            empresaId: d.ref.path.split('/')[1]
        }));
    } catch (indexError) {
        // Se falhar por índice, usar approach alternativo
        console.warn('CollectionGroup query falhou (precisa de índice), usando approach alternativo:', indexError.message);
    }
    
    // Approach 2: Fallback - buscar empresas primeiro, depois agendamentos
    // Este approach funciona sem índice composite
    try {
        // Buscar dados do cliente para obter empresas vinculadas
        const clienteDoc = await getDoc(doc(db, 'usuarios', clienteUid));
        let empresas = [];
        
        if (clienteDoc.exists()) {
            const clienteData = clienteDoc.data();
            // Cliente pode ter campo 'empresas' com array de IDs
            empresas = clienteData.empresas || [];
        }
        
        // Se não tem empresas vinculadas, buscar todas as empresas e filtrar
        // (menos eficiente mas garante funcionamento)
        if (empresas.length === 0) {
            const empresasSnap = await getDocs(collection(db, 'empresas'));
            empresas = empresasSnap.docs.map(d => d.id);
        }
        
        // Buscar agendamentos de cada empresa
        const todosAgendamentos = [];
        for (const empId of empresas) {
            const agendamentosRef = collection(db, 'empresas', empId, 'agendamentos');
            const q = query(
                agendamentosRef,
                where('clienteUid', '==', clienteUid)
            );
            
            const snap = await getDocs(q);
            for (const doc of snap.docs) {
                todosAgendamentos.push({
                    id: doc.id,
                    ...doc.data(),
                    refPath: doc.ref.path,
                    empresaId: empId
                });
            }
        }
        
        // Ordenar por data
        return todosAgendamentos.sort((a, b) => 
            new Date(a.inicio) - new Date(b.inicio)
        );
    } catch (error) {
        console.error('Erro ao buscar agendamentos do cliente:', error);
        throw error;
    }
}

/**
 * Adicionar nota interna ao agendamento
 */
export async function addNota(empresaId, agendamentoId, nota) {
    const db = getFirebaseDB();  // ✅ v9+
    const agRef = doc(db, 'empresas', empresaId, 'agendamentos', agendamentoId);
    
    // Get current notas and append
    const snap = await getDoc(agRef);
    const data = snap.exists() ? snap.data() : { notas: [] };
    const arr = data.notas || [];
    arr.push({ texto: nota, criadoEm: new Date().toISOString() });
    
    await updateDoc(agRef, { notas: arr });
    return { sucesso: true };
}

