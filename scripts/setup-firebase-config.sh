#!/bin/bash
# Setup Firebase Configuration Script
# Execute: bash scripts/setup-firebase-config.sh

echo "📋 AgendaEstética - Firebase Configuration Setup"
echo "================================================"

# Backup existing .env.local if it exists
if [ -f .env.local ]; then
    echo "📁 Backing up existing .env.local to .env.local.backup"
    cp .env.local .env.local.backup
fi

# Create .env.local with real Firebase config
cat > .env.local << 'EOF'
# Firebase Configuration - Desenvolvimento Local
# Valores reais do Firebase Console - Gerado automaticamente

VITE_FIREBASE_API_KEY=AIzaSyDj3cSnhFusveRRzCm8OGOIboiqQjCYy94
VITE_FIREBASE_AUTH_DOMAIN=agendaestetica-fe8b9.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=agendaestetica-fe8b9
VITE_FIREBASE_STORAGE_BUCKET=agendaestetica-fe8b9.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=735305856969
VITE_FIREBASE_APP_ID=1:735305856969:web:9d28f77af9d302f2699a18
EOF

echo "✅ .env.local created with Firebase configuration"
echo ""
echo "📝 Para produção, configure no Vercel Dashboard:"
echo "   Settings > Environment Variables"
echo ""
echo "Variáveis necessárias:"
echo "  - VITE_FIREBASE_API_KEY"
echo "  - VITE_FIREBASE_AUTH_DOMAIN"
echo "  - VITE_FIREBASE_PROJECT_ID"
echo "  - VITE_FIREBASE_STORAGE_BUCKET"
echo "  - VITE_FIREBASE_MESSAGING_SENDER_ID"
echo "  - VITE_FIREBASE_APP_ID"
echo ""
echo "🚀 Execute 'npm run dev' para testar!"

