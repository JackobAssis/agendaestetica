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
    getDoc,
    collection,
    query,
    where,
    getDocs
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
        let snap;
        
        // first attempt: assume profissionalId is document ID
        const docRef = doc(db, 'empresas', profissionalId);
        snap = await getDoc(docRef);
        
        // if not found, try lookup by slug field (allows friendly URLs)
        if (!snap.exists()) {
            const q = query(
                collection(db, 'empresas'),
                where('slug', '==', profissionalId),
                where('public', '==', true),
                // limit to 1 (import limit if needed)
            );
            const results = await getDocs(q);
            if (!results.empty) {
                snap = results.docs[0];
            }
        }
        
        if (!snap || !snap.exists()) {
            document.getElementById('public-nome').textContent = 'Profissional não encontrado';
            document.getElementById('public-desc').textContent = 'Desculpe, este profissional não existe ou foi removido.';
            return;
        }
        
        const data = snap.data();
        
        document.getElementById('public-nome').textContent = data.nome || 'Profissional';
        document.getElementById('public-desc').textContent = data.profissao || '';
        if (data.endereco && document.getElementById('profissional-endereco')) {
            document.getElementById('profissional-endereco').textContent = data.endereco;
        }
        
        const servicosEl = document.getElementById('public-servicos');
        servicosEl.textContent = '';
        
        (data.servicos || []).forEach(s => {
            const li = document.createElement('li');
            if (typeof s === 'string') {
                li.textContent = s;
            } else {
                // object form
                let txt = s.nome || '';
                if (s.preco != null) txt += ` - R$${s.preco}`;
                if (s.duracao != null) txt += ` - ${s.duracao}min`;
                li.textContent = txt;
            }
            servicosEl.appendChild(li);
        });
        
        const link = document.getElementById('link-agendar');
        if (link) link.href = `/agendar/${profissionalId}`;
        
    } catch (error) {
        console.error('Erro ao carregar perfil público:', error);
    }
}

document.addEventListener('DOMContentLoaded', carregar);

