import { obterUsuarioAtual } from '../modules/auth.js';
import { getPlan, setPlan, PLANS } from '../modules/monetization.js';

const nomeEl = document.getElementById('perfil-nome');
const emailEl = document.getElementById('perfil-email');
const planoText = document.getElementById('plano-atual-text');
const planoSelect = document.getElementById('plano-select');
const btnChange = document.getElementById('btn-change-plan');

async function init(){
  const usuario = obterUsuarioAtual();
  if(!usuario) { window.location.href = '/login'; return; }
  nomeEl.textContent = usuario.nome;
  emailEl.textContent = usuario.email || '';

  const plano = await getPlan(usuario.empresaId);
  planoText.textContent = plano.charAt(0).toUpperCase() + plano.slice(1);
  planoSelect.value = plano;

  btnChange.addEventListener('click', async ()=>{
    const newPlan = planoSelect.value;
    if(newPlan === plano) return alert('Plano igual ao atual');
    try{
      await setPlan(usuario.empresaId, newPlan);
      alert('Plano atualizado');
      window.location.reload();
    }catch(e){ console.error(e); alert('Erro ao atualizar plano'); }
  });
}

document.addEventListener('DOMContentLoaded', init);
