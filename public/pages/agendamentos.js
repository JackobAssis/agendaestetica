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
  const div = document.createElement('div'); div.className = 'agendamento-item';

  const meta = document.createElement('div'); meta.className = 'meta';
  const strong = document.createElement('strong'); strong.textContent = item.nomeCliente || item.clienteUid || 'Cliente';
  const spanSvc = document.createElement('span'); spanSvc.className = 'text-secondary'; spanSvc.textContent = item.servico || '';
  meta.appendChild(strong); meta.appendChild(spanSvc);

  const time = document.createElement('div'); time.className = 'time'; time.textContent = `${formatDate(item.inicio)} - ${formatDate(item.fim)}`;

  const status = document.createElement('div'); status.className = 'status';
  status.textContent = 'Status: ';
  const statusStrong = document.createElement('strong'); statusStrong.textContent = item.status;
  status.appendChild(statusStrong);

  const actions = document.createElement('div'); actions.className = 'actions';
  if (item.status === 'solicitado'){
    const confirmBtn = document.createElement('button'); confirmBtn.className = 'btn-confirm'; confirmBtn.textContent = 'Confirmar';
    confirmBtn.addEventListener('click', async ()=>{
      try{
        confirmBtn.disabled = true; confirmBtn.textContent = 'Confirmando...';
        await confirmarAgendamento(obterUsuarioAtual().empresaId, item.id);
        showToast('Agendamento confirmado', 'success');
        // update UI
        statusStrong.textContent = 'confirmado';
        confirmBtn.remove();
        setTimeout(()=> window.location.reload(), 900);
      }catch(err){
        console.error('Erro confirmar', err);
        showToast(err.message || 'Erro ao confirmar', 'error');
        confirmBtn.disabled=false; confirmBtn.textContent='Confirmar';
      }
    });
    actions.appendChild(confirmBtn);
  }

  if (item.status !== 'cancelado'){
    const cancelBtn = document.createElement('button'); cancelBtn.className = 'btn-cancel'; cancelBtn.textContent = 'Cancelar';
    cancelBtn.addEventListener('click', async ()=>{
      if(!confirm('Confirmar cancelamento?')) return;
      try{
        cancelBtn.disabled = true; cancelBtn.textContent = 'Cancelando...';
        await cancelarAgendamento(obterUsuarioAtual().empresaId, item.id, 'Cancelado pelo profissional');
        window.location.reload();
      }catch(err){ alert(err.message || 'Erro ao cancelar'); cancelBtn.disabled=false; cancelBtn.textContent='Cancelar'; }
    });
    actions.appendChild(cancelBtn);
  }

  div.appendChild(meta); div.appendChild(time); div.appendChild(status); div.appendChild(actions);
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
  lista.textContent = '';
  try{
    const usuario = obterUsuarioAtual();
    if(!usuario || !usuario.empresaId){ window.location.href = '/login'; return; }

    const opts = {};
    if(dateStart.value && dateEnd.value){
      opts.start = new Date(dateStart.value).toISOString();
      opts.end = new Date(dateEnd.value).toISOString();
    }

    const ags = await listAgendamentosEmpresa(usuario.empresaId, opts);
    if(!ags.length){ const p = document.createElement('p'); p.className='text-secondary'; p.textContent='Nenhum agendamento encontrado'; lista.appendChild(p); return; }

    ags.forEach(a => {
      lista.appendChild(buildCard(a));
    });
  }catch(err){ console.error('Erro carregar agendamentos', err); lista.textContent = ''; const p = document.createElement('p'); p.className='error-message'; p.textContent='Erro ao carregar agendamentos'; lista.appendChild(p); }
}

btnFilter.addEventListener('click', async ()=>{ await carregarLista(); });

document.addEventListener('DOMContentLoaded', ()=>{ carregarLista(); });
