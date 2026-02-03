/**
 * Firebase v9+ Modular SDK - Instance Factory
 * 
 * Provides centralized Firebase instances for all modules.
 * Uses window.firebaseApp if available (initialized in index.html).
 */

// ============================================================
// Firebase v9+ Imports
// ============================================================

import { getAuth } from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-storage.js';

// ============================================================
// Instance Cache
// ============================================================

let _auth = null;
let _db = null;
let _storage = null;

/**
 * Get Firebase Auth instance
 * Uses window.firebaseApp if available, otherwise throws
 */
export function getFirebaseAuth() {
    if (_auth) return _auth;
    
    const app = getFirebaseApp();
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
    _storage = getStorage(app);
    return _storage;
}

/**
 * Get Firebase App instance
 * Uses window.firebaseApp (initialized in index.html)
 */
export function getFirebaseApp() {
    if (typeof window !== 'undefined' && window.firebaseApp) {
        return window.firebaseApp;
    }
    
    throw new Error('Firebase App not initialized. Initialize in index.html first.');
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

