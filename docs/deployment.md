# 🚀 Guia de Deployment - AgendaEstética

Este guia explica como fazer deploy da plataforma AgendaEstética em produção.

## 🌐 Opções de Hosting

### Vercel (Recomendado)

Vercel oferece deploy automático, CDN global e integração GitHub perfeita.

#### Pré-requisitos

- Conta no [Vercel](https://vercel.com)
- Repositório no GitHub
- Projeto Firebase configurado

#### Configuração

1. **Conecte o repositório**:
   - Importe projeto do GitHub
   - Configure branch principal (main)

2. **Variáveis de ambiente**:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

3. **Build settings**:
   - **Framework Preset**: Other
   - **Build Command**: `./scripts/build.sh`
   - **Output Directory**: `public`
   - **Install Command**: `npm install`

#### Deploy Automático

- Push para branch main → deploy automático
- Preview deployments para pull requests
- Rollback instantâneo se necessário

### Firebase Hosting (Alternativa)

1. Instale Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Faça login:
   ```bash
   firebase login
   ```

3. Configure projeto:
   ```bash
   firebase use --add
   ```

4. Deploy:
   ```bash
   firebase deploy --only hosting
   ```

## 🔥 Configuração do Firebase

### Projeto Firebase

1. Crie projeto no [Firebase Console](https://console.firebase.google.com)
2. Ative serviços:
   - Authentication
   - Firestore Database
   - Storage (opcional)
   - Hosting (se usar Firebase Hosting)

### Regras de Segurança

Deploy as regras de Firestore:

```bash
firebase deploy --only firestore:rules
```

### Indexes

Se necessário, deploy indexes:

```bash
firebase deploy --only firestore:indexes
```

## 🧪 Pré-deploy Checklist

- [ ] Todos os testes passando (`npm test`)
- [ ] Build local funcionando (`npm run build`)
- [ ] Variáveis de ambiente configuradas
- [ ] Firebase rules atualizadas
- [ ] Backup de dados (se produção)
- [ ] Documentação atualizada

## 🚦 Pós-deploy Verificações

### Funcionalidades Críticas

1. **Landing page** carrega corretamente
2. **Cadastro de profissional** funciona
3. **Login** autentica usuários
4. **Dashboard** exibe dados
5. **Agendamento** cria compromissos
6. **Notificações** são enviadas

### Performance

- Lighthouse score > 90
- First Contentful Paint < 2s
- Time to Interactive < 3s

### Segurança

- HTTPS habilitado
- Firebase rules ativas
- Variáveis sensíveis protegidas

## 🔄 Estratégia de Releases

### Versionamento

- **Semântico**: MAJOR.MINOR.PATCH
- **Tags Git**: v1.0.0, v1.1.0, etc.
- **Changelog**: Atualizar `docs/changelog.md`

### Ambientes

- **Development**: Branch develop
- **Staging**: Branch staging ou preview deploy
- **Production**: Branch main

### Rollback

- Vercel: Rollback via dashboard
- Firebase: Deploy versão anterior
- Database: Backup restoration

## 📊 Monitoramento

### Vercel Analytics

- Tráfego e performance
- Erros de JavaScript
- Core Web Vitals

### Firebase

- Authentication logs
- Firestore usage
- Storage metrics

### Alertas

- Configure alertas para:
  - Erros 5xx
  - Latência alta
  - Uso excessivo de recursos

## 🛠️ Troubleshooting

### Problemas Comuns

#### Build falha
- Verifique `scripts/build.sh`
- Confirme dependências em `package.json`
- Teste build local: `npm run build`

#### Firebase não conecta
- Verifique variáveis de ambiente
- Confirme projeto Firebase ativo
- Teste conexão local

#### Performance ruim
- Otimize imagens
- Minimize JavaScript/CSS
- Configure cache headers

#### Erro 404
- Verifique `vercel.json`
- Confirme arquivos em `public/`
- Teste rotas SPA

## 📞 Suporte

- **Vercel Docs**: https://vercel.com/docs
- **Firebase Docs**: https://firebase.google.com/docs
- **GitHub Issues**: Para bugs específicos

---

Para desenvolvimento local, consulte `docs/getting-started.md`.