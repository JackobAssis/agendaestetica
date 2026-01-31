# 📋 Checklist de Deploy — Passos Detalhados

## ✅ Progresso Atual

| Etapa | Status | Observações |
|-------|--------|-------------|
| Repositório GitHub | ✅ Conectado | https://github.com/JackobAssis/agendaestetica |
| Código Commitado | ✅ Feito | Emulators, testes e guias adicionados |
| Emuladores | ✅ Rodando | Firestore, Auth, Functions |
| App Local | ✅ Rodando | http://localhost:8000 |
| **Testes Manuais** | ⏳ Pendente | TC-021 a TC-050 precisam ser executados |
| **Firebase Deploy** | ⏳ Pendente | Requer autenticação + projeto real |
| **Vercel Deploy** | ⏳ Pendente | Requer conexão GitHub + account Vercel |

---

## 🔐 Passo 1: Autenticar Firebase CLI

### 1.1 Fazer Login no Firebase
```bash
cd "/home/jackob/Arquivos Dev/agendaestetica"
npx firebase login
```

**O que vai acontecer:**
1. Browser abrirá: https://accounts.google.com/
2. Faça login com sua conta Google (a mesma usada no Firebase)
3. Autorize o Firebase CLI
4. Volta ao terminal: `✓ Success! Logged in as...`

### 1.2 Verificar Projetos Disponíveis
```bash
npx firebase projects:list
```

**Esperado**: Lista de seus projetos Firebase

---

## 🏗️ Passo 2: Escolher/Criar Projeto Firebase

### Opção A: Usar Projeto Existente (Recomendado)
Se você já tem um projeto Firebase em produção:
```bash
npx firebase use seu-projeto-id
```

### Opção B: Usar demo-project (Desenvolvimento)
Para testes iniciais:
```bash
npx firebase use demo-project
```

### Opção C: Criar Novo Projeto
Se quiser um projeto novo:
1. Acesse: https://console.firebase.google.com
2. Clique "Criar Projeto"
3. Nome: `agendaestetica` ou similar
4. Não ativar Google Analytics (por enquanto)
5. Criar projeto
6. Copiar o `PROJECT_ID`

Depois use:
```bash
npx firebase use seu-novo-projeto-id
```

---

## 📝 Passo 3: Atualizar Credenciais

### 3.1 Copiar Credenciais do Firebase
1. Acesse: https://console.firebase.google.com
2. Selecione seu projeto
3. Vá para: Project Settings (⚙️) → Service Accounts
4. Clique "Generate New Private Key" → Baixe o arquivo JSON
5. Abra o arquivo JSON e copie as credenciais

### 3.2 Atualizar .env
```bash
# Abra .env
vim .env

# Atualize:
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef
```

**Como obter cada valor:**
- `apiKey`: Firebase Console → Project Settings → Web API Key
- `authDomain`: `{projectId}.firebaseapp.com`
- `projectId`: Firebase Console → Project Settings → Project ID
- `storageBucket`: `{projectId}.appspot.com`
- `messagingSenderId`: Firebase Console → Project Settings → Project Number
- `appId`: Firebase Console → Project Settings → App ID

### 3.3 Atualizar src/index.html
```bash
# Abra src/index.html
vim src/index.html

# Encontre:
<script>
window.APP_CONFIG = {
    firebase: {
        apiKey: "...",
        authDomain: "...",
        // ... etc
    }
};
</script>

# E atualize com os mesmos valores do .env
```

---

## 🚀 Passo 4: Deploy Firebase (Regras + Functions)

### 4.1 Executar Script de Deploy
```bash
cd "/home/jackob/Arquivos Dev/agendaestetica"

# Use seu PROJECT_ID real
npx ./scripts/deploy-firebase.sh seu-projeto-id
```

**O script faz:**
1. ✅ Deploy Firestore Rules (`firestore.rules`)
2. ✅ Deploy Cloud Functions (`confirmAgendamento`, `createCliente`)

### 4.2 Verificar Deploy
```bash
# Listar Firestore Rules
npx firebase firestore:indexes:list --project seu-projeto-id

# Listar Cloud Functions
npx firebase functions:list --project seu-projeto-id

# Ver logs das funções
npx firebase functions:log --follow --project seu-projeto-id
```

---

## 🌐 Passo 5: Deploy Vercel

### 5.1 Conectar GitHub ao Vercel
1. Acesse: https://vercel.com/new
2. Clique "Import Git Repository"
3. Conecte sua conta GitHub
4. Selecione: `JackobAssis/agendaestetica`
5. Clique "Import"

### 5.2 Configurar Variáveis de Ambiente
Na página de setup do Vercel:
1. Clique "Environment Variables"
2. Adicione cada variável do `.env`:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `NODE_ENV=production`
   - `VITE_APP_URL=https://seu-dominio.vercel.app`

