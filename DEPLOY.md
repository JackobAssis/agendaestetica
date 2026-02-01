# 🚀 Deploy no Vercel — AgendaEstética

## Configuração Rápida

### 1. Criar novo projeto no Vercel

1. Acesse: https://vercel.com/new
2. Selecione **"Import Git Repository"**
3. Escolha o repositório `agendaestetica`
4. Configure o projeto:

   | Campo | Valor |
   |-------|-------|
   | Framework Preset | **Other** ou **Static** |
   | Build Command | **Vazio** (ou `echo "No build needed"`) |
   | Output Directory | **.** (ponto, raiz do projeto) |
   | Install Command | **Vazio** |

5. Clique em **Deploy**

### 2. Variáveis de Ambiente

No Dashboard do Vercel, adicione as variáveis:

```
VITE_FIREBASE_API_KEY= sua_api_key
VITE_FIREBASE_AUTH_DOMAIN= seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID= seu_projeto_id
VITE_FIREBASE_STORAGE_BUCKET= seu_projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID= seu_sender_id
VITE_FIREBASE_APP_ID= seu_app_id
```

### 3. Configurações do Projeto (vercel.json)

O arquivo `vercel.json` já está configurado:

```json
{
  "framework": "static",
  "buildCommand": null,
  "outputDirectory": ".",
  "cleanUrls": true,
  "rewrites": [
    { "source": "/((?!assets/|modules/|pages/|styles/|favicon\\.ico).*)", "destination": "/index.html" }
  ]
}
```

### 4. Estrutura de Arquivos

```
agendaestetica/
├── index.html          ✅ Entry point
├── router.js           ✅ Roteamento SPA
├── config.js           ✅ Firebase config
├── modules/            ✅ Módulos JS
│   ├── auth.js
│   ├── permissions.js
│   ├── agenda.js
│   ├── agendamentos.js
│   ├── clientes.js
│   ├── theme.js
│   └── notifications.js
├── pages/              ✅ Páginas HTML
│   ├── login.html
│   ├── dashboard.html
│   ├── onboarding.html
│   ├── agenda.html
│   └── ...
├── styles/             ✅ CSS
└── assets/             ✅ Ícones e imagens
```

---

## 🔒 Segurança

**NUNCA commite o arquivo `.env`**

O projeto já inclui:
- ✅ `.gitignore` bloqueia `.env`
- ✅ `.env.example` como template
- ✅ Config carrega de `window.APP_CONFIG.firebase` ou variáveis de ambiente

---

## 🧪 Testar Localmente

```bash
# Instalar http-server (uma vez)
npm install -g http-server

# Rodar localmente
http-server . -p 8080

# Acessar http://localhost:8080
```

---

## 📋 Solução de Problemas

### Erro 404 nas páginas
- Verifique se `vercel.json` tem os rewrites corretos
- Certifique-se que o framework está como "Static" ou "Other"

### Firebase não conecta
- Verifique as variáveis de ambiente no Dashboard Vercel
- Execute `vercel env pull` para sincronizar variáveis localmente

### Arquivos não carregam
- Verifique se os caminhos começam com `/` (absolutos)
- Exemplo: `/pages/login.html` e não `pages/login.html`

---

## 🌐 URLs do Projeto

- **Produção:** `https://agendaestetica.vercel.app` (após deploy)
- **GitHub:** https://github.com/JackobAssis/agendaestetica

---

**Última atualização:** Fevereiro 2026

