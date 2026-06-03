/**
 * Confirmation Page
 * Displays after successful client registration
 */

import { obterUsuarioAtual } from '../modules/auth.js';

console.log('✅ confirmacao.js loaded');

// ============================================================
// Page Initialization
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🔧 Confirmation page initializing');
    
    const usuario = obterUsuarioAtual();
    
    if (usuario) {
        // User is logged in
        setupUserView(usuario);
    } else {
        // No user - show generic confirmation
        setupGenericView();
    }
});

/**
 * Setup view for logged in user
 */
function setupUserView(usuario) {
    const userNameEl = document.getElementById('user-name');
    const userEmailEl = document.getElementById('user-email');
    const userRoleEl = document.getElementById('user-role');
    
    if (userNameEl) {
        userNameEl.textContent = usuario.nome || 'Cliente';
    }
    
    if (userEmailEl) {
        userEmailEl.textContent = usuario.email || '';
    }
    
    if (userRoleEl) {
        userRoleEl.textContent = usuario.role === 'profissional' ? 'Profissional' : 'Cliente';
    }
    
    // Setup continue button based on role
    const continueBtn = document.getElementById('continue-btn');
    if (continueBtn) {
        if (usuario.role === 'profissional') {
            continueBtn.onclick = () => {
                window.location.href = '/dashboard';
            };
        } else {
            continueBtn.onclick = () => {
                window.location.href = '/meus-agendamentos';
            };
        }
    }
}

/**
 * Setup generic view for anonymous users
 */
function setupGenericView() {
    const userNameEl = document.getElementById('user-name');
    if (userNameEl) {
        userNameEl.textContent = 'Bem-vindo!';
    }
    
    const continueBtn = document.getElementById('continue-btn');
    if (continueBtn) {
        continueBtn.onclick = () => {
            window.location.href = '/login';
        };
    }
}

