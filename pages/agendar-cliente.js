import { generateSlotsForDate } from '../modules/agenda.js';
import { solicitarAgendamento } from '../modules/agendamentos.js';
import { notifyInApp, sendWebhook } from '../modules/notifications.js';
import { findOrCreateClienteByEmail } from '../modules/clientes.js';

// Extract profissionalId from path /agendar/:profissionalId
function getProfissionalIdFromPath(){
  const parts = window.location.pathname.split('/').filter(Boolean);
  return parts[1] || null; // ['', 'agendar', ':id'] -> index 1 is id? actually parts[0] = 'agendar', parts[1] = id
}

const profissionalId = getProfissionalIdFromPath();
const profNomeEl = document.getElementById('profissional-nome');
const profInfoEl = document.getElementById('profissional-info');
const servicoSelect = document.getElementById('servico-select');
const dateSelect = document.getElementById('date-select');
const btnGerar = document.getElementById('btn-gerar-slots');
const slotsList = document.getElementById('slots-list');
const nomeInput = document.getElementById('cliente-nome');
const emailInput = document.getElementById('cliente-email');
const telInput = document.getElementById('cliente-telefone');
const msg = document.getElementById('agendar-mensagem');

function showMsg(text, type='success'){
  msg.className = type === 'success' ? 'success-message' : 'error-message';
  msg.textContent = text;
  msg.classList.remove('hidden');
}
function clearMsg(){ msg.classList.add('hidden'); }

async function carregarProfissional(){
  try{
    if(!profissionalId) throw new Error('ID do profissional não encontrado na URL');
    const db = window.firebase.db;
    const empresaDoc = await db.collection('empresas').doc(profissionalId).get();
    if(!empresaDoc.exists()) throw new Error('Profissional não encontrado');
    const data = empresaDoc.data();

    profNomeEl.textContent = data.nome || 'Profissional';
    profInfoEl.textContent = `Profissão: ${data.profissao || '—'} • Plano: ${data.plano || 'free'}`;

    // Populate services
    const services = data.servicos || [];
    servicoSelect.innerHTML = '';
    if(services.length === 0){
      const opt = document.createElement('option'); opt.value=''; opt.textContent='Nenhum serviço cadastrado'; servicoSelect.appendChild(opt);
    } else {
      services.forEach(s=>{ const opt = document.createElement('option'); opt.value = s; opt.textContent = s; servicoSelect.appendChild(opt); });
    }
  }catch(err){
    console.error('Erro carregar profissional', err);
    profNomeEl.textContent = 'Profissional não encontrado';
    profInfoEl.textContent = '';
  }
}

async function gerarSlots(){
  clearMsg(); slotsList.innerHTML = '';
  const date = dateSelect.value;
  if(!date){ showMsg('Selecione uma data', 'error'); return; }
  try{
    const slots = await generateSlotsForDate(profissionalId, date);
    if(!slots.length){ slotsList.innerHTML = '<p class="text-secondary">Nenhum slot disponível</p>'; return; }

    slots.forEach(s => {
      const btn = document.createElement('button');
      btn.className = 'slot-btn';
      const dtStart = new Date(s.inicioISO);
      const dtEnd = new Date(s.fimISO);
      btn.textContent = `${dtStart.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - ${dtEnd.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`;
      btn.addEventListener('click', ()=> solicitarSlot(s));
      slotsList.appendChild(btn);
    });
  }catch(err){ console.error('Erro gerar slots', err); showMsg(err.message || 'Erro ao gerar slots', 'error'); }
}

async function solicitarSlot(slot){
  clearMsg();
  const nome = nomeInput.value.trim();
  const email = emailInput.value.trim();
  const tel = telInput.value.trim();
  const servico = servicoSelect.value;

  if(!nome || !email){ showMsg('Nome e email são obrigatórios', 'error'); return; }

  try{
    // Ensure cliente exists and get clienteId - prefer Cloud Function if configured
    let cliente = null;
    try{
      const createClienteUrl = window.APP_CONFIG && window.APP_CONFIG.createClienteFunctionUrl;
      if (createClienteUrl) {
        const resp = await fetch(createClienteUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ empresaId: profissionalId, nome, email, telefone: tel })
        });
        const body = await resp.json();
        if (!resp.ok) throw new Error(body.error || 'Erro ao criar cliente via função');
        cliente = body.cliente || body;
      } else {
        // fallback to client-side creation (uses Firestore rules / SDK)
        try{ cliente = await findOrCreateClienteByEmail(profissionalId, email, nome, tel); }catch(e){ console.warn('findOrCreateCliente failed', e); }
      }
    }catch(e){ console.warn('createCliente flow failed', e); }

    const payload = { inicioISO: slot.inicioISO, fimISO: slot.fimISO, nomeCliente: nome, telefone: tel, servico, clienteUid: cliente ? cliente.id : null };
    const res = await solicitarAgendamento(profissionalId, payload);

    // Notify profissional (in-app)
    await notifyProfissionalOnNewRequest(profissionalId, res);

    showMsg('Solicitação enviada! Aguarde confirmação.', 'success');
  }catch(err){ console.error('Erro solicitar agendamento', err); showMsg(err.message || 'Erro ao solicitar agendamento', 'error'); }
}

async function notifyProfissionalOnNewRequest(empresaId, agendamento){
  // In-app notification
  await notifyInApp({
    targetEmpresaId: empresaId,
    title: 'Novo pedido de agendamento',
    body: `Pedido para ${agendamento.servico || 'serviço'} em ${new Date(agendamento.inicioISO).toLocaleString()}`
  });

  // Webhook placeholder (if empresa tem webhook configurado)
  try{
    const db = window.firebase.db;
    const empresaDoc = await db.collection('empresas').doc(empresaId).get();
    const data = empresaDoc.data();
    if(data && data.webhookUrl){
      await sendWebhook(data.webhookUrl, { event: 'novo_agendamento', agendamento });
    }
  }catch(e){ console.warn('Webhook falhou', e); }
}

// Events
btnGerar.addEventListener('click', gerarSlots);
document.addEventListener('DOMContentLoaded', carregarProfissional);
