/**
 * Firebase Configuration
 * 
 * This file reads Firebase config from window.APP_CONFIG (injected at build time)
 * or uses safe fallback values.
 * 
 * For Vercel deployment:
 *   - Environment variables VITE_FIREBASE_* are injected during build
 *   - They become available via window.APP_CONFIG.firebase
 * 
 * For local development:
 *   - Set window.APP_CONFIG = { firebase: { ... } } before loading this file
 *   - Or use a local development setup
 */

// IIFE to safely get configuration
const firebaseConfig = (function() {
    // Priority 1: Config injected at build time
    if (typeof window !== 'undefined' && 
        window.APP_CONFIG && 
        window.APP_CONFIG.firebase &&
        window.APP_CONFIG.firebase.apiKey &&
        !window.APP_CONFIG._demoMode) {
        console.log('📦 Config loaded from build injection (window.APP_CONFIG.firebase)');
        return window.APP_CONFIG.firebase;
    }
    
    // Priority 2: Demo mode indicator
    if (typeof window !== 'undefined' && window.APP_CONFIG && window.APP_CONFIG._demoMode) {
        console.log('🧪 Running in DEMO mode - Firebase not configured');
        return null;
    }
    
    // No valid config available
    console.warn('⚠️ No valid Firebase configuration found');
    return null;
})();

// Export for ES modules
export default firebaseConfig;

/**
 * Helper function to check if Firebase is configured
 * Use this before any Firebase operations
 */
window.isFirebaseConfigured = function() {
    return firebaseConfig !== null && 
           firebaseConfig.apiKey &&
           firebaseConfig.apiKey !== 'null' &&
           firebaseConfig.apiKey !== 'undefined' &&
           !firebaseConfig.apiKey.includes('placeholder');
};

