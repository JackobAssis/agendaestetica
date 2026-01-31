# 🚀 Guia de Deploy — AgendaEstética no Vercel

## ✅ Problema Resolvido

O deploy anterior falhava porque o Vercel espera que os arquivos estáticos estejam na pasta `public/` (não `src/`).

### Solução implementada:
- Criada pasta `public/`
- Criado script `scripts/build.sh` que copia `src/*` → `public/`
- Atualizado `vercel.json` para usar o build script

---

## 📋 Checklist Pré-Deploy

- [x] Pasta `public/` criada
- [x] Script `scripts/build.sh` configurado
- [x] `vercel.json` atualizado com outputDirectory: "public"
- [x] Build local testado com sucesso
- [x] Variáveis de ambiente configuradas no Vercel

---

## 🔧 Configuração no Vercel

### 1. Variáveis de Ambiente

No dashboard do Vercel, configure as seguintes variáveis:

| Variável | Valor | Proteção |
|----------|-------|----------|
| `VITE_FIREBASE_API_KEY` | Sua chave API do Firebase | 🔒 Sensitive |
| `VITE_FIREBASE_AUTH_DOMAIN` | `seu-projeto.firebaseapp.com` | 🔒 Sensitive |
| `VITE_FIREBASE_PROJECT_ID` | ID do projeto Firebase | 🔒 Sensitive |
| `VITE_FIREBASE_STORAGE_BUCKET` | `seu-projeto.appspot.com` | 🔒 Sensitive |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender ID do Firebase | 🔒 Sensitive |
| `VITE_FIREBASE_APP_ID` | App ID do Firebase | 🔒 Sensitive |

### 2. Configurações do Projeto

No Vercel Dashboard:
- **Framework Preset:** Other
- **Build Command:** `./scripts/build.sh`
- **Output Directory:** `public`
- **Install Command:** `npm install`

---

## 🏗️ Fazendo Deploy

### **Deploy Automático (Git)**

```bash
# Commit das alterações
git add .
git commit -m "Fix: Configuração de deploy para Vercel com pasta public"
git push origin main

# O Vercel faz deploy automático
```

### **Deploy Manual (Vercel CLI)**

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy
vercel --prod
```

### **Deploy Local (Teste)**

```bash
# Executar build localmente
./scripts/build.sh

# Iniciar servidor local com a pasta public
npx http-server public -p 8000
```

---

## 📁 Estrutura de Arquivos para Deploy

```
agendaestetica/
├── public/                    ⬅️ Pasta de output (copiada do src/)
│   ├── index.html
│   ├── config.js
│   ├── router.js
│   ├── _redirects
│   ├── assets/
│   ├── modules/
│   ├── pages/
│   └── styles/
├── src/                      ⬅️ Código fonte original
├── scripts/
│   └── build.sh              ⬅️ Script de build
├── vercel.json               ⬅️ Configuração Vercel
└── package.json
```

---

## 🐛 Troubleshooting

### **Erro: "No Output Directory"**
```
Error: The "outputDirectory" directory does not exist
```
**Solução:** Execute o build localmente primeiro:
```bash
./scripts/build.sh
```

### **Erro: Firebase Configuration**
```
Firebase Configuration Error: Missing configuration fields
```
**Solução:** Configure as variáveis de ambiente no Vercel Dashboard.

### **Erro: 404 em rotas**
As rotas SPA não estão funcionando.
**Solução:** Verifique se o arquivo `_redirects` está na pasta `public/`:
```bash
cat public/_redirects
# Deve mostrar:
# /*  /index.html  200
```

### **Erro: Assets não carregam**
```
Failed to load resource: net::ERR_FILE_NOT_FOUND
```
**Solução:** Verifique se o build copiou todos os arquivos:
```bash
ls -la public/
```

---

## 🔒 Segurança

### **Nunca commitar:**
- `.env` (contém chaves sensíveis)
- Pasta `public/` (gerada automaticamente)
- Pasta `.firebase/` (se existir)

### **Sempre usar:**
- `@firebase_api_key` nas variáveis Vercel (referência segura)
- HTTPS (Vercel fornece automaticamente)

---

## 📈 Próximos Passos

1. ✅ Configurar variáveis de ambiente no Vercel
2. ✅ Fazer push para `main` (deploy automático)
3. ✅ Testar em produção
4. 🔄 Configurar domínio personalizado (opcional)

---

**Versão:** 1.0.0  
**Última atualização:** Janeiro 2026

