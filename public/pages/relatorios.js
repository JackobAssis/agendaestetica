/**
 * Relatórios Page
 * Professional-side page for viewing reports and analytics
 */

import { listAgendamentosEmpresa } from '../modules/agendamentos.js';
import { listClientesEmpresa } from '../modules/clientes.js';
import { obterUsuarioAtual } from '../modules/auth.js';

// DOM Elements
const relatorioResultado = document.getElementById('relatorio-resultado');
const clientesResultado = document.getElementById('clientes-resultado');
const mensagem = document.getElementById('mensagem');

// State
let todosAgendamentos = [];
let todosClientes = [];

function showMsg(text, type = 'success') {
    mensagem.className = type === 'success' ? 'success-message' : 'error-message';
    mensagem.textContent = text;
    mensagem.classList.remove('hidden');
    setTimeout(() => mensagem.classList.add('hidden'), 5000);
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
        // Carregar agendamentos
        todosAgendamentos = await listAgendamentosEmpresa(usuario.empresaId);
        
        // Carregar clientes
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

    // show loading
    relatorioResultado.textContent = '';
    const loading = document.createElement('div');
    loading.className = 'loading';
    loading.textContent = 'Gerando relatório...';
    relatorioResultado.appendChild(loading);

    try {
        const inicio = new Date(dataInicio);
        const fim = new Date(dataFim);
        fim.setHours(23, 59, 59);

        // Filtrar agendamentos no período
        const filtrados = todosAgendamentos.filter(a => {
            const dataAgendamento = new Date(a.inicio);
            return dataAgendamento >= inicio && dataAgendamento <= fim;
        });

        // Estatísticas
        const confirmados = filtrados.filter(a => a.status === 'confirmado');
        const cancelados = filtrados.filter(a => a.status === 'cancelado');
        const solicitados = filtrados.filter(a => a.status === 'solicitado');
        const total = filtrados.length;

        // Por serviço
        const porServico = {};
        filtrados.forEach(a => {
            const servico = a.servico || 'Não especificado';
            porServico[servico] = (porServico[servico] || 0) + 1;
        });

        // Por dia da semana
        const porDia = {};
        filtrados.forEach(a => {
            const dia = new Date(a.inicio).toLocaleDateString('pt-BR', { weekday: 'long' });
            porDia[dia] = (porDia[dia] || 0) + 1;
        });

        // clear and render
        relatorioResultado.textContent = '';

        if (filtrados.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'empty-state';
            const p = document.createElement('p');
            p.textContent = 'Nenhum agendamento encontrado no período selecionado.';
            empty.appendChild(p);
            relatorioResultado.appendChild(empty);
        } else {
            const statsGrid = document.createElement('div');
            statsGrid.className = 'stats-grid';

            const createStatCard = (value, label, extraClass) => {
                const card = document.createElement('div');
                card.className = `stat-card ${extraClass || ''}`.trim();
                const v = document.createElement('span');
                v.className = 'stat-value';
                v.textContent = value;
                const l = document.createElement('span');
                l.className = 'stat-label';
                l.textContent = label;
                card.appendChild(v);
                card.appendChild(l);
                return card;
            };

            statsGrid.appendChild(createStatCard(total, 'Total'));
            statsGrid.appendChild(createStatCard(confirmados.length, 'Confirmados', 'success'));
            statsGrid.appendChild(createStatCard(solicitados.length, 'Pendentes', 'warning'));
            statsGrid.appendChild(createStatCard(cancelados.length, 'Cancelados', 'error'));

            relatorioResultado.appendChild(statsGrid);

            // Por Serviço table
            const h4 = document.createElement('h4');
            h4.textContent = 'Por Serviço';
            relatorioResultado.appendChild(h4);

            const table = document.createElement('table');
            table.className = 'data-table';
            const thead = document.createElement('thead');
            const trHead = document.createElement('tr');
            ['Serviço','Qtd','%'].forEach(h => { const th = document.createElement('th'); th.textContent = h; trHead.appendChild(th); });
            thead.appendChild(trHead);
            table.appendChild(thead);
            const tbody = document.createElement('tbody');
            Object.entries(porServico).forEach(([servico, qtd]) => {
                const tr = document.createElement('tr');
                const td1 = document.createElement('td'); td1.textContent = servico;
                const td2 = document.createElement('td'); td2.textContent = qtd;
                const td3 = document.createElement('td'); td3.textContent = total > 0 ? ((qtd / total) * 100).toFixed(1) + '%' : '0%';
                tr.appendChild(td1); tr.appendChild(td2); tr.appendChild(td3);
                tbody.appendChild(tr);
            });
            table.appendChild(tbody);
            relatorioResultado.appendChild(table);

            // Por Dia
            if (Object.keys(porDia).length > 0) {
                const h4d = document.createElement('h4');
                h4d.textContent = 'Por Dia da Semana';
                relatorioResultado.appendChild(h4d);

                const row = document.createElement('div');
                row.className = 'stats-row';
                Object.entries(porDia).forEach(([dia, qtd]) => {
                    const mini = document.createElement('div');
                    mini.className = 'stat-mini';
                    const n = document.createElement('span'); n.className = 'stat-num'; n.textContent = qtd;
                    const d = document.createElement('span'); d.className = 'stat-dia'; d.textContent = dia;
                    mini.appendChild(n); mini.appendChild(d);
                    row.appendChild(mini);
                });
                relatorioResultado.appendChild(row);
            }
        }

    } catch (error) {
        console.error('Erro ao gerar relatório:', error);
        relatorioResultado.textContent = '';
        const err = document.createElement('div');
        err.className = 'error-state';
        err.textContent = 'Erro ao gerar relatório.';
        relatorioResultado.appendChild(err);
    }
}