3. Clique "Deploy"

### 5.3 Verificar Deploy Vercel
```bash
# Vercel vai mostrar:
# ✓ Production: https://seu-dominio.vercel.app
# ✓ Deployments com auto-updates em cada push

# Você pode ver no dashboard:
https://vercel.com/dashboard
```

---

## ✅ Passo 6: Testes em Produção

### 6.1 Validar App em Produção
1. Abra: https://seu-dominio.vercel.app
2. Verifique console do navegador (F12)
3. Não deve ter erros de Firebase
4. App deve carregar normalmente

### 6.2 Executar Testes Manuais (TC-021 a TC-050)

#### TC-025: Cliente Solicita Agendamento (Público)
1. Acesse: https://seu-dominio.vercel.app/#/agendar/[profissionalId]
2. Selecione um slot
3. Preencha dados
4. Clique "Solicitar Agendamento"
5. **Esperado**: Agendamento criado com status "solicitado" ✅

#### TC-027: Profissional Confirma Agendamento
1. Faça login como profissional
2. Vá para dashboard
3. Clique em "Agendamentos Pendentes"
4. Clique em um agendamento "solicitado"
5. Clique "Confirmar"
6. **Esperado**: Status muda para "confirmado" via Cloud Function ✅

#### TC-033: Cliente Criado Automaticamente
1. Cliente solicita agendamento (novo email)
2. Acesse Firestore Console
3. Vá para: `empresas/{empresaId}/clientes`
4. **Esperado**: Cliente criado automaticamente via `createCliente` function ✅

### 6.3 Verificar Logs
```bash
# Logs do Cloud Function
npx firebase functions:log --follow --project seu-projeto-id

# Esperado ver:
# [confirmAgendamento] Agendamento XXX confirmado
# [createCliente] Cliente YYY criado
```

---

## 🔗 Links Úteis

| Recurso | URL |
|---------|-----|
| Seu App | https://seu-dominio.vercel.app |
| Repositório | https://github.com/JackobAssis/agendaestetica |
| Firebase Console | https://console.firebase.google.com |
| Firestore Database | https://console.firebase.google.com/firestore |
| Cloud Functions | https://console.firebase.google.com/functions |
| Vercel Dashboard | https://vercel.com/dashboard |

---

## 📊 Checklist Final

- [ ] Firebase login executado (`npx firebase login`)
- [ ] Projeto Firebase selecionado (`npx firebase use PROJECT_ID`)
- [ ] Credenciais atualizadas em `.env`
- [ ] Credenciais atualizadas em `src/index.html`
- [ ] Firestore Rules deployed
- [ ] Cloud Functions deployed
- [ ] Vercel conectado ao GitHub
- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] App acessível em https://seu-dominio.vercel.app
- [ ] Testes TC-025, TC-027, TC-033 passando
- [ ] Sem erros no console do navegador
- [ ] Logs das Cloud Functions visíveis

---

## 🚨 Troubleshooting

### Erro: "firebase: command not found"
```bash
cd "/home/jackob/Arquivos Dev/agendaestetica"
npx firebase login  # Use npx
```

### Erro: "Authentication failed"
1. Certifique-se que está logado: `npx firebase login`
2. Verificar se projeto existe: `npx firebase projects:list`

### Erro: "Function not deployed"
1. Verificar se credentials estão corretas
2. Ver logs: `npx firebase functions:log`
3. Redeployer: `npx ./scripts/deploy-firebase.sh seu-projeto-id`

### App em Vercel mostra "Firebase not initialized"
1. Verificar variáveis de ambiente no Vercel Dashboard
2. Aguardar rebuild automático (2-3 min)
3. Se persistir, fazer push para GitHub (trigger novo build)

### Cloud Function retorna 403 Unauthorized
1. Verificar token de autenticação
2. Verificar `proprietarioUid` nos dados
3. Ver regras Firestore: estão permitindo a função?

---

## ⏭️ Próximos Passos

1. **Agora**: Execute os passos 1-6 acima em ordem
2. **Depois**: Rode testes TC-021 a TC-050 em produção
3. **Monitoramento**: Configure alertas no Firebase Console
4. **Backup**: Ative backup automático do Firestore
5. **Analytics**: Configure Google Analytics (FASE 10)

---

**Precisa de ajuda?** Verifique:
- [PLANO-DEPLOY.md](PLANO-DEPLOY.md) — Guia geral
- [MANUAL-TESTING-GUIDE.md](MANUAL-TESTING-GUIDE.md) — Testes
- [PLANO-MESTRE-TECNICO.md](PLANO-MESTRE-TECNICO.md) — Arquitetura

