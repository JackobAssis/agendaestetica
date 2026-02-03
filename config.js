/**
 * Firebase Configuration
 * DO NOT COMMIT .env FILE - Use environment variables in production
 * Reference: PLANO-MESTRE-TECNICO.md > Seção 4 Sprint 0
 * 
 * Priority order:
 * 1. window.APP_CONFIG.firebase (injected by build)
 * 2. import.meta.env.VITE_FIREBASE_* (Vercel environment variables)
 * 3. .env.local (development)
 */

// ============================================================
// Required fields for valid Firebase config
// ============================================================

const FIREBASE_REQUIRED_FIELDS = ['apiKey', 'authDomain', 'projectId', 'appId'];

// ============================================================
// Get Firebase config from available sources
// ============================================================

function getFirebaseConfig() {
    // Priority 1: window.APP_CONFIG.firebase (injected by build)
    if (typeof window !== 'undefined' && window.APP_CONFIG && window.APP_CONFIG.firebase) {
        const config = window.APP_CONFIG.firebase;
        if (config.apiKey && config.authDomain && config.projectId) {
            console.log('✅ Firebase config loaded from window.APP_CONFIG');
            return config;
        }
    }
    
    // Priority 2: import.meta.env (Vercel compatible)
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
    
    if (envConfig.apiKey && envConfig.authDomain && envConfig.projectId) {
        console.log('✅ Firebase config loaded from import.meta.env');
        return envConfig;
    }
    
    // Return whatever we have (may be incomplete for demo mode)
    return envConfig;
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
        config.apiKey.includes('placeholder') ||
        config.apiKey.length < 10) {
        return false;
    }
    
    // Check required fields
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
        console.warn('App will use placeholder config. Replace values in .env.local or set window.APP_CONFIG.firebase');
        console.warn('Required fields:', FIREBASE_REQUIRED_FIELDS.join(', '));
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

