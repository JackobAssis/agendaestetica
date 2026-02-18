/**
 * Login Page Logic
 * Reference: PLANO-MESTRE-TECNICO.md > Seção 8 Fluxo 1 (Login e Cadastro)
 * 
 * Suporte a Email ou Telefone para login/cadastro
 */

import { 
    loginProfissional, 
    loginCliente, 
    cadastroProfissional, 
    cadastroCliente 
} from '../modules/auth.js';

// ============================================================
// Estado da Página
// ============================================================

let modoAtual = 'login'; // 'login' ou 'cadastro'
let roleAtual = 'profissional'; // 'profissional' ou 'cliente'

// ============================================================
// Helpers
// ============================================================

function isEmail(input) {
    return input && input.includes('@') && input.includes('.');
}

function isPhone(input) {
    const phoneRegex = /^(\+55)?[1-9]{2}[9]?\d{8,9}$/;
    return phoneRegex.test(input.replace(/[\s\-\(\)]/g, ''));
}

// ============================================================
// DOM Elements
// ============================================================

const formLogin = document.getElementById('form-login');
const formCadastro = document.getElementById('form-cadastro');
const toggleButtons = document.querySelectorAll('.toggle-buttons');
const roleBtnsProfissional = document.querySelectorAll('[data-role="profissional"]');
const roleBtnsCliente = document.querySelectorAll('[data-role="cliente"]');
const grupoProfissao = document.getElementById('grupo-profissao');
const grupoSenhaLogin = document.getElementById('grupo-senha-login');
const grupoSenhaCadastro = document.getElementById('grupo-senha-cadastro');
const grupoSenhaConfirma = document.getElementById('grupo-senha-confirma');
const mensagemDiv = document.getElementById('mensagem');
const linkEsqueciSenha = document.getElementById('link-esqueci-senha');

// ============================================================
// Event Listeners
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    setupToggleButtons();
    setupFormListeners();
    setupRoleButtons();
    
    // Setup input listeners para detectar email vs telefone
    setupInputDetection();
});

/**
 * Detectar se input é email ou telefone para ajustar UI
 */
function setupInputDetection() {
    const loginEmail = document.getElementById('login-email');
    const cadastroEmail = document.getElementById('cadastro-email');
    
    const handleInput = (e) => {
        const valor = e.target.value.trim();
        
        if (isEmail(valor)) {
            // É email - mostrar senha
            if (grupoSenhaLogin) grupoSenhaLogin.style.display = 'block';
            if (grupoSenhaCadastro) grupoSenhaCadastro.style.display = 'block';
            if (grupoSenhaConfirma) grupoSenhaConfirma.style.display = 'block';
        } else if (isPhone(valor)) {
            // É telefone - esconder senha
            if (grupoSenhaLogin) grupoSenhaLogin.style.display = 'none';
            if (grupoSenhaCadastro) grupoSenhaCadastro.style.display = 'none';
            if (grupoSenhaConfirma) grupoSenhaConfirma.style.display = 'none';
        }
    };
    
    if (loginEmail) loginEmail.addEventListener('input', handleInput);
    if (cadastroEmail) cadastroEmail.addEventListener('input', handleInput);
}

/**
 * Setup toggle entre Login e Cadastro
 */
function setupToggleButtons() {
    const toggleBtns = document.querySelectorAll('[data-mode]');
    
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            
            const modo = btn.dataset.mode;
            modoAtual = modo;
            
            // Atualizar UI
            toggleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Mostrar/Esconder forms
            if (modo === 'login') {
                formLogin.classList.remove('d-none');
                formCadastro.classList.add('d-none');
            } else {
                formLogin.classList.add('d-none');
                formCadastro.classList.remove('d-none');
            }
            
            // Limpar mensagens
            limparMensagem();
        });
    });
}

/**
 * Setup buttons de Role (Profissional vs Cliente)
 */
