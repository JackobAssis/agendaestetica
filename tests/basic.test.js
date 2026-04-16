/**
 * Testes básicos para módulos core
 * Executar com: node tests/basic.test.js
 */

import { showToast } from '../modules/feedback.js';
import { generateSlotsForDate } from '../modules/agenda.js';

// Teste 1: Feedback module
console.log('🧪 Testando feedback.js...');
try {
    // Simular DOM
    global.document = {
        createElement: (tag) => ({ tagName: tag, className: '', textContent: '', appendChild: () => {} }),
        getElementById: () => ({ innerHTML: '', appendChild: () => {} }),
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