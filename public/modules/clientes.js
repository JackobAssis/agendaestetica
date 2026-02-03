/**
 * Clientes Module - Firebase v9+ Modular SDK
 * CORRIGIDO para Firebase v9+ modular
 */

import { 
    getFirebaseDB, 
    collection, 
    doc, 
    addDoc, 
    getDoc, 
    getDocs, 
    query, 
    where, 
    updateDoc,
    orderBy,
    serverTimestamp
} from '../modules/firebase.js';

export async function addCliente(empresaId, cliente) {
    if (!empresaId) throw new Error('empresaId é obrigatório');
    if (!cliente || !cliente.nome) throw new Error('Dados do cliente inválidos');

    const db = getFirebaseDB();  // ✅ v9+
    const payload = {
        nome: cliente.nome,
        email: cliente.email || null,
        telefone: cliente.telefone || null,
        criadoEm: new Date().toISOString(),
        criadoPor: null,  // Simplified: remove currentUser dependency
        observacoes: [],
    };

    const ref = await addDoc(collection(db, 'empresas', empresaId, 'clientes'), payload);
    return { id: ref.id, ...payload };
}

export async function findOrCreateClienteByEmail(empresaId, email, nome, telefone) {
    if (!empresaId) throw new Error('empresaId é obrigatório');
    if (!email && !nome) throw new Error('Email ou nome é obrigatório para criar cliente');

    const db = getFirebaseDB();  // ✅ v9+
    
    if (email) {
        const q = query(
            collection(db, 'empresas', empresaId, 'clientes'),
            where('email', '==', email)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            const d = snapshot.docs[0];
            return { id: d.id, ...d.data() };
        }
    }

    const payload = { 
        nome: nome || (email ? email.split('@')[0] : 'Cliente'), 
        email: email || null, 
        telefone: telefone || null 
    };
    const res = await addCliente(empresaId, payload);
    return res;
}

export async function getCliente(empresaId, clienteId) {
    if (!empresaId || !clienteId) throw new Error('empresaId e clienteId obrigatórios');
    const db = getFirebaseDB();  // ✅ v9+
    
    const docRef = doc(db, 'empresas', empresaId, 'clientes', clienteId);
    const snap = await getDoc(docRef);
    
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
}

export async function listClientesEmpresa(empresaId) {
    if (!empresaId) throw new Error('empresaId é obrigatório');
    const db = getFirebaseDB();  // ✅ v9+
    
    const q = query(
        collection(db, 'empresas', empresaId, 'clientes'),
        orderBy('criadoEm', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addObservacao(empresaId, clienteId, nota) {
    if (!empresaId || !clienteId) throw new Error('empresaId e clienteId obrigatórios');
    if (!nota) throw new Error('Nota inválida');
    
    const db = getFirebaseDB();  // ✅ v9+
    const clienteRef = doc(db, 'empresas', empresaId, 'clientes', clienteId);
    
    // Fetch current data and update
    const snap = await getDoc(clienteRef);
    const data = snap.exists() ? snap.data() : { observacoes: [] };
    const arr = data.observacoes || [];
    arr.push({ texto: nota, criadoEm: new Date().toISOString(), criadoPor: null });
    
    await updateDoc(clienteRef, { observacoes: arr });
    return { sucesso: true };
}

export async function getHistorico(empresaId, clienteId) {
    if (!empresaId || !clienteId) throw new Error('empresaId e clienteId obrigatórios');
    const db = getFirebaseDB();  // ✅ v9+
    
    // Use collectionGroup query
    const q = query(
        collection(db, 'agendamentos'),
        where('clienteUid', '==', clienteId),
        orderBy('inicio', 'desc')
    );
    
    // Note: collectionGroup queries require indexes
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export default { addCliente, getCliente, listClientesEmpresa, addObservacao, getHistorico };

