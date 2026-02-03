/**
 * Authentication Module - Firebase v9+ Modular SDK
 * 
 * This module handles all authentication operations using Firebase v9+ modular SDK.
 * It uses factory functions to get Firebase instances from the app initialized in index.html.
 * 
 * Architecture:
 * - index.html initializes Firebase and exposes: window.firebaseApp
 * - auth.js uses getAuth(getApp()) and getFirestore(getApp())
 * - Single shared Firebase App instance
 * 
 * Reference: PLANO-MESTRE-TECNICO.md > Seção 5 (auth.js)
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

import { 
    getApp 
} from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js';

// ============================================================
// Firebase Instance Factory
// ============================================================

/**
 * Get Firebase Auth instance
 * Uses the single shared app instance from index.html
 * 
 * @returns {Auth} Firebase Auth instance
 */
export function getFirebaseAuth() {
    if (!window.firebaseApp) {
        throw new Error('Firebase App not initialized. Check index.html');
    }
    return getAuth(window.firebaseApp);
}

/**
 * Get Firebase Firestore instance
 * Uses the single shared app instance from index.html
 * 
 * @returns {Firestore} Firestore instance
 */
export function getFirebaseDB() {
    if (!window.firebaseApp) {
        throw new Error('Firebase App not initialized. Check index.html');
    }
    return getFirestore(window.firebaseApp);
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Check if input is an email address
 * @param {string} input 
 * @returns {boolean}
 */
function isEmail(input) {
    return input && typeof input === 'string' && 
           input.includes('@') && input.includes('.');
}

/**
 * Check if input is a Brazilian phone number
 * Supports formats: (11) 99999-9999, 11999999999, +55 11 99999-9999
 * @param {string} input 
 * @returns {boolean}
 */
function isPhone(input) {
    if (!input || typeof input !== 'string') return false;
    const phoneRegex = /^(\+55)?[1-9]{2}[9]?\d{8,9}$/;
    return phoneRegex.test(input.replace(/[\s\-\(\)]/g, ''));
}

/**
 * Normalize phone number to Brazilian format with country code
 * @param {string} input 
 * @returns {string}
 */
function normalizePhone(input) {
    let phone = input.replace(/[\s\-\(\)]/g, '');
    if (!phone.startsWith('+55') && phone.length >= 10) {
        phone = '+55' + phone;
    }
    return phone;
}

/**
 * Validate email format
 * @param {string} email 
 * @returns {boolean}
 */
function isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Generate random password for client accounts
 * @returns {string}
 */
function generateRandomPassword() {
    return Math.random().toString(36).slice(-12);
}

// ============================================================
// Main Authentication Functions
// ============================================================

/**
 * Professional Registration (Cadastro de Profissional)
 * 
 * @param {string} emailOuTelefone - Email or Phone number (with DDD)
 * @param {string} senha - Password (required for email registration)
 * @param {string} nome - Full name
 * @param {string} profissao - Profession (cabeleireira, esteticista, barbeiro, etc)
 * @returns {Promise<{uid, email, telefone, role, empresaId}>}
 */
export async function cadastroProfissional(emailOuTelefone, senha, nome, profissao) {
    const auth = getFirebaseAuth();
    const db = getFirebaseDB();
    
    // Validations
    if (!nome || !profissao) {
        throw new Error('Nome e profissão são obrigatórios');
    }
    
    let user;
    let email = null;
    let telefone = null;
    
    if (isEmail(emailOuTelefone)) {
        // Email registration
        if (!senha || senha.length < 6) {
            throw new Error('Senha deve ter no mínimo 6 caracteres');
        }
        if (!isValidEmail(emailOuTelefone)) {
            throw new Error('Email inválido');
        }
        
        // Firebase v9+: createUserWithEmailAndPassword(auth, email, password)
        const result = await createUserWithEmailAndPassword(auth, emailOuTelefone, senha);
        user = result.user;
        email = emailOuTelefone;
        
    } else if (isPhone(emailOuTelefone)) {
        // Phone registration - requires SMS verification code
        const phoneNumber = normalizePhone(emailOuTelefone);
        
        // Check if phone already exists
        const phoneExists = await verificarTelefoneExistente(phoneNumber);
        if (phoneExists) {
            throw new Error('Este telefone já está cadastrado');
        }
        
        telefone = phoneNumber;
        throw new Error('Para cadastro por telefone, verifique o código enviado por SMS');
        
    } else {
        throw new Error('Email ou telefone inválido');
    }
    
    // Update user profile
    await updateProfile(user, {
        displayName: nome,
    });
    
    // Generate unique empresaId
    const empresaId = `prof_${user.uid}`;
    
    // Save user document
    await setDoc(doc(db, 'usuarios', user.uid), {
        uid: user.uid,
        email: email,
        telefone: telefone,
        nome: nome,
        profissao: profissao,
        role: 'profissional',
        empresaId: empresaId,
        criadoEm: new Date().toISOString(),
        ativo: true,
    });
    
    // Create company document
    await setDoc(doc(db, 'empresas', empresaId), {
        empresaId: empresaId,
        proprietarioUid: user.uid,
        nome: nome,
        profissao: profissao,
        contato: telefone || email,
        criadoEm: new Date().toISOString(),
        ativo: true,
        plano: 'free',
    });
    
    return {
        uid: user.uid,
        email: email,
        telefone: telefone,
        nome: nome,
        role: 'profissional',
        empresaId: empresaId,
    };
}

/**
 * Check if phone number already exists in database
 * @param {string} telefone 
 * @returns {Promise<boolean>}
 */
async function verificarTelefoneExistente(telefone) {
    const db = getFirebaseDB();
    
    const q = query(
        collection(db, 'usuarios'),
        where('telefone', '==', telefone)
    );
    
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
}

/**
 * Client Registration (Cadastro de Cliente)
 * 
 * @param {string} email - Client email
 * @param {string} nome - Client name
 * @returns {Promise<{uid, email, role}>}
 */
export async function cadastroCliente(email, nome) {
    const auth = getFirebaseAuth();
    const db = getFirebaseDB();
    
    // Validations
    if (!email || !nome) {
        throw new Error('Email e nome são obrigatórios');
    }
    if (!isValidEmail(email)) {
        throw new Error('Email inválido');
    }
    
    // Create anonymous user account with random password
    const result = await createUserWithEmailAndPassword(
        auth, 
        email, 
        generateRandomPassword()
    );
    const { user } = result;
    
    // Update profile
    await updateProfile(user, {
        displayName: nome,
    });
    
    // Save to Firestore
    await setDoc(doc(db, 'usuarios', user.uid), {
        uid: user.uid,
        email: email,
        nome: nome,
        role: 'cliente',
        criadoEm: new Date().toISOString(),
        ativo: true,
    });
    
    return {
        uid: user.uid,
        email: user.email,
        nome: nome,
        role: 'cliente',
    };
}

/**
 * Professional Login (Login de Profissional)
 * 
 * @param {string} emailOuTelefone - Email or Phone
 * @param {string} senha - Password (required for email)
 * @returns {Promise<{uid, email, telefone, role, empresaId, nome, profissao}>}
 */
export async function loginProfissional(emailOuTelefone, senha) {
    const auth = getFirebaseAuth();
    const db = getFirebaseDB();
    
    if (!emailOuTelefone) {
        throw new Error('Email ou telefone é obrigatório');
    }
    
    let user;
    
    if (isEmail(emailOuTelefone)) {
        // Email login
        if (!senha) {
            throw new Error('Senha é obrigatória para login por email');
        }
        if (!isValidEmail(emailOuTelefone)) {
            throw new Error('Email inválido');
        }
        
        // Firebase v9+: signInWithEmailAndPassword(auth, email, password)
        const result = await signInWithEmailAndPassword(auth, emailOuTelefone, senha);
        user = result.user;
        
    } else if (isPhone(emailOuTelefone)) {
        // Phone login
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
        
        // Anonymous login for phone-based users
        await signInAnonymously();
        
        return userData;
        
    } else {
        throw new Error('Email ou telefone inválido');
    }
    
    // Get user data from Firestore
    const userDocRef = doc(db, 'usuarios', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
        throw new Error('Dados do usuário não encontrados');
    }
    
    const userData = userDoc.data();
    
    // Validate professional role
    if (userData.role !== 'profissional') {
        throw new Error('Esse usuário não é um profissional');
    }
    
    // Save to local session
    localStorage.setItem('usuarioAtual', JSON.stringify({
        uid: user.uid,
        email: user.email,
        nome: userData.nome,
        telefone: userData.telefone,
        profissao: userData.profissao,
        role: userData.role,
        empresaId: userData.empresaId,
    }));
    
    return userData;
}

/**
 * Client Login (Login de Cliente)
 * Client clicks public link with email pre-filled
 * 
 * @param {string} email 
 * @returns {Promise<{uid, email, role, nome}>}
 */
export async function loginCliente(email) {
    const db = getFirebaseDB();
    
    if (!email || !isValidEmail(email)) {
        throw new Error('Email inválido');
    }
    
    // Find client by email in Firestore
    const q = query(
        collection(db, 'usuarios'),
        where('email', '==', email),
        where('role', '==', 'cliente')
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
        throw new Error('Cliente não encontrado ou já existe agendamento');
    }
    
    const clienteDoc = querySnapshot.docs[0];
    const clienteData = clienteDoc.data();
    
    // Auto-login (client doesn't need password)
    await signInAnonymously();
    
    // Save to local session
    localStorage.setItem('usuarioAtual', JSON.stringify({
        uid: clienteData.uid,
        email: clienteData.email,
        nome: clienteData.nome,
        role: clienteData.role,
    }));
    
    return clienteData;
}

/**
 * Verify existing session
 * Called on page load (index.html)
 * 
 * @returns {Promise<{usuario: object|null, logado: boolean}>}
 */
export async function verificarSessao() {
    const auth = getFirebaseAuth();
    const db = getFirebaseDB();
    
    // Check localStorage first
    const usuarioLocal = localStorage.getItem('usuarioAtual');
    if (usuarioLocal) {
        return {
            usuario: JSON.parse(usuarioLocal),
            logado: true,
        };
    }
    
    // Check Firebase Auth
    return new Promise((resolve) => {
        // Firebase v9+: onAuthStateChanged(auth, callback)
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const userDocRef = doc(db, 'usuarios', user.uid);
                    const userDoc = await getDoc(userDocRef);
                    
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        
                        localStorage.setItem('usuarioAtual', JSON.stringify({
                            uid: user.uid,
                            email: user.email,
                            nome: userData.nome,
                            role: userData.role,
                            empresaId: userData.empresaId,
                            profissao: userData.profissao,
                        }));
                        
                        // Redirect based on role
                        if (userData.role === 'profissional') {
                            const empresaDocRef = doc(db, 'empresas', userData.empresaId);
                            const empresaDoc = await getDoc(empresaDocRef);
                            
                            const destino = (empresaDoc.exists() && !empresaDoc.data().onboardingCompleto)
                                ? '/onboarding'
                                : '/dashboard';
                            window.location.href = destino;
                            
                        } else if (userData.role === 'cliente') {
                            window.location.href = '/confirmacao';
                        }
                        
                        resolve({
                            usuario: {
                                uid: user.uid,
                                email: user.email,
                                nome: userData.nome,
                                role: userData.role,
                                empresaId: userData.empresaId,
                                profissao: userData.profissao,
                            },
                            logado: true,
                        });
                    } else {
                        resolve({ usuario: null, logado: false });
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    resolve({ usuario: null, logado: false });
                }
            } else {
                // Not logged in
                resolve({ usuario: null, logado: false });
            }
        });
    });
}

