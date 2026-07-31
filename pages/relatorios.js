import { listAgendamentosEmpresa } from '../modules/agendamentos.js';
import { listClientesEmpresa } from '../modules/clientes.js';
import { obterUsuarioAtual } from '../modules/auth.js';
import { setHTML } from '../modules/security.js';

const relatorioResultado = document.getElementById('relatorio-resultado');
const clientesResultado = document.getElementById('clientes-resultado');
const mensagem = document.getElementById('mensagem');

let todosAgendamentos = [];
let todosClientes = [];

function showMsg(text, type = 'success') {
    mensagem.className = `alert alert--${type === 'success' ? 'success' : 'danger'}`;
    mensagem.textContent = text;
    mensagem.classList.remove('d-none');
    setTimeout(() => mensagem.classList.add('d-none'), 5000);
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('pt-BR');
}

async function carregarDados() {
    const usuario = obterUsuarioAtual();
    if (!usuario || !usuario.empresaId) {
        window.location.href = '/login';
        return;
    }

    try {
        todosAgendamentos = await listAgendamentosEmpresa(usuario.empresaId);
        todosClientes = await listClientesEmpresa(usuario.empresaId);
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showMsg('Erro ao carregar dados para relatórios', 'error');
    }
}

async function gerarRelatorioPeriodo() {
    const dataInicio = document.getElementById('relatorio-inicio').value;
    const dataFim = document.getElementById('relatorio-fim').value;

    if (!dataInicio || !dataFim) {
        showMsg('Selecione as datas de início e fim', 'error');
        return;
    }

    setHTML(relatorioResultado, '<div class="loading-state"><p>Gerando relatório...</p></div>');

    try {
        const inicio = new Date(dataInicio);
        const fim = new Date(dataFim);
        fim.setHours(23, 59, 59);

        const filtrados = todosAgendamentos.filter(a => {
            const dataAgendamento = new Date(a.inicio);
            return dataAgendamento >= inicio && dataAgendamento <= fim;
        });

        const confirmados = filtrados.filter(a => a.status === 'confirmado');
        const cancelados = filtrados.filter(a => a.status === 'cancelado');
        const solicitados = filtrados.filter(a => a.status === 'solicitado');
        const total = filtrados.length;

        const porServico = {};
        filtrados.forEach(a => {
            const servico = a.servico || 'Não especificado';
            porServico[servico] = (porServico[servico] || 0) + 1;
        });

        const porDia = {};
        filtrados.forEach(a => {
            const dia = new Date(a.inicio).toLocaleDateString('pt-BR', { weekday: 'long' });
            porDia[dia] = (porDia[dia] || 0) + 1;
        });

        let html = `
            <div class="stats-grid mb-4">
                <div class="stat-card">
                    <div class="stat-card__icon">📊</div>
                    <div class="stat-card__info">
                        <p class="stat-card__value">${total}</p>
                        <p class="stat-card__label">Total</p>
                    </div>
                </div>
                <div class="stat-card stat-card--success">
                    <div class="stat-card__icon">✅</div>
                    <div class="stat-card__info">
                        <p class="stat-card__value">${confirmados.length}</p>
                        <p class="stat-card__label">Confirmados</p>
                    </div>
                </div>
                <div class="stat-card stat-card--warning">
                    <div class="stat-card__icon">⏰</div>
                    <div class="stat-card__info">
                        <p class="stat-card__value">${solicitados.length}</p>
                        <p class="stat-card__label">Pendentes</p>
                    </div>
                </div>
                <div class="stat-card stat-card--danger">
                    <div class="stat-card__icon">❌</div>
                    <div class="stat-card__info">
                        <p class="stat-card__value">${cancelados.length}</p>
                        <p class="stat-card__label">Cancelados</p>
                    </div>
                </div>
            </div>

            <h4 class="font-semibold mb-3">Por Serviço</h4>
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Serviço</th>
                            <th>Qtd</th>
                            <th>%</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(porServico).map(([servico, qtd]) => `
                            <tr>
                                <td>${servico}</td>
                                <td>${qtd}</td>
                                <td>${total > 0 ? ((qtd / total) * 100).toFixed(1) : 0}%</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        if (Object.keys(porDia).length > 0) {
            html += `
                <h4 class="font-semibold mt-4 mb-3">Por Dia da Semana</h4>
                <div class="stats-grid">
                    ${Object.entries(porDia).map(([dia, qtd]) => `
                        <div class="stat-card">
                            <div class="stat-card__icon">📅</div>
                            <div class="stat-card__info">
                                <p class="stat-card__value">${qtd}</p>
                                <p class="stat-card__label">${dia}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        if (filtrados.length === 0) {
            html = '<div class="empty-state"><p>Nenhum agendamento encontrado no período selecionado.</p></div>';
        }

        setHTML(relatorioResultado, html);
    } catch (error) {
        console.error('Erro ao gerar relatório:', error);
        setHTML(relatorioResultado, '<div class="empty-state"><p>Erro ao gerar relatório.</p></div>');
    }
}

async function gerarRelatorioClientes() {
    setHTML(clientesResultado, '<div class="loading-state"><p>Gerando relatório...</p></div>');

    try {
        const contagemPorCliente = {};
        todosAgendamentos
            .filter(a => a.status === 'confirmado' || a.status === 'concluido')
            .forEach(a => {
                const clienteId = a.clienteUid || a.nomeCliente;
                if (clienteId) {
                    contagemPorCliente[clienteId] = (contagemPorCliente[clienteId] || {
                        nome: a.nomeCliente, count: 0, ultimo: a.inicio
                    });
                    contagemPorCliente[clienteId].count++;
                    if (new Date(a.inicio) > new Date(contagemPorCliente[clienteId].ultimo)) {
                        contagemPorCliente[clienteId].ultimo = a.inicio;
                    }
                }
            });

        const ordenados = Object.values(contagemPorCliente).sort((a, b) => b.count - a.count);

        let html = '';

        if (ordenados.length === 0) {
            html = '<div class="empty-state"><p>Nenhum cliente com agendamentos confirmados.</p></div>';
        } else {
            html = `
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Cliente</th>
                                <th>Atendimentos</th>
                                <th>Última Visita</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${ordenados.map(c => `
                                <tr>
                                    <td>${c.nome}</td>
                                    <td><span class="badge badge--primary">${c.count}</span></td>
                                    <td>${new Date(c.ultimo).toLocaleDateString('pt-BR')}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }

        setHTML(clientesResultado, html);
    } catch (error) {
        console.error('Erro ao gerar relatório de clientes:', error);
        setHTML(clientesResultado, '<div class="empty-state"><p>Erro ao gerar relatório.</p></div>');
    }
}

function setDefaultDates() {
    const hoje = new Date();
    const mesPassado = new Date();
    mesPassado.setMonth(mesPassado.getMonth() - 1);

    document.getElementById('relatorio-inicio').value = mesPassado.toISOString().split('T')[0];
    document.getElementById('relatorio-fim').value = hoje.toISOString().split('T')[0];
}

document.getElementById('btn-gerar-relatorio').addEventListener('click', gerarRelatorioPeriodo);
document.getElementById('btn-clientes-recorrentes').addEventListener('click', gerarRelatorioClientes);

document.addEventListener('DOMContentLoaded', async () => {
    await carregarDados();
    setDefaultDates();
});
