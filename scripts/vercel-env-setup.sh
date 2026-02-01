#!/bin/bash
# Setup Vercel Environment Variables Script
# Execute: bash scripts/vercel-env-setup.sh

echo "🚀 AgendaEstética - Vercel Environment Setup"
echo "============================================="

# Check if vercel CLI is available
if ! command -v vercel &> /dev/null && ! command -v npx &> /dev/null; then
    echo "❌ Vercel CLI not found. Please install it first:"
    echo "   npm install -g vercel"
    exit 1
fi

# Check if logged in
echo "📋 Checking Vercel authentication..."
VERCEL_CMD="npx vercel"
if ! $VERCEL_CMD whoami &> /dev/null; then
    echo "⚠️  Not logged in to Vercel."
    echo "   Please run: vercel login"
    echo "   Then execute this script again."
    exit 1
fi

echo "✅ Logged in as: $($VERCEL_CMD whoami)"

# List environment variables to add
echo ""
echo "📝 Adding Firebase environment variables to Vercel..."

$VERCEL_CMD env add VITE_FIREBASE_API_KEY <<< 'AIzaSyDj3cSnhFusveRRzCm8OGOIboiqQjCYy94' 2>/dev/null || true
$VERCEL_CMD env add VITE_FIREBASE_AUTH_DOMAIN <<< 'agendaestetica-fe8b9.firebaseapp.com' 2>/dev/null || true
$VERCEL_CMD env add VITE_FIREBASE_PROJECT_ID <<< 'agendaestetica-fe8b9' 2>/dev/null || true
$VERCEL_CMD env add VITE_FIREBASE_STORAGE_BUCKET <<< 'agendaestetica-fe8b9.firebasestorage.app' 2>/dev/null || true
$VERCEL_CMD env add VITE_FIREBASE_MESSAGING_SENDER_ID <<< '735305856969' 2>/dev/null || true
$VERCEL_CMD env add VITE_FIREBASE_APP_ID <<< '1:735305856969:web:9d28f77af9d302f2699a18' 2>/dev/null || true

echo ""
echo "✅ Firebase environment variables configured!"
echo ""
echo "🔄 Redeploy your project to apply changes:"
echo "   vercel --prod"

