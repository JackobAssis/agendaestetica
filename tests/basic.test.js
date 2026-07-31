/**
 * Testes básicos para módulos core
 * Executar com: node tests/basic.test.js
 */

import { showToast } from '../modules/feedback.js';
import { generateSlotsForDate } from '../modules/agenda.js';

// Teste 1: Feedback module
console.log('🧪 Testando feedback.js...');
try {
    // Simular DOM (mock completo com classList/remove para evitar crashes)
    const mockElement = () => ({
        tagName: '',
        className: '',
        textContent: '',
        dataset: {},
        innerHTML: '',
        classList: { add: () => {}, remove: () => {}, toggle: () => {}, contains: () => false },
        appendChild: () => {},
        remove: () => {},
        onclick: null,
    });
    global.document = {
        createElement: (tag) => { const el = mockElement(); el.tagName = tag; return el; },
        getElementById: () => mockElement(),
        body: { appendChild: () => {} }
    };
    global.window = { setTimeout: (fn) => fn() };

    showToast('Teste', 'success');
    console.log('✅ showToast funciona');
} catch (e) {
    console.log('❌ showToast falhou:', e.message);
}

// Teste 2: Agenda module (mock básico)
console.log('🧪 Testando agenda.js...');
try {
    // Mock básico do Firebase
    global.localStorage = {
        getItem: () => null,
        setItem: () => {}
    };

    // Este teste requer configuração real do Firebase
    console.log('⚠️ generateSlotsForDate requer Firebase configurado - pular teste automático');
} catch (e) {
    console.log('❌ generateSlotsForDate falhou:', e.message);
}

console.log('🏁 Testes básicos concluídos');