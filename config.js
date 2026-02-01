/**
 * Firebase Configuration
 * DO NOT COMMIT .env FILE - Use environment variables in production
 * Reference: PLANO-MESTRE-TECNICO.md > Seção 4 Sprint 0
 */

const firebaseConfig = (function(){
  // Prefer explicit browser config via window.APP_CONFIG.firebase
  if (typeof window !== 'undefined' && window.APP_CONFIG && window.APP_CONFIG.firebase) {
    return window.APP_CONFIG.firebase;
  }

  // Fallback to import.meta.env for bundlers that support it
  const env = typeof import.meta !== 'undefined' ? (import.meta.env || {}) : {};

  return {
    apiKey: env.VITE_FIREBASE_API_KEY || null,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || null,
    projectId: env.VITE_FIREBASE_PROJECT_ID || null,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || null,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || null,
    appId: env.VITE_FIREBASE_APP_ID || null,
  };
})();

// Validate configuration
const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
const missingFields = requiredFields.filter(field => !firebaseConfig[field]);

if (missingFields.length > 0) {
  console.error('❌ Firebase Configuration Error');
  console.error('Missing configuration fields:', missingFields.join(', '));
  console.error('Provide `window.APP_CONFIG = { firebase: { ... } }` in your HTML or set import.meta.env vars. See .env.example');
  // Do not throw in browser; let callers handle missing config gracefully
}

export default firebaseConfig;

