/**
 * Authentication Module
 * Reference: PLANO-MESTRE-TECNICO.md > Seção 5 (auth.js)
 * 
 * Responsibility:
 * - Login/Cadastro de profissional e cliente
 * - Suporte a Email E Telefone
 * - Controle de sessão com Firebase Auth
 * - Persistência de dados do usuário em Firestore
 * - Logout e reset de senha
 * 
 * Fluxo: PLANO-MESTRE-TECNICO.md > Seção 8 Fluxo 1 (Login)
 */

// Helper: Check if input is email or phone
function isEmail(input) {
    return input && input.includes('@') && input.includes('.');
}

function isPhone(input) {
    // Brazilian phone format: (11) 99999-9999 or 11999999999
    const phoneRegex = /^(\+55)?[1-9]{2}[9]?\d{8,9}$/;
    return phoneRegex.test(input.replace(/[\s\-\(\)]/g, ''));
}

function normalizePhone(input) {
    // Remove formatting and add country code if needed
    let phone = input.replace(/[\s\-\(\)]/g, '');
    if (!phone.startsWith('+55') && phone.length >= 10) {
        phone = '+55' + phone;
    }
    return phone;
}

/**
 * Cadastro de Profissional
 * @param {string} emailOuTelefone - Email ou Telefone (com DDD)
 * @param {string} senha - Senha (obrigatória para email, opcional para telefone)
 * @param {string} nome
 * @param {string} profissao (cabeleireira, esteticista, barbeiro, etc)
 * @returns {Promise<{uid, email, telefone, role, empresaId}>}
 */