function setupRoleButtons() {
    // Profissional buttons
    roleBtnsProfissional.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            
            roleAtual = 'profissional';
            atualizarUIRole();
            limparMensagem();
        });
    });
    
    // Cliente buttons
    roleBtnsCliente.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            
            roleAtual = 'cliente';
            atualizarUIRole();
            limparMensagem();
        });
    });
}

/**
 * Atualizar UI baseado no role selecionado
 */
function atualizarUIRole() {
    // Atualizar buttons
    roleBtnsProfissional.forEach(btn => {
        btn.classList.toggle('active', roleAtual === 'profissional');
    });
    
    roleBtnsCliente.forEach(btn => {
        btn.classList.toggle('active', roleAtual === 'cliente');
    });
    
    // Mostrar/Esconder campos específicos
    if (roleAtual === 'profissional') {
        if (grupoProfissao) grupoProfissao.style.display = 'block';
        if (grupoSenhaLogin) grupoSenhaLogin.style.display = 'block';
        if (grupoSenhaCadastro) grupoSenhaCadastro.style.display = 'block';
        if (grupoSenhaConfirma) grupoSenhaConfirma.style.display = 'block';
        
        // Validações
        document.getElementById('cadastro-profissao').required = true;
        document.getElementById('cadastro-senha').required = true;
        document.getElementById('cadastro-senha-confirma').required = true;
        document.getElementById('login-senha').required = true;
        
    } else { // cliente
        if (grupoProfissao) grupoProfissao.style.display = 'none';
        if (grupoSenhaLogin) grupoSenhaLogin.style.display = 'none';
        if (grupoSenhaCadastro) grupoSenhaCadastro.style.display = 'none';
        if (grupoSenhaConfirma) grupoSenhaConfirma.style.display = 'none';
        
        // Remover validações
        document.getElementById('cadastro-profissao').required = false;
        document.getElementById('cadastro-senha').required = false;
        document.getElementById('cadastro-senha-confirma').required = false;
        document.getElementById('login-senha').required = false;
    }
}

/**
 * Setup form listeners
 */
function setupFormListeners() {
    // Login form
    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleLogin();
    });
    
    // Cadastro form
    formCadastro.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleCadastro();
    });
    
    // Esqueci senha
    if (linkEsqueciSenha) {
        linkEsqueciSenha.addEventListener('click', (e) => {
            e.preventDefault();
            mostraModoRecuperarSenha();
        });
    }
}

/**
 * Handle Login - Suporta Email ou Telefone
 */
async function handleLogin() {
    try {
        const emailOuTelefone = document.getElementById('login-email').value.trim();
        
        if (!emailOuTelefone) {
            mostrarErro('Email ou telefone é obrigatório');
            return;
        }
        
        // Disable button
        const btn = formLogin.querySelector('.submit-btn');
        btn.disabled = true;
        btn.innerHTML = '<span class="loading-spinner"></span>Entrando...';
        
        if (roleAtual === 'profissional') {
            let senha = null;
            
            // Se for email, senha é obrigatória
            if (isEmail(emailOuTelefone)) {
                senha = document.getElementById('login-senha').value;
                if (!senha) {
                    mostrarErro('Senha é obrigatória para login por email');
                    btn.disabled = false;
                    btn.innerHTML = '<span id="login-btn-texto">Entrar</span>';
                    return;
                }
            }
            
            // Login profissional (email ou telefone)
            await loginProfissional(emailOuTelefone, senha);
            mostrarSucesso('Login realizado! Redirecionando...');
            
            // Pequeno delay para mostrar mensagem
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1000);
            
        } else {
            // Login cliente (por email ou telefone)
            await loginCliente(emailOuTelefone);
            mostrarSucesso('Bem-vindo! Redirecionando...');
            
            setTimeout(() => {
                window.location.href = '/confirmacao';
            }, 1000);
        }
        
    } catch (error) {
        mostrarErro(error.message);
        
        const btn = formLogin.querySelector('.submit-btn');
        btn.disabled = false;
        btn.innerHTML = '<span id="login-btn-texto">Entrar</span>';
    }
}

