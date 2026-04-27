/**
 * UI Components Module
 * Provides reusable UI components for better UX
 */

/**
 * Show skeleton loading for an element
 * @param {HTMLElement} element - Element to show skeleton for
 * @param {string} type - Type of skeleton (card, text, button)
 */
export function showSkeleton(element, type = 'card') {
    if (!element) return;

    const skeletonClass = `skeleton skeleton--${type}`;
    element.classList.add('skeleton-loading');
    element.setAttribute('aria-busy', 'true');

    // Adicionar overlay se não for texto
    if (type !== 'text') {
        const overlay = document.createElement('div');
        overlay.className = 'skeleton-overlay';
        overlay.innerHTML = '<div class="skeleton-shimmer"></div>';
        element.appendChild(overlay);
    }
}

/**
 * Hide skeleton loading
 * @param {HTMLElement} element - Element to hide skeleton for
 */
export function hideSkeleton(element) {
    if (!element) return;

    element.classList.remove('skeleton-loading');
    element.removeAttribute('aria-busy');

    const overlay = element.querySelector('.skeleton-overlay');
    if (overlay) {
        overlay.remove();
    }
}

/**
 * Show loading spinner
 * @param {HTMLElement} element - Element to show spinner in
 * @param {string} message - Loading message
 */
export function showLoadingSpinner(element, message = 'Carregando...') {
    if (!element) return;

    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    spinner.innerHTML = `
        <div class="spinner"></div>
        <span class="loading-text">${message}</span>
    `;

    element.appendChild(spinner);
    element.setAttribute('aria-busy', 'true');
}

/**
 * Hide loading spinner
 * @param {HTMLElement} element - Element to hide spinner from
 */
export function hideLoadingSpinner(element) {
    if (!element) return;

    const spinner = element.querySelector('.loading-spinner');
    if (spinner) {
        spinner.remove();
    }
    element.removeAttribute('aria-busy');
}

/**
 * Show success message with auto-hide
 * @param {string} message - Success message
 * @param {number} duration - Duration in milliseconds
 */
export function showSuccessToast(message, duration = 3000) {
    const toast = document.createElement('div');
    toast.className = 'toast toast--success';
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <span class="toast-icon">✅</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" aria-label="Fechar">×</button>
    `;

    document.body.appendChild(toast);

    // Auto-hide
    setTimeout(() => {
        toast.remove();
    }, duration);

    // Close button
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => toast.remove());
}

/**
 * Show error message
 * @param {string} message - Error message
 */
export function showErrorToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast toast--error';
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <span class="toast-icon">❌</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" aria-label="Fechar">×</button>
    `;

    document.body.appendChild(toast);

    // Close button
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => toast.remove());
}