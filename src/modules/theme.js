/**
 * Theme module - Firebase v9+ Modular SDK
 * - applyTheme(themeName): applies CSS variables
 * - getTheme(empresaId): reads empresa theme from Firestore (or localStorage fallback)
 * - setTheme(empresaId, themeName): persists theme to Firestore and localStorage
 */

// ============================================================
// Firebase v9+ Modular SDK Imports
// ============================================================

import { 
    getFirestore, 
    doc, 
    getDoc, 
    updateDoc,
    collection,
    addDoc 
} from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js';

import { getAuth } from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js';

// ============================================================
// Firebase Instance Factory
// ============================================================

/**
 * Obter instância do Firestore - USA a instância global do index.html
 */
function getFirebaseDB() {
    if (typeof window !== 'undefined' && window.firebaseApp) {
        return getFirestore(window.firebaseApp);
    }
    throw new Error('Firebase Firestore não inicializado. Verifique index.html');
}

/**
 * Obter instância do Auth - USA a instância global do index.html
 */
function getFirebaseAuth() {
    if (typeof window !== 'undefined' && window.firebaseApp) {
        return getAuth(window.firebaseApp);
    }
    throw new Error('Firebase Auth não inicializado. Verifique index.html');
}

// ============================================================
// Theme Functions
// ============================================================

/**
 * Apply theme CSS variables to document
 * @param {string} themeName - 'free' | 'premium' | custom theme name
 */
export function applyTheme(themeName) {
    const root = document.documentElement;
    // themeName: 'free' | 'premium'
    root.setAttribute('data-theme', themeName);
}

/**
 * Get theme for empresa (from localStorage or Firestore)
 * @param {string} empresaId
 * @returns {Promise<string>} theme name
 */
export async function getTheme(empresaId) {
    // try localStorage first
    try {
        const local = localStorage.getItem('agenda_theme');
        if (local) return local;
    } catch (e) {
        /* ignore */
    }

    if (!empresaId) return 'free';
    
    try {
        const db = getFirebaseDB();
        const docRef = doc(db, 'empresas', empresaId);
        const snap = await getDoc(docRef);
        
        if (!snap.exists()) return 'free';
        
        const data = snap.data();
        return data.theme || 'free';
    } catch (e) {
        console.warn('getTheme error', e);
        return 'free';
    }
}

/**
 * Set theme for empresa (to localStorage and Firestore)
 * @param {string} empresaId
 * @param {string} themeName
 * @returns {Promise<boolean>}
 */
export async function setTheme(empresaId, themeName) {
    // Save to localStorage first
    try {
        localStorage.setItem('agenda_theme', themeName);
    } catch (e) {
        /* ignore */
    }

    if (!empresaId) return true;
    
    try {
        const db = getFirebaseDB();
        const docRef = doc(db, 'empresas', empresaId);
        await updateDoc(docRef, { 
            theme: themeName, 
            themeUpdatedAt: new Date().toISOString() 
        });
        return true;
    } catch (e) {
        console.warn('setTheme error', e);
        return false;
    }
}

/**
 * Notify in-app about theme change (for multi-device sync)
 * @param {string} empresaId
 * @param {string} themeName
 */
export async function notifyThemeChange(empresaId, themeName) {
    try {
        const auth = getFirebaseAuth();
        const currentUser = auth.currentUser;
        
        if (!currentUser) return;
        
        const db = getFirebaseDB();
        const notifRef = collection(db, 'empresas', empresaId, 'notificacoes');
        
        await addDoc(notifRef, {
            type: 'theme_change',
            theme: themeName,
            changedBy: currentUser.uid,
            createdAt: new Date().toISOString(),
            read: false
        });
    } catch (e) {
        console.warn('notifyThemeChange error', e);
    }
}

export default { applyTheme, getTheme, setTheme };

