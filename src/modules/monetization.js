/**
 * Monetization / Plan management module - Firebase v9+ Modular SDK
 * - getPlan(empresaId)
 * - setPlan(empresaId, plan)
 * - available plans and features mapping
 */

// ============================================================
// Firebase v9+ Modular SDK Imports
// ============================================================

import { 
    getFirestore, 
    doc, 
    getDoc, 
    updateDoc 
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
// Plan Definitions
// ============================================================

export const PLANS = {
    free: {
        name: 'Free',
        features: ['agenda_basica', 'agendamentos_basico', 'clientes_basico', 'tema_padrao']
    },
    premium: {
        name: 'Premium',
        features: ['agenda_basica', 'agendamentos_basico', 'clientes_basico', 'tema_padrao', 'tema_avancado', 'notificacoes_email', 'relatorios', 'integracao_agenda']
    }
};

// ============================================================
// Monetization Functions
// ============================================================

export async function getPlan(empresaId) {
    if (!empresaId) return 'free';
    
    try {
        const db = getFirebaseDB();
        const docRef = doc(db, 'empresas', empresaId);
        const snap = await getDoc(docRef);
        
        if (!snap.exists()) return 'free';
        return snap.data().plano || 'free';
    } catch (e) {
        console.warn('getPlan error', e);
        return 'free';
    }
}

export async function setPlan(empresaId, plan) {
    if (!empresaId) throw new Error('empresaId required');
    if (!PLANS[plan]) throw new Error('Invalid plan');
    
    try {
        const db = getFirebaseDB();
        const docRef = doc(db, 'empresas', empresaId);
        await updateDoc(docRef, { 
            plano: plan, 
            planoUpdatedAt: new Date().toISOString() 
        });
        return true;
    } catch (e) {
        console.error('setPlan error', e);
        throw e;
    }
}

export function getFeaturesForPlan(plan) {
    return PLANS[plan] ? PLANS[plan].features : PLANS.free.features;
}

export default { PLANS, getPlan, setPlan, getFeaturesForPlan };

