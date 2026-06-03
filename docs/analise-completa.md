# Análise Completa do Projeto AgendaEstética

## 1. Visão Geral

**AgendaEstética** é um SaaS de agenda online para profissionais do ramo estético (cabeleireiros, esteticistas, barbeiros, manicures). O projeto é uma SPA (Single Page Application) construída com JavaScript Vanilla (sem frameworks), utilizando Firebase como BaaS e Vercel para deploy.

---

## 2. Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|------------|--------|
| Frontend | HTML5, CSS3, JavaScript ES6+ | Vanilla |
| Backend | Firebase (Auth, Firestore, Storage, Functions) | v10.5.0 |
| Deploy | Vercel + GitHub Actions | - |
| Testes Unitários | Mocha + Chai | - |
| Testes E2E | Cypress v15 + Puppeteer v24 | - |
| Linter | ESLint v10 | - |
| Segurança | DOMPurify v3.4 | - |

---

## 3. Estrutura do Projeto

```
agendaestetica/
├── index.html                  # Entry point SPA (com Firebase init)
├── config.js                   # Configuração do Firebase
├── router.js                   # Roteamento client-side SPA
├── pages/                      # 16 páginas (HTML + JS)
│   ├── login.html/js           # Login e cadastro
│   ├── onboarding.html/js      # Setup inicial
│   ├── dashboard.html/js       # Painel do profissional
│   ├── agenda.html/js          # Calendário/configuração
│   ├── agendamentos.html/js    # Gestão de agendamentos
│   ├── clientes.html/js        # CRM de clientes
│   ├── perfil.html/js          # Perfil do usuário
│   ├── notificacoes.html/js    # Centro de notificações
│   ├── relatorios.html/js      # Relatórios e estatísticas
│   ├── meus-agendamentos.html/js    # Portal do cliente
│   ├── pagina-cliente.html/js       # Página do cliente logado
│   ├── pagina-publica.html/js       # Página pública do profissional
│   ├── agendar-cliente.html/js      # Fluxo de agendamento público
│   ├── confirmacao.html/js     # Confirmação de agendamento
│   ├── solicitacoes-troca.html/js   # Gestão de remarcações
│   └── recuperar-senha.html/js      # Recuperação de senha
├── modules/                    # 13 módulos JavaScript
│   ├── firebase.js             # Factory Firebase v9+ (instância única)
│   ├── auth.js                 # Autenticação (login, cadastro, sessão)
│   ├── agenda.js               # Agenda (config, slots, bloqueios)
│   ├── agendamentos.js         # CRUD de agendamentos + remarcações
│   ├── clientes.js             # CRM de clientes
│   ├── permissions.js          # Controle de permissões e features
│   ├── security.js             # Sanitização XSS (DOMPurify)
│   ├── theme.js                # Temas visuais
│   ├── notifications.js        # Notificações in-app e webhook
│   ├── feedback.js             # Toast, loading, modais, badges
│   ├── ui.js                   # Skeleton spinners e toasts
│   ├── monetization.js         # Planos Free/Premium
│   └── utils.js                # Retry, debounce, throttle
├── styles/                     # Estilos CSS (~19 arquivos)
│   ├── tokens.css              # Design tokens (variáveis CSS)
│   ├── main.css                # Entry point CSS (imports v2/)
│   ├── global.css              # Estilos globais
│   ├── login.css, agenda.css, ...  # Estilos por página
│   └── v2/                     # Design system v2
│       ├── reset.css           # Normalização
│       ├── tokens.css          # Tokens com temas (neo, dark, wood, premium)
│       ├── base.css            # Estilos base
│       ├── layout.css          # Estrutura de layout
│       ├── components.css      # Componentes UI (1.338 linhas)
│       └── utilities.css       # Classes utilitárias
├── functions/                  # Firebase Cloud Functions
│   ├── index.js                # 3 funções: rate-limit, confirmAgendamento, createCliente
│   └── package.json
├── tests/                      # Testes automatizados
│   ├── auth.test.js            # Testes de autenticação (237 linhas)
│   ├── agenda.test.js          # Testes de agenda (193 linhas)
│   ├── agendamentos.test.js    # Testes de agendamentos (454 linhas)
│   ├── emulator-sanity.test.js # Sanidade com emulador
│   ├── test-coordinator.js     # Coordenador de testes
│   └── e2e/                    # Testes end-to-end
│       ├── smoke-tests.js      # Testes de fumaça (346 linhas)
│       ├── full-flow-test.js   # Fluxo completo (604 linhas)
│       └── check-css-links.js  # Verificação de CSS
├── cypress/                    # Config Cypress E2E
├── scripts/                    # Scripts de deploy
├── deploy/                     # Instruções de deploy Firebase
├── docs/                       # Documentação técnica
└── .github/workflows/          # CI/CD (GitHub Actions)
```

