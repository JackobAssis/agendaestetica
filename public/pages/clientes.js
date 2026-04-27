import { obterUsuarioAtual } from '../modules/auth.js';
import { addCliente, listClientesEmpresa, getCliente, addObservacao, getHistorico } from '../modules/clientes.js';

const listaEl = document.getElementById('lista-clientes');
const form = document.getElementById('form-add-client');
const btnRefresh = document.getElementById('btn-refresh');
const detalhesSec = document.getElementById('cliente-detalhes');
const detalhesContent = document.getElementById('detalhes-content');
const historicoEl = document.getElementById('cliente-historico');
const obsText = document.getElementById('obs-text');
const btnAddObs = document.getElementById('btn-add-obs');

let currentCliente = null;

function formatDate(iso){ if(!iso) return ''; const d = new Date(iso); return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}` }

function buildClientCard(c){
  const d = document.createElement('div'); d.className = 'client-card';
  d.innerHTML = `<strong>${c.nome}</strong> <div class="meta">${c.email||''} ${c.telefone||''}</div> <div class="actions"><button class="btn-view">Ver</button></div>`;
  d.querySelector('.btn-view').addEventListener('click', ()=> showDetails(c));
  return d;
}

async function carregarLista(){
  listaEl.innerHTML = '';
  try{
    const usuario = obterUsuarioAtual();
    if(!usuario || !usuario.empresaId){ window.location.href = '/login'; return; }
    const clients = await listClientesEmpresa(usuario.empresaId);
    if(!clients.length){ listaEl.innerHTML = '<p class="text-secondary">Nenhum cliente cadastrado</p>'; return; }
    clients.forEach(c => listaEl.appendChild(buildClientCard(c)));
  }catch(err){ console.error('Erro carregar clientes', err); listaEl.innerHTML = '<p class="error-message">Erro ao carregar clientes</p>'; }
}

async function onAddClient(e){
  e.preventDefault();
  const nome = document.getElementById('cliente-nome').value.trim();
  const email = document.getElementById('cliente-email').value.trim();
  const tel = document.getElementById('cliente-tel').value.trim();
  if(!nome){ alert('Nome é obrigatório'); return; }
  try{
    const usuario = obterUsuarioAtual();
    const res = await addCliente(usuario.empresaId, { nome, email, telefone: tel });
    await carregarLista();
    showToast('Cliente adicionado', 'success');
    form.reset();
  }catch(err){ console.error(err); showToast(err.message || 'Erro ao adicionar cliente', 'error'); }
}

async function showDetails(cliente){
  currentCliente = cliente;
  detalhesSec.classList.remove('hidden');
  detalhesContent.innerHTML = `<p><strong>${cliente.nome}</strong></p><p>${cliente.email||''} • ${cliente.telefone||''}</p>`;
  obsText.value = '';
  // Load historico
  try{
    const usuario = obterUsuarioAtual();
    const hist = await getHistorico(usuario.empresaId, cliente.id);
    historicoEl.innerHTML = '';
    if(!hist.length) historicoEl.innerHTML = '<p class="text-secondary">Nenhum histórico</p>';
    hist.forEach(h=>{ const div = document.createElement('div'); div.className='hist-item'; div.innerHTML=`${formatDate(h.inicio)} — ${h.servico || ''} — <strong>${h.status}</strong>`; historicoEl.appendChild(div); });
  }catch(err){ console.error('Erro historico', err); historicoEl.innerHTML = '<p class="error-message">Erro ao carregar histórico</p>'; }
}

btnAddObs.addEventListener('click', async ()=>{
  if(!currentCliente) return showToast('Selecione um cliente', 'error');
  const texto = obsText.value.trim(); if(!texto) return showToast('Escreva uma observação', 'error');
  try{
    const usuario = obterUsuarioAtual();
    await addObservacao(usuario.empresaId, currentCliente.id, texto);
    showToast('Observação adicionada', 'success');
    obsText.value = '';
  }catch(err){ console.error(err); showToast('Erro ao salvar observação','error'); }
});

btnRefresh.addEventListener('click', carregarLista);
form.addEventListener('submit', onAddClient);
document.addEventListener('DOMContentLoaded', carregarLista);

function showToast(text, type='info'){
  let t = document.getElementById('global-toast');
  if(!t){ t = document.createElement('div'); t.id='global-toast'; t.style.position='fixed'; t.style.right='16px'; t.style.bottom='16px'; t.style.padding='12px 16px'; t.style.borderRadius='8px'; t.style.zIndex=9999; document.body.appendChild(t); }
  t.textContent = text; t.style.background = type==='success'?'#e6ffed': type==='error'?'#ffe6e6':'#eef2ff'; t.style.display='block'; setTimeout(()=> t.style.display='none',3000);
}
