/**
 * Theme module
 * - applyTheme(themeName): applies CSS variables
 * - getTheme(empresaId): reads empresa theme from Firestore (or localStorage fallback)
 * - setTheme(empresaId, themeName): persists theme to Firestore and localStorage
 */

export function applyTheme(themeName){
  const root = document.documentElement;
  // themeName: 'free' | 'premium'
  root.setAttribute('data-theme', themeName);
}

export async function getTheme(empresaId){
  // try localStorage first
  try{
    const local = localStorage.getItem('agenda_theme');
    if(local) return local;
  }catch(e){/* ignore */}

  if(!empresaId) return 'free';
  if(!window.firebase || !window.firebase.db) return 'free';
  try{
    const doc = await window.firebase.db.collection('empresas').doc(empresaId).get();
    if(!doc.exists) return 'free';
    const data = doc.data();
    return data.theme || 'free';
  }catch(e){ console.warn('getTheme error', e); return 'free'; }
}

export async function setTheme(empresaId, themeName){
  try{
    localStorage.setItem('agenda_theme', themeName);
  }catch(e){/* ignore */}

  if(!empresaId) return true;
  if(!window.firebase || !window.firebase.db) return true;
  try{
    await window.firebase.db.collection('empresas').doc(empresaId).update({ theme: themeName, themeUpdatedAt: new Date().toISOString() });
    return true;
  }catch(e){ console.warn('setTheme error', e); return false; }
}

export default { applyTheme, getTheme, setTheme };