async function gerarRelatorioClientes() {
    clientesResultado.textContent = '';
    const loadingCli = document.createElement('div');
    loadingCli.className = 'loading';
    loadingCli.textContent = 'Gerando relatório...';
    clientesResultado.appendChild(loadingCli);

    try {
        // Contar agendamentos por cliente
        const contagemPorCliente = {};
        todosAgendamentos
            .filter(a => a.status === 'confirmado' || a.status === 'concluido')
            .forEach(a => {
                const clienteId = a.clienteUid || a.nomeCliente;
                if (clienteId) {
                    contagemPorCliente[clienteId] = (contagemPorCliente[clienteId] || {
                        nome: a.nomeCliente,
                        count: 0,
                        ultimo: a.inicio
                    });
                    contagemPorCliente[clienteId].count++;
                    if (new Date(a.inicio) > new Date(contagemPorCliente[clienteId].ultimo)) {
                        contagemPorCliente[clienteId].ultimo = a.inicio;
                    }
                }
            });

        // Ordenar por quantidade
        const ordenados = Object.values(contagemPorCliente)
            .sort((a, b) => b.count - a.count);

        // Render
        clientesResultado.textContent = '';
        if (ordenados.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'empty-state';
            const p = document.createElement('p');
            p.textContent = 'Nenhum cliente com agendamentos confirmados.';
            empty.appendChild(p);
            clientesResultado.appendChild(empty);
        } else {
            const table = document.createElement('table');
            table.className = 'data-table';
            const thead = document.createElement('thead');
            const trHead2 = document.createElement('tr');
            ['Cliente','Atendimentos','Última Visita'].forEach(h => { const th = document.createElement('th'); th.textContent = h; trHead2.appendChild(th); });
            thead.appendChild(trHead2);
            table.appendChild(thead);
            const tbody = document.createElement('tbody');
            ordenados.forEach(c => {
                const tr = document.createElement('tr');
                const td1 = document.createElement('td'); td1.textContent = c.nome;
                const td2 = document.createElement('td'); td2.textContent = c.count;
                const td3 = document.createElement('td'); td3.textContent = new Date(c.ultimo).toLocaleDateString('pt-BR');
                tr.appendChild(td1); tr.appendChild(td2); tr.appendChild(td3);
                tbody.appendChild(tr);
            });
            table.appendChild(tbody);
            clientesResultado.appendChild(table);
        }

    } catch (error) {
        console.error('Erro ao gerar relatório de clientes:', error);
        clientesResultado.textContent = '';
        const err2 = document.createElement('div');
        err2.className = 'error-state';
        err2.textContent = 'Erro ao gerar relatório.';
        clientesResultado.appendChild(err2);
    }
}

// Set default dates
function setDefaultDates() {
    const hoje = new Date();
    const mesPassado = new Date();
    mesPassado.setMonth(mesPassado.getMonth() - 1);

    document.getElementById('relatorio-inicio').value = mesPassado.toISOString().split('T')[0];
    document.getElementById('relatorio-fim').value = hoje.toISOString().split('T')[0];
}

// Events
document.getElementById('btn-gerar-relatorio').addEventListener('click', gerarRelatorioPeriodo);
document.getElementById('btn-clientes-recorrentes').addEventListener('click', gerarRelatorioClientes);

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await carregarDados();
    setDefaultDates();
});

