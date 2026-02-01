#!/usr/bin/env node
/**
 * Build script that injects Firebase config into index.html for Vercel
 * This script is called during build to inject environment variables into static HTML
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read environment variables from Vercel
const envConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY || '',
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.VITE_FIREBASE_APP_ID || '',
};

// Validate that we have required config
const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
const missingFields = requiredFields.filter(field => !envConfig[field]);
const hasValidConfig = missingFields.length === 0 && envConfig.apiKey && !envConfig.apiKey.includes('placeholder');

console.log('🔧 Build: Injecting Firebase configuration...');
console.log('   Project ID:', envConfig.projectId || 'NOT SET');
console.log('   Has valid config:', hasValidConfig);

// Generate the config script
const configScript = hasValidConfig ? `
// Firebase Configuration (injected at build time)
window.APP_CONFIG = {
    firebase: {
        apiKey: "${envConfig.apiKey}",
        authDomain: "${envConfig.authDomain}",
        projectId: "${envConfig.projectId}",
        storageBucket: "${envConfig.storageBucket}",
        messagingSenderId: "${envConfig.messagingSenderId}",
        appId: "${envConfig.appId}",
    }
};
console.log('✅ Firebase config injected successfully');
` : `
// Firebase Configuration - PLACEHOLDER MODE
// No valid environment variables found - running in demo mode
window.APP_CONFIG = {
    firebase: null,
    _demoMode: true
};
console.warn('⚠️ Firebase config NOT injected - running in demo mode');
console.warn('   Set VITE_FIREBASE_* environment variables in Vercel Dashboard');
`;

// Read index.html template
const indexPath = path.join(__dirname, '..', 'public', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// Replace the configuration placeholder
const placeholderRegex = /<!-- Firebase Configuration Placeholder -->[\s\S]*?<!-- End Firebase Configuration -->/;
const newConfigBlock = `<!-- Firebase Configuration Placeholder -->
<script>
${configScript}
</script>
<!-- End Firebase Configuration -->`;

if (placeholderRegex.test(html)) {
    html = html.replace(placeholderRegex, newConfigBlock);
} else {
    // Fallback: inject after the first <head> or at the beginning of head
    const headMatch = html.match(/<head>/);
    if (headMatch) {
        html = html.replace('<head>', `<head>\n${newConfigBlock}`);
    } else {
        console.error('❌ Could not find <head> tag in index.html');
        process.exit(1);
    }
}

// Write back
fs.writeFileSync(indexPath, html);

console.log('✅ Build complete! Firebase config injected into index.html');

