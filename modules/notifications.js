/**
 * Notifications Module - Firebase v9+ Modular SDK
 * CORRIGIDO para Firebase v9+ modular
 */

import { getFirebaseDB, collection, addDoc } from '../modules/firebase.js';

export async function notifyInApp({ targetEmpresaId, title, body, meta = {} }){
    const db = getFirebaseDB();  // ✅ v9+
    
    const notif = { 
        title, 
        body, 
        read: false, 
        createdAt: new Date().toISOString(), 
        meta 
    };
    
    await addDoc(collection(db, 'empresas', targetEmpresaId, 'notificacoes'), notif);  // ✅ v9+
    return notif;
}

export async function sendWebhook(url, payload){
    try{
        await fetch(url, { 
            method: 'POST', 
            headers: { 'Content-Type':'application/json' }, 
            body: JSON.stringify(payload) 
        });
        return { ok: true };
    }catch(err){ 
        console.warn('sendWebhook error', err); 
        return { ok:false, error: err.message } 
    }
}

export default { notifyInApp, sendWebhook };

