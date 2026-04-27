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

    relatorioResultado.innerHTML = '<div class="loading">Gerando relatório...</div>';

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

        // Render
        let html = `
            <div class="stats-grid">
                <div class="stat-card">
                    <span class="stat-value">${total}</span>
                    <span class="stat-label">Total</span>
                </div>
                <div class="stat-card success">
                    <span class="stat-value">${confirmados.length}</span>
                    <span class="stat-label">Confirmados</span>
                </div>
                <div class="stat-card warning">
                    <span class="stat-value">${solicitados.length}</span>
                    <span class="stat-label">Pendentes</span>
                </div>
                <div class="stat-card error">
                    <span class="stat-value">${cancelados.length}</span>
                    <span class="stat-label">Cancelados</span>
                </div>
            </div>

            <h4>Por Serviço</h4>
            <table class="data-table">
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
        `;

        if (Object.keys(porDia).length > 0) {
            html += `
                <h4>Por Dia da Semana</h4>
                <div class="stats-row">
                    ${Object.entries(porDia).map(([dia, qtd]) => `
                        <div class="stat-mini">
                            <span class="stat-num">${qtd}</span>
                            <span class="stat-dia">${dia}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        if (filtrados.length === 0) {
            html = '<div class="empty-state"><p>Nenhum agendamento encontrado no período selecionado.</p></div>';
        }

        relatorioResultado.innerHTML = html;

    } catch (error) {
        console.error('Erro ao gerar relatório:', error);
        relatorioResultado.innerHTML = '<div class="error-state">Erro ao gerar relatório.</div>';
    }
}

async function gerarRelatorioClientes() {
    clientesResultado.innerHTML = '<div class="loading">Gerando relatório...</div>';

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
        let html = '';
        
        if (ordenados.length === 0) {
            html = '<div class="empty-state"><p>Nenhum cliente com agendamentos confirmados.</p></div>';
        } else {
            html = `
                <table class="data-table">
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
                                <td>${c.count}</td>
                                <td>${new Date(c.ultimo).toLocaleDateString('pt-BR')}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }

        clientesResultado.innerHTML = html;

    } catch (error) {
        console.error('Erro ao gerar relatório de clientes:', error);
        clientesResultado.innerHTML = '<div class="error-state">Erro ao gerar relatório.</div>';
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

