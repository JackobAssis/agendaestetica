/**
 * Solicitações de Troca Page
 * Professional-side page to manage swap/change requests
 */

import { listAgendamentosEmpresa } from '../modules/agendamentos.js';
import { aceitarRemarcacao, rejeitarRemarcacao } from '../modules/agendamentos.js';
import { obterUsuarioAtual } from '../modules/auth.js';

// DOM Elements
const listaSolicitacoes = document.getElementById('lista-solicitacoes');
const mensagem = document.getElementById('mensagem');
const modalDetalhes = document.getElementById('modal-detalhes');

// State
let solicitacoes = [];
let solicitacaoSelecionada = null;
let filtroAtual = 'pendentes';

function showMsg(text, type = 'success') {
    mensagem.className = type === 'success' ? 'success-message' : 'error-message';
    mensagem.textContent = text;
    mensagem.classList.remove('hidden');
    setTimeout(() => mensagem.classList.add('hidden'), 5000);
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

function getStatusBadgeClass(status) {
    const classes = {
        'pendente': 'badge-warning',
        'aceita': 'badge-success',
        'rejeitada': 'badge-error'
    };
    return classes[status] || 'badge-secondary';
}

async function carregarSolicitacoes() {
    const usuario = obterUsuarioAtual();
    if (!usuario || !usuario.empresaId) {
        window.location.href = '/login';
        return;
    }

    listaSolicitacoes.innerHTML = '<div class="loading">Carregando solicitações...</div>';

    try {
        // Carregar todos os agendamentos
        const agendamentos = await listAgendamentosEmpresa(usuario.empresaId);
        
        // Filtrar agendamentos com pedidos de troca
        solicitacoes = agendamentos.filter(a => a.temPedidoRemarcacao);

        renderSolicitacoes();
    } catch (error) {
        console.error('Erro ao carregar solicitações:', error);
        listaSolicitacoes.innerHTML = '<div class="error-state">Erro ao carregar solicitações. Tente novamente.</div>';
    }
}

function renderSolicitacoes() {
    const filtradas = filtroAtual === 'pendentes' 
        ? solicitacoes.filter(s => s.status !== 'cancelado')
        : solicitacoes;

    if (filtradas.length === 0) {
        listaSolicitacoes.innerHTML = `
            <div class="empty-state">
                <p>${filtroAtual === 'pendentes' 
                    ? 'Não há solicitações de troca pendentes.' 
                    : 'Nenhuma solicitação encontrada.'}</p>
            </div>
        `;
        return;
    }

    // Para cada agendamento com troca, precisamos buscar as sub-coleções
    // Isso é uma simplificação - em produção usaria Cloud Function
    listaSolicitacoes.innerHTML = filtradas.map(agendamento => `
        <div class="solicitacao-card" data-id="${agendamento.id}">
            <div class="solicitacao-header">
                <span class="badge badge-warning">Troca Pendente</span>
                <span class="solicitacao-data">${formatDateTime(agendamento.inicio)}</span>
            </div>
            <div class="solicitacao-info">
                <strong>${agendamento.nomeCliente || 'Cliente'}</strong>
                <p class="text-secondary">${agendamento.servico || 'Serviço'}</p>
                <p class="text-secondary">Agendamento: ${formatDateTime(agendamento.inicio)}</p>
            </div>
            <button class="btn-details" onclick="window.mostrarDetalhes('${agendamento.id}')">Ver Detalhes</button>
        </div>
    `).join('');
}

// Simplificado: mostrar detalhes sem sub-coleção
window.mostrarDetalhes = function(agendamentoId) {
    const agendamento = solicitacoes.find(a => a.id === agendamentoId);
    if (!agendamento) return;

    solicitacaoSelecionada = agendamento;

    const conteudo = `
        <div class="detalhes-grid">
            <div class="detalhe-item">
                <label>Cliente</label>
                <span>${agendamento.nomeCliente || 'Não especificado'}</span>
            </div>
            <div class="detalhe-item">
                <label>Telefone</label>
                <span>${agendamento.telefone || 'Não informado'}</span>
            </div>
            <div class="detalhe-item">
                <label>Data/Hora Atual</label>
                <span>${formatDateTime(agendamento.inicio)}</span>
            </div>
            <div class="detalhe-item">
                <label>Serviço</label>
                <span>${agendamento.servico || 'Não especificado'}</span>
            </div>
            ${agendamento.notas ? `
            <div class="detalhe-item full-width">
                <label>Observações do Cliente</label>
                <span>${agendamento.notas}</span>
            </div>
            ` : ''}
        </div>
        <p class="text-info">
            <strong>Nota:</strong> Para ver os detalhes da troca (nova data/hora), 
            é necessário implementar a busca na sub-coleção 'remarcacoes'.
        </p>
    `;

    document.getElementById('detalhes-conteudo').innerHTML = conteudo;
    
    document.getElementById('modal-actions').innerHTML = `
        <button class="btn-secondary" onclick="window.rejeitarSolicitacao('${agendamento.id}')">Rejeitar</button>
        <button class="btn-primary" onclick="window.aceitarSolicitacao('${agendamento.id}')">Aceitar</button>
    `;

    modalDetalhes.classList.remove('hidden');
};

function fecharModal() {
    modalDetalhes.classList.add('hidden');
    solicitacaoSelecionada = null;
}

window.aceitarSolicitacao = async function(agendamentoId) {
    const usuario = obterUsuarioAtual();
    if (!usuario || !usuario.empresaId) {
        showMsg('Erro ao identificar empresa', 'error');
        return;
    }

    try {
        // Em produção, isso buscaria o ID da remarcacao da sub-coleção
        // Por enquanto, precisamos implementar de forma diferente
        showMsg('Para aceitar uma troca, é necessário implementar a integração completa com a sub-coleção de remarcacões.', 'error');
        
        // implementação completa exigiria:
        // 1. Buscar remarcacoes do agendamento
        // 2. Encontrar a pendente
        // 3. Chamar aceitarRemarcacao(empresaId, agendamentoId, remarcacaoId)
        
        /* Exemplo de implementação futura:
        const remarcacao = await buscarRemarcacaoPendente(usuario.empresaId, agendamentoId);
        if (remarcacao) {
            await aceitarRemarcacao(usuario.empresaId, agendamentoId, remarcacao.id);
            showMsg('Troca aceita com sucesso!', 'success');
            fecharModal();
            carregarSolicitacoes();
        }
        */
        
        fecharModal();
    } catch (error) {
        console.error('Erro ao aceitar solicitação:', error);
        showMsg(error.message || 'Erro ao aceitar solicitação', 'error');
    }
};

window.rejeitarSolicitacao = async function(agendamentoId) {
    const usuario = obterUsuarioAtual();
    if (!usuario || !usuario.empresaId) {
        showMsg('Erro ao identificar empresa', 'error');
        return;
    }

    const motivo = prompt('Motivo da rejeição (opcional):');

    try {
        showMsg('Para rejeitar uma troca, é necessário implementar a integração completa com a sub-coleção de remarcacões.', 'error');
        /* Exemplo de implementação futura:
        const remarcacao = await buscarRemarcacaoPendente(usuario.empresaId, agendamentoId);
        if (remarcacao) {
            await rejeitarRemarcacao(usuario.empresaId, agendamentoId, remarcacao.id, motivo);
            showMsg('Solicitação rejeitada.', 'success');
            fecharModal();
            carregarSolicitacoes();
        }
        */
        
        fecharModal();
    } catch (error) {
        console.error('Erro ao rejeitar solicitação:', error);
        showMsg(error.message || 'Erro ao rejeitar solicitação', 'error');
    }
};

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filtroAtual = btn.dataset.filter;
        renderSolicitacoes();
    });
});

// Modal events
document.getElementById('fechar-modal').addEventListener('click', fecharModal);
modalDetalhes.addEventListener('click', (e) => {
    if (e.target === modalDetalhes) fecharModal();
});

// Initialize
document.addEventListener('DOMContentLoaded', carregarSolicitacoes);

