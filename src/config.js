/**
 * Firebase Configuration - Single Source of Truth
 * 
 * This file provides Firebase config validation for the entire app.
 * It should be imported by index.html and auth.js.
 * 
 * For Vercel deployment:
 *   - Environment variables VITE_FIREBASE_* are injected during build
 *   - They become available via window.APP_CONFIG.firebase
 * 
 * For local development:
 *   - Set window.APP_CONFIG = { firebase: { ... } } before loading this file
 *   - Or use .env.local with VITE_FIREBASE_* variables
 */

// ============================================================
// Required Configuration Fields
// ============================================================

const REQUIRED_FIELDS = ['apiKey', 'authDomain', 'projectId', 'appId'];

// ============================================================
// Get Firebase Config
// ============================================================

function getFirebaseConfig() {
    // Priority 1: Config injected at build time via window.APP_CONFIG
    if (typeof window !== 'undefined' && 
        window.APP_CONFIG && 
        window.APP_CONFIG.firebase) {
        return window.APP_CONFIG.firebase;
    }
    
    // Priority 2: Environment variables (Vite/Webpack)
    if (typeof importMetaEnv !== 'undefined') {
        return {
            apiKey: importMetaEnv.VITE_FIREBASE_API_KEY || null,
            authDomain: importMetaEnv.VITE_FIREBASE_AUTH_DOMAIN || null,
            projectId: importMetaEnv.VITE_FIREBASE_PROJECT_ID || null,
            storageBucket: importMetaEnv.VITE_FIREBASE_STORAGE_BUCKET || null,
            messagingSenderId: importMetaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || null,
            appId: importMetaEnv.VITE_FIREBASE_APP_ID || null,
        };
    }
    
    // Priority 3: import.meta.env for ES modules
    if (typeof import.meta !== 'undefined' && import.meta.env) {
        return {
            apiKey: import.meta.env.VITE_FIREBASE_API_KEY || null,
            authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || null,
            projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || null,
            storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || null,
            messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || null,
            appId: import.meta.env.VITE_FIREBASE_APP_ID || null,
        };
    }
    
    // No config available
    return null;
}

// ============================================================
// Validate Configuration
// ============================================================

/**
 * Check if Firebase config is valid for production use
 * Only checks presence of required fields - does NOT validate API key format
 * 
 * @param {object} config - Firebase config object
 * @returns {boolean} - true if config is valid
 */
function isConfigValid(config) {
    if (!config || typeof config !== 'object') {
        return false;
    }
    
    // Check all required fields are present and non-empty
    for (const field of REQUIRED_FIELDS) {
        const value = config[field];
        if (!value || value === '' || value === 'null' || value === 'undefined') {
            return false;
        }
    }
    
    // Check for placeholder values
    if (config.apiKey && (
        config.apiKey.includes('placeholder') ||
        config.apiKey.length < 10
    )) {
        return false;
    }
    
    return true;
}

/**
 * Check if running in demo mode
 * Demo mode is active when config is missing or clearly invalid
 * 
 * @returns {boolean}
 */
function isDemoMode() {
    const config = getFirebaseConfig();
    return !isConfigValid(config);
}

// ============================================================
// Export Config and Validation Functions
// ============================================================

const firebaseConfig = getFirebaseConfig();
const configIsValid = isConfigValid(firebaseConfig);
const demoMode = isDemoMode();

// ============================================================
// Console Logging
// ============================================================

if (typeof console !== 'undefined') {
    if (demoMode) {
        console.warn('🧪 Firebase config missing or invalid - RUNNING IN DEMO MODE');
        console.warn('To enable Firebase: configure VITE_FIREBASE_* in Vercel Dashboard');
    } else if (configIsValid) {
        console.log('✅ Firebase config valid - Ready to initialize');
    } else {
        console.warn('⚠️ Firebase config incomplete');
    }
}

// ============================================================
// Exports
// ============================================================

export { 
    firebaseConfig, 
    isConfigValid as configIsValid, 
    isDemoMode as demoMode,
    isConfigValid,
    isDemoMode,
    REQUIRED_FIELDS
};

export default firebaseConfig;

// ============================================================
// Global Helper (for non-module scripts if needed)
// ============================================================

if (typeof window !== 'undefined') {
    window.firebaseConfigHelpers = {
        getConfig: getFirebaseConfig,
        isValid: isConfigValid,
        isDemoMode: isDemoMode
    };
}