### Estatísticas de Código

| Categoria | Arquivos | Linhas |
|-----------|----------|--------|
| Módulos JS | 13 | ~2.363 |
| Páginas JS | 16 | ~4.771 |
| Páginas HTML | 16 | ~1.781 |
| Estilos CSS | 19 | ~6.990 |
| CSS v2 | 6 | ~3.054 |
| Testes | 9 | ~2.128 |
| Functions | 2 | ~181 |
| **Total** | **~81** | **~19.075** |

---

## 4. Arquitetura do Sistema

### 4.1 Modelo Multi-Tenant

Cada profissional possui um tenant isolado identificado por `empresaId`:

```
URL: https://agendaestetica.vercel.app/agenda/{profissionalId}

Firestore:
└── empresas/{empresaId}
    ├── perfil/
    ├── configuracoes/
    ├── profissionais/
    ├── clientes/{clienteId}
    ├── agendamentos/{agendamentoId}
    │   └── remarcacoes/{remarcacaoId}
    ├── bloqueios/{blockId}
    └── notificacoes/{notifId}
```

### 4.2 Fluxo de Inicialização da SPA

1. `index.html` carrega Firebase via CDN (`firebase-app.js`, `firebase-auth.js`, `firebase-firestore.js`, `firebase-storage.js`)
2. Inicializa `window.firebaseApp` globalmente
3. `config.js` determina se Firebase está configurado (modo demo ou produção)
4. `router.js` configura navegação SPA com `popstate` e carregamento lazy de páginas
5. `auth.js` verifica sessão existente no `localStorage` ou via `onAuthStateChanged`

### 4.3 Roteamento SPA

O `router.js` define 16 rotas com suporte a:
- Parâmetros dinâmicos (`/agenda/:profissionalId`)
- Verificação de autenticação (`requireAuth`)
- Restrição por role (`role: 'profissional' | 'cliente'`)
- Carregamento lazy de JS via `import()`
- Fallback para páginas não encontradas

---

## 5. Banco de Dados (Firestore)

### 5.1 Coleções Principais

| Coleção | Descrição |
|---------|-----------|
| `empresas/{id}` | Documento principal do tenant |
| `empresas/{id}/clientes/{id}` | Clientes da empresa |
| `empresas/{id}/agendamentos/{id}` | Agendamentos |
| `empresas/{id}/agendamentos/{id}/remarcacoes/{id}` | Solicitações de remarcação |
| `empresas/{id}/bloqueios/{id}` | Bloqueios de horário |
| `empresas/{id}/notificacoes/{id}` | Notificações in-app |
| `usuarios/{uid}` | Dados do usuário |

### 5.2 Regras de Segurança (Firestore Rules)

As regras implementam:
- Isolamento multi-tenant: proprietário só acessa própria empresa
- Clientes podem criar agendamentos com status `solicitado`
- Proprietário pode confirmar, cancelar ou concluir agendamentos
- Cliente pode ler seus próprios agendamentos
- Criação de clientes é bloqueada via Rules (deve usar Cloud Function)

### 5.3 Índices

Atualmente sem índices compostos configurados (`firestore.indexes.json` vazio). Consultas como `collectionGroup` em `agendamentos` podem falhar sem índices apropriados.

---

## 6. Funcionalidades Implementadas

### 6.1 Autenticação (`modules/auth.js` - 666 linhas)
- Cadastro de profissional (email com senha ou telefone)
- Cadastro de cliente (email com senha aleatória)
- Login de profissional (email/senha ou telefone)
- Login de cliente (apenas email)
- Rate limiting client-side (5 tentativas, lockout 15min)
- Verificação de sessão
- Logout
- Reset de senha
- Atualização de perfil
- Mapeamento de erros do Firebase para mensagens legíveis

### 6.2 Agenda (`modules/agenda.js` - 230 linhas)
- Salvar/ler configuração de agenda (dias, horários, duração)
- Criar bloqueios de horário
- Gerar slots disponíveis para uma data
- Verificar conflitos com agendamentos existentes
- Cache de slots em localStorage (TTL 1h)
- Criar reserva de agendamento

### 6.3 Agendamentos (`modules/agendamentos.js` - 354 linhas)
- Solicitar agendamento (cliente)
- Confirmar agendamento (profissional) com transação
- Cancelar agendamento com motivo
- Concluir agendamento
- Solicitar remarcação (cliente)
- Aceitar/rejeitar remarcação (profissional)
- Listar agendamentos por empresa ou cliente
- Adicionar notas internas
- Fluxo de remarcação completo

