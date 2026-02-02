/**
 * Lightweight notifications module - Firebase v9+ Modular SDK
 * - in-app (Firestore) + webhook placeholder
 */

// ============================================================
// Firebase v9+ Modular SDK Imports
// ============================================================

import { 
    getFirestore, 
    collection, 
    addDoc 
} from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js';

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

// ============================================================
// Notification Functions
// ============================================================

export async function notifyInApp({ targetEmpresaId, title, body, meta = {} }) {
    const db = getFirebaseDB();
    
    const notif = { 
        title, 
        body, 
        read: false, 
        createdAt: new Date().toISOString(), 
        meta 
    };
    
    const notifRef = collection(db, 'empresas', targetEmpresaId, 'notificacoes');
    await addDoc(notifRef, notif);
    
    return notif;
}

export async function sendWebhook(url, payload) {
    try {
        await fetch(url, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(payload) 
        });
        return { ok: true };
    } catch (err) {
        console.warn('sendWebhook error', err);
        return { ok: false, error: err.message };
    }
}

export default { notifyInApp, sendWebhook };

