# 🏗️ Arquitetura Técnica - AgendaEstética

Este documento descreve a arquitetura técnica da plataforma AgendaEstética.

## 🎯 Princípios Arquiteturais

- **Simplicidade**: Uso de tecnologias web padrão (HTML, CSS, JS)
- **Escalabilidade**: Suporte a múltiplos profissionais (multi-tenant)
- **Isolamento**: Dados completamente isolados por profissional
- **Baixo custo**: Firebase + Vercel (gratuito para MVP)
- **Manutenibilidade**: Código modular e bem documentado

## 🧱 Stack Tecnológico

### Frontend
- **HTML5**: Estrutura semântica
- **CSS3**: Estilos com variáveis CSS para temas
- **JavaScript ES6+**: Lógica client-side, módulos

### Backend (BaaS)
- **Firebase Authentication**: Autenticação segura
- **Firestore**: Banco NoSQL em tempo real
- **Firebase Storage**: Upload de imagens (futuro)

### Infraestrutura
- **Vercel**: Hosting e CDN
- **Firebase Hosting**: Opção alternativa

### Desenvolvimento
- **npm**: Gerenciamento de dependências
- **Mocha/Chai**: Testes automatizados
- **ESLint**: Linting de código

## 📁 Estrutura de Arquivos

```
agendaestetica/
├── pages/              # Páginas HTML
│   ├── index.html      # Landing page
│   ├── login.html      # Autenticação
│   ├── dashboard.html  # Dashboard profissional
│   ├── agenda.html     # Gestão da agenda
│   ├── agendamentos.html # CRUD agendamentos
│   ├── clientes.html   # Gestão clientes
│   ├── notificacoes.html # Centro notificações
│   └── pagina-cliente.html # Portal público
├── modules/            # Módulos JavaScript
│   ├── firebase.js     # Config Firebase
│   ├── auth.js         # Autenticação
│   ├── agenda.js       # Lógica da agenda
│   ├── agendamentos.js # CRUD compromissos
│   ├── clientes.js     # Gestão clientes
│   ├── notifications.js # Sistema notificações
│   └── router.js       # SPA routing
├── styles/             # CSS
│   ├── main.css        # Estilos globais
│   ├── themes.css      # Temas personalizáveis
│   └── components.css  # Componentes UI
├── tests/              # Testes
│   ├── auth.test.js    # Testes autenticação
│   ├── agenda.test.js  # Testes agenda
│   └── agendamentos.test.js # Testes CRUD
├── public/             # Assets estáticos
│   ├── icons/          # Ícones
│   └── images/         # Imagens
├── docs/               # Documentação
└── config.js           # Configurações Firebase
```

## 🔐 Autenticação e Autorização

### Firebase Auth
- **Métodos**: Email/senha, telefone (opcional)
- **Roles**: Profissional (admin), Cliente (read-only)
- **Sessões**: Persistidas automaticamente

### Controle de Acesso
- **Profissional**: Acesso total à própria empresa
- **Cliente**: Acesso apenas aos próprios dados
- **Público**: Visualização da página profissional

## 📊 Modelo de Dados (Firestore)

### Estrutura Multi-tenant

```
empresas/{empresaId}/
├── configuracao/       # Config da empresa
│   ├── horarios        # Dias/horários trabalho
│   ├── servicos        # Serviços oferecidos
│   ├── tema            # Personalização visual
│   └── notificacoes    # Config notificações
├── agendamentos/       # Compromissos
├── clientes/           # Dados clientes
├── notificacoes/       # Alertas sistema
└── remarcacoes/        # Solicitações troca

usuarios/{userId}/
└── perfil              # Dados usuário
```

### Regras de Segurança

```javascript
// Profissional só acessa própria empresa
match /empresas/{empresaId} {
  allow read, write: if request.auth != null &&
    get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.empresaId == empresaId;
}

// Cliente só acessa próprios dados
match /empresas/{empresaId}/agendamentos/{agendamentoId} {
  allow read: if request.auth != null &&
    resource.data.clienteId == request.auth.uid;
}
```

## 🔄 Fluxos de Dados

### Agendamento por Cliente

1. Cliente acessa página pública
2. Seleciona data/horário disponível
3. Sistema cria agendamento "pendente"
4. Profissional recebe notificação
5. Profissional confirma/rejeita
6. Cliente é notificado do status

### Remarcação

1. Cliente solicita troca via portal
2. Sistema cria documento em `remarcacoes`
3. Profissional aprova/rejeita
4. Atualização transacional do agendamento
5. Notificações para ambas as partes

## 🎨 Personalização (Temas)

- **CSS Variables**: Cores dinâmicas
- **Firestore**: Configurações persistidas
- **Real-time**: Aplicação instantânea

```css
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --background-color: #ffffff;
}
```

## 📱 Responsividade

- **Mobile-first**: Design otimizado para mobile
- **Breakpoints**: Tablet (768px), Desktop (1024px)
- **Touch-friendly**: Botões e navegação adequados

## 🧪 Testes

### Estratégia
- **Unitários**: Funções isoladas
- **Integração**: Firebase Emulator
- **E2E**: Cypress (futuro)
- **Manuais**: Casos críticos documentados

### Cobertura
- Autenticação e autorização
- CRUD agendamentos
- Lógica da agenda
- Notificações
- Temas e personalização

## 🚀 Deployment

### Vercel
- **Build**: npm run build
- **Static**: Servir arquivos HTML/JS/CSS
- **Environment**: Variáveis Firebase
- **Domains**: agendaestetica.com

### CI/CD
- **GitHub Actions**: Testes automáticos
- **Branches**: main (produção), develop (staging)
- **Releases**: Versionamento semântico

## 🔍 Monitoramento

### Firebase
- **Analytics**: Uso da plataforma
- **Crashlytics**: Erros JavaScript
- **Performance**: Métricas de carregamento

### Vercel
- **Analytics**: Tráfego e performance
- **Logs**: Erros de build/deploy

## 🔧 Manutenção

### Atualizações
- **Firebase SDK**: Manter atualizado
- **Dependências**: npm audit regular
- **Browser Support**: Modern browsers

### Backup
- **Firestore**: Export automático
- **Storage**: Versionamento de arquivos
- **Código**: Git versioning

---

Esta arquitetura garante um MVP robusto, escalável e de baixo custo, pronto para produção.