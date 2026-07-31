/**
 * Theme module - Firebase v9+ Modular SDK
 * CORRIGIDO para Firebase v9+ modular
 */

import { getFirebaseDB, doc, getDoc, updateDoc } from '../modules/firebase.js';

export function applyTheme(themeName){
    const root = document.documentElement;
    root.setAttribute('data-theme', themeName);
}

export async function getTheme(empresaId){
    try{
        const local = localStorage.getItem('agenda_theme');
        if(local) return local;
    }catch(e){}

    if(!empresaId) return 'beauty';
    
    try{
        const db = getFirebaseDB();
        const docRef = doc(db, 'empresas', empresaId);
        const snap = await getDoc(docRef);
        
        if(!snap.exists()) return 'beauty';
        const data = snap.data();
        return data.theme || 'beauty';
    }catch(e){ console.warn('getTheme error', e); return 'beauty'; }
}

export async function setTheme(empresaId, themeName){
    try{
        localStorage.setItem('agenda_theme', themeName);
    }catch(e){}

    if(!empresaId) return true;
    
    try{
        const db = getFirebaseDB();  // ✅ v9+
        const docRef = doc(db, 'empresas', empresaId);
        await updateDoc(docRef, { 
            theme: themeName, 
            themeUpdatedAt: new Date().toISOString() 
        });  // ✅ v9+
        return true;
    }catch(e){ console.warn('setTheme error', e); return false; }
}

export default { applyTheme, getTheme, setTheme };

