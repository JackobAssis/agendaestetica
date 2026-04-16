# 🚀 Plano de Deploy — AgendaEstética

## Status Atual
- ✅ **Infraestrutura**: Completa (package.json, router, styles, config)
- ✅ **Autenticação**: Implementada (profissional + cliente)
- ✅ **Agenda**: Core implementado (slots, bloqueios, config)
- ✅ **Agendamentos**: Completo (solicitação, confirmação via Cloud Function, cancelamento)
- ✅ **Clientes**: Gestão completa (CRUD, histórico, observações)
- ✅ **Notificações**: In-app implementado, webhook stub
- ✅ **Segurança**: Firestore Rules + Cloud Functions
- ✅ **Tema & Monetização**: Scaffolds implementados
- ✅ **Emuladores & Testes**: Rodando com sucesso
- ✅ **App Local**: Servindo em http://localhost:8000

---

## 📋 Checklist de Deploy

### 1️⃣ Preparação

#### Pré-requisitos
- [ ] Ter uma conta Firebase ativa
- [ ] Ter um projeto Firebase criado (ou usar `demo-project`)
- [ ] Instalar Firebase CLI: `npm install -g firebase-tools` (já feito)
- [ ] Autenticar CLI: `firebase login`

#### Credenciais
- [ ] Obter credenciais reais do Firebase Console
- [ ] Atualizar [.env](.env) com valores reais
- [ ] Atualizar [src/index.html](src/index.html) com `window.APP_CONFIG.firebase`

#### Arquivos Prontos
- [ ] [firestore.rules](firestore.rules) — Regras de acesso
- [ ] [functions/index.js](functions/index.js) — Cloud Functions
- [ ] [functions/package.json](functions/package.json) — Dependências
- [ ] [vercel.json](vercel.json) — Deploy Vercel

---

### 2️⃣ Deploy Firebase (Firestore Rules + Cloud Functions)

#### Opção A: Automático via Script
```bash
# Substituir PROJECT_ID pela ID real do projeto
./scripts/deploy-firebase.sh your-firebase-project-id
```

**O script faz**:
1. Deploy das regras Firestore em `firestore.rules`
2. Deploy das Cloud Functions (`confirmAgendamento`, `createCliente`)
3. Instala dependências em `functions/`

#### Opção B: Manual (Passo a Passo)

**Deploy Regras Firestore**:
```bash
firebase deploy --only firestore:rules --project your-firebase-project-id
```

**Deploy Cloud Functions**:
```bash
cd functions
npm install
firebase deploy --only functions:confirmAgendamento,functions:createCliente --project your-firebase-project-id
cd ..
```

**Verificar Deploy**:
```bash
# Listar regras
firebase firestore:indexes:list --project your-firebase-project-id

# Listar funções
firebase functions:list --project your-firebase-project-id
```

---

### 3️⃣ Deploy Frontend (Vercel)

#### Opção A: CLI do Vercel
```bash
npm install -g vercel
vercel --prod
```

#### Opção B: GitHub Integration
1. Push para GitHub
2. Conectar repositório ao Vercel
3. Vercel auto-deploy a cada push

#### Opção C: Manual via Dashboard
1. Acesse https://vercel.com/dashboard
2. Importar projeto
3. Configurar variáveis de ambiente (.env)
4. Deploy

---

### 4️⃣ Configuração Pós-Deploy

#### Atualizar URLs
- [ ] Se Frontend não está em `http://localhost:8000`, atualizar [.env](.env)
  ```env
  VITE_APP_URL=https://seu-dominio.vercel.app
  ```

#### Configurar CORS
Se Frontend e Backend estão em domínios diferentes:
1. Firebase Console → Firestore
2. Regras: Permitir origem do frontend
   ```
   allow from list: ['https://seu-dominio.vercel.app'];
   ```

#### Testar Cloud Functions
```bash
# Obter URL da função
firebase functions:describe confirmAgendamento --project your-firebase-project-id

# Testar (exemplo)
curl -X POST https://region-project.cloudfunctions.net/confirmAgendamento \
  -H "Authorization: Bearer TOKEN" \
  -d '{"agendamentoId":"...", "decision":"confirm"}'
```

---

### 5️⃣ Checklist Final

#### Testes em Produção
- [ ] Cadastro de profissional funciona
- [ ] Login funciona
- [ ] Agenda salva e carrega
- [ ] Agendamento público funciona
- [ ] Notificações recebidas
- [ ] Tema persiste
- [ ] Sem erros no console do navegador

#### Monitoramento
- [ ] Ativar Firebase Analytics
- [ ] Configurar alertas de erros (Sentry, Rollbar, etc)
- [ ] Monitorar Cloud Function logs

#### Backup & Segurança
- [ ] Backup automático Firestore ativado
- [ ] Revisar Firestore Rules em produção
- [ ] Desativar modo de desenvolvimento
- [ ] Configurar rate limiting (se necessário)

---

## 📝 Variáveis de Ambiente (Exemplo)

### .env (Local)
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef...
NODE_ENV=production
VITE_APP_URL=https://seu-dominio.vercel.app
```

### Vercel Environment Variables
Configure as mesmas variáveis no Vercel Dashboard:
1. Settings → Environment Variables
2. Adicione cada variável
3. Marque como "Encrypted"

---

## 🔗 URLs Importantes

- **App URL**: https://seu-dominio.vercel.app
- **Firebase Console**: https://console.firebase.google.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Cloud Functions Logs**: Firebase Console → Cloud Functions
- **Firestore**: Firebase Console → Firestore Database

---

## 🚨 Troubleshooting

### Erro: "Firebase CLI not found"
```bash
npm install -g firebase-tools
firebase login
```

### Erro: "Permission denied" em regras
- Verificar `firestore.rules` — está correto?
- Verificar `proprietarioUid` está sendo setado?
- Verificar `empresaId` está no contexto?

### Cloud Function não invocada
- Verificar URL da função em `window.APP_CONFIG.createClienteFunctionUrl`
- Verificar token de autenticação está sendo enviado
- Ver logs: `firebase functions:log --follow`

### App não conecta ao Firebase real
- Verificar credenciais em `window.APP_CONFIG.firebase`
- Verificar CORS: certificar-se que domínio do frontend está autorizado
- Verificar internet connectivity

---

## ✅ Próximos Passos Automáticos

1. **Escolher Projeto Firebase**: Usar `demo-project` ou criar novo
2. **Executar Deploy Script**: `./scripts/deploy-firebase.sh <PROJECT_ID>`
3. **Configurar Vercel**: Conectar repositório
4. **Executar Testes em Produção**: Validar todos os TC-* em prod
5. **Monitoramento**: Ativar alertas e logs

---

## 📞 Suporte

Dúvidas ou problemas? Verifique:
- [PLANO-MESTRE-TECNICO.md](PLANO-MESTRE-TECNICO.md) — Arquitetura completa
- [README.md](README.md) — Setup rápido
- [GUIA-RAPIDO-DESENVOLVIMENTO.md](GUIA-RAPIDO-DESENVOLVIMENTO.md) — Dev local
- [MANUAL-TESTING-GUIDE.md](MANUAL-TESTING-GUIDE.md) — Testes manuais

