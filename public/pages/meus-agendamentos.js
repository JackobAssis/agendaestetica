/**
 * Meus Agendamentos Page
 * Client-side page to view and manage client's appointments
 * 
 * Features:
 * - List upcoming appointments
 * - View appointment details
 * - Request cancellation
 * - Request date change
 */

import { listAgendamentosCliente } from '../modules/agendamentos.js';
import { solicitarRemarcacao } from '../modules/agendamentos.js';
import { obterUsuarioAtual } from '../modules/auth.js';
import { generateSlotsForDate } from '../modules/agenda.js';

// DOM Elements
const listaFuturos = document.getElementById('lista-futuros');
const listaHistorico = document.getElementById('lista-historico');
const mensagem = document.getElementById('mensagem');
const modalDetalhes = document.getElementById('modal-detalhes');
const modalTroca = document.getElementById('modal-troca');

// State
let agendamentos = [];
let agendamentoSelecionado = null;

function showMsg(text, type = 'success') {
    mensagem.className = type === 'success' ? 'success-message' : 'error-message';
    mensagem.textContent = text;
    mensagem.classList.remove('hidden');
    setTimeout(() => mensagem.classList.add('hidden'), 5000);
}

function getStatusBadgeClass(status) {
    const classes = {
        'solicitado': 'badge-warning',
        'confirmado': 'badge-success',
        'cancelado': 'badge-error',
        'remarcado': 'badge-info',
        'concluido': 'badge-secondary'
    };
    return classes[status] || 'badge-secondary';
}

function formatDateTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('pt-BR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function createAgendamentoElement(agendamento) {
    const statusClass = getStatusBadgeClass(agendamento.status);
    const dataFormatted = formatDateTime(agendamento.inicio);

    const card = document.createElement('div');
    card.className = 'agendamento-card';
    card.dataset.id = agendamento.id;

    const header = document.createElement('div');
    header.className = 'agendamento-header';
    const badge = document.createElement('span');
    badge.className = `badge ${statusClass}`;
    badge.textContent = agendamento.status;
    const dateSpan = document.createElement('span');
    dateSpan.className = 'agendamento-data';
    dateSpan.textContent = dataFormatted;
    header.appendChild(badge);
    header.appendChild(dateSpan);

    const info = document.createElement('div');
    info.className = 'agendamento-info';
    const strong = document.createElement('strong');
    strong.textContent = agendamento.servico || 'Serviço';
    const p = document.createElement('p');
    p.className = 'text-secondary';
    p.textContent = agendamento.nomeCliente || 'Cliente';
    info.appendChild(strong);
    info.appendChild(p);

    const btn = document.createElement('button');
    btn.className = 'btn-details';
    btn.type = 'button';
    btn.textContent = 'Ver Detalhes';
    btn.addEventListener('click', () => window.mostrarDetalhes(agendamento.id));

    card.appendChild(header);
    card.appendChild(info);
    card.appendChild(btn);

    return card;
}

async function carregarAgendamentos() {
    const usuario = obterUsuarioAtual();
    if (!usuario) {
        window.location.href = '/login';
        return;
    }

    // show loading
    listaFuturos.textContent = '';
    const load = document.createElement('div'); load.className = 'loading'; load.textContent = 'Carregando...'; listaFuturos.appendChild(load);
    listaHistorico.textContent = '';

    try {
        agendamentos = await listAgendamentosCliente(usuario.uid);
        
        const agora = new Date();
        const futuros = agendamentos.filter(a => new Date(a.inicio) >= agora && a.status !== 'cancelado');
        const historico = agendamentos.filter(a => new Date(a.inicio) < agora || a.status === 'cancelado');

        // Render futuros
        listaFuturos.textContent = '';
        if (futuros.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'empty-state';
            const p = document.createElement('p');
            p.textContent = 'Você não tem agendamentos próximos.';
            const a = document.createElement('a');
            a.href = '/';
            a.className = 'btn-primary';
            a.textContent = 'Ver Profissionais';
            empty.appendChild(p);
            empty.appendChild(a);
            listaFuturos.appendChild(empty);
        } else {
            futuros.forEach(f => listaFuturos.appendChild(createAgendamentoElement(f)));
        }

        // Render histórico
        listaHistorico.textContent = '';
        if (historico.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'empty-state';
            const p = document.createElement('p');
            p.textContent = 'Nenhum histórico de agendamentos.';
            empty.appendChild(p);
            listaHistorico.appendChild(empty);
        } else {
            historico.forEach(h => listaHistorico.appendChild(createAgendamentoElement(h)));
        }

    } catch (error) {
        console.error('Erro ao carregar agendamentos:', error);
        listaFuturos.textContent = '';
        const err = document.createElement('div'); err.className = 'error-state'; err.textContent = 'Erro ao carregar agendamentos. Tente novamente.'; listaFuturos.appendChild(err);
    }
}