### 6.4 Clientes (`modules/clientes.js` - 122 linhas)
- Adicionar cliente
- Buscar ou criar cliente por email (deduplicação)
- Obter detalhes do cliente
- Listar clientes da empresa
- Adicionar observações
- Obter histórico de agendamentos

### 6.5 Plano de Negócio
- **Free**: Funcionalidades básicas com marca d'água
- **Premium (R$ 29,90/mês)**: Temas avançados, relatórios, remoção de marca d'água, múltiplos profissionais

### 6.6 Segurança
- Sanitização HTML com DOMPurify (`modules/security.js`)
- Validação de inputs (tamanho, HTML permitido)
- CSP configurado no `vercel.json`
- Headers de segurança (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)

---

## 7. Infraestrutura e Deploy

### 7.1 Cloud Functions (`functions/index.js` - 169 linhas)
Três funções implementadas:
1. **`loginWithRateLimit`** - Rate limiting server-side por IP
2. **`confirmAgendamento`** - Confirmação atômica com lock distribuído de 30s
3. **`createCliente`** - Criação/deduplicação de clientes (bypass Rules) com suporte a reCAPTCHA

### 7.2 Vercel
- Configurado com SPA fallback (`rewrites` para `index.html`)
- Headers de segurança e cache
- Deploy automático via GitHub Actions

### 7.3 GitHub Actions
Workflow de CI/CD:
1. Checkout
2. Instala dependências
3. Testes (continue-on-error)
4. Deploy para Vercel (apenas push na main)

---

## 8. Testes

### 8.1 Unitários (Mocha + Chai)
| Arquivo | Linhas | Cobertura |
|---------|--------|-----------|
| `auth.test.js` | 237 | Cadastro, login, validação |
| `agenda.test.js` | 193 | Configuração, geração de slots |
| `agendamentos.test.js` | 454 | CRUD, remarcação, conflitos |

### 8.2 E2E (Puppeteer)
| Arquivo | Linhas | Fluxo |
|---------|--------|-------|
| `smoke-tests.js` | 346 | Testes de fumaça |
| `full-flow-test.js` | 604 | Fluxo completo |
| `check-css-links.js` | 45 | Verificação de CSS |

### 8.3 Cypress
Configurado para E2E com `baseUrl: localhost:3000`, viewport 1280x720.

---

## 9. Design System (CSS v2)

