/**
 * Dashboard Page Logic
 * Reference: PLANO-MESTRE-TECNICO.md > Seção 5 (dashboard.js)
 */

import { obterUsuarioAtual, logout } from '../modules/auth.js';
import { obterPlano, temFeature } from '../modules/permissions.js';
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

                // Apply theme preference and gate advanced theme by feature flag
                const themeSelect = document.getElementById('theme-select');
                const currentTheme = await getTheme(usuario.empresaId);
                applyTheme(currentTheme);
                if (themeSelect) themeSelect.value = currentTheme;

                // Check if advanced theme feature is available for this user
                (async () => {
                    try{
                        const allowAdvancedTheme = await temFeature('tema_avancado');
                        const premiumOption = themeSelect ? themeSelect.querySelector('option[value="premium"]') : null;
                        if (premiumOption && !allowAdvancedTheme) {
                            premiumOption.disabled = true;
                            // add small hint
                            let hint = document.getElementById('theme-hint');
                            if(!hint){
                                hint = document.createElement('div'); hint.id = 'theme-hint'; hint.style.fontSize='0.85rem'; hint.style.color='var(--muted)'; hint.style.marginTop='6px';
                                hint.innerHTML = 'Tema avançado disponível apenas no plano <a href="/perfil">Premium</a>.';
                                themeSelect.parentNode && themeSelect.parentNode.appendChild(hint);
                            }
                        }
                        // Gate other premium-only quick action cards
                        const allowRelatorios = await temFeature('relatorios');
                        const relCard = document.querySelector('.action-card[href="/relatorios"]');
                        if(relCard && !allowRelatorios) relCard.style.opacity = '0.5', relCard.title = 'Disponível no plano Premium';
                        const allowIntegr = await temFeature('integracao_agenda');
                        const integCard = document.querySelector('.action-card[href="/integracoes"]');
                        if(integCard && !allowIntegr) integCard.style.opacity = '0.5', integCard.title = 'Disponível no plano Premium';
                    }catch(e){ console.warn('temFeature check failed', e); }
                })();

                if (themeSelect) themeSelect.addEventListener('change', async (e) => {
                        const newTheme = e.target.value;
                        // prevent switching to premium if not allowed
                        try{
                            const allowAdvanced = await temFeature('tema_avancado');
                            if(newTheme === 'premium' && !allowAdvanced){
                                alert('Tema avançado disponível apenas no plano Premium. Acesse Perfil para alterar o plano.');
                                // reset select
                                const current = await getTheme(usuario.empresaId);
                                themeSelect.value = current;
                                return;
                            }
                        }catch(e){ console.warn('feature check failed', e); }

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
