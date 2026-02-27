/**
 * Agendar Cliente Page - Firebase v9+ Modular SDK
 */

import { generateSlotsForDate } from '../modules/agenda.js';
import { solicitarAgendamento } from '../modules/agendamentos.js';
import { notifyInApp, sendWebhook } from '../modules/notifications.js';
import { findOrCreateClienteByEmail } from '../modules/clientes.js';

// ============================================================
// Firebase v9+ Modular SDK Imports
// ============================================================

import { 
    getFirestore, 
    doc, 
    getDoc 
} from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js';

// ============================================================
// Firebase Instance Factory
// ============================================================

/**
 * Obter instância do Firestore - USA a instância global do index.html
 */
function getFirebaseDB() {
    if (typeof window !== 'undefined' && window.firebaseApp) {
        return getFirestore(window.firebaseApp);
    }
    throw new Error('Firebase Firestore não inicializado. Verifique index.html');
}

// ============================================================
// Agendar Cliente Functions
// ============================================================

// Extract profissionalId from path /agendar/:profissionalId
function getProfissionalIdFromPath() {
    const parts = window.location.pathname.split('/').filter(Boolean);
    return parts[1] || null; // ['', 'agendar', ':id'] -> index 1 is id
}

const profissionalId = getProfissionalIdFromPath();
const profNomeEl = document.getElementById('profissional-nome');
const profInfoEl = document.getElementById('profissional-info');
const servicoSelect = document.getElementById('servico-select');

let services = []; // will hold array of objects or strings
const dateSelect = document.getElementById('date-select');
const btnGerar = document.getElementById('btn-gerar-slots');
const slotsList = document.getElementById('slots-list');
const nomeInput = document.getElementById('cliente-nome');
const emailInput = document.getElementById('cliente-email');
const telInput = document.getElementById('cliente-telefone');
const msg = document.getElementById('agendar-mensagem');

function showMsg(text, type = 'success') {
    msg.className = type === 'success' ? 'success-message' : 'error-message';
    msg.textContent = text;
    msg.classList.remove('hidden');
}

function clearMsg() {
    msg.classList.add('hidden');
}

async function carregarProfissional() {
    try {
        if (!profissionalId) throw new Error('ID do profissional não encontrado na URL');
        
        const db = getFirebaseDB();
        const docRef = doc(db, 'empresas', profissionalId);
        const snap = await getDoc(docRef);
        
        if (!snap.exists()) throw new Error('Profissional não encontrado');
        
        const data = snap.data();

        profNomeEl.textContent = data.nome || 'Profissional';
        profInfoEl.textContent = `Profissão: ${data.profissao || '—'} • Plano: ${data.plano || 'free'}`;

        // Populate services
        services = data.servicos || [];
        servicoSelect.textContent = '';
        
        if (services.length === 0) {
            const opt = document.createElement('option');
            opt.value = '';
            opt.textContent = 'Nenhum serviço cadastrado';
            servicoSelect.appendChild(opt);
        } else {
            services.forEach(s => {
                const opt = document.createElement('option');
                const nome = s.nome || s;
                opt.value = nome;
                let label = nome;
                if (s.preco != null) label += ` - R$${s.preco}`;
                if (s.duracao != null) label += ` - ${s.duracao}min`;
                opt.textContent = label;
                servicoSelect.appendChild(opt);
            });
        }
    } catch (err) {
        console.error('Erro carregar profissional', err);
        profNomeEl.textContent = 'Profissional não encontrado';
        profInfoEl.textContent = '';
    }
}

async function gerarSlots() {
    clearMsg();
    slotsList.textContent = '';
    btnGerar.disabled = true;
    btnGerar.textContent = 'Gerando...';
    
    const date = dateSelect.value;
    if (!date) {
        showMsg('Selecione uma data', 'error');
        btnGerar.disabled = false;
        btnGerar.textContent = 'Gerar slots';
        return;
    }
    
    try {
        const slots = await generateSlotsForDate(profissionalId, date);
        
        if (!slots.length) {
            const p = document.createElement('p'); p.className='text-secondary'; p.textContent='Nenhum slot disponível'; slotsList.appendChild(p); 
            btnGerar.disabled = false; btnGerar.textContent = 'Gerar slots';
            return;
        }

        slots.forEach(s => {
            const btn = document.createElement('button');
            btn.className = 'slot-btn';
            const dtStart = new Date(s.inicioISO);
            const dtEnd = new Date(s.fimISO);
            btn.textContent = `${dtStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${dtEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            btn.addEventListener('click', () => solicitarSlot(s));
            slotsList.appendChild(btn);
        });
    } catch (err) {
        console.error('Erro gerar slots', err);
        showMsg(err.message || 'Erro ao gerar slots', 'error');
    } finally {
        btnGerar.disabled = false;
        btnGerar.textContent = 'Gerar slots';
    }
}

async function solicitarSlot(slot) {
    clearMsg();
    
    const nome = nomeInput.value.trim();
    const email = emailInput.value.trim();
    const tel = telInput.value.trim();
    const servicoNome = servicoSelect.value;

    if (!nome || !email) {
        showMsg('Nome e email são obrigatórios', 'error');
        return;
    }

    const btn = document.querySelector('button[disabled]');
    const originalText = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = 'Processando...'; }

    try {
        // Ensure cliente exists and get clienteId - prefer Cloud Function if configured
        let cliente = null;
        
        try {
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
                try {
                    cliente = await findOrCreateClienteByEmail(profissionalId, email, nome, tel);
                } catch (e) {
                    console.warn('findOrCreateCliente failed', e);
                }
            }
        } catch (e) {
            console.warn('createCliente flow failed', e);
        }

        const selServico = services.find(s => (s.nome || s) === servicoNome) || { nome: servicoNome };
        const payload = { 
            inicioISO: slot.inicioISO, 
            fimISO: slot.fimISO, 
            nomeCliente: nome, 
            telefone: tel, 
            servico: selServico.nome || selServico,
            servicoPreco: selServico.preco,
            servicoDuracao: selServico.duracao,
            clienteUid: cliente ? cliente.id : null 
        };
        
        const res = await solicitarAgendamento(profissionalId, payload);

        // Notify profissional (in-app)
        await notifyProfissionalOnNewRequest(profissionalId, res);

        showMsg('Solicitação enviada! Aguarde confirmação.', 'success');
    } catch (err) {
        console.error('Erro solicitar agendamento', err);
        showMsg(err.message || 'Erro ao solicitar agendamento', 'error');
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = originalText; }
    }
}

async function notifyProfissionalOnNewRequest(empresaId, agendamento) {
    // In-app notification
    await notifyInApp({
        targetEmpresaId: empresaId,
        title: 'Novo pedido de agendamento',
        body: `Pedido para ${agendamento.servico || 'serviço'} em ${new Date(agendamento.inicioISO).toLocaleString()}`
    });

    // Webhook placeholder (if empresa tem webhook configurado)
    try {
        const db = getFirebaseDB();
        const docRef = doc(db, 'empresas', empresaId);
        const snap = await getDoc(docRef);
        const data = snap.data();
        
        if (data && data.webhookUrl) {
            await sendWebhook(data.webhookUrl, { event: 'novo_agendamento', agendamento });
        }
    } catch (e) {
        console.warn('Webhook falhou', e);
    }
}

// Events
if (btnGerar) {
    btnGerar.addEventListener('click', gerarSlots);
}
document.addEventListener('DOMContentLoaded', carregarProfissional);

