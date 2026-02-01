#!/usr/bin/env node
/**
 * @deprecated Este script está OBSOLETO e não é mais usado no fluxo de deploy.
 * 
 * O fluxo de deploy atual (Vercel) usa:
 *   - buildCommand: "bash scripts/build.sh"
 *   - outputDirectory: "public"
 * 
 * O script build.sh simplesmente copia arquivos de src/ para public/
 * sem precisar de injeção de config via regex.
 * 
 * Para configurações do Firebase, use variáveis de ambiente diretamente:
 *   - VITE_FIREBASE_API_KEY
 *   - VITE_FIREBASE_AUTH_DOMAIN
 *   - etc.
 * 
 * Estas variáveis são configuradas no dashboard da Vercel e lidas via config.js
 * ou window.APP_CONFIG (ver public/index.html).
 * 
 * @usage Este arquivo pode ser removido do projeto.
 */
console.log('⚠️ build.js está obsoleto! Use: bash scripts/build.sh');
process.exit(0);

