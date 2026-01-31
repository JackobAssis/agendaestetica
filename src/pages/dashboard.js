/**
 * Dashboard Page Logic
 * Reference: PLANO-MESTRE-TECNICO.md > Seção 5 (dashboard.js)
 */

import { obterUsuarioAtual, logout } from '../modules/auth.js';
import { obterPlano } from '../modules/permissions.js';
import { applyTheme, getTheme, setTheme } from '../modules/theme.js';

/**
 * Inicializar dashboard
 */
async function inicializar() {
    try {
        // Obter usuário
        const usuario = obterUsuarioAtual();
        
        if (!usuario) {
            window.location.href = '/login';
            return;
        }
        
        // Mostrar informações do usuário
        const usuarioInfo = document.getElementById('usuario-info');
        usuarioInfo.textContent = `${usuario.nome} (${usuario.profissao || 'Cliente'})`;
        
        // Welcome message
        const welcomeMessage = document.getElementById('welcome-message');
        welcomeMessage.textContent = `Olá ${usuario.nome}, seja bem-vindo(a) de volta! Aqui você pode gerenciar sua agenda e clientes.`;
        
        // Obter plano
        const plano = await obterPlano();
        document.getElementById('plano-atual').textContent = plano.charAt(0).toUpperCase() + plano.slice(1);

            // Apply theme preference
            const themeSelect = document.getElementById('theme-select');
            const currentTheme = await getTheme(usuario.empresaId);
            applyTheme(currentTheme);
            if (themeSelect) themeSelect.value = currentTheme;
            if (themeSelect) themeSelect.addEventListener('change', async (e) => {
                const newTheme = e.target.value;
                applyTheme(newTheme);
                await setTheme(usuario.empresaId, newTheme);
            });
        
        // Carregar dados do Firebase (será implementado em FASE 3+)
        carregarDados(usuario.empresaId);
        
    } catch (error) {
        console.error('Erro ao inicializar dashboard:', error);
    }
}

/**
 * Carregar dados do Firebase
 */
async function carregarDados(empresaId) {
    try {
        const db = window.firebase.db;
        
        // Contar agendamentos de hoje
        // TODO: Implementar query de agendamentos
        document.getElementById('count-hoje').textContent = '0';
        
        // Contar clientes
        // TODO: Implementar query de clientes
        document.getElementById('count-clientes').textContent = '0';
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Logout button
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', async (e) => {
            e.preventDefault();
            
            if (confirm('Tem certeza que deseja sair?')) {
                await logout();
            }
        });
    }
    
    // Navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remover active
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Navegar
            const href = link.getAttribute('href');
            window.location.href = href;
        });
    });
}

// Inicializar ao carregar página
document.addEventListener('DOMContentLoaded', () => {
    inicializar();
    setupEventListeners();
});