window.mostrarDetalhes = function(agendamentoId) {
    const agendamento = agendamentos.find(a => a.id === agendamentoId);
    if (!agendamento) return;

    agendamentoSelecionado = agendamento;
    
    const statusClass = getStatusBadgeClass(agendamento.status);
    const container = document.createElement('div');
    container.className = 'detalhes-grid';

    const makeItem = (labelText, contentEl) => {
        const item = document.createElement('div');
        item.className = 'detalhe-item';
        const label = document.createElement('label'); label.textContent = labelText;
        item.appendChild(label);
        item.appendChild(contentEl);
        return item;
    };

    const statusSpan = document.createElement('span'); statusSpan.className = `badge ${statusClass}`; statusSpan.textContent = agendamento.status;
    container.appendChild(makeItem('Status', statusSpan));

    const dataSpan = document.createElement('span'); dataSpan.textContent = formatDateTime(agendamento.inicio);
    container.appendChild(makeItem('Data e Hora', dataSpan));

    const servSpan = document.createElement('span'); servSpan.textContent = agendamento.servico || 'Não especificado';
    container.appendChild(makeItem('Serviço', servSpan));

    const clienteSpan = document.createElement('span'); clienteSpan.textContent = agendamento.nomeCliente || '';
    container.appendChild(makeItem('Cliente', clienteSpan));

    if (agendamento.telefone) {
        const telSpan = document.createElement('span'); telSpan.textContent = agendamento.telefone;
        container.appendChild(makeItem('Telefone', telSpan));
    }

    if (agendamento.notas) {
        const notasItem = document.createElement('div'); notasItem.className = 'detalhe-item full-width';
        const label = document.createElement('label'); label.textContent = 'Observações';
        const spanNotas = document.createElement('span'); spanNotas.textContent = agendamento.notas;
        notasItem.appendChild(label); notasItem.appendChild(spanNotas);
        container.appendChild(notasItem);
    }

    const detalheConteudo = document.getElementById('detalhes-conteudo');
    detalheConteudo.textContent = '';
    detalheConteudo.appendChild(container);
    modalDetalhes.classList.remove('hidden');

    // Mostrar/esconder botões baseado no status
    const btnCancelar = document.getElementById('btn-cancelar');
    const btnTroca = document.getElementById('btn-solicitar-troca');

    if (agendamento.status === 'confirmado' || agendamento.status === 'solicitado') {
        btnCancelar.style.display = 'inline-block';
        btnTroca.style.display = 'inline-block';
    } else {
        btnCancelar.style.display = 'none';
        btnTroca.style.display = 'none';
    }
};

function fecharModalDetalhes() {
    modalDetalhes.classList.add('hidden');
    agendamentoSelecionado = null;
}

function abrirModalTroca() {
    if (!agendamentoSelecionado) return;
    
    const dataOriginal = new Date(agendamentoSelecionado.inicio);
    document.getElementById('troca-atual').textContent = formatDateTime(agendamentoSelecionado.inicio);
    
    // Set min date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('troca-data').min = tomorrow.toISOString().split('T')[0];
    document.getElementById('troca-data').value = '';
    const trocaHoraEl = document.getElementById('troca-hora');
    trocaHoraEl.textContent = '';
    const optDefault = document.createElement('option'); optDefault.value = ''; optDefault.textContent = 'Selecione uma data primeiro'; trocaHoraEl.appendChild(optDefault);
    document.getElementById('troca-motivo').value = '';

    modalDetalhes.classList.add('hidden');
    modalTroca.classList.remove('hidden');
}

