#!/usr/bin/env node
/**
 * Firebase Configuration Injection Script
 * 
 * Este script injeta a configuração do Firebase no index.html
 * durante o processo de build.
 * 
 * Uso: node scripts/inject-config.js
 * 
 * Para desenvolvimento local: configure as variáveis no .env.local
 * Para Vercel: configure VITE_FIREBASE_* em Settings > Environment Variables
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================
// Configuração dos caminhos
// ============================================================

const ROOT_DIR = path.join(__dirname, '..');
const INDEX_HTML_PATH = path.join(ROOT_DIR, 'index.html');
const PUBLIC_INDEX_HTML_PATH = path.join(ROOT_DIR, 'public', 'index.html');

// ============================================================
// Funções auxiliares
// ============================================================

/**
 * Carregar variáveis de ambiente
 */
function loadEnv() {
    const env = {};
    
    // Carregar de .env.local se existir
    const envLocalPath = path.join(ROOT_DIR, '.env.local');
    if (fs.existsSync(envLocalPath)) {
        const content = fs.readFileSync(envLocalPath, 'utf8');
        content.split('\n').forEach(line => {
            const match = line.match(/^([A-Z_]+)=(.*)$/);
            if (match) {
                env[match[1]] = match[2].trim();
            }
        });
    }
    
    // Sobrescrever com variáveis de ambiente do processo
    const firebaseVars = [
        'VITE_FIREBASE_API_KEY',
        'VITE_FIREBASE_AUTH_DOMAIN',
        'VITE_FIREBASE_PROJECT_ID',
        'VITE_FIREBASE_STORAGE_BUCKET',
        'VITE_FIREBASE_MESSAGING_SENDER_ID',
        'VITE_FIREBASE_APP_ID'
    ];
    
    firebaseVars.forEach(key => {
        if (process.env[key]) {
            env[key] = process.env[key];
        }
    });
    
    return env;
}

/**
 * Gerar script de configuração Firebase
 */
function generateFirebaseConfigScript(env) {
    const apiKey = env.VITE_FIREBASE_API_KEY || 'AIzaSyD-placeholder-key';
    const authDomain = env.VITE_FIREBASE_AUTH_DOMAIN || 'placeholder.firebaseapp.com';
    const projectId = env.VITE_FIREBASE_PROJECT_ID || 'placeholder';
    const storageBucket = env.VITE_FIREBASE_STORAGE_BUCKET || 'placeholder.appspot.com';
    const messagingSenderId = env.VITE_FIREBASE_MESSAGING_SENDER_ID || '000000000000';
    const appId = env.VITE_FIREBASE_APP_ID || '1:000000000000:web:0000000000000000000000';
    
    return `
// Firebase Configuration - INJETADO VIA BUILD
// NÃO EDITE ESTE BLOCO MANUALMENTE
(function() {
    // Verificar se já existe configuração
    if (window.APP_CONFIG && window.APP_CONFIG.firebase) {
        console.log('✅ Firebase config já carregada');
        return;
    }
    
    // Configuração do Firebase
    window.APP_CONFIG = {
        firebase: {
            apiKey: "${apiKey}",
            authDomain: "${authDomain}",
            projectId: "${projectId}",
            storageBucket: "${storageBucket}",
            messagingSenderId: "${messagingSenderId}",
            appId: "${appId}"
        }
    };
    
    console.log('✅ Firebase config injetada com sucesso');
    console.log('Project ID:', window.APP_CONFIG.firebase.projectId);
})();
// FIM Firebase Configuration
`;
}

/**
 * Injetar configuração no index.html
 */
function injectConfig(htmlPath, env) {
    if (!fs.existsSync(htmlPath)) {
        console.warn(`⚠️  Arquivo não encontrado: ${htmlPath}`);
        return false;
    }
    
    let html = fs.readFileSync(htmlPath, 'utf8');
    
    // Verificar se já tem configuração injetada
    if (html.includes('// Firebase Configuration - INJETADO VIA BUILD')) {
        console.log(`ℹ️  Configuração já injetada em: ${htmlPath}`);
        return true;
    }
    
    // Gerar script de configuração
    const configScript = generateFirebaseConfigScript(env);
    
    // Encontrar e substituir o placeholder
    const placeholderPattern = /<!-- Firebase Configuration Placeholder -->[\s\S]*?<!-- End Firebase Configuration -->/;
    
    if (placeholderPattern.test(html)) {
        html = html.replace(placeholderPattern, `<!-- Firebase Configuration -->\n${configScript}\n<!-- End Firebase Configuration -->`);
    } else {
        // Se não encontrar o placeholder, adicionar antes do título
        const titleMatch = html.match(/<title>.*<\/title>/);
        if (titleMatch) {
            const insertPosition = html.indexOf(titleMatch[0]) + titleMatch[0].length;
            html = html.slice(0, insertPosition) + 
                   `\n${configScript}` + 
                   html.slice(insertPosition);
        }
    }
    
    // Escrever arquivo modificado
    fs.writeFileSync(htmlPath, html);
    console.log(`✅ Configuração injetada em: ${htmlPath}`);
    
    return true;
}

/**
 * Verificar se a configuração é válida
 */
function isConfigValid(env) {
    const required = [
        'VITE_FIREBASE_API_KEY',
        'VITE_FIREBASE_AUTH_DOMAIN',
        'VITE_FIREBASE_PROJECT_ID',
        'VITE_FIREBASE_APP_ID'
    ];
    
    for (const key of required) {
        if (!env[key] || env[key].includes('placeholder')) {
            return false;
        }
    }
    
    return true;
}

// ============================================================
// Main
// ============================================================

function main() {
    console.log('🔧 Inject Config Script');
    console.log('========================\n');
    
    // Carregar variáveis de ambiente
    const env = loadEnv();
    
    console.log('📋 Variáveis carregadas:');
    console.log('  - VITE_FIREBASE_API_KEY:', env.VITE_FIREBASE_API_KEY ? '✅' : '❌');
    console.log('  - VITE_FIREBASE_AUTH_DOMAIN:', env.VITE_FIREBASE_AUTH_DOMAIN ? '✅' : '❌');
    console.log('  - VITE_FIREBASE_PROJECT_ID:', env.VITE_FIREBASE_PROJECT_ID ? '✅' : '❌');
    console.log('  - VITE_FIREBASE_APP_ID:', env.VITE_FIREBASE_APP_ID ? '✅' : '❌');
    console.log('');
    
    // Verificar se configuração é válida
    if (isConfigValid(env)) {
        console.log('✅ Configuração válida detectada');
    } else {
        console.warn('⚠️  Configuração incompleta - modo demo será usado');
        console.warn('   Para produção, configure as variáveis no Vercel Dashboard');
    }
    
    console.log('');
    
    // Injetar configuração em index.html
    let success = injectConfig(INDEX_HTML_PATH, env);
    
    // Injetar configuração em public/index.html
    success = injectConfig(PUBLIC_INDEX_HTML_PATH, env) && success;
    
    console.log('');
    if (success) {
        console.log('✨ Injeção concluída com sucesso!');
    } else {
        console.error('❌ Erro durante injeção');
        process.exit(1);
    }
}

// Executar
main();