/**
 * Handle Cadastro - Suporta Email ou Telefone
 */
async function handleCadastro() {
    try {
        const nome = document.getElementById('cadastro-nome').value.trim();
        const emailOuTelefone = document.getElementById('cadastro-email').value.trim();
        
        if (!nome || !emailOuTelefone) {
            mostrarErro('Nome e email/telefone são obrigatórios');
            return;
        }
        
        // Disable button
        const btn = formCadastro.querySelector('.submit-btn');
        btn.disabled = true;
        btn.innerHTML = '<span class="loading-spinner"></span>Criando conta...';
        
        if (roleAtual === 'profissional') {
            const profissao = document.getElementById('cadastro-profissao').value;
            let senha = null;
            let senhaConfirma = null;
            
            // Se for email, senha é obrigatória
            if (isEmail(emailOuTelefone)) {
                senha = document.getElementById('cadastro-senha').value;
                senhaConfirma = document.getElementById('cadastro-senha-confirma').value;
                
                // Validações
                if (!profissao) {
                    mostrarErro('Profissão é obrigatória');
                    btn.disabled = false;
                    btn.innerHTML = '<span id="cadastro-btn-texto">Criar Conta</span>';
                    return;
                }
                
                if (!senha || !senhaConfirma) {
                    mostrarErro('Senha e confirmação são obrigatórias para cadastro por email');
                    btn.disabled = false;
                    btn.innerHTML = '<span id="cadastro-btn-texto">Criar Conta</span>';
                    return;
                }
                
                if (senha !== senhaConfirma) {
                    mostrarErro('As senhas não coincidem');
                    btn.disabled = false;
                    btn.innerHTML = '<span id="cadastro-btn-texto">Criar Conta</span>';
                    return;
                }
            }
            
            // Cadastro profissional
            await cadastroProfissional(emailOuTelefone, senha, nome, profissao);
            mostrarSucesso('Cadastro realizado! Redirecionando para onboarding...');
            
            setTimeout(() => {
                window.location.href = '/onboarding';
            }, 1000);
            
        } else {
            // Cadastro cliente
            await cadastroCliente(emailOuTelefone, nome);
            mostrarSucesso('Cadastro realizado! Você será redirecionado...');
            
            setTimeout(() => {
                window.location.href = '/confirmacao';
            }, 1000);
        }
        
    } catch (error) {
        mostrarErro(error.message);
        
        const btn = formCadastro.querySelector('.submit-btn');
        btn.disabled = false;
        btn.innerHTML = '<span id="cadastro-btn-texto">Criar Conta</span>';
    }
}

/**
 * Mostrar modo de recuperar senha
 */
function mostraModoRecuperarSenha() {
    // Navegar para pagina de recuperacao de senha
    window.location.href = '/recuperar-senha';
}

// ============================================================
// Utilitários de UI
// ============================================================

/**
 * Mostrar erro
 */
function mostrarErro(mensagem) {
    mensagemDiv.className = 'alert alert--danger';
    mensagemDiv.innerHTML = `
        <svg class="alert__icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
        </svg>
        <div class="alert__content">
            <p class="alert__message">${mensagem}</p>
        </div>
    `;
    mensagemDiv.classList.remove('d-none');
}

/**
 * Mostrar sucesso
 */
function mostrarSucesso(mensagem) {
    mensagemDiv.className = 'alert alert--success';
    mensagemDiv.innerHTML = `
        <svg class="alert__icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
        <div class="alert__content">
            <p class="alert__message">${mensagem}</p>
        </div>
    `;
    mensagemDiv.classList.remove('d-none');
}

/**
 * Limpar mensagem
 */
function limparMensagem() {
    mensagemDiv.classList.add('d-none');
}

// Inicializar UI do role
atualizarUIRole();
