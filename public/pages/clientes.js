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
  const strong = document.createElement('strong'); strong.textContent = c.nome;
  const meta = document.createElement('div'); meta.className = 'meta'; meta.textContent = `${c.email||''} ${c.telefone||''}`;
  const actions = document.createElement('div'); actions.className = 'actions';
  const btn = document.createElement('button'); btn.className = 'btn-view'; btn.textContent = 'Ver';
  btn.addEventListener('click', ()=> showDetails(c));
  actions.appendChild(btn);
  d.appendChild(strong); d.appendChild(meta); d.appendChild(actions);
  return d;
}

async function carregarLista(){
  listaEl.textContent = '';
  try{
    const usuario = obterUsuarioAtual();
    if(!usuario || !usuario.empresaId){ window.location.href = '/login'; return; }
    const clients = await listClientesEmpresa(usuario.empresaId);
    if(!clients.length){
      const p = document.createElement('p');
      p.className = 'text-secondary';
      p.textContent = 'Nenhum cliente cadastrado';
      listaEl.appendChild(p);
      return;
    }
    clients.forEach(c => listaEl.appendChild(buildClientCard(c)));
  }catch(err){ console.error('Erro carregar clientes', err); listaEl.textContent = ''; const p = document.createElement('p'); p.className='error-message'; p.textContent='Erro ao carregar clientes'; listaEl.appendChild(p); }
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
  detalhesContent.textContent = ''; // clear
  const p1 = document.createElement('p');
  const strong = document.createElement('strong'); strong.textContent = cliente.nome;
  p1.appendChild(strong);
  const p2 = document.createElement('p'); p2.textContent = `${cliente.email||''} • ${cliente.telefone||''}`;
  detalhesContent.appendChild(p1); detalhesContent.appendChild(p2);
  obsText.value = '';
  // Load historico
  try{
    const usuario = obterUsuarioAtual();
    const hist = await getHistorico(usuario.empresaId, cliente.id);
    historicoEl.textContent = '';
    if(!hist.length) { const p = document.createElement('p'); p.className='text-secondary'; p.textContent='Nenhum histórico'; historicoEl.appendChild(p); }
    hist.forEach(h=>{ 
      const div = document.createElement('div'); div.className='hist-item';
      const dateSpan = document.createElement('span'); dateSpan.textContent = formatDate(h.inicio);
      const sep1 = document.createElement('span'); sep1.textContent = ' — ';
      const serviceSpan = document.createElement('span'); serviceSpan.textContent = h.servico || '';
      const sep2 = document.createElement('span'); sep2.textContent = ' — ';
      const statusStrong = document.createElement('strong'); statusStrong.textContent = h.status;
      div.appendChild(dateSpan); div.appendChild(sep1); div.appendChild(serviceSpan); div.appendChild(sep2); div.appendChild(statusStrong);
      historicoEl.appendChild(div);
    });
  }catch(err){ console.error('Erro historico', err); historicoEl.textContent = ''; const p = document.createElement('p'); p.className='error-message'; p.textContent='Erro ao carregar histórico'; historicoEl.appendChild(p); }
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
