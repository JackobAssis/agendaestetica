/**
 * Authentication Module - Firebase v9+ Modular SDK
 * 
 * Responsibility:
 * - Login/Cadastro de profissional e cliente
 * - Suporte a Email E Telefone
 * - Controle de sessão com Firebase Auth
 * - Persistência de dados do usuário em Firestore
 * - Logout e reset de senha
 */

// ============================================================
// Firebase v9+ Imports (via firebase.js factory)
// ============================================================

import { 
    getFirebaseAuth,
    getFirebaseDB,
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signInAnonymously, 
    signOut, 
    sendPasswordResetEmail,
    updateProfile,
    onAuthStateChanged,
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    query,
    where,
    updateDoc
} from './firebase.js';

// ============================================================
// Helper Functions
// ============================================================

function isEmail(input) {
    return input && typeof input === 'string' && input.includes('@') && input.includes('.');
}

function isPhone(input) {
    const phoneRegex = /^(\+55)?[1-9]{2}[9]?\d{8,9}$/;
    return phoneRegex.test(String(input).replace(/[\s\-\(\)]/g, ''));
}

function normalizePhone(input) {
    let phone = String(input).replace(/[\s\-\(\)]/g, '');
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
// Main Authentication Functions
// ============================================================

/**
 * Cadastro de Profissional
 */
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
        const telefoneUtilizado = await verificarTelefoneExistente(phoneNumber);
        if (telefoneUtilizado) {
            throw new Error('Este telefone já está cadastrado');
        }
        throw new Error('Para cadastro por telefone, verifique o código enviado por SMS');
    } else {
        throw new Error('Email ou telefone inválido');
    }
    
    await updateProfile(user, { displayName: nome });
    
    const empresaId = `prof_${user.uid}`;
    
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
 * Verificar se telefone já existe
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
 * Cadastro de Cliente
 */
export async function cadastroCliente(email, nome) {
    const auth = getFirebaseAuth();
    const db = getFirebaseDB();
    
    if (!email || !nome) {
        throw new Error('Email e nome são obrigatórios');
    }
    if (!isValidEmail(email)) {
        throw new Error('Email inválido');
    }
    
    const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        generateRandomPassword()
    );
    
    await updateProfile(user, { displayName: nome });
    
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
 * Login de Profissional
 */
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
        return {
            uid: userData.uid,
            email: userData.email,
            telefone: userData.telefone,
            nome: userData.nome,
            profissao: userData.profissao,
            role: 'profissional',
            empresaId: userData.empresaId,
        };
    } else {
        throw new Error('Email ou telefone inválido');
    }
    
    const userDocRef = doc(db, 'usuarios', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
        throw new Error('Dados do usuário não encontrados');
    }
    
    const userData = userDoc.data();
    
    if (userData.role !== 'profissional') {
        throw new Error('Esse usuário não é um profissional');
    }
    
    const usuario = {
        uid: user.uid,
        email: user.email,
        nome: userData.nome,
        telefone: userData.telefone,
        profissao: userData.profissao,
        role: userData.role,
        empresaId: userData.empresaId,
    };
    
    localStorage.setItem('usuarioAtual', JSON.stringify(usuario));
    
    return usuario;
}

/**
 * Login de Cliente
 */
export async function loginCliente(email) {
    const auth = getFirebaseAuth();
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
        throw new Error('Cliente não encontrado');
    }
    
    const clienteData = querySnapshot.docs[0].data();
    
    await signInAnonymously();
    
    const usuario = {
        uid: clienteData.uid,
        email: clienteData.email,
        nome: clienteData.nome,
        role: 'cliente',
    };
    
    localStorage.setItem('usuarioAtual', JSON.stringify(usuario));
    
    return usuario;
}

/**
 * Verificar sessão existente
 */
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
                    const userDocRef = doc(db, 'usuarios', user.uid);
                    const userDoc = await getDoc(userDocRef);
                    
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        const usuario = {
                            uid: user.uid,
                            email: user.email,
                            nome: userData.nome,
                            role: userData.role,
                            empresaId: userData.empresaId,
                            profissao: userData.profissao,
                        };
                        localStorage.setItem('usuarioAtual', JSON.stringify(usuario));
                        
                        resolve({ usuario, logado: true });
                    } else {
                        resolve({ usuario: null, logado: false });
                    }
                } catch (error) {
                    console.error('Erro ao buscar dados do usuário:', error);
                    resolve({ usuario: null, logado: false });
                }
            } else {
                resolve({ usuario: null, logado: false });
            }
        });
    });
}

/**
 * Obter usuário atual
 */
export function obterUsuarioAtual() {
    const usuarioLocal = localStorage.getItem('usuarioAtual');
    return usuarioLocal ? JSON.parse(usuarioLocal) : null;
}

/**
 * Logout
 */
export async function logout() {
    const auth = getFirebaseAuth();
    localStorage.removeItem('usuarioAtual');
    await signOut(auth);
    window.location.href = '/login';
}

/**
 * Resetar senha
 */
export async function resetarSenha(email) {
    const auth = getFirebaseAuth();
    if (!email || !isValidEmail(email)) {
        throw new Error('Email inválido');
    }
    await sendPasswordResetEmail(auth, email);
}

/**
 * Atualizar perfil
 */
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
    
    const userDocRef = doc(db, 'usuarios', usuario.uid);
    await updateDoc(userDocRef, {
        ...dados,
        atualizadoEm: new Date().toISOString(),
    });
    
    const usuarioAtualizado = { ...usuario, ...dados };
    localStorage.setItem('usuarioAtual', JSON.stringify(usuarioAtualizado));
}

