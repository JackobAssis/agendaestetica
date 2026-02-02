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
const hasValidConfig = missingFields.length === 0 && 
                       envConfig.apiKey && 
                       !envConfig.apiKey.includes('placeholder') &&
                       envConfig.apiKey.length > 10;

console.log('🔧 Build: Injecting Firebase configuration...');
console.log('   Project ID:', envConfig.projectId || 'NOT SET');
console.log('   Has valid config:', hasValidConfig);

// Show which fields are missing for debugging
if (!hasValidConfig && missingFields.length > 0) {
    console.log('   Missing fields:', missingFields.join(', '));
}

if (!hasValidConfig && envConfig.apiKey) {
    console.log('   API Key looks invalid (too short or contains "placeholder")');
}

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
// ❌ No valid environment variables found - running in demo mode
// 
// TO FIX THIS ERROR: auth/api-key-not-valid
// 1. Go to Vercel Dashboard > Settings > Environment Variables
// 2. Add the following variables (must match your Firebase project):
//
//    VITE_FIREBASE_API_KEY=AIzaSy...
//    VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
//    VITE_FIREBASE_PROJECT_ID=your-project-id
//    VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
//    VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
//    VITE_FIREBASE_APP_ID=1:123456789:web:abc123
//
// 3. Redeploy the application
//
// To get these values:
// - Go to Firebase Console > Project Settings > General
// - Scroll down to "Your apps" > Web app configuration
//
// ⚠️ IMPORTANT: The API key must match the projectId!
//
window.APP_CONFIG = {
    firebase: null,
    _demoMode: true,
    _error: "Firebase environment variables not configured in Vercel"
};
console.error('❌ Firebase config NOT injected - running in DEMO mode');
console.error('   Set VITE_FIREBASE_* variables in Vercel Dashboard');
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

if (hasValidConfig) {
    console.log('✅ Build complete! Firebase config injected into index.html');
} else {
    console.log('⚠️  Build complete, but Firebase config is MISSING!');
    console.log('   The app will run in DEMO mode.');
    console.log('');
    console.log('   To fix: Add VITE_FIREBASE_* variables in Vercel Dashboard');
}

