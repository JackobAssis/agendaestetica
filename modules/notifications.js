// Lightweight notifications module: in-app (Firestore) + webhook placeholder

export async function notifyInApp({ targetEmpresaId, title, body, meta = {} }){
  if(!window.firebase || !window.firebase.db) throw new Error('Firebase não inicializado');
  const db = window.firebase.db;
  const notif = { title, body, read: false, createdAt: new Date().toISOString(), meta };
  await db.collection('empresas').doc(targetEmpresaId).collection('notificacoes').add(notif);
  return notif;
}

export async function sendWebhook(url, payload){
  try{
    await fetch(url, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(payload) });
    return { ok: true };
  }catch(err){ console.warn('sendWebhook error', err); return { ok:false, error: err.message } }
}

export default { notifyInApp, sendWebhook };
