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

    // show loading
    listaSolicitacoes.textContent = '';
    const loadingEl = document.createElement('div');
    loadingEl.className = 'loading';
    loadingEl.textContent = 'Carregando solicitações...';
    listaSolicitacoes.appendChild(loadingEl);

    try {
        // Carregar todos os agendamentos
        const agendamentos = await listAgendamentosEmpresa(usuario.empresaId);
        
        // Filtrar agendamentos com pedidos de troca
        solicitacoes = agendamentos.filter(a => a.temPedidoRemarcacao);

        renderSolicitacoes();
    } catch (error) {
        console.error('Erro ao carregar solicitações:', error);
        listaSolicitacoes.textContent = '';
        const err = document.createElement('div');
        err.className = 'error-state';
        err.textContent = 'Erro ao carregar solicitações. Tente novamente.';
        listaSolicitacoes.appendChild(err);
    }
}

function renderSolicitacoes() {
    const filtradas = filtroAtual === 'pendentes' 
        ? solicitacoes.filter(s => s.status !== 'cancelado')
        : solicitacoes;

    if (filtradas.length === 0) {
        listaSolicitacoes.textContent = '';
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        const p = document.createElement('p');
        p.textContent = filtroAtual === 'pendentes' ? 'Não há solicitações de troca pendentes.' : 'Nenhuma solicitação encontrada.';
        empty.appendChild(p);
        listaSolicitacoes.appendChild(empty);
        return;
    }

    // Render list safely
    listaSolicitacoes.textContent = '';
    filtradas.forEach(agendamento => {
        const card = document.createElement('div');
        card.className = 'solicitacao-card';
        card.dataset.id = agendamento.id;

        const header = document.createElement('div');
        header.className = 'solicitacao-header';
        const badge = document.createElement('span'); badge.className = 'badge badge-warning'; badge.textContent = 'Troca Pendente';
        const dateSpan = document.createElement('span'); dateSpan.className = 'solicitacao-data'; dateSpan.textContent = formatDateTime(agendamento.inicio);
        header.appendChild(badge); header.appendChild(dateSpan);

        const info = document.createElement('div');
        info.className = 'solicitacao-info';
        const strong = document.createElement('strong'); strong.textContent = agendamento.nomeCliente || 'Cliente';
        const pServ = document.createElement('p'); pServ.className = 'text-secondary'; pServ.textContent = agendamento.servico || 'Serviço';
        const pAg = document.createElement('p'); pAg.className = 'text-secondary'; pAg.textContent = `Agendamento: ${formatDateTime(agendamento.inicio)}`;
        info.appendChild(strong); info.appendChild(pServ); info.appendChild(pAg);

        const btn = document.createElement('button');
        btn.className = 'btn-details';
        btn.type = 'button';
        btn.textContent = 'Ver Detalhes';
        btn.addEventListener('click', () => window.mostrarDetalhes(agendamento.id));

        card.appendChild(header);
        card.appendChild(info);
        card.appendChild(btn);

        listaSolicitacoes.appendChild(card);
    });
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

    const detalhesEl = document.getElementById('detalhes-conteudo');
    detalhesEl.textContent = '';
    const grid = document.createElement('div'); grid.className = 'detalhes-grid';

    const makeItem = (labelText, valueText) => {
        const item = document.createElement('div'); item.className = 'detalhe-item';
        const label = document.createElement('label'); label.textContent = labelText;
        const span = document.createElement('span'); span.textContent = valueText;
        item.appendChild(label); item.appendChild(span);
        return item;
    };

    grid.appendChild(makeItem('Cliente', agendamento.nomeCliente || 'Não especificado'));
    grid.appendChild(makeItem('Telefone', agendamento.telefone || 'Não informado'));
    grid.appendChild(makeItem('Data/Hora Atual', formatDateTime(agendamento.inicio)));
    grid.appendChild(makeItem('Serviço', agendamento.servico || 'Não especificado'));
    if (agendamento.notas) {
        const notas = document.createElement('div'); notas.className = 'detalhe-item full-width';
        const label = document.createElement('label'); label.textContent = 'Observações do Cliente';
        const span = document.createElement('span'); span.textContent = agendamento.notas;
        notas.appendChild(label); notas.appendChild(span); grid.appendChild(notas);
    }

    detalhesEl.appendChild(grid);

    const note = document.createElement('p'); note.className = 'text-info';
    const strong = document.createElement('strong'); strong.textContent = 'Nota:';
    note.appendChild(strong);
    note.appendChild(document.createTextNode(' Para ver os detalhes da troca (nova data/hora), é necessário implementar a busca na sub-coleção \'remarcacoes\'.'));
    detalhesEl.appendChild(note);

    const modalActions = document.getElementById('modal-actions');
    modalActions.textContent = '';
    const btnRejeitar = document.createElement('button'); btnRejeitar.className = 'btn-secondary'; btnRejeitar.type = 'button'; btnRejeitar.textContent = 'Rejeitar';
    btnRejeitar.addEventListener('click', () => window.rejeitarSolicitacao(agendamento.id));
    const btnAceitar = document.createElement('button'); btnAceitar.className = 'btn-primary'; btnAceitar.type = 'button'; btnAceitar.textContent = 'Aceitar';
    btnAceitar.addEventListener('click', () => window.aceitarSolicitacao(agendamento.id));
    modalActions.appendChild(btnRejeitar);
    modalActions.appendChild(btnAceitar);

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

