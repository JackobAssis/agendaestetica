# Firebase Configuration Guide
# ============================
#
# ERRO: auth/api-key-not-valid
#
# CAUSA: As variáveis de ambiente do Firebase não estão configuradas
#        ou a API Key não corresponde ao Project ID.
#
# SOLUÇÃO: Configure as seguintes variáveis no Vercel Dashboard
# ============================================================

# Instruções para configurar no Vercel:
# 1. Acesse https://vercel.com/dashboard
# 2. Selecione seu projeto "agendaestetica"
# 3. Vá em Settings > Environment Variables
# 4. Adicione as seguintes variáveis (敏感 Sensitive = true para API Key):

# ==============================================================================
# VARIÁVEIS DE AMBIENTE - COPIE E COLOQUE NO VERCEL
# ==============================================================================

# Vá em Firebase Console > Project Settings > General > Your apps > Web app
# Clique em "</>" (Web app configuration) e copie os valores

VITE_FIREBASE_API_KEY=AIzaSy........................
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:....................

# ==============================================================================
# VERIFICAÇÕES IMPORTANTES
# ==============================================================================

# 1. Verifique se o Authentication está habilitado:
#    - Firebase Console > Authentication > Sign-in method
#    - Verifique se "Email/Password" está habilitado (habilitado por padrão)

# 2. Verifique se o Project ID está correto:
#    - Firebase Console > Project Settings > General
#    - O Project ID deve corresponder ao valor em VITE_FIREBASE_PROJECT_ID

# 3. Verifique se a API Key pertence ao projeto:
#    - Firebase Console > Project Settings > Your apps > Web app
#    - A API Key mostrada deve corresponder ao VITE_FIREBASE_API_KEY

# ==============================================================================
# TESTE LOCAL
# ==============================================================================

# Para testar localmente, crie um arquivo .env.local na raiz:
cp .env.example .env.local

# Edite .env.local com suas configurações do Firebase

# ==============================================================================
# DEPLOY
# ==============================================================================

# Após configurar as variáveis no Vercel:
# 1. Redeploy: Vercel Dashboard > Deployments > Redeploy
# 2. Ou faça um novo push para ativar o deploy automático

