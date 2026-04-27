import { obterUsuarioAtual } from '../modules/auth.js';
import { listAgendamentosEmpresa, confirmarAgendamento, cancelarAgendamento } from '../modules/agendamentos.js';

const lista = document.getElementById('lista-agendamentos');
const btnFilter = document.getElementById('btn-filter');
const dateStart = document.getElementById('filter-date-start');
const dateEnd = document.getElementById('filter-date-end');

function formatDate(iso){
  const d = new Date(iso);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`;
}

function buildCard(item){
  const div = document.createElement('div');
  div.className = 'agendamento-item';
  div.innerHTML = `
    <div class="meta">
      <strong>${item.nomeCliente || item.clienteUid || 'Cliente'}</strong>
      <span class="text-secondary">${item.servico || ''}</span>
    </div>
    <div class="time">${formatDate(item.inicio)} - ${formatDate(item.fim)}</div>
    <div class="status">Status: <strong>${item.status}</strong></div>
    <div class="actions">
      ${item.status === 'solicitado' ? '<button class="btn-confirm">Confirmar</button>' : ''}
      ${item.status !== 'cancelado' ? '<button class="btn-cancel">Cancelar</button>' : ''}
    </div>
  `;

  // Attach handlers
  if (item.status === 'solicitado'){
    const b = div.querySelector('.btn-confirm');
    b.addEventListener('click', async ()=>{
      try{
        b.disabled = true; b.textContent = 'Confirmando...';
        const res = await confirmarAgendamento(obterUsuarioAtual().empresaId, item.id);
        showToast('Agendamento confirmado', 'success');
        // update UI
        const statusEl = div.querySelector('.status');
        if (statusEl) statusEl.innerHTML = 'Status: <strong>confirmado</strong>';
        b.remove();
        // optionally reload after short delay to refresh list
        setTimeout(()=> window.location.reload(), 900);
      }catch(err){
        console.error('Erro confirmar', err);
        showToast(err.message || 'Erro ao confirmar', 'error');
        b.disabled=false; b.textContent='Confirmar';
      }
    });
  }

  const bc = div.querySelector('.btn-cancel');
  if (bc){
    bc.addEventListener('click', async ()=>{
      if(!confirm('Confirmar cancelamento?')) return;
      try{
        bc.disabled = true; bc.textContent = 'Cancelando...';
        await cancelarAgendamento(obterUsuarioAtual().empresaId, item.id, 'Cancelado pelo profissional');
        window.location.reload();
      }catch(err){ alert(err.message || 'Erro ao cancelar'); bc.disabled=false; bc.textContent='Cancelar'; }
    });
  }

  return div;
}

function showToast(text, type='info'){
  let t = document.getElementById('global-toast');
  if(!t){
    t = document.createElement('div'); t.id = 'global-toast';
    t.style.position = 'fixed'; t.style.right='16px'; t.style.bottom='16px'; t.style.padding='12px 16px'; t.style.borderRadius='8px'; t.style.boxShadow='0 2px 8px rgba(0,0,0,0.12)'; t.style.zIndex=9999; document.body.appendChild(t);
  }
  t.textContent = text;
  t.style.background = type === 'success' ? '#e6ffed' : type === 'error' ? '#ffe6e6' : '#eef2ff';
  t.style.color = '#111';
  t.style.display = 'block';
  setTimeout(()=>{ t.style.display='none'; }, 3000);
}

async function carregarLista(){
  lista.innerHTML = '';
  try{
    const usuario = obterUsuarioAtual();
    if(!usuario || !usuario.empresaId){ window.location.href = '/login'; return; }

    const opts = {};
    if(dateStart.value && dateEnd.value){
      opts.start = new Date(dateStart.value).toISOString();
      opts.end = new Date(dateEnd.value).toISOString();
    }

    const ags = await listAgendamentosEmpresa(usuario.empresaId, opts);
    if(!ags.length){ lista.innerHTML = '<p class="text-secondary">Nenhum agendamento encontrado</p>'; return; }

    ags.forEach(a => {
      lista.appendChild(buildCard(a));
    });
  }catch(err){ console.error('Erro carregar agendamentos', err); lista.innerHTML = '<p class="error-message">Erro ao carregar agendamentos</p>'; }
}

btnFilter.addEventListener('click', async ()=>{ await carregarLista(); });

document.addEventListener('DOMContentLoaded', ()=>{ carregarLista(); });
