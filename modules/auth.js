/**
 * Authentication Module - Firebase v9+ Modular SDK
 * 
 * Responsibility:
 * - Login/Cadastro de profissional e cliente
 * - Suporte a Email E Telefone
 * - Controle de sessão com Firebase Auth
 * - Persistência de dados do usuário em Firestore
 * - Logout e reset de senha
 * 
 * Reference: 2.0.md - Correção do Cadastro de Cliente
 */

// ============================================================
// Firebase v9+ Imports (via firebase.js factory)
// ============================================================

import { 
    getFirebaseAuth,
    getFirebaseDB,
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
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

/**
 * Validar email localmente
 * Reference: 2.0.md > Tarefa 2 - Validar localmente antes do signup
 */
function isEmail(input) {
    if (!input || typeof input !== 'string') return false;
    
    // Regex RFC 5322 compliant (simplificado)
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(input.trim());
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

/**
 * Mapear códigos de erro do Firebase para mensagens legíveis
 * Reference: 2.0.md > Tarefa 1 - Tratamento correto de erros do Firebase Auth
 */
function getAuthErrorMessage(errorCode) {
    const errorMessages = {
        'auth/email-already-in-use': 'Este email já está cadastrado',
        'auth/weak-password': 'A senha deve conter no mínimo 6 caracteres',
        'auth/invalid-email': 'Email inválido',
        'auth/operation-not-allowed': 'Cadastro por email está desativado. Entre em contato com o suporte.',
        'auth/user-disabled': 'Esta conta foi desativada',
        'auth/user-not-found': 'Usuário não encontrado',
        'auth/wrong-password': 'Senha incorreta',
        'auth/invalid-credential': 'Credenciais inválidas',
        'auth/too-many-requests': 'Muitas tentativas consecutivas. Tente novamente mais tarde.',
        'auth/network-request-failed': 'Erro de conexão. Verifique sua internet.',
        'auth/internal-error': 'Erro interno. Tente novamente.',
    };
    
    return errorMessages[errorCode] || 'Erro ao processar solicitação. Tente novamente.';
}

/**
 * Verificar se email já existe no Firestore
 * Reference: 2.0.md > Tarefa 2 - Consultar o Firestore antes do signup
 */
async function verificarEmailExistente(email, role = 'cliente') {
    console.log('🔍 Verificando se email já existe:', email);
    
    const db = getFirebaseDB();
    const q = query(
        collection(db, 'usuarios'),
        where('email', '==', email.toLowerCase().trim())
    );
    
    const querySnapshot = await getDocs(q);
    const exists = !querySnapshot.empty;
    
    if (exists) {
        console.log('❌ Email já existe no Firestore');
        const existingUser = querySnapshot.docs[0].data();
        console.log('   Usuário existente:', existingUser.role, '- UID:', existingUser.uid);
    } else {
        console.log('✅ Email não encontrado - livre para cadastro');
    }
    
    return exists;
}

// ============================================================
// Main Authentication Functions
// ============================================================

/**
 * Cadastro de Profissional
 * Reference: 2.0.md - Tarefas 1, 2, 4, 5
 */
export async function cadastroProfissional(emailOuTelefone, senha, nome, profissao) {
    console.log('🔧 Iniciando cadastro de profissional');
    console.log('   Email/Telefone:', emailOuTelefone);
    console.log('   Nome:', nome);
    console.log('   Profissão:', profissao);
    
    // ============================================================
    // Validação local
    // Reference: 2.0.md > Tarefa 2 - Validar localmente antes do signup
    // ============================================================
    
    if (!nome || !profissao) {
        console.error('❌ Validação local falhou: nome ou profissão vazios');
        throw new Error('Nome e profissão são obrigatórios');
    }
    
    console.log('✅ Validação local (nome/profissão) passou');
    
    const auth = getFirebaseAuth();
    const db = getFirebaseDB();
    
    let user;
    let email = null;
    const telefone = null;
    
    if (isEmail(emailOuTelefone)) {
        // ============================================================
        // Cadastro por Email
        // ============================================================
        
        if (!senha || senha.length < 6) {
            console.error('❌ Validação local falhou: senha fraca');
            throw new Error('Senha deve ter no mínimo 6 caracteres');
        }
        
        if (!isValidEmail(emailOuTelefone)) {
            console.error('❌ Validação local falhou: email inválido');
            throw new Error('Email inválido');
        }
        
        console.log('✅ Validação local (email/senha) passou');
        
        // ============================================================
        // Validação preventiva - Verificar email no Firestore
        // Reference: 2.0.md > Tarefa 2 - Consultar o Firestore antes do signup
        // ============================================================
        
        const emailExists = await verificarEmailExistente(emailOuTelefone, 'profissional');
        
        if (emailExists) {
            console.error('❌ Email já existe - bloqueando signup');
            throw new Error('Este email já está cadastrado');
        }
        
        console.log('✅ Email validado - prosseguindo com signup');
        
        try {
            console.log('🔧 Criando usuário no Firebase Auth...');
            
            const result = await createUserWithEmailAndPassword(
                auth, 
                emailOuTelefone.toLowerCase().trim(), 
                senha
            );
            user = result.user;
            email = emailOuTelefone.toLowerCase().trim();
            
            console.log('✅ Firebase Auth criado com sucesso - UID:', user.uid);
            
        } catch (error) {
            // ============================================================
            // Tratamento de erros do Firebase Auth
            // Reference: 2.0.md > Tarefa 1 - Mapear erros para mensagens legíveis
            // ============================================================
            
            console.error('❌ Erro durante cadastro de profissional:', error.code || error.message);
            
            if (error.code && error.code.startsWith('auth/')) {
                const userMessage = getAuthErrorMessage(error.code);
                console.error('   Erro traduzido:', userMessage);
                throw new Error(userMessage);
            }
            
            throw error;
        }
        
    } else if (isPhone(emailOuTelefone)) {
        // ============================================================
        // Cadastro por Telefone (não implementado completamente)
        // ============================================================
        
        const phoneNumber = normalizePhone(emailOuTelefone);
        const telefoneUtilizado = await verificarTelefoneExistente(phoneNumber);
        
        if (telefoneUtilizado) {
            console.error('❌ Telefone já existe');
            throw new Error('Este telefone já está cadastrado');
        }
        
        console.log('⚠️ Cadastro por telefone requer verificação SMS');
        throw new Error('Para cadastro por telefone, verifique o código enviado por SMS');
        
    } else {
        console.error('❌ Validação local falhou: email ou telefone inválido');
        throw new Error('Email ou telefone inválido');
    }
    
    // ============================================================
    // Atualizar perfil e criar documentos no Firestore
    // Reference: 2.0.md > Tarefa 4 - Estrutura consistente de dados
    // ============================================================
    
    try {
        await updateProfile(user, { displayName: nome });
        console.log('✅ Perfil atualizado com nome');
        
        const empresaId = `prof_${user.uid}`;
        
        console.log('🔧 Salvando profissional no Firestore...');
        
        // Criar documento do usuário
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
        
        console.log('✅ Profissional salvo no Firestore');
        
        // Criar documento da empresa
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
        
        console.log('✅ Empresa criada no Firestore');
        
        return {
            uid: user.uid,
            email: email,
            telefone: telefone,
            nome: nome,
            role: 'profissional',
            empresaId: empresaId,
        };
        
    } catch (error) {
        console.error('❌ Erro ao salvar dados no Firestore:', error);
        throw error;
    }
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
 * Reference: 2.0.md - Tarefas 1, 2, 4, 5
 */
export async function cadastroCliente(email, nome) {
    console.log('🔧 Iniciando cadastro de cliente');
    console.log('   Email:', email);
    console.log('   Nome:', nome);
    
    // ============================================================
    // Validação local
    // Reference: 2.0.md > Tarefa 2 - Validar localmente antes do signup
    // ============================================================
    
    if (!email || !nome) {
        console.error('❌ Validação local falhou: email ou nome vazios');
        throw new Error('Email e nome são obrigatórios');
    }
    
    if (!isValidEmail(email)) {
        console.error('❌ Validação local falhou: email inválido');
        throw new Error('Email inválido');
    }
    
    console.log('✅ Validação local passou');
    
    // ============================================================
    // Validação preventiva - Verificar email no Firestore
    // Reference: 2.0.md > Tarefa 2 - Consultar o Firestore antes do signup
    // ============================================================
    
    const emailExists = await verificarEmailExistente(email, 'cliente');
    
    if (emailExists) {
        console.error('❌ Email já existe - bloqueando signup');
        throw new Error('Este email já está cadastrado');
    }
    
    console.log('✅ Email validado - prosseguindo com signup');
    
    // ============================================================
    // Firebase Auth - Criar usuário
    // ============================================================
    
    const auth = getFirebaseAuth();
    const db = getFirebaseDB();
    
    try {
        console.log('🔧 Criando usuário no Firebase Auth...');
        
        const { user } = await createUserWithEmailAndPassword(
            auth,
            email.toLowerCase().trim(),
            generateRandomPassword()
        );
        
        console.log('✅ Firebase Auth criado com sucesso - UID:', user.uid);
        
        // Atualizar perfil com nome
        await updateProfile(user, { displayName: nome });
        console.log('✅ Perfil atualizado com nome');
        
        // ============================================================
        // Criar documento no Firestore
        // Reference: 2.0.md > Tarefa 4 - Estrutura consistente de dados
        // ============================================================
        
        console.log('🔧 Salvando cliente no Firestore...');
        
        const clienteData = {
            uid: user.uid,
            email: email.toLowerCase().trim(),
            nome: nome,
            role: 'cliente',
            criadoEm: new Date().toISOString(),
            ativo: true,
        };
        
        await setDoc(doc(db, 'usuarios', user.uid), clienteData);
        
        console.log('✅ Cliente salvo no Firestore');
        console.log('   Document ID:', user.uid);
        console.log('   Email:', email);
        console.log('   Nome:', nome);
        
        return {
            uid: user.uid,
            email: user.email,
            nome: nome,
            role: 'cliente',
        };
        
    } catch (error) {
        // ============================================================
        // Tratamento de erros do Firebase Auth
        // Reference: 2.0.md > Tarefa 1 - Mapear erros para mensagens legíveis
        // ============================================================
        
        console.error('❌ Erro durante cadastro de cliente:', error.code || error.message);
        
        // Se o erro é do Firebase Auth, traduzir para mensagem legível
        if (error.code && error.code.startsWith('auth/')) {
            const userMessage = getAuthErrorMessage(error.code);
            console.error('   Erro traduzido:', userMessage);
            throw new Error(userMessage);
        }
        
        // Erro genérico
        throw error;
    }
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
 * Reference: 2.0.md - Login simplificado sem signInAnonymously
 */
export async function loginCliente(email) {
    console.log('🔧 Iniciando login de cliente');
    console.log('   Email:', email);
    
    const db = getFirebaseDB();
    
    if (!email || !isValidEmail(email)) {
        console.error('❌ Email inválido');
        throw new Error('Email inválido');
    }
    
    console.log('✅ Email válido - consultando Firestore...');
    
    const q = query(
        collection(db, 'usuarios'),
        where('email', '==', email.toLowerCase().trim()),
        where('role', '==', 'cliente')
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
        console.error('❌ Cliente não encontrado');
        throw new Error('Cliente não encontrado');
    }
    
    const clienteData = querySnapshot.docs[0].data();
    console.log('✅ Cliente encontrado - UID:', clienteData.uid);
    
    const usuario = {
        uid: clienteData.uid,
        email: clienteData.email,
        nome: clienteData.nome,
        role: 'cliente',
    };
    
    localStorage.setItem('usuarioAtual', JSON.stringify(usuario));
    console.log('✅ Login de cliente concluído');
    
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
 * Reference: 2.0.md - Logging e tratamento de erros
 */
export async function logout() {
    console.log('🔧 Iniciando logout...');
    
    try {
        const auth = getFirebaseAuth();
        
        // Verificar se há usuário logado
        if (auth.currentUser) {
            console.log('✅ Usuário logado:', auth.currentUser.uid);
            await signOut(auth);
            console.log('✅ SignOut realizado com sucesso');
        } else {
            console.log('⚠️ Nenhum usuário logado, apenas limpando localStorage');
        }
        
    } catch (error) {
        console.error('❌ Erro durante signOut:', error);
        // Continuar mesmo se signOut falhar (pode ser que não há sessão ativa)
    }
    
    // Sempre limpar localStorage e redirecionar
    localStorage.removeItem('usuarioAtual');
    console.log('✅ localStorage limpo');
    console.log('🔄 Redirecionando para /login...');
    
    // Redirecionar para login
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

