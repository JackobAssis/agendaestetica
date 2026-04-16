# TODO - Correção de Erros Firebase e Vercel

## Status: ✅ CONCLUÍDO

### Correção 1: Corrigir vercel.json ✅
- [x] Remover `cleanUrls: true`
- [x] Adicionar redirect para favicon.ico
- [x] Adicionar headers de segurança

### Correção 2: Reativar inject-config.js ✅
- [x] Atualizar script para funcionar corretamente
- [x] Garantir que o build.sh chame o script

### Correção 3: Corrigir build.sh ✅
- [x] Adicionar chamada para inject-config.js
- [x] Garantir que a configuração seja injetada no index.html

### Correção 4: Corrigir index.html ✅
- [x] Adicionar link para favicon.svg
- [x] Manter placeholder para injeção de configuração

### Correção 5: Corrigir config.js ✅
- [x] Melhorar lógica de detecção de configuração
- [x] Adicionar exports para validação

---

## Resumo das Correções Implementadas

### 1. **vercel.json**
- ✅ Removido `cleanUrls: true` que causava conflitos de roteamento
- ✅ Adicionado redirect para `/favicon.ico` → `/assets/images/favicon.svg`
- ✅ Adicionado header `X-XSS-Protection`

### 2. **scripts/inject-config.js** (novo)
- ✅ Script completo para injeção de configuração Firebase
- ✅ Suporta variáveis de ambiente do Vercel
- ✅ Fallback para `.env.local`
- ✅ Usa ES modules (compatível com o projeto)

### 3. **scripts/build.sh**
- ✅ Adicionada chamada ao `inject-config.js` após cópia dos arquivos

### 4. **index.html**
- ✅ Adicionado link para favicon SVG

### 5. **config.js**
- ✅ Lógica melhorada de detecção de configuração
- ✅ Exports: `firebaseConfig`, `firebaseConfigValid`, `firebaseDemoMode`
- ✅ Console logs claros para debugging

---

## ⚠️ RESTAÇÃO NECESSÁRIA PELO USUÁRIO

### 1. Configurar Variáveis no Vercel

Acesse: **Vercel Dashboard > Settings > Environment Variables**

Adicione as seguintes variáveis:

```
VITE_FIREBASE_API_KEY=AIzaSy........................
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:....................
```

### 2. Deploy

Após configurar as variáveis:
1. Faça um novo push para ativar redeploy automático
2. Ou vá em Vercel Dashboard > Deployments > Redeploy

### 3. Testar Localmente

```bash
# Criar arquivo .env.local com suas configurações
cp .env.example .env.local

# Editar .env.local com seus valores do Firebase

# Iniciar servidor local
./scripts/run-local.sh
```

