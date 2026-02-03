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
 * Injetar configuração no index.html
 */
function injectConfig(htmlPath, env) {
    if (!fs.existsSync(htmlPath)) {
        console.warn(`⚠️  Arquivo não encontrado: ${htmlPath}`);
        return false;
    }
    
    let html = fs.readFileSync(htmlPath, 'utf8');
    
    // Verificar se já tem configuração válida injetada
    if (html.includes('INJETAR_API_KEY') === false && 
        html.includes('API_KEY_REPLACE')) {
        console.log(`ℹ️  Configuração já injetada em: ${htmlPath}`);
        return true;
    }
    
    // Obter valores ou usar placeholders
    const apiKey = env.VITE_FIREBASE_API_KEY || 'AIzaSyD-placeholder-key';
    const authDomain = env.VITE_FIREBASE_AUTH_DOMAIN || 'placeholder.firebaseapp.com';
    const projectId = env.VITE_FIREBASE_PROJECT_ID || 'placeholder';
    const storageBucket = env.VITE_FIREBASE_STORAGE_BUCKET || 'placeholder.appspot.com';
    const messagingSenderId = env.VITE_FIREBASE_MESSAGING_SENDER_ID || '000000000000';
    const appId = env.VITE_FIREBASE_APP_ID || '1:000000000000:web:0000000000000000000000';
    
    // Substituir placeholders no HTML
    html = html.replace(/INJETAR_API_KEY/g, apiKey);
    html = html.replace(/INJETAR_AUTH_DOMAIN/g, authDomain);
    html = html.replace(/INJETAR_PROJECT_ID/g, projectId);
    html = html.replace(/INJETAR_STORAGE_BUCKET/g, storageBucket);
    html = html.replace(/INJECT_SENDER_ID/g, messagingSenderId);
    html = html.replace(/INJECT_APP_ID/g, appId);
    
    // Escrever arquivo modificado
    fs.writeFileSync(htmlPath, html);
    console.log(`✅ Configuração injetada em: ${htmlPath}`);
    console.log(`   API Key: ${apiKey.substring(0, 10)}...`);
    console.log(`   Project ID: ${projectId}`);
    
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

