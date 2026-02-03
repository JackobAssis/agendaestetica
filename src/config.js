/**
 * Firebase Configuration - Single Source of Truth
 * 
 * Uses import.meta.env as primary source (Vercel compatible).
 * Falls back to window.APP_CONFIG if env vars are missing.
 */

// Required fields for valid Firebase config
const FIREBASE_REQUIRED_FIELDS = ['apiKey', 'authDomain', 'projectId', 'appId'];

/**
 * Get Firebase config from environment variables or window.APP_CONFIG
 */
function getFirebaseConfig() {
    // Primary source: import.meta.env (Vercel compatible)
    const env = (typeof importMetaEnv !== 'undefined' ? importMetaEnv : 
                 (typeof import.meta !== 'undefined' ? import.meta.env : {}));
    
    const envConfig = {
        apiKey: env.VITE_FIREBASE_API_KEY || null,
        authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || null,
        projectId: env.VITE_FIREBASE_PROJECT_ID || null,
        storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || null,
        messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || null,
        appId: env.VITE_FIREBASE_APP_ID || null,
    };
    
    // Fallback: window.APP_CONFIG (build-time injection)
    if (typeof window !== 'undefined' && 
        window.APP_CONFIG && 
        window.APP_CONFIG.firebase &&
        window.APP_CONFIG.firebase.apiKey) {
        return window.APP_CONFIG.firebase;
    }
    
    return envConfig;
}

/**
 * Check if Firebase config is valid
 * Validation: all required keys must exist and be non-empty strings
 */
function isFirebaseConfigValid(config) {
    if (!config || typeof config !== 'object') {
        return false;
    }
    
    for (const field of FIREBASE_REQUIRED_FIELDS) {
        const value = config[field];
        if (!value || typeof value !== 'string' || value.trim() === '') {
            return false;
        }
    }
    
    return true;
}

// Create exported values
const firebaseConfig = getFirebaseConfig();
const firebaseConfigValid = isFirebaseConfigValid(firebaseConfig);
const firebaseDemoMode = !firebaseConfigValid;

// Console logging for debugging
if (typeof console !== 'undefined') {
    if (firebaseDemoMode) {
        console.warn('[Firebase Config] Missing or invalid - DEMO MODE');
    } else {
        console.log('[Firebase Config] Valid - Ready');
    }
}

// Named exports - clean and simple
export { firebaseConfig, firebaseConfigValid, firebaseDemoMode };

