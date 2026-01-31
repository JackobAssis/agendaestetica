#!/usr/bin/env bash
set -euo pipefail

# ==========================================
# Script de Configuração de Variáveis de Ambiente
# Para AgendaEstética no Vercel
# ==========================================
# Uso: ./scripts/setup-env.sh
# ==========================================

echo "🔐 Configuração de Variáveis de Ambiente - Vercel"
echo "=================================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para ler valor com echo colorido
read_env() {
    local label=$1
    local var_name=$2
    local is_secret=${3:-true}
    
    echo -n "${label}: "
    if [ "$is_secret" = true ]; then
        read -s var_value
        echo ""
    else
        read var_value
    fi
    
    export "$var_name=$var_value"
}

# Verificar se Vercel CLI está instalado
echo "Verificando Vercel CLI..."
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}Vercel CLI não encontrado. Instalando...${NC}"
    npm install -g vercel
fi

echo -e "${GREEN}Vercel CLI encontrado!${NC}"
echo ""

# Verificar se está logado
echo "Verificando autenticação..."
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}Não está logado no Vercel. Faça login:${NC}"
    vercel login
fi

echo ""
echo "Para configurar as variáveis, você precisa dos valores do Firebase Console."
echo "Acesse: https://console.firebase.google.com/"
echo ""

# Ler valores
echo "=== Configuração do Firebase ==="
echo ""

read_env "VITE_FIREBASE_API_KEY" "FIRE_API_KEY"
read_env "VITE_FIREBASE_AUTH_DOMAIN (ex: projeto.firebaseapp.com)" "FIRE_AUTH_DOMAIN"
read_env "VITE_FIREBASE_PROJECT_ID" "FIRE_PROJECT_ID"
read_env "VITE_FIREBASE_STORAGE_BUCKET (ex: projeto.appspot.com)" "FIRE_STORAGE_BUCKET"
read_env "VITE_FIREBASE_MESSAGING_SENDER_ID" "FIRE_MESSAGING_SENDER_ID"
read_env "VITE_FIREBASE_APP_ID" "FIRE_APP_ID"

echo ""
echo "=== Adicionando variáveis ao Vercel ==="
echo ""

# Adicionar cada variável
vercel env add VITE_FIREBASE_API_KEY "$FIRE_API_KEY" < /dev/null
vercel env add VITE_FIREBASE_AUTH_DOMAIN "$FIRE_AUTH_DOMAIN" < /dev/null
vercel env add VITE_FIREBASE_PROJECT_ID "$FIRE_PROJECT_ID" < /dev/null
vercel env add VITE_FIREBASE_STORAGE_BUCKET "$FIRE_STORAGE_BUCKET" < /dev/null
vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID "$FIRE_MESSAGING_SENDER_ID" < /dev/null
vercel env add VITE_FIREBASE_APP_ID "$FIRE_APP_ID" < /dev/null

echo ""
echo -e "${GREEN}✅ Todas as variáveis foram adicionadas!${NC}"
echo ""
echo "As variáveis foram adicionadas ao ambiente de Preview."
echo "Para Production, você precisa promotionar ou adicionar novamente com --production."
echo ""
echo "Para fazer redeploy:"
echo "  vercel --prod"
echo ""
