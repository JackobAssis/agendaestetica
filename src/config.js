/**
 * Firebase Configuration - Single Source of Truth
 */

// Required fields for valid Firebase config
const FIREBASE_REQUIRED_FIELDS = ['apiKey', 'authDomain', 'projectId', 'appId'];

// Get Firebase config from window.APP_CONFIG or environment variables
function getFirebaseConfig() {
    if (typeof window !== 'undefined' && 
        window.APP_CONFIG && 
        window.APP_CONFIG.firebase) {
        return window.APP_CONFIG.firebase;
    }
    
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

// Check if Firebase config is valid
function isFirebaseConfigValid(config) {
    if (!config || typeof config !== 'object') {
        return false;
    }
    
    for (const field of FIREBASE_REQUIRED_FIELDS) {
        const value = config[field];
        if (!value || value === '' || value === 'null' || value === 'undefined') {
            return false;
        }
    }
    
    if (config.apiKey && (
        config.apiKey.includes('placeholder') ||
        config.apiKey.length < 10
    )) {
        return false;
    }
    
    return true;
}

// Check if running in demo mode
function isFirebaseDemoMode(config) {
    return !isFirebaseConfigValid(config);
}

// Create exported values
const firebaseConfig = getFirebaseConfig();
const firebaseConfigValid = isFirebaseConfigValid(firebaseConfig);
const firebaseDemoMode = isFirebaseDemoMode(firebaseConfig);

// Console logging
if (typeof console !== 'undefined') {
    if (firebaseDemoMode) {
        console.warn('Firebase config missing or invalid - DEMO MODE');
    } else if (firebaseConfigValid) {
        console.log('Firebase config valid - Ready');
    }
}

// Named exports
export { firebaseConfig };
export { firebaseConfigValid };
export { firebaseDemoMode };
export { isFirebaseConfigValid };
export { isFirebaseDemoMode };

// Default export
export default firebaseConfig;

// Global helper
if (typeof window !== 'undefined') {
    window.firebaseHelpers = {
        getConfig: getFirebaseConfig,
        isValid: isFirebaseConfigValid,
        isDemoMode: isFirebaseDemoMode
    };
}

