/**
 * Clientes Module - Firebase v9+ Modular SDK
 * Responsibilities:
 * - CRUD básico para clientes por empresa
 * - Observações internas
 * - Histórico de agendamentos por cliente
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
    arrayUnion 
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
// Clientes Functions
// ============================================================

export async function addCliente(empresaId, cliente) {
    if (!empresaId) throw new Error('empresaId é obrigatório');
    if (!cliente || !cliente.nome) throw new Error('Dados do cliente inválidos');

    const db = getFirebaseDB();
    const currentUserUid = getCurrentUserUid();
    
    const payload = {
        nome: cliente.nome,
        email: cliente.email || null,
        telefone: cliente.telefone || null,
        criadoEm: new Date().toISOString(),
        criadoPor: currentUserUid,
        observacoes: [],
    };

    const clientesRef = collection(db, 'empresas', empresaId, 'clientes');
    const docRef = await addDoc(clientesRef, payload);
    return { id: docRef.id, ...payload };
}

/**
 * Find a client by email under empresa; if not found, create one.
 * Returns the cliente object with id.
 */
export async function findOrCreateClienteByEmail(empresaId, email, nome, telefone) {
    if (!empresaId) throw new Error('empresaId é obrigatório');
    if (!email && !nome) throw new Error('Email ou nome é obrigatório para criar cliente');

    const db = getFirebaseDB();
    
    if (email) {
        const clientesRef = collection(db, 'empresas', empresaId, 'clientes');
        const q = query(clientesRef, where('email', '==', email));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
            const d = snapshot.docs[0];
            return { id: d.id, ...d.data() };
        }
    }

    // Create new cliente
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
    
    const db = getFirebaseDB();
    const docRef = doc(db, 'empresas', empresaId, 'clientes', clienteId);
    const snap = await getDoc(docRef);
    
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
}

export async function listClientesEmpresa(empresaId) {
    if (!empresaId) throw new Error('empresaId é obrigatório');
    
    const db = getFirebaseDB();
    const clientesRef = collection(db, 'empresas', empresaId, 'clientes');
    const q = query(clientesRef, orderBy('criadoEm', 'desc'));
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addObservacao(empresaId, clienteId, nota) {
    if (!empresaId || !clienteId) throw new Error('empresaId e clienteId obrigatórios');
    if (!nota) throw new Error('Nota inválida');
    
    const db = getFirebaseDB();
    const clienteRef = doc(db, 'empresas', empresaId, 'clientes', clienteId);
    const currentUserUid = getCurrentUserUid();
    
    // Firebase v9+: usar arrayUnion diretamente
    await updateDoc(clienteRef, { 
        observacoes: arrayUnion({ 
            texto: nota, 
            criadoEm: new Date().toISOString(), 
            criadoPor: currentUserUid 
        }) 
    });
    
    return { sucesso: true };
}

export async function getHistorico(empresaId, clienteId) {
    if (!empresaId || !clienteId) throw new Error('empresaId e clienteId obrigatórios');
    
    const db = getFirebaseDB();
    const agendamentosRef = collection(db, 'empresas', empresaId, 'agendamentos');
    const q = query(
        agendamentosRef, 
        where('clienteUid', '==', clienteId), 
        orderBy('inicio', 'desc')
    );
    
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export default { 
    addCliente, 
    findOrCreateClienteByEmail,
    getCliente, 
    listClientesEmpresa, 
    addObservacao, 
    getHistorico 
};