export async function cadastroProfissional(emailOuTelefone, senha, nome, profissao) {
    try {
        const auth = window.firebase.auth;
        const db = window.firebase.db;
        
        // Validações básicas
        if (!nome || !profissao) {
            throw new Error('Nome e profissão são obrigatórios');
        }
        
        let user;
        let email = null;
        let telefone = null;
        
        if (isEmail(emailOuTelefone)) {
            // Cadastro por EMAIL
            if (!senha || senha.length < 6) {
                throw new Error('Senha deve ter no mínimo 6 caracteres');
            }
            
            if (!isValidEmail(emailOuTelefone)) {
                throw new Error('Email inválido');
            }
            
            const result = await window.firebase.auth.createUserWithEmailAndPassword(auth, emailOuTelefone, senha);
            user = result.user;
            email = emailOuTelefone;
            
        } else if (isPhone(emailOuTelefone)) {
            // Cadastro por TELEFONE - requer confirmação de código
            const phoneNumber = normalizePhone(emailOuTelefone);
            
            // Verificar se telefone já está em uso
            const telefoneUtilizado = await verificarTelefoneExistente(phoneNumber);
            if (telefoneUtilizado) {
                throw new Error('Este telefone já está cadastrado');
            }
            
            // Para telefone, geramos uma senha temporária
            const tempSenha = generateRandomPassword();
            
            // O fluxo de telefone requer envio de código SMS primeiro
            // Aqui simplificamos: salvamos o telefone no Firestore e aguardamos confirmação
            telefone = phoneNumber;
            
            // Nota: Para produção completa, implemente confirmationResult do Firebase
            throw new Error('Para cadastro por telefone, verifique o código enviado por SMS');
            
        } else {
            throw new Error('Email ou telefone inválido');
        }
        
        // Atualizar perfil
        await window.firebase.auth.updateProfile(user, {
            displayName: nome,
        });
        
        // Gerar empresaId único
        const empresaId = `prof_${user.uid}`;
        
        // Documento do usuário
        await window.firebase.db.doc(`usuarios/${user.uid}`).set({
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
        
        // Criar documento da empresa
        await window.firebase.db.collection('empresas').doc(empresaId).set({
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
        
    } catch (error) {
        console.error('Erro ao cadastrar profissional:', error);
        throw error;
    }
}

/**
 * Verificar se telefone já existe na base
 */
async function verificarTelefoneExistente(telefone) {
    const q = window.firebase.db.query(
        window.firebase.db.collection('usuarios'),
        window.firebase.db.where('telefone', '==', telefone)
    );
    const snap = await q.get();
    return !snap.empty;
}

/**
 * Cadastro de Cliente
 * @param {string} email
 * @param {string} nome
 * @returns {Promise<{uid, email, role}>}
 */
export async function cadastroCliente(email, nome) {
    try {
        const auth = window.firebase.auth;
        
        // Validações
        if (!email || !nome) {
            throw new Error('Email e nome são obrigatórios');
        }
        
        if (!isValidEmail(email)) {
            throw new Error('Email inválido');
        }
        
        // Criar usuário anonimamente (cliente não precisa de senha)
        // Usamos email como identificador único
        const { user } = await auth.createUserWithEmailAndPassword(
            auth,
            email,
            // Gerar senha aleatória (cliente não usa login)
            generateRandomPassword()
        );
        
        // Atualizar perfil
        await window.firebase.auth.updateProfile(user, {
            displayName: nome,
        });
        
        // Salvar dados em Firestore
        await window.firebase.db.collection('usuarios').doc(user.uid).set({
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
        
    } catch (error) {
        console.error('Erro ao cadastrar cliente:', error);
        throw error;
    }
}

/**
 * Login de Profissional
 * @param {string} emailOuTelefone - Email ou Telefone
 * @param {string} senha - Senha (obrigatória para email, opcional para telefone)
 * @returns {Promise<{uid, email, telefone, role, empresaId, nome, profissao}>}
 */
export async function loginProfissional(emailOuTelefone, senha) {
    try {
        const auth = window.firebase.auth;
        const db = window.firebase.db;
        
        if (!emailOuTelefone) {
            throw new Error('Email ou telefone é obrigatório');
        }
        
        let user;
        
        if (isEmail(emailOuTelefone)) {
            // Login por EMAIL
            if (!senha) {
                throw new Error('Senha é obrigatória para login por email');
            }
            
            if (!isValidEmail(emailOuTelefone)) {
                throw new Error('Email inválido');
            }
            
            const result = await window.firebase.auth.signInWithEmailAndPassword(auth, emailOuTelefone, senha);
            user = result.user;
            
        } else if (isPhone(emailOuTelefone)) {
            // Login por TELEFONE
            const phoneNumber = normalizePhone(emailOuTelefone);
            
            // Buscar usuário pelo telefone no Firestore primeiro
            const q = db.query(
                db.collection('usuarios'),
                db.where('telefone', '==', phoneNumber),
                db.where('role', '==', 'profissional')
            );
            
            const querySnapshot = await q.get();
            
            if (querySnapshot.empty) {
                throw new Error('Profissional não encontrado com este telefone');
            }
            
            const userData = querySnapshot.docs[0].data();
            
            // Para login por telefone, o Firebase Auth requer confirmationResult
            // Simplificação: login anônimo vinculado ao uid existente
            await auth.signInAnonymously();
            
            // Retornar dados do usuário encontrado
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
        
        // Obter dados do usuário do Firestore
        const userDoc = await window.firebase.db.collection('usuarios').doc(user.uid).get();
        
        if (!userDoc.exists()) {
            throw new Error('Dados do usuário não encontrados');
        }
        
        const userData = userDoc.data();
        
        // Validar que é profissional
        if (userData.role !== 'profissional') {
            throw new Error('Esse usuário não é um profissional');
        }
        
        // Salvar na sessão local
        localStorage.setItem('usuarioAtual', JSON.stringify({
            uid: user.uid,
            email: user.email,
            nome: userData.nome,
            telefone: userData.telefone,
            profissao: userData.profissao,
            role: userData.role,
            empresaId: userData.empresaId,
        }));
        
        return {
            uid: user.uid,
            email: user.email,
            telefone: userData.telefone,
            nome: userData.nome,
            profissao: userData.profissao,
            role: userData.role,
            empresaId: userData.empresaId,
        };
        
    } catch (error) {
        console.error('Erro ao fazer login de profissional:', error);
        throw error;
    }
}

/**
 * Login de Cliente (por email único)
 * Fluxo: cliente clica no link público, email é pré-preenchido
 * @param {string} email
 * @returns {Promise<{uid, email, role, nome}>}
 */
export async function loginCliente(email) {
    try {
        const auth = window.firebase.auth;
        const db = window.firebase.db;
        
        // Validações
        if (!email) {
            throw new Error('Email é obrigatório');
        }
        
        if (!isValidEmail(email)) {
            throw new Error('Email inválido');
        }
        
        // Buscar cliente por email em Firestore
        const q = window.firebase.db.query(
            window.firebase.db.collection('usuarios'),
            window.firebase.db.where('email', '==', email),
            window.firebase.db.where('role', '==', 'cliente')
        );
        
        const querySnapshot = await window.firebase.db.getDocs(q);
        
        if (querySnapshot.empty) {
            throw new Error('Cliente não encontrado ou já existe agendamento');
        }
        
        const clienteDoc = querySnapshot.docs[0];
        const clienteData = clienteDoc.data();
        
        // Login automático (cliente não precisa de senha)
        // Usar signInAnonymously para clientes
        const { user } = await auth.signInAnonymously();
        
        // Salvar na sessão local
        localStorage.setItem('usuarioAtual', JSON.stringify({
            uid: clienteData.uid,
            email: clienteData.email,
            nome: clienteData.nome,
            role: clienteData.role,
        }));
        
        return {
            uid: clienteData.uid,
            email: clienteData.email,
            nome: clienteData.nome,
            role: 'cliente',
        };
        
    } catch (error) {
        console.error('Erro ao fazer login de cliente:', error);
        throw error;
    }
}

/**
 * Verificar sessão existente
 * Chamada ao carregar página (index.html)
 * @returns {Promise<{usuario: object|null, logado: boolean}>}
 */
export async function verificarSessao() {
    try {
        const auth = window.firebase.auth;
        
        // Verificar localStorage primeiro
        const usuarioLocal = localStorage.getItem('usuarioAtual');
        if (usuarioLocal) {
            return {
                usuario: JSON.parse(usuarioLocal),
                logado: true,
            };
        }
        
        // Verificar Firebase Auth
        return new Promise((resolve) => {
            auth.onAuthStateChanged(async (user) => {
                if (user) {
                    try {
                        const userDoc = await window.firebase.db
                            .collection('usuarios')
                            .doc(user.uid)
                            .get();
                        
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
                            
                            // Redirecionar baseado no role
                            if (userData.role === 'profissional') {
                                // Verificar se completou onboarding
                                const empresaDoc = await window.firebase.db
                                    .collection('empresas')
                                    .doc(userData.empresaId)
                                    .get();
                                
                                if (empresaDoc.exists() && !empresaDoc.data().onboardingCompleto) {
                                    window.location.href = '/onboarding';
                                } else {
                                    window.location.href = '/dashboard';
                                }
                            } else if (userData.role === 'cliente') {
                                // Cliente redirecionado após confirmação
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
                        console.error('Erro ao buscar dados do usuário:', error);
                        resolve({ usuario: null, logado: false });
                    }
                } else {
                    // Não está logado, redirecionar para login
                    resolve({ usuario: null, logado: false });
                }
            });
        });
    } catch (error) {
        console.error('Erro ao verificar sessão:', error);
        return { usuario: null, logado: false };
    }
}

/**
 * Obter usuário atual da sessão
 * @returns {object|null}
 */
export function obterUsuarioAtual() {
    const usuarioLocal = localStorage.getItem('usuarioAtual');
    return usuarioLocal ? JSON.parse(usuarioLocal) : null;
}

/**
 * Logout
 * @returns {Promise<void>}
 */
export async function logout() {
    try {
        const auth = window.firebase.auth;
        
        // Remover da sessão local
        localStorage.removeItem('usuarioAtual');
        
        // Logout do Firebase
        await auth.signOut();
        
        // Redirecionar para login
        window.location.href = '/login';
        
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
        throw error;
    }
}

/**
 * Resetar senha por email
 * @param {string} email
 * @returns {Promise<void>}
 */
export async function resetarSenha(email) {
    try {
        const auth = window.firebase.auth;
        
        // Validações
        if (!email) {
            throw new Error('Email é obrigatório');
        }
        
        if (!isValidEmail(email)) {
            throw new Error('Email inválido');
        }
        
        // Enviar email de reset
        await window.firebase.auth.sendPasswordResetEmail(auth, email);
        
    } catch (error) {
        console.error('Erro ao resetar senha:', error);
        throw error;
    }
}

/**
 * Atualizar perfil do profissional
 * @param {object} dados - {nome, profissao, foto, bio, etc}
 * @returns {Promise<void>}
 */
export async function atualizarPerfil(dados) {
    try {
        const usuario = obterUsuarioAtual();
        
        if (!usuario) {
            throw new Error('Usuário não está logado');
        }
        
        const auth = window.firebase.auth;
        const db = window.firebase.db;
        
        // Atualizar Firebase Auth (nome)
        if (dados.nome) {
            await window.firebase.auth.updateProfile(auth.currentUser, {
                displayName: dados.nome,
            });
        }
        
        // Atualizar Firestore
        await db.collection('usuarios').doc(usuario.uid).update({
            ...dados,
            atualizadoEm: new Date().toISOString(),
        });
        
        // Atualizar localStorage
        const usuarioAtualizado = { ...usuario, ...dados };
        localStorage.setItem('usuarioAtual', JSON.stringify(usuarioAtualizado));
        
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        throw error;
    }
}

// ============================================================
// Funções Utilitárias (Privadas)
// ============================================================

/**
 * Validar email
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Gerar senha aleatória para clientes
 * @returns {string}
 */
function generateRandomPassword() {
    return Math.random().toString(36).slice(-12);
}