/**
 * Get current user from session
 * @returns {object|null}
 */
export function obterUsuarioAtual() {
    const usuarioLocal = localStorage.getItem('usuarioAtual');
    return usuarioLocal ? JSON.parse(usuarioLocal) : null;
}

/**
 * Logout user
 * @returns {Promise<void>}
 */
export async function logout() {
    const auth = getFirebaseAuth();
    
    localStorage.removeItem('usuarioAtual');
    
    // Firebase v9+: signOut(auth)
    await signOut(auth);
    
    window.location.href = '/login';
}

/**
 * Reset password via email
 * @param {string} email 
 * @returns {Promise<void>}
 */
export async function resetarSenha(email) {
    const auth = getFirebaseAuth();
    
    if (!email || !isValidEmail(email)) {
        throw new Error('Email inválido');
    }
    
    // Firebase v9+: sendPasswordResetEmail(auth, email)
    await sendPasswordResetEmail(auth, email);
}

/**
 * Update professional profile
 * @param {object} dados - {nome, profissao, foto, bio, etc}
 * @returns {Promise<void>}
 */
export async function atualizarPerfil(dados) {
    const usuario = obterUsuarioAtual();
    
    if (!usuario) {
        throw new Error('Usuário não está logado');
    }
    
    const auth = getFirebaseAuth();
    const db = getFirebaseDB();
    
    // Update Firebase Auth (name)
    if (dados.nome && auth.currentUser) {
        await updateProfile(auth.currentUser, {
            displayName: dados.nome,
        });
    }
    
    // Update Firestore
    const userDocRef = doc(db, 'usuarios', usuario.uid);
    await updateDoc(userDocRef, {
        ...dados,
        atualizadoEm: new Date().toISOString(),
    });
    
    // Update localStorage
    const usuarioAtualizado = { ...usuario, ...dados };
    localStorage.setItem('usuarioAtual', JSON.stringify(usuarioAtualizado));
}

