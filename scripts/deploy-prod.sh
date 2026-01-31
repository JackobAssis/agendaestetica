#!/usr/bin/env bash
set -euo pipefail

# ==========================================
# Script de Deploy para Produção - Vercel
# ==========================================
# Uso: ./scripts/deploy-prod.sh
# ==========================================

echo "🚀 Deploy AgendaEstética para Produção"
echo "========================================"

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}Instalando Vercel CLI...${NC}"
    npm install -g vercel
fi

echo -e "${GREEN}Vercel CLI OK!${NC}"
echo ""

# Verificar login
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}Faça login no Vercel:${NC}"
    vercel login
fi

echo ""
echo "📦 Fazendo deploy para produção..."
echo ""

# Deploy
vercel --prod

echo ""
echo -e "${GREEN}✅ Deploy concluído!${NC}"
echo ""
echo "📋 Próximos passos:"
echo "   Configure as variáveis de ambiente:"
echo "   vercel env add VITE_FIREBASE_API_KEY --production"
echo "   vercel env add VITE_FIREBASE_AUTH_DOMAIN --production"
echo "   vercel env add VITE_FIREBASE_PROJECT_ID --production"
echo "   vercel env add VITE_FIREBASE_STORAGE_BUCKET --production"
echo "   vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID --production"
echo "   vercel env add VITE_FIREBASE_APP_ID --production"
echo ""
echo "   Depois, faça redeploy:"
echo "   vercel --prod"
