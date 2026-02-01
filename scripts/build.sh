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

# Remover e recriar pasta public/
echo "🗑️  Limpando diretório public/..."
rm -rf "$PROJECT_DIR/public"
mkdir -p "$PROJECT_DIR/public"

# Copiar todos os arquivos de src/ para public/
echo "📁 Copiando arquivos de src/ para public/..."
cp -r "$PROJECT_DIR/src"/* "$PROJECT_DIR/public/"

# Copiar arquivos da raiz necessários para public/
echo "📁 Copiando arquivos da raiz..."
cp "$PROJECT_DIR/index.html" "$PROJECT_DIR/public/" 2>/dev/null || true
cp "$PROJECT_DIR/config.js" "$PROJECT_DIR/public/" 2>/dev/null || true
cp "$PROJECT_DIR/router.js" "$PROJECT_DIR/public/" 2>/dev/null || true
cp "$PROJECT_DIR/_redirects" "$PROJECT_DIR/public/" 2>/dev/null || true

# Verificar arquivos copiados
echo ""
echo "📂 Estrutura do public/:"
ls -la "$PROJECT_DIR/public/"

echo ""
echo "✅ Build concluído com sucesso!"
echo "📦 Pasta public/ pronta para deploy"

