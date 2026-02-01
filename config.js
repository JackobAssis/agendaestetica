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

// Validate configuration - warn but don't throw for placeholder values
const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
const missingFields = requiredFields.filter(field => !firebaseConfig[field]);

// Check for placeholder values
const isPlaceholder = firebaseConfig.apiKey === 'AIzaSyD-placeholder-key' || 
                     !firebaseConfig.apiKey ||
                     firebaseConfig.apiKey === 'null' ||
                     firebaseConfig.apiKey === 'undefined';

if (missingFields.length > 0 || isPlaceholder) {
  const hasRealConfig = !isPlaceholder && missingFields.length === 0;
  
  if (hasRealConfig) {
    console.warn('⚠️ Firebase Configuration Warning: Some optional fields missing:', missingFields.join(', '));
  } else {
    console.warn('⚠️ Firebase configuration incomplete or using placeholder values.');
    console.warn('App will use placeholder config. Replace values in .env.local or set window.APP_CONFIG.firebase');
    console.warn('Required fields:', requiredFields.join(', '));
  }
}

export default firebaseConfig;

