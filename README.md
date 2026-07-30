# 🚀 AgendaEstética

**Plataforma SaaS de agenda online para profissionais do ramo estético.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-9.22.0-orange)](https://firebase.google.com/)

---

## 📌 Visão Geral

AgendaEstética é uma plataforma SaaS que permite profissionais do ramo estético gerenciar agendas online sem dependência de WhatsApp. Elimina conflitos de horário, centraliza agendamentos e oferece experiência profissional para clientes.

### 🎯 Problema Resolvido

- ❌ **Desorganização**: Agendamentos perdidos no WhatsApp
- ❌ **Conflitos**: Overbooking e cancelamentos
- ❌ **Falta de histórico**: Impossibilidade de analisar preferências
- ❌ **Gestão manual**: Tempo desperdiçado

### ✅ Solução Oferecida

- **Agenda Visual**: Interface intuitiva mensal/semanal/diária
- **Slots Exclusivos**: Evita conflitos de horário
- **Histórico Completo**: CRM básico integrado
- **Automação**: Lembretes e confirmações automáticas

### 📊 Mercado

- **Público-alvo**: 3M+ profissionais no Brasil
- **Setores**: Cabeleireiros, esteticistas, barbeiros, manicures
- **Modelo**: Freemium → Premium

---

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+
- Conta Firebase
- Conta Vercel (deploy)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/agendaestetica.git
cd agendaestetica

# Instale dependências
npm install

# Configure Firebase
cp config.example.js config.js
# Edite config.js com suas credenciais

# Inicie desenvolvimento
npm run dev
```

Acesse `http://localhost:8000` para ver a aplicação.

### Deploy

```bash
# Deploy para Vercel
npm run deploy
```

Para detalhes completos, consulte [`docs/getting-started.md`](docs/getting-started.md).

---

## 📖 Documentação

- [**🚀 Início Rápido**](docs/getting-started.md) - Setup e primeiros passos
- [**👥 Guia do Usuário**](docs/user-guide.md) - Como usar a plataforma
- [**👨‍💻 Guia do Desenvolvedor**](docs/developer-guide.md) - Desenvolvimento e arquitetura
- [**🏗️ Arquitetura Técnica**](docs/architecture.md) - Design system e decisões
- [**🚀 Deployment**](docs/deployment.md) - Deploy e produção
- [**🧪 Testes**](docs/testing.md) - Estratégia de testes
- [**📋 Checklist Completo**](docs/checklist-projeto-completo.md) - Status detalhado do projeto
- [**🤝 Contribuição**](docs/contributing.md) - Como contribuir
- [**📋 Changelog**](docs/changelog.md) - Histórico de versões

---

## ✨ Funcionalidades

### Para Profissionais

- 📅 **Agenda Visual**: Mensal, semanal e diária
- 👥 **Gestão de Clientes**: CRM básico com histórico
- 🎨 **Personalização**: Tema e identidade visual
- 🔔 **Notificações**: Push e in-app
- 📊 **Dashboard**: KPIs e resumo diário
- 🔄 **Remarcações**: Controle de solicitações

### Para Clientes

- 🖥️ **Página Pública**: Link personalizado profissional
- 📱 **Agendamento Simples**: 3 passos para marcar
- 📲 **Gestão Própria**: Cancelar e remarcar
- 📧 **Lembretes**: Notificações automáticas
- 📋 **Histórico**: Todos os atendimentos

---

## 🛠️ Stack Tecnológico

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Firebase (Auth, Firestore)
- **Deploy**: Vercel
- **Testes**: Mocha, Chai, Firebase Emulator

---

## 📈 Roadmap

### ✅ MVP (v1.0)
- Sistema completo de agendamento
- Multi-tenant com isolamento
- Portal cliente e profissional
- Notificações e personalização

### 🔄 Próximas Versões
- [ ] App mobile nativo
- [ ] Integrações (Google Calendar, WhatsApp)
- [ ] Relatórios avançados
- [ ] Marketplace de serviços
- [ ] Pagamentos integrados

---

## 🤝 Contribuição

Contribuições são bem-vindas! Veja [`docs/contributing.md`](docs/contributing.md) para detalhes.

### Como Contribuir

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 📞 Contato

- **Projeto**: [GitHub Issues](https://github.com/seu-usuario/agendaestetica/issues)
- **Email**: contato@agendaestetica.com
- **Website**: https://agendaestetica.com

---

**Feito com ❤️ para profissionais do ramo estético**
- Sistema de notificações
- 1 profissional por empresa

Limitações:
- Marca d'água "Powered by AgendaEstética"
- Paleta de cores limitada (5 opções)
- Sem imagem de fundo
- Sem relatórios avançados
- Sem customização avançada

### Plano Premium (R$ 29,90/mês)

**Objetivo**: Receita recorrente e retenção

Benefícios:
- ✅ Remoção da marca d'água
- ✅ Paleta de cores completa (qualquer cor HEX)
- ✅ Imagem de fundo personalizada
- ✅ Customização visual avançada
- ✅ Relatórios avançados (por período, clientes recorrentes)
- ✅ Cadastro ilimitado de clientes
- ✅ Múltiplos profissionais (até 5)
- ✅ Prioridade em novas funcionalidades
- ✅ Suporte prioritário

### Projeção de Receita (TAM/SAM/SOM)

```
TAM (Mercado Total): R$ 1 bilhão/ano
  └─ 3M profissionais × R$ 29,90 × 12 meses

SAM (Mercado Endereçável): R$ 100 milhões/ano
  └─ 10% do TAM (Brasil, fase inicial)

SOM (Mercado Obtenível Ano 1): R$ 100 mil/ano
  └─ 280 usuários premium × R$ 29,90
```

---

## 🛠 Tecnologias Utilizadas

### Frontend

| Tecnologia | Justificativa |
|------------|--------------|
| **HTML5** | Semântico, acessível, mobile-first, zero overhead |
| **CSS3** | Grid, Flexbox, CSS Variables para temas dinâmicos |
| **JavaScript ES6+** | Vanilla (sem frameworks), menor bundle, mais controle |

### Backend (BaaS - Firebase)

| Serviço | Função |
|---------|--------|
| **Authentication** | Email/senha (telefone opcional), sessões seguras |
| **Firestore Database** | NoSQL em tempo real, transações, queries |
| **Firebase Storage** | Fotos de perfil e banners |

### Infraestrutura & DevOps

| Ferramenta | Função |
|------------|--------|
| **GitHub** | Versionamento, branches, code review |
| **Vercel** | Hosting global, CDN, deploy automático (CI/CD) |
| **Firebase Console** | Admin, monitoramento, regras de segurança |

### Por que Firebase?

1. **Velocidade de desenvolvimento**: Backend pronto em minutos
2. **Escalabilidade automática**: Sem provisionamento manual
3. **Real-time nativamente**: WebSockets sem configuração
4. **Custo inicial zero**: Pay-as-you-go, generoso free tier
5. **Segurança robusta**: Regras de segurança em camada

---

## 🏗 Arquitetura do Sistema

### Visão de Alto Nível

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (SPA)                          │
│   HTML5 + CSS3 + JavaScript ES6+ (Vanilla, Modular)        │
│                                                             │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │
│   │  Páginas│  │ Estilos │  │ Módulos  │  │ Assets   │    │
│   │  (12)   │  │  (8)    │  │  (12)   │  │ (ícones) │    │
│   └────┬────┘  └────┬────┘  └────┬────┘  └─────┬─────┘    │
└────────┼─────────────┼─────────────┼─────────────┼─────────┘
         │             │             │             │
         └─────────────┴─────────────┴─────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    FIREBASE (BaaS)                           │
│                                                             │
│   ┌─────────────┐  ┌──────────────┐  ┌────────────────┐   │
│   │  Auth       │  │   Firestore  │  │    Storage     │   │
│   │  (email)    │  │   (NoSQL)    │  │   (imagens)    │   │
│   └─────────────┘  └──────────────┘  └────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     VERCEL (Infra)                          │
│   • CDN global (300+POPs)                                  │
│   • Deploy automático via GitHub Actions                    │
│   • Environment variables seguras                          │
│   • SSL automático                                         │
└─────────────────────────────────────────────────────────────┘
```

### Modelo Multi-Tenant

Cada profissional possui um **tenant isolado**, identificado por `empresaId` (slug):

```
URL: https://agendaestetica.vercel.app/barbearia-do-joao
                                         ↑
                                    empresaId

Estrutura Firestore (isolamento garantido):
┌──────────────────────────────────────────────────────┐
│ firestore                                              │
│ └── empresas/                                          │
│      └── {empresaId}                                  │
│           ├── perfil/                                  │
│           ├── configuracoes/                          │
│           ├── profissionais/                           │
│           ├── clientes/                                │
│           ├── agenda/                                  │
│           ├── agendamentos/                            │
│           ├── trocas/                                  │
│           └── notificacoes/                            │
└──────────────────────────────────────────────────────┘
```

### Stack de Módulos JavaScript

```
┌─────────────────────────────────────────────────────────────┐
│                    MÓDULOS JS                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────┐     ┌─────────┐     ┌─────────┐              │
│  │ config.js│────▶│ app.js   │◀────│permissoes│             │
│  │ Firebase │     │ Bootstrap│     │ Roteamento             │
│  │ config   │     │          │     │                        │
│  └─────────┘     └────┬──────┘     └─────────┘              │
│                       │                                     │
│       ┌───────────────┼───────────────┐                     │
│       │               │               │                     │
│       ▼               ▼               ▼                     │
│  ┌─────────┐     ┌─────────┐     ┌─────────┐              │
│  │ auth.js │     │firestore │     │ tema.js │              │
│  │ Login/  │     │ CRUD +  │     │ Cores   │              │
│  │ Sessão  │     │ Queries │     │dinâmicas│              │
│  └─────────┘     └─────────┘     └─────────┘              │
│                       │                                     │
│       ┌───────────────┼───────────────┐                     │
│       │               │               │                     │
│       ▼               ▼               ▼                     │
│  ┌─────────┐     ┌─────────┐     ┌─────────┐              │
│  │agenda.js│     │agendamen│     │clientes │              │
│  │Horários │     │ tos.js   │     │  .js    │              │
│  │Slots    │     │ CRUD     │     │ CRM     │              │
│  └─────────┘     └─────────┘     └─────────┘              │
│                       │                                     │
│       ┌───────────────┼───────────────┐                     │
│       │               │               │                     │
│       ▼               ▼               ▼                     │
│  ┌─────────┐     ┌─────────┐     ┌─────────┐              │
│  │notifica │     │relatorios│     │ utils.js│              │
│  │coes.js  │     │  Stats   │     │Helpers  │              │
│  └─────────┘     └─────────┘     └─────────┘              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Estrutura do Projeto

```
agendaestetica/
├── index.html                   # Entry point SPA (Firebase init + router)
├── config.js                    # Firebase configuration
├── router.js                    # Client-side SPA router (16 rotas)
│
├── pages/                       # 16 páginas (HTML + JS module)
│   ├── login.html/js
│   ├── dashboard.html/js
│   ├── agenda.html/js
│   ├── agendamentos.html/js
│   ├── clientes.html/js
│   ├── perfil.html/js
│   ├── onboarding.html/js
│   ├── notificacoes.html/js
│   ├── relatorios.html/js
│   ├── meus-agendamentos.html/js
│   ├── pagina-cliente.html/js
│   ├── pagina-publica.html/js
│   ├── agendar-cliente.html/js
│   ├── confirmacao.html/js
│   ├── solicitacoes-troca.html/js
│   └── recuperar-senha.html/js
│
├── modules/                     # 12 módulos JS
│   ├── firebase.js              # Firebase v9+ factory (instância única)
│   ├── auth.js                  # Auth (login, cadastro, sessão)
│   ├── agenda.js                # Agenda (config, slots, bloqueios)
│   ├── agendamentos.js          # CRUD + remarcações
│   ├── clientes.js              # CRM de clientes
│   ├── permissions.js           # Controle de acesso
│   ├── security.js              # Sanitização (DOMPurify)
│   ├── theme.js                 # Temas visuais (4 temas)
│   ├── notifications.js         # Notificações
│   ├── feedback.js              # Toast, loading, modais
│   ├── monetization.js          # Planos Free/Premium
│   └── utils.js                 # Helpers
│
├── styles/                      # CSS
│   ├── main.css                 # Entry point (importa v2/)
│   ├── v2/                      # Design system v2
│   │   ├── reset.css
│   │   ├── tokens.css           # Design tokens + 4 temas
│   │   ├── base.css
│   │   ├── layout.css
│   │   ├── components.css
│   │   └── utilities.css
│   └── *.css                    # Estilos específicos de página
│
├── functions/                   # Firebase Cloud Functions (3 funções)
│   ├── index.js                # loginWithRateLimit, confirmAgendamento, createCliente
│   └── package.json
│
├── tests/                       # Testes (Mocha + Puppeteer + Cypress)
│   ├── auth.test.js
│   ├── agenda.test.js
│   ├── agendamentos.test.js
│   ├── emulator-sanity.test.js
│   └── e2e/
│
├── docs/                        # Documentação
├── vercel.json
├── firestore.rules              # Regras de segurança multi-tenant
├── firestore.indexes.json       # 4 índices configurados
├── .env.example
├── .gitignore
└── package.json
```

---

## 📈 Status de Desenvolvimento

### Roadmap de Sprints

| Sprint | Foco | Status | Entregáveis |
|--------|------|--------|-------------|
| 0 | Infraestrutura | ✅ Concluída | Firebase, Vercel, Repo, CI/CD |
| 1 | Autenticação | 🔄 Em Andamento | Login, Cadastro, Sessões, Permissões |
| 2 | Agenda | ⏳ Pendente | Onboarding, Configurações, Visualizações |
| 3 | Agendamentos | ⏳ Pendente | CRUD completo, Fluxo cliente |
| 4 | UX/Polish | ⏳ Pendente | Temas, Notificações, Relatórios |
| 5 | Deploy | ⏳ Pendente | Testes, Segurança, Produção |

**Tempo Estimado Total**: 35-50 dias

**Progresso Atual**: Sprint 1 (Autenticação) ~60%

---

## 🚀 Como Executar Localmente

### Pré-requisitos

- **Node.js** 16+ (recomendado: 18 LTS)
- **NPM** ou **Yarn**
- **Git**
- Conta **Firebase** (free tier suficiente)
- Conta **Vercel** (free tier suficiente)

### Configuração em 6 Passos

```bash
# 1. Clonar o repositório
git clone https://github.com/seu-usuario/agendaestetica.git
cd agendaestetica

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais do Firebase

# 4. Configurar Firebase Console
# - Criar projeto Firebase
# - Ativar Authentication (Email/Senha)
# - Ativar Firestore Database
# - Ativar Storage (para fotos)
# - Copiar configuração para .env

# 5. Iniciar servidor local
npm run dev

# 6. Acessar em navegador
open http://localhost:3000
```

### Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor local com hot reload |
| `npm run build` | Build de produção (minificado) |
| `npm run preview` | Visualizar build local |
| `npm test` | Executar testes unitários |
| `npm run test:emulator` | Testes com Firebase Emulator |
| `npm run deploy` | Deploy para produção (Vercel) |

---

## 🔒 Segurança e Conformidade

### Medidas Implementadas

1. **Isolamento Multi-Tenant**
   - Toda query filtrada por `empresaId`
   - Regras Firestore: blocking de acesso cruzado

2. **Autenticação Robusta**
   - Firebase Auth com email/senha
   - Sessões gerenciadas com sessionStorage
   - Refresh token automático

3. **Validação em Camadas**
   - Frontend: validação visual e de formato
   - Backend (Firestore Rules): validação de dados

4. **Dados Sensíveis**
   - Credenciais em environment variables (não no código)
   - HTTPS obrigatório (Vercel)
   - Sem dados pessoais em logs

### Regras de Segurança Firestore

```javascript
// Exemplo simplificado
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Usuário só acessa própria empresa
    match /empresas/{empresaId} {
      allow read, write: if request.auth != null 
        && getUserData(request.auth.uid).empresaId == empresaId;
    }
    
    // Cliente só acessa próprios agendamentos
    match /agendamentos/{agendamentoId} {
      allow read: if request.auth != null 
        && (isProfissional() || resource.data.clienteId == request.auth.uid);
    }
  }
}
```

---

## 📊 Métricas de Qualidade

### Core Web Vitals (Meta)

| Métrica | Target | Ferramenta de Medida |
|---------|--------|---------------------|
| **LCP** | < 2.5s | PageSpeed Insights |
| **FID** | < 100ms | PageSpeed Insights |
| **CLS** | < 0.1 | PageSpeed Insights |

### Test Coverage

| Tipo | Meta |
|------|------|
| Unit Tests | 70% |
| Integration Tests | 50% |
| Manual Tests | 100% dos fluxos críticos |

---

## 👥 Equipe e Contribuição

### Desenvolvedor Principal
- **Tech Lead**: Full-stack, arquitetura e implementação

### Como Contribuir

1. Fork o repositório
2. Crie branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m 'feat: adiciona nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra Pull Request

### Convenções

- **Commits**: Conventional Commits (feat, fix, docs, refactor)
- **Branches**: `feature/*`, `fix/*`, `hotfix/*`, `release/*`
- **Code Review**: Obrigatório para merge na main

---

## 📚 Documentação Complementar

| Documento | Descrição |
|-----------|-----------|
| [PLANO-MESTRE-TECNICO.md](./PLANO-MESTRE-TECNICO.md) | Arquitetura completa, 50+ páginas |
| [escopo-funcional-detalhado.md](./escopo-funcional-detalhado.md) | Features detalhadas |
| [fluxo_usabilidade.md](./fluxo_usabilidade.md) | Jornadas de usuário |
| [monetizacao.md](./monetizacao.md) | Modelo de negócio detalhado |
| [TESTES-AUTOMATIZADOS.md](./TESTES-AUTOMATIZADOS.md) | Estratégia de testes |

---

## ⚠️ Disclaimer

Este projeto está em **desenvolvimento ativo**. Funcionalidades podem mudar antes do lançamento oficial. Versão 1.0 esperada em Q2 2026.

---

**AgendaEstética** — *Simples, profissional e escalável.*

GitHub: [github.com/seu-usuario/agendaestetica](https://github.com/seu-usuario/agendaestetica)  
Produção: [agendaestetica.vercel.app](https://agendaestetica.vercel.app)