### 9.1 Temas Disponíveis
- **neo** (padrão) - Roxo principal (#6B46C1)
- **dark** - Modo escuro
- **wood** - Tom madeira
- **premium** - Personalizado

### 9.2 Design Tokens
- 13 cores (primárias, secundárias, status, fundo, texto, bordas)
- 5 níveis de sombra
- 8 espaçamentos (xs a 3xl)
- 10 tamanhos de fonte
- 4 níveis de border-radius
- 7 níveis de z-index
- 3 velocidades de transição

### 9.3 Componentes CSS (1.338 linhas)
- Formulários, botões, cards, tabelas
- Modais, toasts, notificações
- Slots, agenda, calendário
- Navegação (AppShell), sidebar
- Loading states, skeletons, spinners

---

## 10. Rotas da Aplicação

| Rota | Página | Requer Auth | Role |
|------|--------|-------------|------|
| `/` | Home | Não | - |
| `/login` | Login/Cadastro | Não | - |
| `/recuperar-senha` | Recuperar senha | Não | - |
| `/dashboard` | Dashboard profissional | Sim | profissional |
| `/onboarding` | Setup inicial | Sim | - |
| `/agenda` | Calendário | Sim | - |
| `/agendamentos` | Gestão de agendamentos | Sim | - |
| `/clientes` | CRM | Sim | - |
| `/perfil` | Perfil | Sim | - |
| `/notificacoes` | Centro de notificações | Sim | - |
| `/relatorios` | Relatórios | Sim | profissional |
| `/solicitacoes-troca` | Remarcações | Sim | profissional |
| `/meus-agendamentos` | Portal cliente | Sim | cliente |
| `/pagina-cliente` | Página cliente | Sim | cliente |
| `/agenda/:profissionalId` | Página pública | Não | - |
| `/agendar/:profissionalId` | Agendamento público | Não | - |
| `/confirmacao` | Confirmação | Não | - |

---

## 11. Modelo de Dados

### empresa
```json
{
  "empresaId": "prof_{uid}",
  "proprietarioUid": "firebase-uid",
  "nome": "Nome do Profissional",
  "profissao": "Esteticista",
  "contato": "email ou telefone",
  "criadoEm": "ISO date",
  "ativo": true,
  "plano": "free | premium",
  "onboardingCompleto": true/false,
  "agendaConfig": {
    "dias": ["mon", "tue", ...],
    "horaInicio": "08:00",
    "horaFim": "18:00",
    "duracaoSlot": 30
  },
  "theme": "neo | dark | wood | premium"
}
```

### agendamento
```json
{
  "inicio": "ISO date",
  "fim": "ISO date",
  "clienteUid": "firebase-uid",
  "nomeCliente": "Nome",
  "telefone": "+5511999999999",
  "servico": "Nome do serviço",
  "status": "solicitado | confirmado | concluido | cancelado",
  "criadoEm": "ISO date",
  "confirmadoEm": "ISO date",
  "concluidoEm": "ISO date",
  "canceladoEm": "ISO date",
  "motivoCancelamento": "string",
  "notas": [{"texto": "...", "criadoEm": "..."}],
  "temPedidoRemarcacao": true/false
}
```

### usuario
```json
{
  "uid": "firebase-uid",
  "email": "user@email.com",
  "telefone": "+5511999999999",
  "nome": "Nome",
  "profissao": "Esteticista",
  "role": "profissional | cliente",
  "empresaId": "prof_{uid}",
  "criadoEm": "ISO date",
  "ativo": true
}
```

---

## 12. Pontos Fortes

1. **Arquitetura modular**: 13 módulos JS com responsabilidade única
2. **SPA sem frameworks**: Performance e controle total
3. **Multi-tenant robusto**: Isolamento via `empresaId` em todas as queries
4. **Segurança em camadas**: Firestore Rules + sanitização + CSP + headers HTTP
5. **Design system completo**: Tokens CSS, temas, componentes reutilizáveis
6. **Modo demo**: Funciona sem Firebase configurado para desenvolvimento
7. **Rate limiting**: Tanto client-side quanto server-side (Cloud Function)
8. **PWA**: Service worker registrado, manifest, app shell
9. **Cobertura de testes**: Unitários (Mocha) + E2E (Puppeteer + Cypress)
10. **CI/CD completo**: GitHub Actions + Vercel
11. **Cloud Functions**: Locks distribuídos para prevenção de race conditions
12. **Acessibilidade**: ARIA attributes, keyboard navigation, focus management

---

## 13. Pontos de Atenção

1. **Índices Firestore**: `firestore.indexes.json` vazio - queries `collectionGroup` podem falhar em produção
2. **Firebase config hardcoded**: `index.html` contém chave Firebase em texto plano (embora seja esperado para Firebase Web)
3. **Duplicação de CSS**: Estilos em `styles/` e `src/styles/` com conteúdo redundante (~19 arquivos vs 6 no v2)
4. **Modo demo limitado**: Sem Firebase, muitas funcionalidades ficam indisponíveis
5. **Cloud Functions**: Dependem de deploy manual via Firebase CLI
6. **Testes E2E**: `continue-on-error` no CI permite deploy mesmo com falha nos testes
7. **Documentação extensa**: `docs/` contém muitos arquivos (~80), alguns com conteúdo desatualizado
8. **`signInAnonymously`**: Chamado em `auth.js:455` mas não importado, o que causará erro em runtime

---

## 14. Recomendações

1. **Configurar índices Firestore** para `collectionGroup` queries
2. **Unificar estilos CSS** removendo duplicatas entre `styles/` e `src/styles/`
3. **Implementar testes de integração** com Firebase Emulator
4. **Adicionar retry em Cloud Functions** para operações críticas
5. **Corrigir importação ausente** de `signInAnonymously` em `auth.js`
6. **Melhorar cobertura de testes** para módulos de notificações, tema e permissões
7. **Automatizar deploy das Cloud Functions** no CI/CD
8. **Implementar cache de slots** no backend (Firestore) para reduzir leituras
9. **Adicionar monitoramento** com Firebase Performance ou Sentry
10. **Criar testes de segurança** para validar Firestore Rules

---

## 15. Métricas do Projeto

| Métrica | Valor |
|---------|-------|
| Total de arquivos | ~81 |
| Total de linhas de código | ~19.075 |
| Módulos JavaScript | 13 |
| Páginas | 16 |
| Arquivos CSS | 19 |
| Testes | 9 |
| Cloud Functions | 3 |
| Commits no Git | ~17 |
| Dependências | 7 (3 produção, 4 dev) |
