/**
 * Firebase v9+ Modular SDK - Instance Factory
 * 
 * Provides centralized Firebase instances for all modules.
 * Uses window.firebaseApp if available (initialized in index.html).
 * 
 * Reference: 2.0.md > Tarefa 3 - Inicialização correta do Firebase
 * Garantir que Firebase seja inicializado uma única vez.
 */

// ============================================================
// Firebase v9+ Imports
// ============================================================

import { getAuth } from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-storage.js';

/**
 * Get Firebase App instance
 * Uses window.firebaseApp (initialized in index.html)
 * 
 * Reference: 2.0.md > Tarefa 3 - Falhar imediatamente se não inicializado
 */
export function getFirebaseApp() {
    if (typeof window !== 'undefined' && window.firebaseApp) {
        return window.firebaseApp;
    }
    
    console.error('❌ Firebase App não inicializado. Verifique se initializeApp() foi chamado em index.html antes de usar auth.js');
    throw new Error('Firebase App not initialized. Initialize in index.html first.');
}

/**
 * Set Firebase as initialized (called from index.html after initializeApp)
 * This marks that Firebase has been properly initialized
 */
export function markFirebaseInitialized() {
    console.log('✅ Firebase marcado como inicializado');
}

/**
 * Get Firebase Auth instance
 * Uses window.firebaseApp if available, otherwise throws
 * 
 * Reference: 2.0.md > Tarefa 3 - Reutilizar a mesma instância
 */
export function getFirebaseAuth() {
    const app = getFirebaseApp();
    return getAuth(app);
}

/**
 * Get Firebase Firestore instance
 * Uses window.firebaseApp if available, otherwise throws
 */
export function getFirebaseDB() {
    const app = getFirebaseApp();
    return getFirestore(app);
}

/**
 * Get Firebase Storage instance
 * Uses window.firebaseApp if available, otherwise throws
 */
export function getFirebaseStorage() {
    const app = getFirebaseApp();
    return getStorage(app);
}

// ============================================================
// Re-export Firestore functions
// ============================================================

export {
    collection,
    collectionGroup,
    doc,
    setDoc,
    getDoc,
    getDocs,
    query,
    where,
    updateDoc,
    addDoc,
    deleteDoc,
    orderBy,
    limit,
    startAfter,
    Timestamp,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js';

// ============================================================
// Re-export Auth functions
// ============================================================

export {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    onAuthStateChanged,
    getIdToken
} from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js';

