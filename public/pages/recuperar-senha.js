/**
 * Password Recovery Page Logic
 * Reference: ROADMAP-IMPLEMENTACAO.md - Semana 2
 * 
 * Fluxo:
 * 1. User requests recovery email
 * 2. User clicks link in email (contains oobCode)
 * 3. User sets new password
 * 4. Success confirmation
 */

import { 
    getFirebaseAuth, 
    sendPasswordResetEmail, 
    confirmPasswordReset,
    verifyPasswordResetCode 
} from '../modules/firebase.js';
import { showLoading, removeLoading, showError, showSuccess } from '../modules/feedback.js';

let resetEmail = null;
let oobCode = null;

/**
 * Initialize page based on URL params
 */
async function init() {
    const urlParams = new URLSearchParams(window.location.search);
    oobCode = urlParams.get('oobCode');
    
    if (oobCode) {
        await handleResetLink();
    } else {
        showStep('step-request');
    }
    
    setupEventListeners();
}

/**
 * Handle reset link (has oobCode)
 */
async function handleResetLink() {
    try {
        showLoading('Verificando link de recuperacao...');
        
        const auth = getFirebaseAuth();
        resetEmail = await verifyPasswordResetCode(auth, oobCode);
        
        removeLoading();
        showStep('step-reset');
        
    } catch (error) {
        removeLoading();
        console.error('Erro ao verificar codigo:', error);
        
        if (error.code === 'auth-expired-action-code') {
            showError('Este link de recuperacao expirou. Solicite um novo.');
        } else if (error.code === 'auth-invalid-action-code') {
            showError('Este link de recuperacao e invalido. Solicite um novo.');
        } else {
            showError('Erro ao processar link de recuperacao.');
        }
        
        setTimeout(() => {
            window.location.href = '/recuperar-senha';
        }, 3000);
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    const requestForm = document.getElementById('request-form');
    if (requestForm) {
        requestForm.addEventListener('submit', handleRequestSubmit);
    }
    
    const btnResend = document.getElementById('btn-resend');
    if (btnResend) {
        btnResend.addEventListener('click', () => {
            const email = document.getElementById('email').value;
            if (email) sendRecoveryEmail(email);
        });
    }
    
    const resetForm = document.getElementById('reset-form');
    if (resetForm) {
        resetForm.addEventListener('submit', handleResetSubmit);
    }
    
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('blur', () => validateEmail(emailInput.value));
    }
    
    const passwordInput = document.getElementById('new-password');
    if (passwordInput) {
        passwordInput.addEventListener('input', () => validatePassword(passwordInput.value));
    }
    
    const confirmInput = document.getElementById('confirm-password');
    if (confirmInput) {
        confirmInput.addEventListener('input', () => validateConfirmPassword());
    }
}

/**
 * Handle email request submission
 */
async function handleRequestSubmit(e) {
    e.preventDefault();
    
    const emailInput = document.getElementById('email');
    const email = emailInput.value.trim();
    
    if (!validateEmail(email)) return;
    
    await sendRecoveryEmail(email);
}

/**
 * Send recovery email
 */
async function sendRecoveryEmail(email) {
    try {
        const btn = document.getElementById('btn-request');
        btn.disabled = true;
        btn.innerHTML = 'Enviando...';
        
        const auth = getFirebaseAuth();
        await sendPasswordResetEmail(auth, email);
        
        document.getElementById('sent-email').textContent = email;
        showStep('step-success');
        
    } catch (error) {
        console.error('Erro ao enviar email:', error);
        
        if (error.code === 'auth/user-not-found') {
            showError('Nao encontramos uma conta com este email.');
        } else if (error.code === 'auth/invalid-email') {
            showError('Este email e invalido.');
        } else {
            showError('Erro ao enviar email. Tente novamente.');
        }
        
        const btn = document.getElementById('btn-request');
        btn.disabled = false;
        btn.innerHTML = 'Enviar Link de Recuperacao';
    }
}

/**
 * Handle password reset submission
 */
async function handleResetSubmit(e) {
    e.preventDefault();
    
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (!validatePassword(newPassword)) return;
    if (!validateConfirmPassword()) return;
    
    try {
        const btn = document.getElementById('btn-reset');
        btn.disabled = true;
        btn.innerHTML = 'Alterando...';
        
        const auth = getFirebaseAuth();
        await confirmPasswordReset(auth, oobCode, newPassword);
        
        showStep('step-complete');
        
    } catch (error) {
        console.error('Erro ao redefinir senha:', error);
        
        if (error.code === 'auth-expired-action-code') {
            showError('Este link expirou. Solicite um novo.');
            setTimeout(() => {
                window.location.href = '/recuperar-senha';
            }, 3000);
        } else if (error.code === 'auth-weak-password') {
            showError('A senha e muito fraca. Use pelo menos 6 caracteres.');
        } else {
            showError('Erro ao alterar senha. Tente novamente.');
        }
        
        const btn = document.getElementById('btn-reset');
        btn.disabled = false;
        btn.innerHTML = 'Alterar Senha';
    }
}

/**
 * Validate email
 */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const errorEl = document.getElementById('email-error');
    
    if (!email) {
        errorEl.textContent = 'Email e obrigatorio';
        return false;
    }
    
    if (!emailRegex.test(email)) {
        errorEl.textContent = 'Digite um email valido';
        return false;
    }
    
    errorEl.textContent = '';
    return true;
}

/**
 * Validate password
 */
function validatePassword(password) {
    const errorEl = document.getElementById('password-error');
    
    if (!password) {
        errorEl.textContent = 'Senha e obrigatoria';
        return false;
    }
    
    if (password.length < 6) {
        errorEl.textContent = 'Minimo de 6 caracteres';
        return false;
    }
    
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    if (password.length >= 6 && (!hasLetter || !hasNumber)) {
        errorEl.textContent = 'Use letras e numeros';
        return false;
    }
    
    errorEl.textContent = '';
    return true;
}

/**
 * Validate password confirmation
 */
function validateConfirmPassword() {
    const password = document.getElementById('new-password').value;
    const confirm = document.getElementById('confirm-password').value;
    const errorEl = document.getElementById('confirm-error');
    
    if (!confirm) {
        errorEl.textContent = 'Confirme sua senha';
        return false;
    }
    
    if (confirm !== password) {
        errorEl.textContent = 'As senhas nao coincidem';
        return false;
    }
    
    errorEl.textContent = '';
    return true;
}

/**
 * Show specific step
 */
function showStep(stepId) {
    const steps = document.querySelectorAll('.auth-step');
    steps.forEach(step => step.style.display = 'none');
    
    const activeStep = document.getElementById(stepId);
    if (activeStep) {
        activeStep.style.display = 'block';
        activeStep.classList.add('animate-fadeIn');
    }
}

document.addEventListener('DOMContentLoaded', init);

export { init, validateEmail, validatePassword, validateConfirmPassword };

