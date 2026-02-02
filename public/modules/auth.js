/**
 * Authentication Module - Firebase v9+ Modular SDK
 * CORRIGIDO para usar instâncias compartilhadas do index.html
 */

// Firebase Auth funções necessárias (importadas para uso)
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signInAnonymously, 
    signOut, 
    sendPasswordResetEmail,
    updateProfile,
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js';

// Firebase Firestore funções necessárias
import { 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    getDocs, 
    query, 
    where, 
    updateDoc 
} from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js';

// ============================================================
// Firebase Instance Factory (usa instâncias compartilhadas)
// ============================================================

/**
 * Obter instância do Auth - USA a instância global do index.html
 * Isso evita criar múltiplas instâncias do Firebase
 */
function getFirebaseAuth() {
    if (typeof window !== 'undefined' && window.firebase && window.firebase.auth) {
        return window.firebase.auth;
    }
    throw new Error('Firebase Auth não inicializado. Verifique index.html');
}

/**
 * Obter instância do Firestore - USA a instância global do index.html
 */
function getFirebaseDB() {
    if (typeof window !== 'undefined' && window.firebase && window.firebase.db) {
        return window.firebase.db;
    }
    throw new Error('Firebase Firestore não inicializado. Verifique index.html');
}

// ============================================================
// Helper Functions
// ============================================================

function isEmail(input) {
    return input && input.includes('@') && input.includes('.');
}

function isPhone(input) {
    const phoneRegex = /^(\+55)?[1-9]{2}[9]?\d{8,9}$/;
    return phoneRegex.test(input.replace(/[\s\-\(\)]/g, ''));
}

function normalizePhone(input) {
    let phone = input.replace(/[\s\-\(\)]/g, '');
    if (!phone.startsWith('+55') && phone.length >= 10) {
        phone = '+55' + phone;
    }
    return phone;
}

function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function generateRandomPassword() {
    return Math.random().toString(36).slice(-12);
}

// ============================================================
// Main Authentication Functions (v9+)
// ============================================================

/**
 * Cadastro de Profissional
 */
export async function cadastroProfissional(emailOuTelefone, senha, nome, profissao) {
    const auth = getFirebaseAuth();  // Usa instância global
    const db = getFirebaseDB();      // Usa instância global
    
    if (!nome || !profissao) throw new Error('Nome e profissão são obrigatórios');
    
    let user;
    let email = null;
    let telefone = null;
    
    if (isEmail(emailOuTelefone)) {
        if (!senha || senha.length < 6) throw new Error('Senha deve ter no mínimo 6 caracteres');
        if (!isValidEmail(emailOuTelefone)) throw new Error('Email inválido');
        
        // ✅ Firebase v9+ com instância compartilhada
        const result = await createUserWithEmailAndPassword(auth, emailOuTelefone, senha);
        user = result.user;
        email = emailOuTelefone;
        
    } else if (isPhone(emailOuTelefone)) {
        const phoneNumber = normalizePhone(emailOuTelefone);
        telefone = phoneNumber;
        throw new Error('Para cadastro por telefone, verifique o código enviado por SMS');
    } else {
        throw new Error('Email ou telefone inválido');
    }
    
    await updateProfile(user, { displayName: nome });
    
    const empresaId = `prof_${user.uid}`;
    
    await setDoc(doc(db, 'usuarios', user.uid), {
        uid: user.uid, email, telefone, nome, profissao,
        role: 'profissional', empresaId,
        criadoEm: new Date().toISOString(), ativo: true,
    });
    
    await setDoc(doc(db, 'empresas', empresaId), {
        empresaId, proprietarioUid: user.uid, nome, profissao,
        contato: telefone || email,
        criadoEm: new Date().toISOString(), ativo: true, plano: 'free',
    });
    
    return { uid: user.uid, email, telefone, nome, role: 'profissional', empresaId };
}

/**
 * Cadastro de Cliente
 */
export async function cadastroCliente(email, nome) {
    const auth = getFirebaseAuth();
    const db = getFirebaseDB();
    
    if (!email || !nome) throw new Error('Email e nome são obrigatórios');
    if (!isValidEmail(email)) throw new Error('Email inválido');
    
    const result = await createUserWithEmailAndPassword(auth, email, generateRandomPassword());
    const { user } = result;
    
    await updateProfile(user, { displayName: nome });
    
    await setDoc(doc(db, 'usuarios', user.uid), {
        uid: user.uid, email, nome,
        role: 'cliente',
        criadoEm: new Date().toISOString(), ativo: true,
    });
    
    return { uid: user.uid, email: user.email, nome, role: 'cliente' };
}

