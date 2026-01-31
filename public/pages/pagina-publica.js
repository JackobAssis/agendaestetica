// Simple public profile page for professional (read-only)
async function carregar(){
  const parts = window.location.pathname.split('/').filter(Boolean);
  const profissionalId = parts[1] || null;
  if(!profissionalId) return;
  const db = window.firebase.db;
  const doc = await db.collection('empresas').doc(profissionalId).get();
  if(!doc.exists) return;
  const data = doc.data();
  document.getElementById('public-nome').textContent = data.nome || 'Profissional';
  document.getElementById('public-desc').textContent = data.profissao || '';
  const servicosEl = document.getElementById('public-servicos');
  servicosEl.innerHTML = '';
  (data.servicos||[]).forEach(s=>{ const li = document.createElement('li'); li.textContent = s; servicosEl.appendChild(li); });
  const link = document.getElementById('link-agendar');
  if(link) link.href = `/agendar/${profissionalId}`;
}

document.addEventListener('DOMContentLoaded', carregar);
