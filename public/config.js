/**
 * Firebase Configuration - Single Source of Truth
 * 
 * This file provides Firebase config validation for the entire app.
 * It should be imported by index.html and auth.js.
 */

// ============================================================
// Required Configuration Fields
// ============================================================

const REQUIRED_FIELDS = ['apiKey', 'authDomain', 'projectId', 'appId'];

// ============================================================
// Get Firebase Config
// ============================================================

function getFirebaseConfig() {
    // Config injected at build time via window.APP_CONFIG
    if (typeof window !== 'undefined' && 
        window.APP_CONFIG && 
        window.APP_CONFIG.firebase) {
        return window.APP_CONFIG.firebase;
    }
    
    // Environment variables
    const env = typeof import.meta !== 'undefined' ? (import.meta.env || {}) : {};
    
    return {
        apiKey: env.VITE_FIREBASE_API_KEY || null,
        authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || null,
        projectId: env.VITE_FIREBASE_PROJECT_ID || null,
        storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || null,
        messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || null,
        appId: env.VITE_FIREBASE_APP_ID || null,
    };
}

// ============================================================
// Validate Configuration
// ============================================================

function isFirebaseConfigValid(config) {
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

function isFirebaseDemoMode(config) {
    return !isFirebaseConfigValid(config);
}

// ============================================================
// Create exports
// ============================================================

const firebaseConfig = getFirebaseConfig();
const configIsValid = isFirebaseConfigValid(firebaseConfig);
const demoMode = isFirebaseDemoMode(firebaseConfig);

// ============================================================
// Console Logging
// ============================================================

if (typeof console !== 'undefined') {
    if (demoMode) {
        console.warn('🧪 Firebase config missing or invalid - RUNNING IN DEMO MODE');
    } else if (configIsValid) {
        console.log('✅ Firebase config valid - Ready to initialize');
    }
}

// ============================================================
// ES Module Exports
// ============================================================

export { firebaseConfig as firebaseConfig$config };
export { configIsValid as configIsValid$config };
export { demoMode as demoMode$config };
export { isFirebaseConfigValid };
export { isFirebaseDemoMode };

// Default export for compatibility
export default firebaseConfig;

// Make available globally for non-module scripts
if (typeof window !== 'undefined') {
    window.firebaseConfigHelpers = {
        getConfig: getFirebaseConfig,
        isValid: isFirebaseConfigValid,
        isDemoMode: isFirebaseDemoMode,
        config: firebaseConfig
    };
}