function fecharModalTroca() {
    modalTroca.classList.add('hidden');
}

async function carregarSlotsTroca() {
    const data = document.getElementById('troca-data').value;
    const horaSelect = document.getElementById('troca-hora');
    
    if (!data) {
        horaSelect.textContent = '';
        const opt = document.createElement('option'); opt.value = ''; opt.textContent = 'Selecione uma data primeiro'; horaSelect.appendChild(opt);
        return;
    }

    const usuario = obterUsuarioAtual();
    if (!usuario || !usuario.empresaId) {
        showMsg('Erro ao identificar empresa', 'error');
        return;
    }

    try {
        const slots = await generateSlotsForDate(usuario.empresaId, data);
        
        if (slots.length === 0) {
            horaSelect.textContent = '';
            const optNone = document.createElement('option'); optNone.value = ''; optNone.textContent = 'Nenhum horário disponível'; horaSelect.appendChild(optNone);
            return;
        }

        horaSelect.textContent = '';
        slots.forEach(slot => {
            const opt = document.createElement('option'); opt.value = slot.inicioISO; opt.textContent = new Date(slot.inicioISO).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); horaSelect.appendChild(opt);
        });
        
        } catch (error) {
        console.error('Erro ao carregar slots:', error);
        horaSelect.textContent = '';
        const optErr = document.createElement('option'); optErr.value = ''; optErr.textContent = 'Erro ao carregar horários'; horaSelect.appendChild(optErr);
    }
}

async function enviarSolicitacaoTroca() {
    if (!agendamentoSelecionado) return;

    const usuario = obterUsuarioAtual();
    if (!usuario || !usuario.empresaId) {
        showMsg('Erro ao identificar empresa', 'error');
        return;
    }

    const novoInicio = document.getElementById('troca-hora').value;
    const motivo = document.getElementById('troca-motivo').value.trim();

    if (!novoInicio) {
        showMsg('Selecione um novo horário', 'error');
        return;
    }

    // Calcular fim baseado na duração original
    const duracao = new Date(agendamentoSelecionado.fim) - new Date(agendamentoSelecionado.inicio);
    const novoFim = new Date(new Date(novoInicio).getTime() + duracao).toISOString();

    try {
        await solicitarRemarcacao(
            usuario.empresaId,
            agendamentoSelecionado.id,
            novoInicio,
            novoFim,
            motivo
        );

        showMsg('Solicitação de troca enviada com sucesso!', 'success');
        fecharModalTroca();
        carregarAgendamentos();
    } catch (error) {
        console.error('Erro ao solicitar troca:', error);
        showMsg(error.message || 'Erro ao solicitar troca', 'error');
    }
}

function solicitarCancelamento() {
    if (!agendamentoSelecionado) return;
    
    const confirmacao = confirm('Tem certeza que deseja cancelar este agendamento?\n\nEsta ação não pode ser desfeita.');
    
    if (confirmacao) {
        // TODO: Implementar função de cancelamento para cliente
        showMsg('Funcionalidade em desenvolvimento', 'error');
    }
}

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const tab = btn.dataset.tab;
        document.getElementById('agendamentos-futuros').classList.toggle('hidden', tab !== 'futuros');
        document.getElementById('agendamentos-historico').classList.toggle('hidden', tab !== 'historico');
    });
});

// Modal events
document.getElementById('fechar-modal').addEventListener('click', fecharModalDetalhes);
document.getElementById('fechar-modal-troca').addEventListener('click', fecharModalTroca);
document.getElementById('btn-cancelar').addEventListener('click', solicitarCancelamento);
document.getElementById('btn-solicitar-troca').addEventListener('click', abrirModalTroca);
document.getElementById('btn-enviar-troca').addEventListener('click', enviarSolicitacaoTroca);
document.getElementById('troca-data').addEventListener('change', carregarSlotsTroca);

// Close modals on outside click
modalDetalhes.addEventListener('click', (e) => {
    if (e.target === modalDetalhes) fecharModalDetalhes();
});
modalTroca.addEventListener('click', (e) => {
    if (e.target === modalTroca) fecharModalTroca();
});

// Initialize
document.addEventListener('DOMContentLoaded', carregarAgendamentos);

