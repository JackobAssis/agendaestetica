/**
 * Login Page Logic
 * Reference: PLANO-MESTRE-TECNICO.md > Seção 8 Fluxo 1 (Login e Cadastro)
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
});

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
                formLogin.style.display = 'block';
                formCadastro.style.display = 'none';
            } else {
                formLogin.style.display = 'none';
                formCadastro.style.display = 'block';
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
 * Handle Login
 */
async function handleLogin() {
    try {
        const email = document.getElementById('login-email').value.trim();
        
        if (!email) {
            mostrarErro('Email é obrigatório');
            return;
        }
        
        // Disable button
        const btn = formLogin.querySelector('.submit-btn');
        btn.disabled = true;
        btn.innerHTML = '<span class="loading-spinner"></span>Entrando...';
        
        if (roleAtual === 'profissional') {
            const senha = document.getElementById('login-senha').value;
            
            if (!senha) {
                mostrarErro('Senha é obrigatória para profissionais');
                btn.disabled = false;
                btn.innerHTML = '<span id="login-btn-texto">Entrar</span>';
                return;
            }
            
            // Login profissional
            await loginProfissional(email, senha);
            mostrarSucesso('Login realizado! Redirecionando...');
            
            // Pequeno delay para mostrar mensagem
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1000);
            
        } else {
            // Login cliente (por email)
            await loginCliente(email);
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
 * Handle Cadastro
 */
async function handleCadastro() {
    try {
        const nome = document.getElementById('cadastro-nome').value.trim();
        const email = document.getElementById('cadastro-email').value.trim();
        
        if (!nome || !email) {
            mostrarErro('Nome e email são obrigatórios');
            return;
        }
        
        // Disable button
        const btn = formCadastro.querySelector('.submit-btn');
        btn.disabled = true;
        btn.innerHTML = '<span class="loading-spinner"></span>Criando conta...';
        
        if (roleAtual === 'profissional') {
            const profissao = document.getElementById('cadastro-profissao').value;
            const senha = document.getElementById('cadastro-senha').value;
            const senhaConfirma = document.getElementById('cadastro-senha-confirma').value;
            
            // Validações
            if (!profissao) {
                mostrarErro('Profissão é obrigatória');
                btn.disabled = false;
                btn.innerHTML = '<span id="cadastro-btn-texto">Criar Conta</span>';
                return;
            }
            
            if (!senha || !senhaConfirma) {
                mostrarErro('Senha e confirmação são obrigatórias');
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
            
            // Cadastro profissional
            await cadastroProfissional(email, senha, nome, profissao);
            mostrarSucesso('Cadastro realizado! Redirecionando para onboarding...');
            
            setTimeout(() => {
                window.location.href = '/onboarding';
            }, 1000);
            
        } else {
            // Cadastro cliente
            await cadastroCliente(email, nome);
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
    const email = prompt('Digite seu email:');
    if (!email) return;
    
    // TODO: Implementar em FASE 2+
    mostrarSucesso('Um email de recuperação foi enviado. Verifique sua caixa de entrada.');
}

// ============================================================
// Utilitários de UI
// ============================================================

/**
 * Mostrar erro
 */
function mostrarErro(mensagem) {
    mensagemDiv.className = 'error-message';
    mensagemDiv.textContent = '❌ ' + mensagem;
    mensagemDiv.classList.remove('hidden');
}

/**
 * Mostrar sucesso
 */
function mostrarSucesso(mensagem) {
    mensagemDiv.className = 'success-message';
    mensagemDiv.textContent = '✅ ' + mensagem;
    mensagemDiv.classList.remove('hidden');
}

/**
 * Limpar mensagem
 */
function limparMensagem() {
    mensagemDiv.classList.add('hidden');
}

// Inicializar UI do role
atualizarUIRole();
