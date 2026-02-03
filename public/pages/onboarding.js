/**
 * Onboarding Page Logic - Firebase v9+ Modular SDK
 */

import { obterUsuarioAtual } from '../modules/auth.js';

// ============================================================
// Firebase v9+ Modular SDK Imports
// ============================================================

import { 
    getFirestore, 
    doc, 
    updateDoc 
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
// Onboarding Functions
// ============================================================

const form = document.getElementById('form-onboarding');
const mensagemDiv = document.getElementById('onboarding-mensagem');

function mostrarMensagem(text, tipo = 'success') {
    mensagemDiv.className = tipo === 'success' ? 'success-message' : 'error-message';
    mensagemDiv.textContent = text;
    mensagemDiv.classList.remove('hidden');
}

function limparMensagem() {
    mensagemDiv.classList.add('hidden');
}

function coletarDadosDoFormulario() {
    const empresaNome = document.getElementById('empresa-nome').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const servicosRaw = document.getElementById('servicos').value.trim();
    const servicos = servicosRaw ? servicosRaw.split(',').map(s => s.trim()).filter(Boolean) : [];

    const diasNodes = Array.from(document.querySelectorAll('input[name="dias"]:checked'));
    const dias = diasNodes.map(n => n.value);

    const horaInicio = document.getElementById('hora-inicio').value;
    const horaFim = document.getElementById('hora-fim').value;
    const duracaoSlot = parseInt(document.getElementById('duracao-slot').value, 10);

    return { empresaNome, telefone, servicos, dias, horaInicio, horaFim, duracaoSlot };
}

async function validarDados(dados) {
    if (!dados.empresaNome) throw new Error('Nome do estabelecimento é obrigatório');
    if (!dados.dias || dados.dias.length === 0) throw new Error('Selecione pelo menos um dia da semana');
    if (!dados.horaInicio || !dados.horaFim) throw new Error('Informe horário de início e fim');
    if (dados.duracaoSlot < 5) throw new Error('Duração de slot inválida');
    // Mais validações podem ser adicionadas conforme necessário
}

async function salvarConfiguracao(dados) {
    const usuario = obterUsuarioAtual();
    if (!usuario || !usuario.empresaId) throw new Error('Usuário não autenticado ou sem empresaId');

    const empresaId = usuario.empresaId;
    const db = getFirebaseDB();

    const payload = {
        nome: dados.empresaNome,
        telefone: dados.telefone || null,
        servicos: dados.servicos,
        horarios: {
            dias: dados.dias,
            inicio: dados.horaInicio,
            fim: dados.horaFim,
            duracaoSlot: dados.duracaoSlot,
        },
        onboardingCompleto: true,
        atualizadoEm: new Date().toISOString(),
    };

    // Atualiza documento da empresa - Firebase v9+: updateDoc(doc(db, collection, id), data)
    const empresaRef = doc(db, 'empresas', empresaId);
    await updateDoc(empresaRef, payload);
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    limparMensagem();

    const btn = form.querySelector('.submit-btn');
    btn.disabled = true;
    btn.textContent = 'Salvando...';

    try {
        const dados = coletarDadosDoFormulario();
        await validarDados(dados);
        await salvarConfiguracao(dados);
        mostrarMensagem('Configuração salva com sucesso! Redirecionando...', 'success');
        setTimeout(() => { window.location.href = '/dashboard'; }, 900);
    } catch (err) {
        console.error('Onboarding error:', err);
        mostrarMensagem(err.message || 'Erro ao salvar configuração', 'error');
        btn.disabled = false;
        btn.textContent = 'Salvar e Continuar';
    }
});

// Proteção: se não estiver autenticado, redireciona
document.addEventListener('DOMContentLoaded', () => {
    const usuario = obterUsuarioAtual();
    if (!usuario || !usuario.empresaId) {
        window.location.href = '/login';
    }
});

