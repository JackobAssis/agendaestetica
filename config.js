/**
 * Firebase Configuration
 * DO NOT COMMIT .env FILE - Use environment variables in production
 * Reference: PLANO-MESTRE-TECNICO.md > Seção 4 Sprint 0
 * 
 * Priority order:
 * 1. window.APP_CONFIG.firebase (injected by build)
 * 2. import.meta.env.VITE_FIREBASE_* (Vite/Vercel bundler)
 */

// ============================================================
// Required fields for valid Firebase config
// ============================================================

const FIREBASE_REQUIRED_FIELDS = ['apiKey', 'authDomain', 'projectId', 'appId'];

// ============================================================
// Get Firebase config from available sources
// ============================================================

function getFirebaseConfig() {
    // Priority 1: window.APP_CONFIG.firebase (injected by build script)
    if (typeof window !== 'undefined' && window.APP_CONFIG && window.APP_CONFIG.firebase) {
        const config = window.APP_CONFIG.firebase;
        if (config && config.apiKey && config.authDomain && config.projectId) {
            console.log('✅ Firebase config loaded from window.APP_CONFIG');
            return config;
        }
    }
    
    // Priority 2: import.meta.env (Vite/Vercel bundler)
    // This only works when bundled with Vite
    let envConfig = null;
    
    if (typeof import.meta !== 'undefined' && import.meta.env) {
        const env = import.meta.env;
        envConfig = {
            apiKey: env.VITE_FIREBASE_API_KEY || null,
            authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || null,
            projectId: env.VITE_FIREBASE_PROJECT_ID || null,
            storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || null,
            messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || null,
            appId: env.VITE_FIREBASE_APP_ID || null,
        };
        
        if (envConfig.apiKey && envConfig.authDomain && envConfig.projectId) {
            console.log('✅ Firebase config loaded from import.meta.env');
            return envConfig;
        }
    }
    
    // Return demo config - app will work in demo mode
    console.log('⚠️ Firebase config not found - demo mode');
    return {
        apiKey: null,
        authDomain: null,
        projectId: null,
        storageBucket: null,
        messagingSenderId: null,
        appId: null,
    };
}

// ============================================================
// Validate Firebase config
// ============================================================

function isFirebaseConfigValid(config) {
    if (!config || typeof config !== 'object') {
        return false;
    }
    
    // Check for placeholder/invalid values
    if (!config.apiKey || 
        config.apiKey === 'null' || 
        config.apiKey === 'undefined' ||
        (typeof config.apiKey === 'string' && config.apiKey.includes('placeholder')) ||
        (typeof config.apiKey === 'string' && config.apiKey.length < 10)) {
        return false;
    }
    
    // Check required fields exist
    for (const field of FIREBASE_REQUIRED_FIELDS) {
        const value = config[field];
        if (!value || typeof value !== 'string' || value.trim() === '') {
            return false;
        }
    }
    
    return true;
}

// ============================================================
// Initialize configuration
// ============================================================

const firebaseConfig = getFirebaseConfig();
const firebaseConfigValid = isFirebaseConfigValid(firebaseConfig);
const firebaseDemoMode = !firebaseConfigValid;

// ============================================================
// Console output for debugging
// ============================================================

if (typeof console !== 'undefined') {
    if (firebaseDemoMode) {
        console.warn('⚠️ Firebase configuration incomplete or using placeholder values.');
        console.warn('App will use demo mode. Configure VITE_FIREBASE_* environment variables.');
    } else {
        console.log('✅ Firebase configuration valid - Ready');
        console.log('Project ID:', firebaseConfig.projectId);
    }
}

// ============================================================
// Exports
// ============================================================

export { firebaseConfig, firebaseConfigValid, firebaseDemoMode };
export default firebaseConfig;

