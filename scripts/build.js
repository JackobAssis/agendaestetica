#!/usr/bin/env node
/**
 * Build script that injects Firebase config into index.html
 * Usage: node scripts/build.js
 */

const fs = require('fs');
const path = require('path');

// Read environment variables
const config = {
    apiKey: process.env.VITE_FIREBASE_API_KEY || '',
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.VITE_FIREBASE_APP_ID || '',
};

// Check if we have the required config
if (!config.apiKey) {
    console.error('❌ Error: VITE_FIREBASE_API_KEY is not set');
    console.error('Please set environment variables before running build');
    process.exit(1);
}

console.log('✅ Firebase config found, injecting into index.html...');

// Read index.html
const indexPath = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// Create the config script
const configScript = `
<!-- Firebase Configuration (injected at build time) -->
<script>
window.APP_CONFIG = {
    firebase: {
        apiKey: "${config.apiKey}",
        authDomain: "${config.authDomain}",
        projectId: "${config.projectId}",
        storageBucket: "${config.storageBucket}",
        messagingSenderId: "${config.messagingSenderId}",
        appId: "${config.appId}",
    }
};
</script>
`;

// Replace the placeholder comment
const placeholderRegex = /<!-- Security: Firebase Configuration[\s\S]*?-->/;
html = html.replace(placeholderRegex, configScript.trim());

// Write back
fs.writeFileSync(indexPath, html);

console.log('✅ Build complete! index.html has been updated.');
console.log('');
console.log('Ready to deploy to Vercel!');
