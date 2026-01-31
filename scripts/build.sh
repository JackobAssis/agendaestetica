#!/usr/bin/env bash
set -euo pipefail

# ==========================================
# Build Script for Vercel Deployment
# ==========================================
# Copia arquivos src/ para public/
# para compatibilidade com Vercel
# ==========================================

echo "🏗️ Build AgendaEstética para Vercel"
echo "===================================="

# Detectar diretório do projeto (onde está este script)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "📂 Diretório do projeto: $PROJECT_DIR"

# Verificar se src existe
if [ ! -d "$PROJECT_DIR/src" ]; then
    echo "❌ Erro: Pasta src/ não encontrada em $PROJECT_DIR/src"
    exit 1
fi

# Criar pasta public se não existir
mkdir -p "$PROJECT_DIR/public"

# Copiar todos os arquivos de src/ para public/
echo "📁 Copiando arquivos de src/ para public/..."
cp -r "$PROJECT_DIR/src"/* "$PROJECT_DIR/public/"

# Verificar arquivos copiados
echo ""
echo "📂 Estrutura do public/:"
ls -la "$PROJECT_DIR/public/"

echo ""
echo "✅ Build concluído com sucesso!"
echo "📦 Pasta public/ pronta para deploy"

