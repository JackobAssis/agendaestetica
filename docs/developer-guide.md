# 👨‍💻 Guia do Desenvolvedor - AgendaEstética

Este guia fornece informações técnicas para desenvolvedores que trabalham no projeto AgendaEstética.

## 🏗️ Arquitetura do Sistema

### Stack Tecnológico

- **Frontend**: Vanilla JavaScript (ES6+)
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Hosting**: Vercel
- **Testes**: Mocha + Chai
- **Build**: npm scripts

### Estrutura Multi-tenant

- Cada profissional tem uma "empresa" própria
- Dados isolados por `empresaId`
- Schema Firestore otimizado para queries

### Módulos Principais

- **Autenticação**: Firebase Auth com roles (profissional/cliente)
- **Agenda**: Gerenciamento de slots e horários
- **Agendamentos**: CRUD de compromissos
- **Clientes**: CRM básico
- **Notificações**: Sistema de alertas
- **Temas**: Personalização visual

## 📁 Estrutura de Pastas

```
agendaestetica/
├── pages/              # Páginas da aplicação
│   ├── index.html      # Landing page
│   ├── login.html      # Login/cadastro
│   ├── dashboard.html  # Dashboard profissional
│   ├── agenda.html     # Visualização da agenda
│   ├── agendamentos.html # Gestão de agendamentos
│   ├── clientes.html   # Gestão de clientes
│   ├── notificacoes.html # Centro de notificações
│   └── pagina-cliente.html # Portal do cliente
├── modules/            # Módulos JavaScript
│   ├── firebase.js     # Configuração Firebase
│   ├── auth.js         # Autenticação
│   ├── agenda.js       # Lógica da agenda
│   ├── agendamentos.js # CRUD agendamentos
│   ├── clientes.js     # Gestão clientes
│   ├── notifications.js # Notificações
│   └── router.js       # Roteamento SPA
├── styles/             # CSS
├── tests/              # Testes automatizados
├── public/             # Assets estáticos
├── docs/               # Documentação
└── config.js           # Configurações
```

## 🔧 Configuração do Ambiente

### Firebase Setup

1. Crie projeto no Firebase Console
2. Ative Authentication, Firestore, Storage
3. Configure regras de segurança
4. Copie SDK config para `config.js`

### Dependências

```json
{
  "dependencies": {
    "firebase": "^9.22.0"
  },
  "devDependencies": {
    "mocha": "^10.2.0",
    "chai": "^4.3.7"
  }
}
```

## 🧪 Testes

### Testes Automatizados

```bash
# Executar todos os testes
npm test

# Testes específicos
npx mocha tests/auth.test.js
npx mocha tests/agenda.test.js
```

### Testes Manuais

Consulte `docs/testing.md` para casos de teste obrigatórios.

## 🚀 Deployment

### Vercel

1. Conecte repositório GitHub
2. Configure build settings
3. Adicione variáveis de ambiente
4. Deploy automático

### Firebase

- Regras de segurança já configuradas
- Indexes automáticos
- Backup recomendado

## 📊 Estrutura do Firestore

### Collections Principais

```
empresas/{empresaId}
├── horarios (configuração da agenda)
├── servicos (serviços oferecidos)
├── agendamentos (compromissos)
├── clientes (dados dos clientes)
├── notificacoes (alertas do sistema)
└── configuracao (tema, personalização)

usuarios/{userId}
└── perfil (dados do usuário)
```

### Regras de Segurança

- Profissionais só acessam dados da própria empresa
- Clientes só acessam próprios agendamentos
- Validações em nível de documento

## 🔄 Fluxos Críticos

### 1. Cadastro de Profissional

1. Validação de email único
2. Criação automática de empresa
3. Onboarding obrigatório
4. Redirecionamento para dashboard

### 2. Agendamento por Cliente

1. Validação de slot disponível
2. Criação de agendamento pendente
3. Notificação para profissional
4. Confirmação manual

### 3. Remarcação

1. Cliente solicita troca
2. Profissional aprova/reprova
3. Atualização transacional
4. Notificações para ambas as partes

## 🐛 Debugging

### Ferramentas

- Firebase Emulator para desenvolvimento
- Console do navegador
- Logs do Vercel
- Firebase Debug View

### Comandos Úteis

```bash
# Iniciar emulador
npx firebase emulators:start

# Executar testes
npm test

# Build de produção
npm run build
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie branch para feature
3. Commit seguindo convenções
4. Abra Pull Request
5. Aguarde review

### Convenções de Código

- ESLint configurado
- Prettier para formatação
- Commits em português
- Testes obrigatórios

## 📚 Referências

- [Firebase Documentation](https://firebase.google.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Vanilla JS Best Practices](https://developer.mozilla.org)

---

Para documentação de usuário, consulte `docs/user-guide.md`.