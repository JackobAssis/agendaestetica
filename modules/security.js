/**
 * Security Utilities Module
 * Provides sanitization and security helpers
 */

import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS
 * @param {string} html - HTML content to sanitize
 * @returns {string} - Sanitized HTML
 */
export function sanitizeHTML(html) {
    if (!html || typeof html !== 'string') return '';
    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'div', 'span', 'label', 'section', 'header', 'footer', 'main', 'aside', 'nav', 'button', 'input', 'select', 'option', 'form', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'img', 'small', 'sub', 'sup', 'hr', 'blockquote', 'pre', 'code', 'figure', 'figcaption', 'time'],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'id', 'src', 'alt', 'width', 'height', 'style', 'data-id', 'value', 'type', 'name', 'placeholder', 'disabled', 'checked', 'selected', 'aria-label', 'role', 'tabindex']
    });
}

/**
 * Sanitize text input (remove HTML tags)
 * @param {string} text - Text to sanitize
 * @returns {string} - Sanitized text
 */
export function sanitizeText(text) {
    if (!text || typeof text !== 'string') return '';
    return text.replace(/<[^>]*>/g, '').trim();
}

/**
 * Validate and sanitize user input
 * @param {string} input - User input
 * @param {object} options - Validation options
 * @returns {string} - Sanitized input or throws error
 */
export function validateInput(input, options = {}) {
    const {
        maxLength = 1000,
        allowHTML = false,
        required = false
    } = options;

    if (required && (!input || input.trim() === '')) {
        throw new Error('Campo obrigatório');
    }

    if (!input) return '';

    const sanitized = allowHTML ? sanitizeHTML(input) : sanitizeText(input);

    if (sanitized.length > maxLength) {
        throw new Error(`Texto muito longo (máximo ${maxLength} caracteres)`);
    }

    return sanitized;
}

/**
 * Set innerHTML safely with DOMPurify sanitization
 * Drop-in replacement for element.innerHTML = content
 * @param {HTMLElement} element - Target element
 * @param {string} html - HTML content to set
 */
export function setHTML(element, html) {
    if (!element) return;
    element.innerHTML = sanitizeHTML(html);
}