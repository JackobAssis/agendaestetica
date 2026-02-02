/**
 * Agendamentos Module - Firebase v9+ Modular SDK
 * CORRIGIDO para Firebase v9+ modular
 */

import { 
    getFirebaseDB, 
    getFirebaseAuth,
    collection, 
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

export async function solicitarAgendamento(empresaId, payload) {
    if (!empresaId) throw new Error('empresaId é obrigatório');
    if (!payload || !payload.inicioISO || !payload.fimISO) throw new Error('Intervalo inválido');

    const db = getFirebaseDB();
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

export async function confirmarAgendamento(empresaId, agendamentoId) {
    if (!empresaId || !agendamentoId) throw new Error('empresaId e agendamentoId obrigatórios');
    
    const db = getFirebaseDB();
    const agDocRef = doc(db, 'empresas', empresaId, 'agendamentos', agendamentoId);
    
    const remoteUrl = window.APP_CONFIG && window.APP_CONFIG.confirmAgendamentoFunctionUrl;
    if (remoteUrl) {
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

    return await runTransaction(db, async (transaction) => {
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

    const agDocRef = doc(db, 'empresas', empresaId, 'agendamentos', agendamentoId);
    await updateDoc(agDocRef, { temPedidoRemarcacao: true });

    return { id: res.id, status: 'pendente' };
}

export async function aceitarRemarcacao(empresaId, agendamentoId, remarcacaoId) {
    if (!empresaId || !agendamentoId || !remarcacaoId) throw new Error('Parâmetros obrigatórios');
    
    const db = getFirebaseDB();
    const remRef = doc(db, 'empresas', empresaId, 'agendamentos', agendamentoId, 'remarcacoes', remarcacaoId);
    const agDocRef = doc(db, 'empresas', empresaId, 'agendamentos', agendamentoId);

    return await runTransaction(db, async (transaction) => {
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

export async function rejeitarRemarcacao(empresaId, agendamentoId, remarcacaoId, motivo) {
    const db = getFirebaseDB();
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

export async function listAgendamentosEmpresa(empresaId, opts = {}) {
    const db = getFirebaseDB();
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

export async function listAgendamentosCliente(clienteUid) {
    const db = getFirebaseDB();
    
    const q = query(
        collection(db, 'agendamentos'),
        where('clienteUid', '==', clienteUid),
        orderBy('inicio', 'asc')
    );
    
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data(), refPath: d.ref.path }));
}

export async function addNota(empresaId, agendamentoId, nota) {
    const db = getFirebaseDB();
    const agRef = doc(db, 'empresas', empresaId, 'agendamentos', agendamentoId);
    
    const snap = await getDoc(agRef);
    const data = snap.exists() ? snap.data() : { notas: [] };
    const arr = data.notas || [];
    arr.push({ texto: nota, criadoEm: new Date().toISOString() });
    
    await updateDoc(agRef, { notas: arr });
    return { sucesso: true };
}

