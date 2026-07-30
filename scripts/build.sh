#!/usr/bin/env bash
set -euo pipefail

# ==========================================
# Build Script for Vercel Deployment
# ==========================================
# Simply copies src/ to public/ for static hosting
# Firebase config is handled via import.meta.env at runtime
# ==========================================

echo "🏗️ Build AgendaEstética para Vercel"
echo "===================================="

# Detect project directories
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "📂 Diretório do projeto: $PROJECT_DIR"

# Remove and recreate public/
echo "🗑️  Limpando diretório public/..."
rm -rf "$PROJECT_DIR/public"
mkdir -p "$PROJECT_DIR/public"

# Copy root files
echo "📁 Copiando arquivos da raiz..."
cp "$PROJECT_DIR/index.html" "$PROJECT_DIR/public/"
cp "$PROJECT_DIR/config.js" "$PROJECT_DIR/public/"
cp "$PROJECT_DIR/router.js" "$PROJECT_DIR/public/"
cp "$PROJECT_DIR/_redirects" "$PROJECT_DIR/public/" 2>/dev/null || true
cp "$PROJECT_DIR/manifest.json" "$PROJECT_DIR/public/" 2>/dev/null || true
cp "$PROJECT_DIR/sw.js" "$PROJECT_DIR/public/" 2>/dev/null || true
cp -r "$PROJECT_DIR/assets" "$PROJECT_DIR/public/" 2>/dev/null || true

# Copy modules/
echo "📁 Copiando módulos..."
cp -r "$PROJECT_DIR/modules" "$PROJECT_DIR/public/"

# Copy pages/
echo "📁 Copiando páginas..."
cp -r "$PROJECT_DIR/pages" "$PROJECT_DIR/public/"

# Copy styles/
echo "📁 Copiando estilos..."
cp -r "$PROJECT_DIR/styles" "$PROJECT_DIR/public/"

# Verify copied files
echo ""
echo "📂 Estrutura do public/:"
find "$PROJECT_DIR/public" -maxdepth 2 -type f -name "*.js" -o -name "*.html" | head -20

# Inject Firebase configuration
echo ""
echo "🔧 Injetando configuração do Firebase..."
cd "$SCRIPT_DIR"
node inject-config.js

echo ""
echo "✅ Build concluído com sucesso!"
echo "📦 Pasta public/ pronta para deploy"
echo ""
echo "💡 Firebase config foi injetado via inject-config.js"

