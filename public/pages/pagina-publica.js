/**
 * Public Profile Page - Firebase v9+ Modular SDK
 * Simple public profile page for professional (read-only)
 */

// ============================================================
// Firebase v9+ Modular SDK Imports
// ============================================================

import { 
    getFirestore, 
    doc, 
    getDoc 
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
// Public Page Functions
// ============================================================

async function carregar() {
    const parts = window.location.pathname.split('/').filter(Boolean);
    const profissionalId = parts[1] || null;
    
    if (!profissionalId) return;
    
    try {
        const db = getFirebaseDB();
        const docRef = doc(db, 'empresas', profissionalId);
        const snap = await getDoc(docRef);
        
        if (!snap.exists()) return;
        
        const data = snap.data();
        
        document.getElementById('public-nome').textContent = data.nome || 'Profissional';
        document.getElementById('public-desc').textContent = data.profissao || '';
        
        const servicosEl = document.getElementById('public-servicos');
        servicosEl.innerHTML = '';
        
        (data.servicos || []).forEach(s => {
            const li = document.createElement('li');
            li.textContent = s;
            servicosEl.appendChild(li);
        });
        
        const link = document.getElementById('link-agendar');
        if (link) link.href = `/agendar/${profissionalId}`;
        
    } catch (error) {
        console.error('Erro ao carregar perfil público:', error);
    }
}

document.addEventListener('DOMContentLoaded', carregar);

