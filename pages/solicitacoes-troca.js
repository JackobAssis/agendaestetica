import { listAgendamentosEmpresa, buscarRemarcacaoPendente, aceitarRemarcacao, rejeitarRemarcacao } from '../modules/agendamentos.js';
import { obterUsuarioAtual } from '../modules/auth.js';
import { setHTML } from '../modules/security.js';

const listaSolicitacoes = document.getElementById('lista-solicitacoes');
const mensagem = document.getElementById('mensagem');
const modalDetalhes = document.getElementById('modal-detalhes');

let solicitacoes = [];
let solicitacaoSelecionada = null;
let filtroAtual = 'pendentes';

function showMsg(text, type = 'success') {
    mensagem.className = `alert alert--${type === 'success' ? 'success' : 'danger'}`;
    mensagem.textContent = text;
    mensagem.classList.remove('d-none');
    setTimeout(() => mensagem.classList.add('d-none'), 5000);
}

function formatDateTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('pt-BR', {
        weekday: 'short', day: 'numeric', month: 'short',
        hour: '2-digit', minute: '2-digit'
    });
}

async function carregarSolicitacoes() {
    const usuario = obterUsuarioAtual();
    if (!usuario || !usuario.empresaId) {
        window.location.href = '/login';
        return;
    }

    setHTML(listaSolicitacoes, '<div class="loading-state"><p>Carregando solicitações...</p></div>');

    try {
        const agendamentos = await listAgendamentosEmpresa(usuario.empresaId);
        solicitacoes = agendamentos.filter(a => a.temPedidoRemarcacao);
        renderSolicitacoes();
    } catch (error) {
        console.error('Erro ao carregar solicitações:', error);
        setHTML(listaSolicitacoes, '<div class="empty-state"><p>Erro ao carregar solicitações. Tente novamente.</p></div>');
    }
}

function renderSolicitacoes() {
    const filtradas = filtroAtual === 'pendentes'
        ? solicitacoes.filter(s => s.status !== 'cancelado')
        : solicitacoes;

    if (filtradas.length === 0) {
        setHTML(listaSolicitacoes, `
            <div class="empty-state">
                <p>${filtroAtual === 'pendentes'
                    ? 'Não há solicitações de troca pendentes.'
                    : 'Nenhuma solicitação encontrada.'}</p>
            </div>
        `);
        return;
    }

    setHTML(listaSolicitacoes, filtradas.map(agendamento => `
        <div class="card card--interactive mb-3" data-id="${agendamento.id}" onclick="window.mostrarDetalhes('${agendamento.id}')">
            <div class="card__body">
                <div class="flex items-center justify-between mb-2">
                    <span class="badge badge--warning">Troca Pendente</span>
                    <span class="text-sm text-tertiary">${formatDateTime(agendamento.inicio)}</span>
                </div>
                <strong>${agendamento.nomeCliente || 'Cliente'}</strong>
                <p class="text-sm text-secondary mt-1">${agendamento.servico || 'Serviço'}</p>
            </div>
        </div>
    `).join(''));
}

window.mostrarDetalhes = async function(agendamentoId) {
    const agendamento = solicitacoes.find(a => a.id === agendamentoId);
    if (!agendamento) return;

    solicitacaoSelecionada = agendamento;
    const usuario = obterUsuarioAtual();
    let remarcacao = null;

    try {
        remarcacao = await buscarRemarcacaoPendente(usuario.empresaId, agendamentoId);
    } catch (e) {
        console.warn('Erro ao buscar remarcação pendente:', e);
    }

    const detalhesRemarcacao = remarcacao ? `
        <div class="perfil-item">
            <span class="perfil-label">Nova Data</span>
            <span class="perfil-valor">${formatDateTime(remarcacao.novoInicio)}</span>
        </div>
        <div class="perfil-item">
            <span class="perfil-label">Motivo</span>
            <span class="perfil-valor">${remarcacao.motivo || 'Não informado'}</span>
        </div>
    ` : `
        <div class="empty-state">
            <p>Não foi possível carregar os detalhes da remarcação.</p>
        </div>
    `;

    const conteudo = `
        <div class="perfil-card">
            <div class="perfil-item">
                <span class="perfil-label">Cliente</span>
                <span class="perfil-valor">${agendamento.nomeCliente || 'Não especificado'}</span>
            </div>
            <div class="perfil-item">
                <span class="perfil-label">Telefone</span>
                <span class="perfil-valor">${agendamento.telefone || 'Não informado'}</span>
            </div>
            <div class="perfil-item">
                <span class="perfil-label">Data/Hora Atual</span>
                <span class="perfil-valor">${formatDateTime(agendamento.inicio)}</span>
            </div>
            <div class="perfil-item">
                <span class="perfil-label">Serviço</span>
                <span class="perfil-valor">${agendamento.servico || 'Não especificado'}</span>
            </div>
            ${agendamento.notas ? `
            <div class="perfil-item">
                <span class="perfil-label">Observações</span>
                <span class="perfil-valor">${agendamento.notas}</span>
            </div>
            ` : ''}
        </div>
        <hr />
        <h4 class="font-medium mb-3">Detalhes da solicitação</h4>
        ${detalhesRemarcacao}
    `;

    setHTML(document.getElementById('detalhes-conteudo'), conteudo);

    const modalAcoes = document.getElementById('modal-actions');
    setHTML(modalAcoes, `
        <button class="btn btn--secondary" onclick="window.rejeitarSolicitacao('${agendamento.id}')">Rejeitar</button>
        <button class="btn btn--primary" onclick="window.aceitarSolicitacao('${agendamento.id}')">Aceitar</button>
    `);

    modalDetalhes.classList.add('modal-overlay--active');
}

function fecharModal() {
    modalDetalhes.classList.remove('modal-overlay--active');
    solicitacaoSelecionada = null;
}

window.aceitarSolicitacao = async function(agendamentoId) {
    const usuario = obterUsuarioAtual();
    if (!usuario || !usuario.empresaId) {
        showMsg('Erro ao identificar empresa', 'error');
        return;
    }

    try {
        const remarcacao = await buscarRemarcacaoPendente(usuario.empresaId, agendamentoId);
        if (!remarcacao) throw new Error('Nenhuma remarcação pendente encontrada');

        await aceitarRemarcacao(usuario.empresaId, agendamentoId, remarcacao.id);
        showMsg('Troca aceita com sucesso!', 'success');
        fecharModal();
        await carregarSolicitacoes();
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
        const remarcacao = await buscarRemarcacaoPendente(usuario.empresaId, agendamentoId);
        if (!remarcacao) throw new Error('Nenhuma remarcação pendente encontrada');

        await rejeitarRemarcacao(usuario.empresaId, agendamentoId, remarcacao.id, motivo);
        showMsg('Solicitação rejeitada.', 'success');
        fecharModal();
        await carregarSolicitacoes();
    } catch (error) {
        console.error('Erro ao rejeitar solicitação:', error);
        showMsg(error.message || 'Erro ao rejeitar solicitação', 'error');
    }
};

document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(b => b.classList.remove('tab--active'));
        btn.classList.add('tab--active');
        filtroAtual = btn.dataset.filter;
        renderSolicitacoes();
    });
});

document.getElementById('fechar-modal').addEventListener('click', fecharModal);
modalDetalhes.addEventListener('click', (e) => {
    if (e.target === modalDetalhes) fecharModal();
});

document.addEventListener('DOMContentLoaded', carregarSolicitacoes);
