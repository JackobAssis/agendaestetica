/**
 * Feedback System - Toast Notifications
 * Reference: ROADMAP-IMPLEMENTACAO.md
 * 
 * Sistema de feedback visual para o usuário
 */

const toastContainerId = 'toast-container';

/**
 * Criar container de toast se não existir
 */
function createToastContainer() {
    if (document.getElementById(toastContainerId)) return;
    
    const container = document.createElement('div');
    container.id = toastContainerId;
    container.className = 'toast-container';
    document.body.appendChild(container);
}

/**
 * Mostrar toast de sucesso
 */
export function showSuccess(message, duration = 4000) {
    showToast(message, 'success', duration);
}

/**
 * Mostrar toast de erro
 */
export function showError(message, duration = 5000) {
    showToast(message, 'error', duration);
}

/**
 * Mostrar toast de warning
 */
export function showWarning(message, duration = 4000) {
    showToast(message, 'warning', duration);
}

/**
 * Mostrar toast de informação
 */
export function showInfo(message, duration = 4000) {
    showToast(message, 'info', duration);
}

/**
 * Mostrar toast generico
 */
export function showToast(message, type = 'info', duration = 4000) {
    createToastContainer();
    
    const container = document.getElementById(toastContainerId);
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

/**
 * Loading Overlay - Full screen
 */
export function showLoading(message = 'Carregando...') {
    removeLoading();
    
    const overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
        <div class="loading-content">
            <div class="loading-spinner"></div>
            <p class="loading-message">${message}</p>
        </div>
    `;
    document.body.appendChild(overlay);
    
    return overlay;
}

export function removeLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.remove();
}

/**
 * Loading Button - Dentro de botoes
 */
export function setButtonLoading(button, loading = true) {
    if (!button) return;
    
    if (loading) {
        button.dataset.originalText = button.innerHTML;
        button.disabled = true;
        button.innerHTML = '<span class="btn-spinner"></span> Carregando...';
        button.classList.add('btn-loading');
    } else {
        button.disabled = false;
        button.innerHTML = button.dataset.originalText || '';
        button.classList.remove('btn-loading');
    }
}

/**
 * Confirm Dialog Customizado
 */
export async function showConfirm(title, message, confirmText = 'Confirmar', cancelText = 'Cancelar') {
    return new Promise((resolve) => {
        const container = document.getElementById('modal-container') || createModalContainer();
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-header">
                    <h3>${title}</h3>
                </div>
                <div class="modal-body">
                    <p>${message}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="modal-cancel">${cancelText}</button>
                    <button class="btn" id="modal-confirm">${confirmText}</button>
                </div>
            </div>
        `;
        
        container.appendChild(modal);
        
        modal.querySelector('#modal-cancel').onclick = () => {
            modal.remove();
            resolve(false);
        };
        
        modal.querySelector('#modal-confirm').onclick = () => {
            modal.remove();
            resolve(true);
        };
        
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.remove();
                resolve(false);
            }
        };
    });
}

/**
 * Alert Customizado
 */
export function showAlert(title, message, buttonText = 'OK') {
    const container = document.getElementById('modal-container') || createModalContainer();
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-header">
                <h3>${title}</h3>
            </div>
            <div class="modal-body">
                <p>${message}</p>
            </div>
            <div class="modal-footer">
                <button class="btn" id="modal-ok">${buttonText}</button>
            </div>
        </div>
    `;
    
    container.appendChild(modal);
    modal.querySelector('#modal-ok').onclick = () => modal.remove();
}

function createModalContainer() {
    const container = document.createElement('div');
    container.id = 'modal-container';
    document.body.appendChild(container);
    return container;
}

/**
 * Notification Badge
 */
export function showBadge(elementId, count) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const existingBadge = element.querySelector('.notification-badge');
    if (existingBadge) existingBadge.remove();
    
    if (count > 0) {
        const badge = document.createElement('span');
        badge.className = 'notification-badge';
        badge.textContent = count > 99 ? '99+' : count;
        element.appendChild(badge);
    }
}

export function hideBadge(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const badge = element.querySelector('.notification-badge');
    if (badge) badge.remove();
}

/**
 * Empty State Helper
 */
export function showEmptyState(containerId, icon, title, message, actionText, actionOnClick) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">${icon}</div>
            <h3 class="empty-title">${title}</h3>
            <p class="empty-message">${message}</p>
            ${actionText ? `
                <button class="btn" id="empty-action">${actionText}</button>
            ` : ''}
        </div>
    `;
    
    if (actionText && actionOnClick) {
        container.querySelector('#empty-action').onclick = actionOnClick;
    }
}

export default {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showToast,
    showLoading,
    removeLoading,
    setButtonLoading,
    showConfirm,
    showAlert,
    showBadge,
    hideBadge,
    showEmptyState
};

