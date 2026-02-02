/**
 * Firebase v9+ Modular SDK - Instance Factory
 * 
 * Centraliza a obtenção de instâncias Auth e Firestore
 * para evitar código v8 namespaced em todo o projeto.
 */

// ============================================================
// Firebase v9+ Imports
// ============================================================

import { getAuth } from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js?v=1';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js?v=1';

// ============================================================
// Instance Cache
// ============================================================

let _auth = null;
let _db = null;

/**
 * Obter instância do Auth - usa window.firebase.app se disponível
 * Fallback: cria nova instância se necessário
 */
export function getFirebaseAuth() {
    if (_auth) return _auth;
    
    // Se window.firebase.app existe (inicializado em index.html)
    if (typeof window !== 'undefined' && window.firebaseApp) {
        _auth = getAuth(window.firebaseApp);
        return _auth;
    }
    
    // Se window.firebase.auth existe (fallback)
    if (typeof window !== 'undefined' && window.firebase && window.firebase.auth) {
        _auth = window.firebase.auth;
        return _auth;
    }
    
    throw new Error('Firebase Auth não inicializado. Verifique index.html');
}

/**
 * Obter instância do Firestore - usa window.firebase.app se disponível
 * Fallback: cria nova instância se necessário
 */
export function getFirebaseDB() {
    if (_db) return _db;
    
    // Se window.firebase.app existe (inicializado em index.html)
    if (typeof window !== 'undefined' && window.firebaseApp) {
        _db = getFirestore(window.firebaseApp);
        return _db;
    }
    
    // Se window.firebase.db existe (fallback)
    if (typeof window !== 'undefined' && window.firebase && window.firebase.db) {
        _db = window.firebase.db;
        return _db;
    }
    
    throw new Error('Firebase Firestore não inicializado. Verifique index.html');
}

// Funções auxiliares para Firestore
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
} from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js?v=1';

// Funções auxiliares para Auth
export {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInAnonymously,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    onAuthStateChanged,
    getIdToken
} from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js?v=1';

