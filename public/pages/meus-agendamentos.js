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

function renderAgendamento(agendamento) {
    const statusClass = getStatusBadgeClass(agendamento.status);
    const dataFormatted = formatDateTime(agendamento.inicio);
    
    return `
        <div class="agendamento-card" data-id="${agendamento.id}">
            <div class="agendamento-header">
                <span class="badge ${statusClass}">${agendamento.status}</span>
                <span class="agendamento-data">${dataFormatted}</span>
            </div>
            <div class="agendamento-info">
                <strong>${agendamento.servico || 'Serviço'}</strong>
                <p class="text-secondary">${agendamento.nomeCliente || 'Cliente'}</p>
            </div>
            <button class="btn-details" onclick="window.mostrarDetalhes('${agendamento.id}')">Ver Detalhes</button>
        </div>
    `;
}

async function carregarAgendamentos() {
    const usuario = obterUsuarioAtual();
    if (!usuario) {
        window.location.href = '/login';
        return;
    }

    listaFuturos.innerHTML = '<div class="loading">Carregando...</div>';
    listaHistorico.innerHTML = '';

    try {
        agendamentos = await listAgendamentosCliente(usuario.uid);
        
        const agora = new Date();
        const futuros = agendamentos.filter(a => new Date(a.inicio) >= agora && a.status !== 'cancelado');
        const historico = agendamentos.filter(a => new Date(a.inicio) < agora || a.status === 'cancelado');

        // Render futuros
        if (futuros.length === 0) {
            listaFuturos.innerHTML = '<div class="empty-state"><p>Você não tem agendamentos próximos.</p><a href="/" class="btn-primary">Ver Profissionais</a></div>';
        } else {
            listaFuturos.innerHTML = futuros.map(renderAgendamento).join('');
        }

        // Render histórico
        if (historico.length === 0) {
            listaHistorico.innerHTML = '<div class="empty-state"><p>Nenhum histórico de agendamentos.</p></div>';
        } else {
            listaHistorico.innerHTML = historico.map(renderAgendamento).join('');
        }

    } catch (error) {
        console.error('Erro ao carregar agendamentos:', error);
        listaFuturos.innerHTML = '<div class="error-state">Erro ao carregar agendamentos. Tente novamente.</div>';
    }
}

window.mostrarDetalhes = function(agendamentoId) {
    const agendamento = agendamentos.find(a => a.id === agendamentoId);
    if (!agendamento) return;

    agendamentoSelecionado = agendamento;
    
    const statusClass = getStatusBadgeClass(agendamento.status);
    const conteudo = `
        <div class="detalhes-grid">
            <div class="detalhe-item">
                <label>Status</label>
                <span class="badge ${statusClass}">${agendamento.status}</span>
            </div>
            <div class="detalhe-item">
                <label>Data e Hora</label>
                <span>${formatDateTime(agendamento.inicio)}</span>
            </div>
            <div class="detalhe-item">
                <label>Serviço</label>
                <span>${agendamento.servico || 'Não especificado'}</span>
            </div>
            <div class="detalhe-item">
                <label>Cliente</label>
                <span>${agendamento.nomeCliente}</span>
            </div>
            ${agendamento.telefone ? `
            <div class="detalhe-item">
                <label>Telefone</label>
                <span>${agendamento.telefone}</span>
            </div>
            ` : ''}
            ${agendamento.notas ? `
            <div class="detalhe-item full-width">
                <label>Observações</label>
                <span>${agendamento.notas}</span>
            </div>
            ` : ''}
        </div>
    `;

    document.getElementById('detalhes-conteudo').innerHTML = conteudo;
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
    document.getElementById('troca-hora').innerHTML = '<option value="">Selecione uma data primeiro</option>';
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
        horaSelect.innerHTML = '<option value="">Selecione uma data primeiro</option>';
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
            horaSelect.innerHTML = '<option value="">Nenhum horário disponível</option>';
            return;
        }

        horaSelect.innerHTML = slots.map(slot => {
            const dt = new Date(slot.inicioISO);
            const hora = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return `<option value="${slot.inicioISO}">${hora}</option>`;
        }).join('');
        
    } catch (error) {
        console.error('Erro ao carregar slots:', error);
        horaSelect.innerHTML = '<option value="">Erro ao carregar horários</option>';
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