/**
 * Login de Profissional
 */
export async function loginProfissional(emailOuTelefone, senha) {
    const auth = getFirebaseAuth();
    const db = getFirebaseDB();
    
    if (!emailOuTelefone) throw new Error('Email ou telefone é obrigatório');
    
    let user;
    
    if (isEmail(emailOuTelefone)) {
        if (!senha) throw new Error('Senha é obrigatória para login por email');
        const result = await signInWithEmailAndPassword(auth, emailOuTelefone, senha);
        user = result.user;
    } else if (isPhone(emailOuTelefone)) {
        const phoneNumber = normalizePhone(emailOuTelefone);
        const q = query(
            collection(db, 'usuarios'),
            where('telefone', '==', phoneNumber),
            where('role', '==', 'profissional')
        );
        const snapshot = await getDocs(q);
        if (snapshot.empty) throw new Error('Profissional não encontrado');
        
        const userData = snapshot.docs[0].data();
        await signInAnonymously();
        return userData;
    } else {
        throw new Error('Email ou telefone inválido');
    }
    
    const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
    if (!userDoc.exists()) throw new Error('Dados do usuário não encontrados');
    
    const userData = userDoc.data();
    if (userData.role !== 'profissional') throw new Error('Esse usuário não é um profissional');
    
    localStorage.setItem('usuarioAtual', JSON.stringify({
        uid: user.uid, email: user.email, nome: userData.nome,
        telefone: userData.telefone, profissao: userData.profissao,
        role: userData.role, empresaId: userData.empresaId,
    }));
    
    return userData;
}

/**
 * Login de Cliente
 */
export async function loginCliente(email) {
    const db = getFirebaseDB();
    
    if (!email || !isValidEmail(email)) throw new Error('Email inválido');
    
    const q = query(
        collection(db, 'usuarios'),
        where('email', '==', email),
        where('role', '==', 'cliente')
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) throw new Error('Cliente não encontrado');
    
    const clienteData = snapshot.docs[0].data();
    await signInAnonymously();
    
    localStorage.setItem('usuarioAtual', JSON.stringify({
        uid: clienteData.uid, email: clienteData.email,
        nome: clienteData.nome, role: clienteData.role,
    }));
    
    return clienteData;
}

/**
 * Verificar sessão existente
 */
export async function verificarSessao() {
    const auth = getFirebaseAuth();
    const db = getFirebaseDB();
    
    const usuarioLocal = localStorage.getItem('usuarioAtual');
    if (usuarioLocal) return { usuario: JSON.parse(usuarioLocal), logado: true };
    
    return new Promise((resolve) => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    localStorage.setItem('usuarioAtual', JSON.stringify({
                        uid: user.uid, email: user.email, nome: userData.nome,
                        role: userData.role, empresaId: userData.empresaId,
                        profissao: userData.profissao,
                    }));
                    
                    if (userData.role === 'profissional') {
                        const empresaDoc = await getDoc(doc(db, 'empresas', userData.empresaId));
                        const destino = (empresaDoc.exists() && !empresaDoc.data().onboardingCompleto) 
                            ? '/onboarding' : '/dashboard';
                        window.location.href = destino;
                    } else {
                        window.location.href = '/confirmacao';
                    }
                    
                    resolve({ usuario: { uid: user.uid, email: user.email, ...userData }, logado: true });
                } else {
                    resolve({ usuario: null, logado: false });
                }
            } else {
                resolve({ usuario: null, logado: false });
            }
        });
    });
}

export function obterUsuarioAtual() {
    const usuarioLocal = localStorage.getItem('usuarioAtual');
    return usuarioLocal ? JSON.parse(usuarioLocal) : null;
}

export async function logout() {
    const auth = getFirebaseAuth();
    localStorage.removeItem('usuarioAtual');
    await signOut(auth);
    window.location.href = '/login';
}

export async function resetarSenha(email) {
    const auth = getFirebaseAuth();
    if (!email || !isValidEmail(email)) throw new Error('Email inválido');
    await sendPasswordResetEmail(auth, email);
}

export async function atualizarPerfil(dados) {
    const usuario = obterUsuarioAtual();
    if (!usuario) throw new Error('Usuário não está logado');
    
    const auth = getFirebaseAuth();
    const db = getFirebaseDB();
    
    if (dados.nome && auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: dados.nome });
    }
    
    await updateDoc(doc(db, 'usuarios', usuario.uid), {
        ...dados,
        atualizadoEm: new Date().toISOString(),
    });
    
    localStorage.setItem('usuarioAtual', JSON.stringify({ ...usuario, ...dados }));
}

