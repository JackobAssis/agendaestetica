/**
 * Página Pública do Profissional - Firebase v9+ Modular SDK
 * CORRIGIDO para Firebase v9+ modular
 */

import { getFirebaseDB, doc, getDoc, collection, query, where, getDocs } from '../modules/firebase.js';

async function carregar(){
    const parts = window.location.pathname.split('/').filter(Boolean);
    const profissionalId = parts[1] || null;
    
    if(!profissionalId) return;
    
    const db = getFirebaseDB();  // ✅ v9+
    const docRef = doc(db, 'empresas', profissionalId);  // ✅ v9+
    const empresaDoc = await getDoc(docRef);  // ✅ v9+
    
    if(!empresaDoc.exists()) return;
    
    const data = empresaDoc.data();
    document.getElementById('public-nome').textContent = data.nome || 'Profissional';
    document.getElementById('public-desc').textContent = data.profissao || '';
    
    const servicosEl = document.getElementById('public-servicos');
    servicosEl.innerHTML = '';
    (data.servicos||[]).forEach(s=>{
        const li = document.createElement('li');
        li.textContent = s;
        servicosEl.appendChild(li);
    });
    
    const link = document.getElementById('link-agendar');
    if(link) link.href = `/agendar/${profissionalId}`;
}

document.addEventListener('DOMContentLoaded', carregar);

