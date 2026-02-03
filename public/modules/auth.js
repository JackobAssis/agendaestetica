/**
 * Authentication Module - Firebase v9+ Modular SDK
 * 
 * This module handles all authentication operations using Firebase v9+ modular SDK.
 * It uses factory functions to get Firebase instances from the app initialized in index.html.
 * 
 * Architecture:
 * - index.html initializes Firebase and exposes: window.firebaseApp
 * - auth.js uses getAuth(window.firebaseApp) and getFirestore(window.firebaseApp)
 * - Single shared Firebase App instance
 */

// ============================================================
// Firebase v9+ Modular SDK Imports
// ============================================================

import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signInAnonymously, 
    signOut, 
    sendPasswordResetEmail,
    updateProfile,
    onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js';

import { 
    getFirestore, 
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
// Firebase Instance Factory
// ============================================================

export function getFirebaseAuth() {
    if (!window.firebaseApp) {
        throw new Error('Firebase App not initialized. Check index.html');
    }
    return getAuth(window.firebaseApp);
}

export function getFirebaseDB() {
    if (!window.firebaseApp) {
        throw new Error('Firebase App not initialized. Check index.html');
    }
    return getFirestore(window.firebaseApp);
}

// ============================================================
// Helper Functions
// ============================================================

function isEmail(input) {
    return input && typeof input === 'string' && 
           input.includes('@') && input.includes('.');
}

function isPhone(input) {
    if (!input || typeof input !== 'string') return false;
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
    if (!email || typeof email !== 'string') return false;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function generateRandomPassword() {
    return Math.random().toString(36).slice(-12);
}

// ============================================================
// Main Authentication Functions
// ============================================================

export async function cadastroProfissional(emailOuTelefone, senha, nome, profissao) {
    const auth = getFirebaseAuth();
    const db = getFirebaseDB();
    
    if (!nome || !profissao) {
        throw new Error('Nome e profissão são obrigatórios');
    }
    
    let user;
    let email = null;
    let telefone = null;
    
    if (isEmail(emailOuTelefone)) {
        if (!senha || senha.length < 6) {
            throw new Error('Senha deve ter no mínimo 6 caracteres');
        }
        if (!isValidEmail(emailOuTelefone)) {
            throw new Error('Email inválido');
        }
        
        const result = await createUserWithEmailAndPassword(auth, emailOuTelefone, senha);
        user = result.user;
        email = emailOuTelefone;
        
    } else if (isPhone(emailOuTelefone)) {
        const phoneNumber = normalizePhone(emailOuTelefone);
        const phoneExists = await verificarTelefoneExistente(phoneNumber);
        if (phoneExists) {
            throw new Error('Este telefone já está cadastrado');
        }
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

async function verificarTelefoneExistente(telefone) {
    const db = getFirebaseDB();
    const q = query(collection(db, 'usuarios'), where('telefone', '==', telefone));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
}

export async function cadastroCliente(email, nome) {
    const auth = getFirebaseAuth();
    const db = getFirebaseDB();
    
    if (!email || !nome) {
        throw new Error('Email e nome são obrigatórios');
    }
    if (!isValidEmail(email)) {
        throw new Error('Email inválido');
    }
    
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

export async function loginProfissional(emailOuTelefone, senha) {
    const auth = getFirebaseAuth();
    const db = getFirebaseDB();
    
    if (!emailOuTelefone) {
        throw new Error('Email ou telefone é obrigatório');
    }
    
    let user;
    
    if (isEmail(emailOuTelefone)) {
        if (!senha) {
            throw new Error('Senha é obrigatória para login por email');
        }
        if (!isValidEmail(emailOuTelefone)) {
            throw new Error('Email inválido');
        }
        
        const result = await signInWithEmailAndPassword(auth, emailOuTelefone, senha);
        user = result.user;
        
    } else if (isPhone(emailOuTelefone)) {
        const phoneNumber = normalizePhone(emailOuTelefone);
        const q = query(
            collection(db, 'usuarios'),
            where('telefone', '==', phoneNumber),
            where('role', '==', 'profissional')
        );
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            throw new Error('Profissional não encontrado com este telefone');
        }
        
        const userData = querySnapshot.docs[0].data();
        await signInAnonymously();
        return userData;
        
    } else {
        throw new Error('Email ou telefone inválido');
    }
    
    const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
    if (!userDoc.exists()) {
        throw new Error('Dados do usuário não encontrados');
    }
    
    const userData = userDoc.data();
    if (userData.role !== 'profissional') {
        throw new Error('Esse usuário não é um profissional');
    }
    
    localStorage.setItem('usuarioAtual', JSON.stringify({
        uid: user.uid, email: user.email, nome: userData.nome,
        telefone: userData.telefone, profissao: userData.profissao,
        role: userData.role, empresaId: userData.empresaId,
    }));
    
    return userData;
}

export async function loginCliente(email) {
    const db = getFirebaseDB();
    
    if (!email || !isValidEmail(email)) {
        throw new Error('Email inválido');
    }
    
    const q = query(
        collection(db, 'usuarios'),
        where('email', '==', email),
        where('role', '==', 'cliente')
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
        throw new Error('Cliente não encontrado ou já existe agendamento');
    }
    
    const clienteData = querySnapshot.docs[0].data();
    await signInAnonymously();
    
    localStorage.setItem('usuarioAtual', JSON.stringify({
        uid: clienteData.uid, email: clienteData.email,
        nome: clienteData.nome, role: clienteData.role,
    }));
    
    return clienteData;
}

export async function verificarSessao() {
    const auth = getFirebaseAuth();
    const db = getFirebaseDB();
    
    const usuarioLocal = localStorage.getItem('usuarioAtual');
    if (usuarioLocal) {
        return { usuario: JSON.parse(usuarioLocal), logado: true };
    }
    
    return new Promise((resolve) => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
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
                } catch (error) {
                    console.error('Error fetching user data:', error);
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
    if (!email || !isValidEmail(email)) {
        throw new Error('Email inválido');
    }
    await sendPasswordResetEmail(auth, email);
}

export async function atualizarPerfil(dados) {
    const usuario = obterUsuarioAtual();
    if (!usuario) {
        throw new Error('Usuário não está logado');
    }
    
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

