import { obterUsuarioAtual } from '../modules/auth.js';
import { listAgendamentosEmpresa, confirmarAgendamento, cancelarAgendamento } from '../modules/agendamentos.js';

const lista = document.getElementById('lista-agendamentos');
const btnFilter = document.getElementById('btn-filter');
const dateStart = document.getElementById('filter-date-start');
const dateEnd = document.getElementById('filter-date-end');
const countBadge = document.querySelector('.count-badge');

function formatDate(iso) {
  const d = new Date(iso);
  return `${d.toLocaleDateString('pt-BR')} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

function buildCard(item) {
  const status = (item.status || 'pendente').toLowerCase();
  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
  const div = document.createElement('article');
  div.className = 'agendamento-item';
  div.innerHTML = `
    <div class="meta">
      <strong>${item.nomeCliente || item.clienteUid || 'Cliente'}</strong>
      <span class="text-secondary">${item.servico || 'Serviço não informado'}</span>
      <span class="text-secondary">${item.local || item.sala || 'Atendimento presencial'}</span>
    </div>
    <div class="time">${formatDate(item.inicio)} · ${formatDate(item.fim)}</div>
    <div>
      <span class="status-badge status-${status}">${statusLabel}</span>
    </div>
    <div class="actions">
      ${status === 'solicitado' ? '<button class="btn-confirm">Confirmar</button>' : ''}
      ${status !== 'cancelado' ? '<button class="btn-cancel">Cancelar</button>' : ''}
    </div>
  `;

  const confirmBtn = div.querySelector('.btn-confirm');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', async () => {
      confirmBtn.disabled = true;
      confirmBtn.textContent = 'Confirmando...';
      try {
        await confirmarAgendamento(obterUsuarioAtual().empresaId, item.id);
        showToast('Agendamento confirmado', 'success');
        confirmBtn.remove();
        const badge = div.querySelector('.status-badge');
        if (badge) {
          badge.textContent = 'Confirmado';
          badge.className = 'status-badge status-confirmado';
        }
      } catch (err) {
        console.error('Erro confirmar', err);
        showToast(err.message || 'Erro ao confirmar', 'error');
        confirmBtn.disabled = false;
        confirmBtn.textContent = 'Confirmar';
      }
    });
  }

  const cancelBtn = div.querySelector('.btn-cancel');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', async () => {
      if (!confirm('Confirmar cancelamento?')) return;
      cancelBtn.disabled = true;
      cancelBtn.textContent = 'Cancelando...';
      try {
        await cancelarAgendamento(obterUsuarioAtual().empresaId, item.id, 'Cancelado pelo profissional');
        window.location.reload();
      } catch (err) {
        alert(err.message || 'Erro ao cancelar');
        cancelBtn.disabled = false;
        cancelBtn.textContent = 'Cancelar';
      }
    });
  }

  return div;
}

function showToast(text, type = 'info') {
  let t = document.getElementById('global-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'global-toast';
    t.style.position = 'fixed';
    t.style.right = '16px';
    t.style.bottom = '16px';
    t.style.padding = '12px 16px';
    t.style.borderRadius = '12px';
    t.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)';
    t.style.zIndex = 9999;
    document.body.appendChild(t);
  }
  t.textContent = text;
  t.style.background = type === 'success' ? '#e6ffed' : type === 'error' ? '#ffe6e6' : '#eef2ff';
  t.style.color = '#111';
  t.style.display = 'block';
  setTimeout(() => {
    t.style.display = 'none';
  }, 3000);
}

async function carregarLista() {
  lista.innerHTML = '';
  try {
    const usuario = obterUsuarioAtual();
    if (!usuario || !usuario.empresaId) {
      window.location.href = '/login';
      return;
    }

    const opts = {};
    if (dateStart.value && dateEnd.value) {
      opts.start = new Date(dateStart.value).toISOString();
      opts.end = new Date(dateEnd.value).toISOString();
    }

    const ags = await listAgendamentosEmpresa(usuario.empresaId, opts);
    countBadge.textContent = `${ags.length} item${ags.length === 1 ? '' : 's'}`;

    if (!ags.length) {
      lista.innerHTML = '<div class="empty-state">Nenhum agendamento encontrado para esse período.</div>';
      return;
    }

    ags.forEach((a) => {
      lista.appendChild(buildCard(a));
    });
  } catch (err) {
    console.error('Erro carregar agendamentos', err);
    lista.innerHTML = '<div class="empty-state">Erro ao carregar os agendamentos.</div>';
  }
}

btnFilter.addEventListener('click', async () => {
  await carregarLista();
});

document.addEventListener('DOMContentLoaded', () => {
  carregarLista();
});
