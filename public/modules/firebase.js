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

// ============================================================
// Instance Cache - Singleton Pattern
// ============================================================

let _auth = null;
let _db = null;
let _storage = null;
let _firebaseInitialized = false;

/**
 * Check if Firebase is already initialized
 * Prevents multiple initializeApp() calls
 */
function isFirebaseReady() {
    return _firebaseInitialized && typeof window !== 'undefined' && window.firebaseApp;
}

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
    _firebaseInitialized = true;
    console.log('✅ Firebase marcado como inicializado');
}

/**
 * Get Firebase Auth instance
 * Uses window.firebaseApp if available, otherwise throws
 * 
 * Reference: 2.0.md > Tarefa 3 - Reutilizar a mesma instância
 */
export function getFirebaseAuth() {
    if (_auth) return _auth;
    
    const app = getFirebaseApp();
    if (!app) {
        throw new Error('Firebase Auth não pode ser obtido: App não inicializado');
    }
    
    _auth = getAuth(app);
    return _auth;
}

/**
 * Get Firebase Firestore instance
 * Uses window.firebaseApp if available, otherwise throws
 */
export function getFirebaseDB() {
    if (_db) return _db;
    
    const app = getFirebaseApp();
    if (!app) {
        throw new Error('Firebase DB não pode ser obtido: App não inicializado');
    }
    
    _db = getFirestore(app);
    return _db;
}

/**
 * Get Firebase Storage instance
 * Uses window.firebaseApp if available, otherwise throws
 */
export function getFirebaseStorage() {
    if (_storage) return _storage;
    
    const app = getFirebaseApp();
    if (!app) {
        throw new Error('Firebase Storage não pode ser obtido: App não inicializado');
    }
    
    _storage = getStorage(app);
    return _storage;
}

// ============================================================
// Re-export Firestore functions
// ============================================================

export {
    collection,
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
    signInAnonymously,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    onAuthStateChanged,
    getIdToken
} from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js';

