# 🏗️ PLANO MESTRE TÉCNICO COMPLETO — AgendaEstética

**Versão:** 2.1 — Análise Profunda + Implementação  
**Data:** 31 de Janeiro de 2026  
**Autor:** Tech Lead Sênior  
**Status:** Pronto para Desenvolvimento Imediato  
**Tempo Estimado:** 35-50 dias

---

## 📑 ÍNDICE COMPLETO

1. [Visão Geral do Sistema](#1-visão-geral-do-sistema)
2. [Mapa de Arquitetura](#2-mapa-de-arquitetura)
3. [Estrutura Final de Pastas](#3-estrutura-final-de-pastas)
4. [Checklist de Desenvolvimento por Sprint](#4-checklist-por-sprint)
5. [Funções Obrigatórias por Arquivo JS](#5-funções-obrigatórias)
6. [Estrutura do Firestore](#6-estrutura-firestore)
7. [Regras de Segurança](#7-regras-de-segurança)
8. [Fluxos Críticos Detalhados](#8-fluxos-críticos)
9. [Checklist de Testes Manuais](#9-testes-manuais)

---

# 1. VISÃO GERAL DO SISTEMA

## O que é AgendaEstética?

**AgendaEstética** é uma plataforma SaaS **multi-tenant** que permite profissionais do ramo estético gerenciar calendário de atendimentos online **sem dependência de WhatsApp**.

### Problema que Resolve

- ❌ Cliente perde mensagens no WhatsApp
- ❌ Profissional perde track de agendamentos
- ❌ Conflito de horários frequente
- ❌ Falta de histórico organizado

### Solução Oferecida

- ✅ Calendário visual e intuitivo
- ✅ Agendamentos confirmados automaticamente
- ✅ Notificações de eventos críticos
- ✅ Histórico completo de atendimentos

## Tipos de Usuários

| Tipo | Quem é | O que pode fazer |
|------|--------|-----------------|
| **Profissional (Admin)** | Cabeleireira, esteticista, barbeiro | Criar empresa • Configurar horários • Gerenciar agenda • Confirmar agendamentos • Gerenciar clientes • Customizar tema |
| **Cliente** | Pessoa que agenda serviço | Visualizar horários • Criar agendamento • Cancelar/remarcar • Ver histórico próprio • Receber notificações |

## Fluxos Principais

### 🔄 Fluxo Completo: Profissional

```
[ACESSO]
1. Acessa link da plataforma
2. Escolhe "Sou Profissional"
3. Faz login (email + senha) ou cadastro automático

[ONBOARDING — OBRIGATÓRIO]
4. Preenche: Nome profissional, Nicho
5. Configura: Dias de trabalho, Horários
6. Sistema bloqueia dashboard até conclusão

[OPERAÇÃO]
7. Visualiza dashboard (resumo do dia)
8. Gerencia agenda (confirma, cancela, bloqueia horários)
9. Gerencia clientes (observações, histórico)
10. Customiza tema (cores, imagem)
11. Vê notificações de eventos
```

### 🔄 Fluxo Completo: Cliente

```
[ACESSO]
1. Recebe link público do profissional
2. Acessa página pública
3. Não precisa criar conta (será criada automaticamente)

[AGENDAMENTO]
4. Clica em "Agendar"
5. Seleciona data no calendário (mostra apenas dias disponíveis)
6. Seleciona horário na lista
7. Confirma dados (nome, contato)
8. Agendamento criado com status "pendente"

[CONFIRMAÇÃO]
9. Profissional vê agendamento pendente
10. Profissional confirma (ou recusa)
11. Cliente é notificado

[PÓS-AGENDAMENTO]
12. Cliente pode solicitar cancelamento/troca
13. Sistema libera ou nega conforme regras
```

## Regras de Negócio Críticas

| # | Regra | Implementação |
|---|-------|----------------|
| R1 | Um profissional = uma empresa isolada | `empresaId` salvo no Firestore, queries filtradas |
| R2 | Um agendamento = um horário exclusivo | Verificar conflito em transação antes de salvar |
| R3 | Onboarding é obrigatório | Flag em BD, bloqueio no frontend, redirecionamento |
| R4 | Cliente não vê horários bloqueados | Filtrar na geração de horários disponíveis |
| R5 | Notificação = um evento crítico | Criar doc em `notificacoes` na ação |
| R6 | Cancelamento = horário liberado | Update automático em `agendamentos` |
| R7 | Tema aplicado dinamicamente | CSS Variables carregadas ao inicializar app |
| R8 | Free vs Premium = feature flags | Validar plano antes de permitir ação |

---

# 2. MAPA DE ARQUITETURA

## Arquitetura em Camadas

```
┌──────────────────────────────────────┐
│     FRONTEND (Cliente)                │
│  HTML + CSS + JavaScript Vanilla     │
│  ┌────┬──────┬──────────┬─────────┐ │
│  │Telas│Estilos│Lógica JS│Assets   │ │
│  └─┬──┴──┬───┴──────────┴─┬───────┘ │
└────┼─────┼─────────────────┼────────┘
     │     │                 │
┌────▼─────▼──────────────────▼────────┐
│        FIREBASE (Backend/BaaS)        │
│  ┌──────────┬──────────┬────────────┐ │
│  │   Auth   │ Firestore│ Storage    │ │
│  │(email)   │ (NoSQL)  │ (imagens)  │ │
│  └──────────┴──────────┴────────────┘ │
└──────────────────────────────────────┘
                    │
┌───────────────────▼──────────────────┐
│     VERCEL (Hosting + Deploy)         │
│  • CDN global                         │
│  • Build automático (GitHub)          │
│  • Environment variables              │
└──────────────────────────────────────┘
```

## Stack Tecnológico

### Frontend
- **HTML5**: Semântico, acessível, mobile-first
- **CSS3**: Grid, Flexbox, CSS Variables, media queries
- **JavaScript ES6+**: Vanilla (sem frameworks)
  - Moderna (arrow functions, destructuring, async/await)
  - Modular (módulos ES6, separação de responsabilidades)
  - Reativo (listeners, event delegation)

### Backend (BaaS)
- **Firebase Authentication**: Email + Telefone (opcional)
- **Firestore**: NoSQL em tempo real, transações
- **Firebase Storage**: Fotos de perfil, imagens de fundo

### Infraestrutura
- **GitHub**: Versionamento + branches
- **Vercel**: Hosting + CI/CD automático
- **Firebase Console**: Admin, monitoramento, regras

## Módulos JavaScript (Responsabilidades)

```
┌─────────────────────────────────────────────────┐
│               MÓDULOS JS                        │
├─────────────────────────────────────────────────┤
│                                                 │
│  config.js         ← Firebase config            │
│       ↓                                         │
│  app.js            ← Inicializar tudo          │
│       ├─ auth.js   ← Login/Logout              │
│       └─ tema.js   ← CSS Variables             │
│                                                 │
│  permissoes.js     ← Validar acesso/rotas      │
│       ↓                                         │
│  [Página protegida]                            │
│       ├─ firestore.js (queries seguras)        │
│       ├─ agenda.js                             │
│       ├─ agendamentos.js                       │
│       ├─ clientes.js                           │
│       ├─ notificacoes.js                       │
│       └─ relatorios.js                         │
│                                                 │
│  utils.js          ← Helpers gerais            │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Fluxo de Dados

```
[USUÁRIO INTERAGE]
     │
     ↓
[HTML EVENT → JS Handler]
     │
     ├─→ Validar (permissões.js)
     ├─→ Processar (lógica específica)
     └─→ Chamar Firestore (firestore.js)
             │
             ├─→ Firestore Rules validam
             ├─→ Dados retornam
             └─→ Atualizar UI
     │
     ↓
[LISTENERS FIREBASE]
     │
     └─→ Atualizar dados em tempo real
             │
             └─→ Renderizar mudanças
```

---

# 3. ESTRUTURA FINAL DE PASTAS

```
agendaestetica/
├── .github/workflows/
│   └── deploy.yml                    # CI/CD (Vercel automático)
│
├── src/
│   ├── index.html                    # Landing page / Selector
│   ├── login.html                    # Tela unificada de login
│   ├── onboarding.html               # Config inicial (profissional)
│   ├── dashboard.html                # Resumo do dia
│   ├── agenda.html                   # Calendário (3 visualizações)
│   ├── agendamentos.html             # Detalhes + Ações
│   ├── clientes.html                 # Lista + Perfil individual
│   ├── configuracoes.html            # Settings completos
│   ├── public.html                   # Página pública (cliente)
│   ├── notificacoes.html             # Centro de notificações
│   ├── relatorios.html               # Relatórios básicos
│   ├── 404.html                      # Erro / Não encontrado
│   │
│   ├── css/
│   │   ├── main.css                  # Reset, base, tipografia
│   │   ├── variables.css             # CSS Variables (temas)
│   │   ├── responsive.css            # Media queries mobile-first
│   │   ├── components.css            # Componentes reutilizáveis
│   │   ├── forms.css                 # Inputs, validação visual
│   │   └── animations.css            # Transições, loaders
│   │
│   ├── js/
│   │   ├── config.js                 # Firebase + constantes
│   │   ├── auth.js                   # Login, logout, sessão
│   │   ├── firestore.js              # CRUD + queries
│   │   ├── permissoes.js             # Acesso + rotas
│   │   ├── agenda.js                 # Horários + geração
│   │   ├── agendamentos.js           # CRUD agendamentos
│   │   ├── clientes.js               # Gestão de clientes
│   │   ├── tema.js                   # CSS Variables dinâmicos
│   │   ├── notificacoes.js           # Sistema de notif
│   │   ├── relatorios.js             # Agregação de dados
│   │   ├── utils.js                  # Helpers gerais
│   │   └── app.js                    # Bootstrap
│   │
│   └── assets/
│       ├── icons/                    # SVG icons
│       ├── images/                   # Static images
│       └── fonts/                    # Custom fonts (opcional)
│
├── docs/
│   ├── (todos os .md originais)
│   ├── FIRESTORE-SCHEMA.md           # Schema detalhado
│   ├── REGRAS-SEGURANCA.md           # Rules detalhadas
│   └── API-FUNCOES.md                # Referência JS
│
├── .env.example
├── .env                              # NÃO commitar
├── .gitignore
├── vercel.json
├── package.json
└── README.md
```

### Descrição de Responsabilidades

#### 🌐 HTML

| Arquivo | Responsabilidade | Tipo de Usuário |
|---------|-----------------|-----------------|
| `index.html` | Landing, choice: Cliente vs Profissional | Público |
| `login.html` | Tela unificada (nome, contato, role) | Público |
| `onboarding.html` | Setup obrigatório (nome, nicho, horários) | Profissional |
| `dashboard.html` | Resumo dia, menu de acesso | Profissional |
| `agenda.html` | Mensal/semanal/diária + bloqueios | Profissional |
| `agendamentos.html` | Detalhes + Confirmar/Cancelar/Remarcar | Profissional |
| `clientes.html` | Lista + Perfil + Observações | Profissional |
| `configuracoes.html` | Horários, Regras, Tema, Perfil | Profissional |
| `public.html` | Página pública do profissional | Cliente externo |
| `notificacoes.html` | Centro de notificações | Profissional + Cliente |
| `relatorios.html` | Período, clientes recorrentes | Profissional |
| `404.html` | Erro genérico | Público |

#### 🎨 CSS

| Arquivo | O que contém |
|---------|-------------|
| `main.css` | Reset CSS, tipografia base, layout padrão |
| `variables.css` | CSS Variables para cores, espaçamentos, raios |
| `responsive.css` | Breakpoints: mobile (360px+), tablet (600px+), desktop (1024px+) |
| `components.css` | Botões, cards, modais, badges, dropdowns |
| `forms.css` | Input styling, validação visual, focus, disabled |
| `animations.css` | Transições, loaders, toasts, hover effects |

#### ⚙️ JS

| Arquivo | Responsabilidades | Principais Funções |
|---------|------------------|-------------------|
| `config.js` | Firebase config, enums, constantes | Exportar firebaseConfig, enums de status |
| `auth.js` | Login, logout, cadastro, sessão | loginCliente(), loginProfissional(), logout(), verificarSessao() |
| `firestore.js` | CRUD genérico, queries filtradas | criar(), atualizar(), deletar(), listar(), lerDocumento() |
| `permissoes.js` | Verificar acesso, redirecionar | verificarAutenticacao(), verificarTipo(), protegerRota() |
| `agenda.js` | Horários, conflitos, visualizações | gerarHorarios(), verificarConflito(), carregarAgenda() |
| `agendamentos.js` | CRUD agendamentos, status | criarAgendamento(), confirmarAgendamento(), cancelarAgendamento() |
| `clientes.js` | Gestão de clientes | carregarClientes(), criarCliente(), salvarObservacao() |
| `tema.js` | CSS Variables dinâmicos | aplicarTema(), carregarTema(), validarTema() |
| `notificacoes.js` | Criar, ler, marcar como lida | criarNotificacao(), carregarNotificacoes(), marcarComoLida() |
| `relatorios.js` | Agregação de dados | gerarRelatorioPeriodo(), gerarRelatorioClientes() |
| `utils.js` | Helpers gerais | formatarData(), formatarHora(), validarEmail(), etc |
| `app.js` | Inicializar app | inicializar() — chamar config, restaurar sessão, carregar tema |

---

# 4. CHECKLIST POR SPRINT

## 📋 Sprint 0: Infraestrutura (3-4 dias)

### 0.1 Repositório Git

- [ ] Criar repositório GitHub
- [ ] Clonar localmente
- [ ] Criar `.gitignore` (node_modules, .env, .firebase)
- [ ] Criar branches: `main` (protegida), `develop`
- [ ] Documentar estratégia: feature/*, hotfix/*

### 0.2 Estrutura de Pastas

- [ ] Criar `/src` com subpastas: `css/`, `js/`, `assets/`
- [ ] Criar `/docs` para documentação
- [ ] Criar `.env.example` com template

### 0.3 Firebase Setup

- [ ] Criar projeto Firebase ("agendaestetica-prod")
- [ ] Ativar **Authentication** (Email/Senha)
- [ ] Ativar **Firestore** (modo produção)
- [ ] Ativar **Storage** (para fotos)
- [ ] Gerar credenciais
- [ ] Salvar em `.env` (NÃO commitar)

### 0.4 Vercel Setup

- [ ] Criar conta Vercel
- [ ] Conectar repo GitHub
- [ ] Configurar environment variables
- [ ] Testar build automático
- [ ] Obter URL de produção

### 0.5 Documentação Base

- [ ] Criar `README.md` (o que é, stack, como rodar)
- [ ] Criar `SETUP-LOCAL.md` (instalação local)
- [ ] Criar `.env.example` com variáveis

---

## 📋 Sprint 1: Autenticação e Base (7-9 dias)

### 1.1 Configuração Firestore

**Collection: `usuarios`**
- [ ] Criar collection
- [ ] Estrutura de documento:
  ```
  usuarios/{uid}
    - uid: string
    - empresaId: string
    - role: "profissional" | "cliente"
    - nome: string
    - contato: string
    - ativo: boolean
    - criadoEm: timestamp
    - ultimoAcesso: timestamp
  ```

**Collection: `empresas`**
- [ ] Criar collection
- [ ] Estrutura base:
  ```
  empresas/{empresaId}
    - empresaId: string (slug)
    - nome: string
    - nicho: string (texto livre)
    - status: "ativa" | "suspensa"
    - plano: "free" | "premium"
    - criadaEm: timestamp
  ```

- [ ] Subcollections: profissionais, clientes, configuracoes, agenda, agendamentos, notificacoes

### 1.2 Firebase Rules (Básicas)

- [ ] Implementar regras de acesso por `empresaId`
- [ ] Usuário só acessa sua empresa
- [ ] Cliente só acessa dados que pertence
- [ ] Testar acesso cruzado (deve bloquear)

### 1.3 Arquivo: `src/js/config.js`

- [ ] Exportar `firebaseConfig` (do `.env`)
- [ ] Inicializar Firebase App
- [ ] Exportar `db` (Firestore), `auth` (Authentication)
- [ ] Definir enums:
  ```javascript
  const ROLES = {
    PROFISSIONAL: 'profissional',
    CLIENTE: 'cliente'
  };
  
  const STATUS_AGENDAMENTO = {
    PENDENTE: 'pendente',
    CONFIRMADO: 'confirmado',
    CANCELADO: 'cancelado',
    CONCLUIDO: 'concluido',
    REMARCADO: 'remarcado'
  };
  
  const PLANOS = {
    FREE: 'free',
    PREMIUM: 'premium'
  };
  ```

### 1.4 Arquivo: `src/js/auth.js`

**Funções obrigatórias:**

- [ ] `loginCliente(nome, contato, empresaId)`
  - Verificar se cliente existe em BD
  - Se não, criar automaticamente
  - Salvar em sessionStorage: uid, empresaId, role
  - Retornar objeto usuário

- [ ] `loginProfissional(email, senha, empresaId)`
  - Usar Firebase Auth
  - Verificar se profissional pertence à empresa
  - Se 1º login: redirecionar para onboarding
  - Salvar sessão
  - Retornar usuário

- [ ] `cadastroProfissional(email, senha, nome, nicho, empresaId)`
  - Firebase Auth: criar usuário
  - Criar doc em `usuarios/{uid}`
  - Criar doc em `empresas/{empresaId}`
  - Criar subcollection `profissionais`
  - Retornar usuário

- [ ] `logout()`
  - Firebase Auth: signOut()
  - Limpar sessionStorage
  - Redirecionar para `/login.html`

- [ ] `verificarSessao()`
  - Se houver sessão ativa: retornar usuário
  - Se não: redirecionar para login

- [ ] `restaurarSessaoAposRefresh()`
  - Verificar auth state do Firebase
  - Restaurar sessionStorage
  - Atualizar lastAccess

### 1.5 Arquivo: `src/js/permissoes.js`

- [ ] `verificarAutenticacao()`
  - Retornar boolean (está logado?)
  - Se não: redirecionar login

- [ ] `verificarTipo(tipoEsperado)`
  - Comparar role da sessão
  - Se diferente: redirecionar 404

- [ ] `protegerRota(tipoPermitido)`
  - Executar em cada página protegida
  - Verificar auth + tipo
  - Bloquear ou permitir

- [ ] `obterUidAtual()`
- [ ] `obterEmpresaIdAtual()`
- [ ] `obterTipoAtual()`

### 1.6 Arquivo: `src/js/firestore.js`

**Abstração genérica de Firestore:**

- [ ] `criar(colecao, dados, subcolecao = null, subcoleçãoNome = null)`
  - Adicionar validação de empresaId
  - Usar transação se necessário
  - Retornar documento criado

- [ ] `atualizar(colecao, docId, dados, empresaId = null)`
  - Validar empresaId
  - Update parcial
  - Retornar sucesso

- [ ] `deletar(colecao, docId, empresaId = null)`
  - Validar permissão
  - Deletar documento
  - Retornar sucesso

- [ ] `listar(colecao, filtros = {}, empresaId = null)`
  - Query com filtros
  - Sempre adicionar filtro `empresaId`
  - Retornar array

- [ ] `lerDocumento(colecao, docId, empresaId = null)`
  - Ler um documento
  - Validar empresaId
  - Retornar dados

- [ ] `ouvir(colecao, callback, filtros = {})`
  - Real-time listener
  - Útil para notificações

### 1.7 Tela: `src/index.html`

- [ ] Layout: Logo + Title + 2 Botões (Cliente vs Profissional)
- [ ] Mobile-first responsivo
- [ ] Links: `/login.html?type=cliente` vs `/login.html?type=profissional`

### 1.8 Tela: `src/login.html`

**Leiaute:**

- [ ] Header: Logo
- [ ] Form: Nome, Contato, Radio (Cliente/Profissional)
- [ ] Botão: "Entrar"
- [ ] Validação básica (campos obrigatórios)
- [ ] Mensagens de erro/sucesso

**Lógica:**

- [ ] Detectar tipo pela URL (query param ou radio)
- [ ] Se Cliente:
  - [ ] Chamar `loginCliente(nome, contato, empresaId)`
  - [ ] Redirecionar para `/public.html`
  
- [ ] Se Profissional:
  - [ ] Pedir email + senha
  - [ ] Chamar `loginProfissional(email, senha, empresaId)`
  - [ ] Se 1º login: redirecionar `/onboarding.html`
  - [ ] Se já tem: redirecionar `/dashboard.html`

### 1.9 Tela: `src/dashboard.html` (Básico)

- [ ] Verificar permissão (só profissional)
- [ ] Layout: Header (Logo + Nome + Logout) + Menu lateral
- [ ] Menu: Agenda | Clientes | Configurações | Notificações
- [ ] Seção principal: Vazio (será preenchido em Sprint 2)
- [ ] Cards: Próximos atendimentos (vazio)

### 1.10 CSS Básico

- [ ] `src/css/main.css`:
  - [ ] Reset CSS
  - [ ] Tipografia base
  - [ ] Layout grid/flexbox
  - [ ] Cores base

- [ ] `src/css/responsive.css`:
  - [ ] Breakpoints: 360px (mobile), 600px (tablet), 1024px (desktop)
  - [ ] Ajustes para cada breakpoint

- [ ] `src/css/components.css`:
  - [ ] Botões (primary, secondary, danger)
  - [ ] Inputs (text, email, password)
  - [ ] Cards
  - [ ] Modals

### 1.11 Arquivo: `src/js/app.js`

- [ ] `inicializar()`:
  - [ ] Chamar `config.js` (setup Firebase)
  - [ ] Chamar `verificarSessao()` de auth.js
  - [ ] Se logado: carregar tema
  - [ ] Se não: redirecionar login
  - [ ] Executar ao carregar qualquer página protegida

### 1.12 Testes Manuais (Sprint 1)

- [ ] Login cliente novo → usuário criado automaticamente
- [ ] Login cliente existente → acesso permitido
- [ ] Login profissional novo → redireciona onboarding
- [ ] Login profissional existente → acessa dashboard
- [ ] Logout → limpa sessão
- [ ] Refresh → sessão mantida
- [ ] Tentativa acesso cruzado (cliente como profissional) → bloqueado
- [ ] URL inválida → redireciona 404

---

## 📋 Sprint 2: Agenda e Configurações (7-9 dias)

### 2.1 Onboarding Obrigatório

**Tela: `src/onboarding.html`**

**Etapa 1: Dados Básicos**
- [ ] Campo: Nome profissional
- [ ] Campo: Nicho (texto livre)
- [ ] Upload: Foto de perfil (opcional)
- [ ] Botão: "Próximo"

**Etapa 2: Horários de Trabalho**
- [ ] Checkboxes: Dias ativos (segunda a domingo)
- [ ] Para cada dia: Horário inicio e fim
- [ ] Campo: Duração padrão de atendimento (minutos)
- [ ] Campo: Intervalo entre atendimentos (minutos)
- [ ] Botão: "Salvar e Concluir"

**Lógica em `src/js/auth.js`:**

- [ ] `verificarOnboardingCompleto(uid, empresaId)`:
  - [ ] Query: `empresas/{empresaId}/configuracoes`
  - [ ] Verificar campos obrigatórios
  - [ ] Retornar boolean

- [ ] `salvarOnboarding(empresaId, dados)`:
  - [ ] Salvar em `empresas/{empresaId}/perfil`
  - [ ] Salvar em `empresas/{empresaId}/configuracoes`
  - [ ] Marcar como onboarding concluído
  - [ ] Redirecionar `/dashboard.html`

- [ ] `protegerDashboard()`:
  - [ ] Se onboarding incompleto: redirecionar onboarding
  - [ ] Se completo: liberar acesso

### 2.2 Firestore Collections: Agenda

**Collection: `empresas/{empresaId}/configuracoes`**

```
Document: config
  - agendamentoOnlineAtivo: boolean
  - tempoMinimoRemarcacao: number (horas)
  - limiteSolicitacoesTroca: number
  - politicaCancelamento: string
  - diasAtivos: array ["segunda", "terca", ...]
  - horariosBase: object
    {
      segunda: { inicio: "09:00", fim: "18:00" },
      terca: { inicio: "09:00", fim: "18:00" },
      ...
    }
  - durationPadrao: number (minutos)
  - intervaloPadrao: number (minutos)
```

**Collection: `empresas/{empresaId}/agenda`**

```
Document: {data} (formato: YYYY-MM-DD)
  - data: string
  - horariosDisponiveis: array
    [
      { horario: "09:00", disponivel: true, ocupado: false },
      { horario: "10:00", disponivel: true, ocupado: false },
      ...
    ]
  - horariosBloqueados: array
    [
      { horario: "12:00", motivo: "almoço" }
    ]
  - excecao: boolean (dia fora do padrão)
  - criadoEm: timestamp
```

- [ ] Criar collections acima
- [ ] Documentar estrutura em `docs/FIRESTORE-SCHEMA.md`

### 2.3 Arquivo: `src/js/agenda.js`

**Funções principais:**

- [ ] `gerarHorariosDisponiveis(configuraçoes, data)`:
  - [ ] Inputs: config (horários, duração, intervalo), data
  - [ ] Gerar array de horários baseado em config
  - [ ] Exemplo: 09:00-18:00, 60min, 15min intervalo
    → ["09:00", "10:15", "11:30", "12:45", "14:00", "15:15", "16:30"]
  - [ ] Retornar array

- [ ] `carregarConfigurações(empresaId)`:
  - [ ] Query: `empresas/{empresaId}/configuracoes`
  - [ ] Retornar objeto com horários, durações, etc

- [ ] `carregarAgendaMês(empresaId, ano, mês)`:
  - [ ] Query: todos os agendamentos do mês
  - [ ] Contar agendamentos por dia
  - [ ] Retornar objeto com dados agregados

- [ ] `carregarAgendaSemana(empresaId, dataInicio)`:
  - [ ] Query: agendamentos de 7 dias
  - [ ] Estruturar para visualização semanal
  - [ ] Retornar array por dia

- [ ] `carregarAgendaDia(empresaId, data)`:
  - [ ] Query: agendamentos do dia
  - [ ] Gerar horários livres/ocupados
  - [ ] Retornar grid horária

- [ ] `bloquearHorario(empresaId, data, horario, motivo)`:
  - [ ] Criar/atualizar doc em `agenda/{data}`
  - [ ] Adicionar ao array `horariosBloqueados`
  - [ ] Retornar sucesso

- [ ] `bloquearDia(empresaId, data, motivo)`:
  - [ ] Marcar dia como `excecao: true`
  - [ ] Desabilitar todos os horários
  - [ ] Retornar sucesso

- [ ] `desbloquearHorario(empresaId, data, horario)`:
  - [ ] Remover de `horariosBloqueados`
  - [ ] Retornar sucesso

### 2.4 Tela: `src/configuracoes.html`

**Seção 1: Perfil Profissional**
- [ ] Campo: Nome profissional (editável)
- [ ] Campo: Nicho (editável)
- [ ] Upload: Foto de perfil
- [ ] Botão: Salvar

**Seção 2: Horários de Trabalho**
- [ ] Checkboxes: Dias ativos
- [ ] Para cada dia: Inputs de horário
- [ ] Campo: Duração padrão
- [ ] Campo: Intervalo
- [ ] Botão: Salvar

**Seção 3: Regras de Cancelamento**
- [ ] Campo: Tempo mínimo (horas)
- [ ] Campo: Limite de trocas (por mês)
- [ ] Toggle: Agendamento online ativo/inativo
- [ ] Botão: Salvar

**Seção 4: Tema**
- [ ] Seletor: Cor primária (paleta pré-definida)
- [ ] Seletor: Cor de fundo (paleta pré-definida)
- [ ] Preview ao vivo
- [ ] Botão: Salvar

**Lógica:**
- [ ] Cada Salvar chama função correspondente em `firestore.js` e `agenda.js`
- [ ] Feedback visual (sucesso/erro)

### 2.5 Tela: `src/agenda.html`

**Visualização Mensal**
- [ ] Calendário mensal
- [ ] Cores: Verde (dias com agendamentos), Cinza (dias cheios), Azul (dias de folga)
- [ ] Clique em dia → passar para semanal daquele dia

**Visualização Semanal**
- [ ] Grid: Dias (segunda-domingo) vs Horários
- [ ] Blocos: Verde (ocupado), Branco (livre), Cinza (bloqueado)
- [ ] Clique em bloco vazio → modal para bloquear
- [ ] Clique em bloco ocupado → ver detalhes

**Visualização Diária**
- [ ] Lista de horários (30/30min ou 1h/1h)
- [ ] Ao lado: Detalhes do agendamento (se houver)
- [ ] Botão por horário: "Bloquear" (se livre)
- [ ] Botão por agendamento: "Ver detalhes"

### 2.6 CSS para Agenda

- [ ] `src/css/components.css`: Adicionar estilos de calendário
- [ ] Cores para status (ocupado, livre, bloqueado)
- [ ] Grid layout responsivo

### 2.7 Testes Manuais (Sprint 2)

- [ ] Profissional completa onboarding → dashboard liberado
- [ ] Configurações salvam corretamente
- [ ] Horários gerados baseado em config
- [ ] Visualizações (mês/semana/dia) carregam dados
- [ ] Bloquear horário → impedeprefigura agendamento
- [ ] Bloquear dia → desabilita todos os horários

---

## 📋 Sprint 3: Agendamentos (8-10 dias)

### 3.1 Firestore Collection: Agendamentos

**Collection: `empresas/{empresaId}/agendamentos`**

```
Document: {agendamentoId}
  - clienteId: string (referência)
  - profissionalId: string (referência)
  - empresaId: string
  - data: string (YYYY-MM-DD)
  - horario: string (HH:MM)
  - duracao: number (minutos)
  - status: enum (pendente, confirmado, cancelado, concluido, remarcado)
  - observacoes: string (do cliente)
  - observacoesInternas: string (do profissional)
  - criadoEm: timestamp
  - atualizadoEm: timestamp
  - confirmadoEm: timestamp (opcional)
  - canceladoEm: timestamp (opcional)
```

### 3.2 Firestore Collection: Clientes

**Collection: `empresas/{empresaId}/clientes`**

```
Document: {clienteId}
  - uid: string (Firebase Auth)
  - empresaId: string
  - nome: string
  - contato: string
  - preferencias: object
  - criadoEm: timestamp
  - status: enum (ativo, inativo, bloqueado)
  - observacoes: array
    [
      { texto: "string", criadoEm: timestamp }
    ]
```

### 3.3 Firestore Collection: Trocas

**Collection: `empresas/{empresaId}/trocas`**

```
Document: {trocaId}
  - agendamentoId: string
  - clienteId: string
  - dataAtual: string
  - horarioAtual: string
  - dataSugerida: string
  - horarioSugerido: string
  - status: enum (pendente, aceita, recusada)
  - criadoEm: timestamp
  - respondidoEm: timestamp (opcional)
```

- [ ] Criar collections acima no Firestore

### 3.4 Arquivo: `src/js/agendamentos.js`

**Funções principais:**

- [ ] `criarAgendamento(empresaId, dados)`:
  - [ ] Validar: data, horário, cliente
  - [ ] Verificar conflito (transação)
  - [ ] Se houver conflito: retornar erro
  - [ ] Criar cliente se não existir
  - [ ] Salvar em `agendamentos`
  - [ ] Status inicial: "pendente"
  - [ ] Disparar notificação ao profissional
  - [ ] Retornar agendamento criado

- [ ] `confirmarAgendamento(agendamentoId)`:
  - [ ] Update: `status = "confirmado"`
  - [ ] Update: `confirmadoEm = now()`
  - [ ] Disparar notificação ao cliente
  - [ ] Retornar sucesso

- [ ] `cancelarAgendamento(agendamentoId)`:
  - [ ] Update: `status = "cancelado"`
  - [ ] Update: `canceladoEm = now()`
  - [ ] Liberar horário automaticamente
  - [ ] Disparar notificação ao cliente
  - [ ] Retornar sucesso

- [ ] `remarcarAgendamento(agendamentoId, novaData, novoHorario)`:
  - [ ] Verificar conflito na nova data/horário
  - [ ] Update: `data`, `horario`, `status = "remarcado"`
  - [ ] Disparar notificação ao cliente
  - [ ] Retornar sucesso

- [ ] `carregarAgendamentoPendente(agendamentoId)`:
  - [ ] Query: documento específico
  - [ ] Retornar agendamento

- [ ] `carregarAgendamentos(empresaId, filtros = {})`:
  - [ ] Query: todos os agendamentos
  - [ ] Filtros opcionais: status, clienteId, data range
  - [ ] Retornar array

- [ ] `verificarConflito(empresaId, data, horario)`:
  - [ ] Query: agendamento em data/horário
  - [ ] Se existe e está "confirmado": retornar erro
  - [ ] Se não: retornar OK

### 3.5 Arquivo: `src/js/clientes.js`

**Funções principais:**

- [ ] `criarCliente(empresaId, dados)`:
  - [ ] Criar doc em `clientes`
  - [ ] Retornar cliente criado

- [ ] `carregarClientes(empresaId)`:
  - [ ] Query: todos os clientes
  - [ ] Para cada: contar agendamentos, próximo agendamento
  - [ ] Retornar array enriched

- [ ] `carregarClientePerfil(empresaId, clienteId)`:
  - [ ] Query: cliente + agendamentos + observações
  - [ ] Retornar cliente completo

- [ ] `salvarObservacao(empresaId, clienteId, observacao)`:
  - [ ] Adicionar ao array `observacoes`
  - [ ] Retornar sucesso

- [ ] `obterHistoricoCliente(empresaId, clienteId)`:
  - [ ] Query: agendamentos do cliente
  - [ ] Ordenar por data decrescente
  - [ ] Retornar array

### 3.6 Tela: `src/public.html`

**Leiaute:**

- [ ] Header: Nome do profissional
- [ ] Seção: Foto + Descrição (nicho)
- [ ] CTA: "Agendar Horário" (botão destaque)
- [ ] Se logado: "Meus Agendamentos"
- [ ] Rodapé: "Powered by AgendaEstética"

**Lógica:**

- [ ] Carregar dados de `empresas/{empresaId}/perfil`
- [ ] Ao clicar "Agendar": redirecionar fluxo de agendamento

### 3.7 Fluxo de Agendamento (Cliente)

**Passo 1: Escolher Data**
- [ ] Tela: `src/agendamento-data.html`
- [ ] Calendário mensal
- [ ] Dias indisponíveis: desabilitados
- [ ] Clique em dia: avançar passo 2

**Passo 2: Escolher Horário**
- [ ] Tela: `src/agendamento-horario.html`
- [ ] Lista de horários disponíveis
- [ ] Clique em horário: avançar passo 3

**Passo 3: Confirmar Dados**
- [ ] Tela: `src/agendamento-confirmacao.html`
- [ ] Mostrar resumo: profissional, data, horário, duração
- [ ] Campos: Nome cliente, Contato
- [ ] Campo: Observações (opcional)
- [ ] Botões: Confirmar | Cancelar

**Lógica:**

- [ ] Guardar estado em sessionStorage durante fluxo
- [ ] Passo 3: Chamar `criarAgendamento()`
- [ ] Sucesso: redirecionar para `/public.html` com confirmação
- [ ] Erro: mostrar mensagem

### 3.8 Tela: `src/agendamentos.html` (Profissional)

**Lista de Agendamentos Pendentes**
- [ ] Cards com:
  - [ ] Cliente (nome)
  - [ ] Data/Horário
  - [ ] Status (badge)
  - [ ] Botões: Ver detalhes | Confirmar | Recusar

**Ao clicar "Ver Detalhes":**
- [ ] Mostrar modal com:
  - [ ] Dados do cliente
  - [ ] Data/Horário
  - [ ] Observações do cliente
  - [ ] Campo: Observações internas (editável)
  - [ ] Botões: Confirmar | Cancelar | Remarcar

**Ao clicar "Remarcar":**
- [ ] Modal: Escolher nova data/horário
- [ ] Validar conflito
- [ ] Atualizar agendamento

### 3.9 Tela: `src/clientes.html`

**Lista de Clientes**
- [ ] Cards com:
  - [ ] Nome
  - [ ] Contato
  - [ ] Total de agendamentos
  - [ ] Próximo agendamento
  - [ ] Botão: "Ver perfil"

**Perfil do Cliente**
- [ ] Dados básicos
- [ ] Histórico (todos os agendamentos)
- [ ] Seção: Observações internas
  - [ ] Lista de observações com datas
  - [ ] Campo: Nova observação
  - [ ] Botão: Adicionar

### 3.10 Testes Manuais (Sprint 3)

- [ ] Cliente acessa página pública
- [ ] Cliente cria agendamento (3 passos)
- [ ] Sistema bloqueia agendamento duplicado
- [ ] Profissional vê agendamento pendente
- [ ] Profissional confirma → cliente notificado
- [ ] Profissional cancela → horário liberado
- [ ] Cliente vê histórico de agendamentos
- [ ] Observações de cliente salvam

---

## 📋 Sprint 4: UX, Temas e Notificações (6-8 dias)

### 4.1 Sistema de Temas (CSS Variables)

**Arquivo: `src/css/variables.css`**

- [ ] Definir CSS Variables:
  ```css
  :root {
    --color-primary: #e91e63;
    --color-background: #ffffff;
    --color-text: #333333;
    --color-border: #e0e0e0;
    /* ... mais */
  }
  ```

**Arquivo: `src/js/tema.js`**

- [ ] `carregarTemadoFirestore(empresaId)`:
  - [ ] Query: `empresas/{empresaId}/perfil`
  - [ ] Extrair cores
  - [ ] Retornar objeto

- [ ] `aplicarTema(temaConfig)`:
  - [ ] Validar por plano (free vs premium)
  - [ ] Aplicar CSS Variables via `document.documentElement.style`
  - [ ] Salvar em localStorage (para evitar flicker)

- [ ] `validarTemaComPlano(plano, cores)`:
  - [ ] Se free: apenas paleta limitada (4-5 cores)
  - [ ] Se premium: qualquer cor
  - [ ] Retornar boolean

- [ ] Chamar ao carregar app (em `app.js`)

### 4.2 Configuração de Tema (Tela)

**Em `src/configuracoes.html` — Seção Tema**

**Para Plano Free:**
- [ ] Seletor: Cor primária
  - [ ] Opções: Rosa, Azul, Verde, Roxo
- [ ] Seletor: Cor de fundo
  - [ ] Opções: Branco, Cinza Claro, Creme
- [ ] Preview ao vivo
- [ ] Marca d'água obrigatória

**Para Plano Premium:**
- [ ] Picker: Cor primária (qualquer cor)
- [ ] Picker: Cor de fundo (qualquer cor)
- [ ] Picker: Cor de texto (qualquer cor)
- [ ] Upload: Imagem de fundo
- [ ] Toggle: Remover marca d'água
- [ ] Preview ao vivo

**Lógica:**
- [ ] Chamar `salvarTema()` em firestore.js
- [ ] Atualizar em tempo real

### 4.3 Notificações

**Collection: `empresas/{empresaId}/notificacoes`**

```
Document: {notificacaoId}
  - tipo: enum (novo_agendamento, confirmacao, cancelamento, troca_pendente, etc)
  - destinatarioId: string (uid)
  - titulo: string
  - mensagem: string
  - agendamentoId: string (referência)
  - lida: boolean
  - criadoEm: timestamp
```

**Arquivo: `src/js/notificacoes.js`**

- [ ] `criarNotificacao(empresaId, tipo, destinatarioId, dados)`:
  - [ ] Criar doc em `notificacoes`
  - [ ] Retornar sucesso

- [ ] `carregarNotificacoes(destinatarioId, naoLidas = true)`:
  - [ ] Query: notificações do usuário
  - [ ] Filtro opcional: apenas não lidas
  - [ ] Ordenar por data decrescente
  - [ ] Retornar array

- [ ] `marcarComoLida(notificacaoId)`:
  - [ ] Update: `lida = true`
  - [ ] Retornar sucesso

- [ ] `listarNotificações()`:
  - [ ] Real-time listener
  - [ ] Atualizar badge no header

**Eventos que disparam Notificação:**

- [ ] Novo agendamento criado → profissional
- [ ] Agendamento confirmado → cliente
- [ ] Agendamento cancelado → ambos
- [ ] Solicitação de troca → profissional
- [ ] Troca aceita/recusada → cliente

### 4.4 Tela: `src/notificacoes.html`

- [ ] Header: Titulo "Notificações"
- [ ] Filtros: Todas | Não lidas
- [ ] Lista de notificações:
  - [ ] Cards com: Tipo (ícone), Mensagem, Data/hora, Status (lida/não lida)
  - [ ] Clique: redirecionar ao agendamento
- [ ] Ação: Marcar como lida

### 4.5 Badge de Notificações

- [ ] No header de todas as páginas protegidas:
  - [ ] Ícone de sino
  - [ ] Badge com número de não lidas
  - [ ] Dropdown ao clicar: últimas 5 notificações
  - [ ] Link "Ver todas"

### 4.6 Refinamento de UX

**Responsividade:**

- [ ] Testar todas as páginas em:
  - [ ] iPhone SE (375px)
  - [ ] Pixel 4 (412px)
  - [ ] iPad (768px)
  - [ ] Desktop (1440px)
- [ ] Ajustar layouts (stack vertical em mobile)
- [ ] Testar touch interactions

**Forms:**

- [ ] Validação em tempo real
- [ ] Mensagens de erro inline
- [ ] Desabilitar botão durante submit
- [ ] Focar em campo inválido

**Feedback Visual:**

- [ ] Loading spinners (durante requisições Firestore)
- [ ] Toasts de sucesso/erro
- [ ] Confirmações antes de ações destrutivas
- [ ] Transições suaves

### 4.7 Relatórios Básicos

**Tela: `src/relatorios.html`**

**Relatório 1: Atendimentos por Período**
- [ ] Seletor: Período (semana, mês, custom)
- [ ] Tabela:
  - [ ] Data | Horário | Cliente | Status | Duração
- [ ] Estatísticas: Total, Confirmados, Cancelados

**Relatório 2: Clientes Recorrentes**
- [ ] Tabela:
  - [ ] Cliente | Total Agendamentos | Última Visita | Taxa Show-up
- [ ] Ordenável por coluna

**Arquivo: `src/js/relatorios.js`**

- [ ] `gerarRelatorioPeriodo(empresaId, dataInicio, dataFim)`:
  - [ ] Query: agendamentos no período
  - [ ] Agrupar por status
  - [ ] Calcular estatísticas
  - [ ] Retornar dados

- [ ] `gerarRelatorioClientes(empresaId)`:
  - [ ] Query: clientes + contar agendamentos
  - [ ] Calcular taxa de show-up
  - [ ] Ordenar por frequência
  - [ ] Retornar array

### 4.8 Marca d'água

- [ ] Elemento HTML fixo no footer:
  ```html
  <div class="marca-dagua" id="marcaDagua">Powered by AgendaEstética</div>
  ```

- [ ] CSS:
  ```css
  .marca-dagua {
    position: fixed;
    bottom: 10px;
    right: 10px;
    font-size: 12px;
    opacity: 0.3;
  }
  
  .premium .marca-dagua {
    display: none;
  }
  ```

- [ ] Lógica: Esconder se plano === "premium"

### 4.9 Feature Flags

**Arquivo: `src/js/utils.js`** ou novo `src/js/features.js`

```javascript
const FEATURES_BY_PLAN = {
  free: {
    agendamentoOnline: true,
    trocas: true,
    personalizacaoLimitada: true,
    imagemFundo: false,
    relatoriAvancado: false,
    removerMarcaDagua: false
  },
  premium: {
    agendamentoOnline: true,
    trocas: true,
    personalizacaoCompleta: true,
    imagemFundo: true,
    relatorioAvancado: true,
    removerMarcaDagua: true
  }
};

function temFeature(feature, plano) {
  return FEATURES_BY_PLAN[plano]?.[feature] ?? false;
}
```

- [ ] Usar em validações antes de permitir ações premium

### 4.10 Testes Manuais (Sprint 4)

- [ ] Free: cores limitadas, marca d'água visível
- [ ] Premium: cores livres, imagem fundo, marca d'água removida
- [ ] Tema aplica em todas as páginas
- [ ] Notificações criadas nos eventos corretos
- [ ] Badge mostra número correto
- [ ] Marcar como lida funciona
- [ ] Relatórios mostram dados corretos
- [ ] Página responsiva em 4+ dispositivos

---

## 📋 Sprint 5: Deploy e Produção (5-7 dias)

### 5.1 Otimização de Performance

- [ ] Minificar CSS e JS
- [ ] Comprimir imagens
- [ ] Lazy load de imagens
- [ ] Remover console.log em produção
- [ ] Otimizar Font Awesome ou icons

### 5.2 Variáveis de Ambiente (Produção)

- [ ] Criar `.env` com credenciais reais (NÃO commitar)
- [ ] Configurar em Vercel dashboard
- [ ] Testar que variáveis são acessadas corretamente

### 5.3 Regras de Segurança Firestore (Finalização)

**Implementar regras completas:**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários podem ler/escrever seu próprio documento
    match /usuarios/{uid} {
      allow read: if request.auth.uid == uid;
      allow write: if request.auth.uid == uid 
        && (
          request.resource.data.empresaId == resource.data.empresaId
          || !('empresaId' in request.resource.data)
        );
    }

    // Empresas: acesso filtrado por empresaId
    match /empresas/{empresaId} {
      // Leitura: profissional da empresa
      allow read: if request.auth.uid != null 
        && exists(/databases/$(database)/documents/usuarios/$(request.auth.uid))
        && get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.empresaId == empresaId;

      // Escrita: profissional (admin) apenas
      allow write: if request.auth.uid != null
        && exists(/databases/$(database)/documents/usuarios/$(request.auth.uid))
        && get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.role == 'profissional'
        && get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.empresaId == empresaId;

      // Subcoleções
      match /{subcollection=**} {
        allow read, write: if request.auth.uid != null
          && exists(/databases/$(database)/documents/usuarios/$(request.auth.uid))
          && get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.empresaId == empresaId;
      }
    }
  }
}
```

- [ ] Implementar no Firestore Console
- [ ] Testar acesso cruzado (deve bloquear)
- [ ] Testar acesso legítimo (deve permitir)

### 5.4 Checklist de Segurança

- [ ] Nenhuma chave privada no frontend
- [ ] Nenhuma chave no `.git` (verificar histórico)
- [ ] Autenticação obrigatória em rotas protegidas
- [ ] Validação de `empresaId` em todas as queries
- [ ] Senhas não armazenadas localmente
- [ ] HTTPS enforçado (Vercel automático)
- [ ] Firebase Rules testadas

### 5.5 Testes em Produção (Smoke Tests)

**Após deploy:**

- [ ] [ ] Login profissional funciona
- [ ] [ ] Login cliente funciona
- [ ] [ ] Dashboard carrega
- [ ] [ ] Página pública acessível
- [ ] [ ] Criar agendamento funciona
- [ ] [ ] Notificações disparam
- [ ] [ ] Tema aplica
- [ ] [ ] Nenhum erro no console do navegador

### 5.6 Build e Deploy

**Localmente:**

- [ ] Rodar build: `npm run build` (se usar tooling)
- [ ] Verificar output (sem erros)
- [ ] Testar: `npm run preview`

**Vercel:**

- [ ] Confirmar variáveis de ambiente
- [ ] Push para `main`
- [ ] Vercel auto-deploya
- [ ] Acessar URL de produção
- [ ] Verificar status de build

### 5.7 Documentação Final

- [ ] Atualizar `README.md`:
  - [ ] O que é AgendaEstética
  - [ ] Stack técnico
  - [ ] Como rodar localmente
  - [ ] Deploy

- [ ] Criar `docs/FIRESTORE-SCHEMA.md`:
  - [ ] Collections completas
  - [ ] Estrutura de documentos
  - [ ] Relacionamentos

- [ ] Criar `docs/REGRAS-SEGURANCA.md`:
  - [ ] Rules Firestore
  - [ ] Acessos permitidos
  - [ ] Riscos e mitigação

- [ ] Criar `docs/API-FUNCOES.md`:
  - [ ] Lista de funções JS
  - [ ] Assinatura (inputs, outputs)
  - [ ] Exemplos de uso

### 5.8 Testes Críticos (Passar em Produção)

**26 Testes Obrigatórios:**

1. [ ] TC-001: Login cliente novo cria usuário
2. [ ] TC-002: Login profissional bloqueia se onboarding incompleto
3. [ ] TC-003: Cliente acessa apenas sua empresa
4. [ ] TC-004: Profissional acessa apenas sua empresa
5. [ ] TC-005: Logout limpa sessão
6. [ ] TC-006: Refresh mantém sessão válida
7. [ ] TC-007: URL inválida redireciona login
8. [ ] TC-008: Onboarding completo desbloqueia dashboard
9. [ ] TC-009: Configurações salvam e persistem
10. [ ] TC-010: Horários bloqueados não aparecem para cliente
11. [ ] TC-011: Dia bloqueado desabilita todos os horários
12. [ ] TC-012: Cliente cria agendamento em 3 passos
13. [ ] TC-013: Sistema bloqueia agendamento duplicado
14. [ ] TC-014: Profissional confirma agendamento
15. [ ] TC-015: Cliente vê agendamento confirmado
16. [ ] TC-016: Cliente cancela agendamento e horário libera
17. [ ] TC-017: Cliente solicita troca
18. [ ] TC-018: Profissional aceita troca
19. [ ] TC-019: Profissional recusa troca
20. [ ] TC-020: Free: apenas cores limitadas
21. [ ] TC-021: Premium: cores livres + imagem fundo
22. [ ] TC-022: Tema aplica em todas as páginas
23. [ ] TC-023: Marca d'água esconde no premium
24. [ ] TC-024: Novo agendamento dispara notificação
25. [ ] TC-025: Badge mostra número correto
26. [ ] TC-026: Marcar como lida funciona

### 5.9 Monitoramento em Produção

- [ ] Vercel Analytics: vigilar Core Web Vitals
  - [ ] LCP < 2.5s
  - [ ] FID < 100ms
  - [ ] CLS < 0.1
- [ ] Firebase Console: vigilar quota
- [ ] Verificar logs de erro

### 5.10 Go-Live Checklist

- [ ] [ ] Code review completado
- [ ] [ ] 26 testes críticos PASS
- [ ] [ ] Documentação atualizada
- [ ] [ ] Backup de dados (se houver dados piloto)
- [ ] [ ] Monitoramento ativo
- [ ] [ ] Suporte/FAQ pronto
- [ ] [ ] Notificar usuários iniciais

---

# 5. FUNÇÕES OBRIGATÓRIAS POR ARQUIVO JS

## `src/js/config.js`

```javascript
// Exportar Firebase config
export const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Constantes e enums
export const ROLES = {
  PROFISSIONAL: 'profissional',
  CLIENTE: 'cliente'
};

export const STATUS_AGENDAMENTO = {
  PENDENTE: 'pendente',
  CONFIRMADO: 'confirmado',
  CANCELADO: 'cancelado',
  CONCLUIDO: 'concluido',
  REMARCADO: 'remarcado'
};

export const PLANOS = {
  FREE: 'free',
  PREMIUM: 'premium'
};

// Exportar instâncias Firebase
export let db, auth, storage;

export function initializeFirebase() {
  // Inicializar Firebase
  // Atribuir db, auth, storage
}
```

## `src/js/auth.js`

```javascript
// Login / Cadastro / Sessão

export async function loginCliente(nome, contato, empresaId) {
  // 1. Verificar se cliente existe em BD
  // 2. Se não, criar automaticamente
  // 3. Salvar em sessionStorage: uid, empresaId, role
  // 4. Retornar objeto usuário
}

export async function loginProfissional(email, senha, empresaId) {
  // 1. Firebase Auth: signInWithEmailAndPassword
  // 2. Verificar se profissional pertence à empresa
  // 3. Se 1º login (onboarding incompleto): redirecionar onboarding
  // 4. Salvar sessão
  // 5. Retornar usuário
}

export async function cadastroProfissional(email, senha, nome, nicho, empresaId) {
  // 1. Firebase Auth: createUserWithEmailAndPassword
  // 2. Criar doc em usuarios/{uid}
  // 3. Criar doc em empresas/{empresaId}
  // 4. Criar subcollection profissionais
  // 5. Retornar usuário
}

export async function logout() {
  // 1. Firebase Auth: signOut()
  // 2. Limpar sessionStorage
  // 3. Redirecionar para /login.html
}

export function verificarSessao() {
  // 1. Ler sessionStorage
  // 2. Se válido: retornar usuário
  // 3. Se não: retornar null
}

export async function restaurarSessaoAposRefresh() {
  // 1. Verificar Firebase Auth state
  // 2. Restaurar sessionStorage
  // 3. Atualizar lastAccess
}

export async function verificarOnboardingCompleto(uid, empresaId) {
  // 1. Query: empresas/{empresaId}/configuracoes
  // 2. Verificar campos obrigatórios
  // 3. Retornar boolean
}

export async function salvarOnboarding(empresaId, dados) {
  // 1. Salvar em empresas/{empresaId}/perfil
  // 2. Salvar em empresas/{empresaId}/configuracoes
  // 3. Marcar onboarding como concluído
  // 4. Redirecionar /dashboard.html
}
```

## `src/js/permissoes.js`

```javascript
export function verificarAutenticacao() {
  // Retornar: boolean (está logado?)
  // Se não: redirecionar /login.html
}

export function verificarTipo(tipoEsperado) {
  // Comparar role da sessão com tipoEsperado
  // Se diferente: redirecionar /404.html
  // Retornar: boolean
}

export function protegerRota(tipoPermitido) {
  // Verificar auth + tipo
  // Se não autorizado: bloquear e redirecionar
}

export function obterUidAtual() {
  // Retornar: uid da sessão
}

export function obterEmpresaIdAtual() {
  // Retornar: empresaId da sessão
}

export function obterTipoAtual() {
  // Retornar: role da sessão
}
```

## `src/js/firestore.js`

```javascript
// CRUD genérico e queries filtradas por empresaId

export async function criar(colecao, dados, empresaId = null) {
  // Validar empresaId se requerido
  // Adicionar timestamp criadoEm
  // Salvar em Firestore
  // Retornar documento criado com ID
}

export async function atualizar(colecao, docId, dados, empresaId = null) {
  // Validar empresaId
  // Update parcial
  // Adicionar timestamp atualizadoEm
  // Retornar sucesso
}

export async function deletar(colecao, docId, empresaId = null) {
  // Validar permissão
  // Deletar documento
  // Retornar sucesso
}

export async function listar(colecao, filtros = {}, empresaId = null) {
  // Query com filtros
  // SEMPRE adicionar filtro empresaId
  // Ordenar por criadoEm DESC
  // Retornar array
}

export async function lerDocumento(colecao, docId, empresaId = null) {
  // Validar empresaId
  // Ler documento
  // Retornar dados
}

export function ouvir(colecao, callback, filtros = {}, empresaId = null) {
  // Real-time listener
  // Útil para atualizações em tempo real
  // Retornar unsubscribe function
}

// Transações (importante para conflitos de horários)
export async function executarTransacao(callback) {
  // Executar callback em transação
  // Retornar resultado
}
```

## `src/js/agenda.js`

```javascript
// Lógica de horários e geração de disponibilidade

export function gerarHorariosDisponiveis(configuracoes, data) {
  // Inputs: config (horário inicio, fim, duração, intervalo), data
  // Retornar: array de horários
  // Ex: ["09:00", "10:15", "11:30", ...]
}

export async function carregarConfiguracoes(empresaId) {
  // Query: empresas/{empresaId}/configuracoes
  // Retornar: objeto com horários, durações, etc
}

export async function carregarAgendaMês(empresaId, ano, mês) {
  // Query: agendamentos do mês
  // Contar por dia
  // Retornar: objeto com dados agregados
}

export async function carregarAgendaSemana(empresaId, dataInicio) {
  // Query: agendamentos de 7 dias
  // Estruturar para visualização semanal
  // Retornar: array com dados diários
}

export async function carregarAgendaDia(empresaId, data) {
  // Query: agendamentos do dia
  // Gerar horários livres/ocupados
  // Retornar: grid horária
}

export async function bloquearHorario(empresaId, data, horario, motivo) {
  // Criar/atualizar doc em agenda/{data}
  // Adicionar ao array horariosBloqueados
  // Retornar: sucesso
}

export async function bloquearDia(empresaId, data, motivo) {
  // Marcar como excecao: true
  // Desabilitar todos os horários
  // Retornar: sucesso
}

export async function desbloquearHorario(empresaId, data, horario) {
  // Remover de horariosBloqueados
  // Retornar: sucesso
}

export async function verificarConflito(empresaId, data, horario) {
  // Query: agendamento em data/horário
  // Se existe e confirmado: erro
  // Retornar: {conflito: boolean, erro?: string}
}
```

## `src/js/agendamentos.js`

```javascript
// CRUD de agendamentos e lógica de status

export async function criarAgendamento(empresaId, dados) {
  // 1. Validar dados
  // 2. Verificar conflito (transação)
  // 3. Criar cliente se não existir
  // 4. Salvar em agendamentos
  // 5. Status = "pendente"
  // 6. Disparar notificação ao profissional
  // 7. Retornar agendamento criado
}

export async function confirmarAgendamento(agendamentoId) {
  // Update: status = "confirmado", confirmadoEm = now()
  // Disparar notificação ao cliente
  // Retornar: sucesso
}

export async function cancelarAgendamento(agendamentoId) {
  // Update: status = "cancelado", canceladoEm = now()
  // Liberar horário automaticamente
  // Disparar notificação ao cliente
  // Retornar: sucesso
}

export async function remarcarAgendamento(agendamentoId, novaData, novoHorario) {
  // 1. Verificar conflito na nova data/horário
  // 2. Update: data, horario, status = "remarcado"
  // 3. Disparar notificação ao cliente
  // 4. Retornar: sucesso
}

export async function carregarAgendamentos(empresaId, filtros = {}) {
  // Query: todos os agendamentos
  // Filtros opcionais: status, clienteId, data range
  // Retornar: array
}

export async function carregarAgendamento(agendamentoId) {
  // Query: documento específico
  // Retornar: agendamento
}
```

## `src/js/clientes.js`

```javascript
// Gestão de clientes e observações

export async function criarCliente(empresaId, dados) {
  // Criar doc em clientes
  // Retornar: cliente criado
}

export async function carregarClientes(empresaId) {
  // Query: todos os clientes
  // Para cada: contar agendamentos, próximo agendamento
  // Retornar: array enriched
}

export async function carregarClientePerfil(empresaId, clienteId) {
  // Query: cliente + agendamentos + observações
  // Retornar: cliente completo
}

export async function salvarObservacao(empresaId, clienteId, observacao) {
  // Adicionar ao array observacoes
  // Retornar: sucesso
}

export async function obterHistoricoCliente(empresaId, clienteId) {
  // Query: agendamentos do cliente
  // Ordenar por data DESC
  // Retornar: array
}
```

## `src/js/tema.js`

```javascript
// CSS Variables dinâmicos e validação

export async function carregarTemadoFirestore(empresaId) {
  // Query: empresas/{empresaId}/perfil
  // Extrair objeto tema
  // Retornar: objeto com cores
}

export function aplicarTema(temaConfig) {
  // Validar por plano
  // Aplicar CSS Variables via document.documentElement.style
  // Salvar em localStorage
  // Retornar: sucesso
}

export function validarTemaComPlano(plano, cores) {
  // Se free: apenas paleta limitada
  // Se premium: qualquer cor
  // Retornar: boolean
}

export async function salvarTema(empresaId, temaConfig) {
  // Validar com plano
  // Salvar em empresas/{empresaId}/perfil
  // Aplicar tema
  // Retornar: sucesso
}
```

## `src/js/notificacoes.js`

```javascript
// Sistema de notificações

export async function criarNotificacao(empresaId, tipo, destinatarioId, dados) {
  // Criar doc em notificacoes
  // Incluir: tipo, titulo, mensagem, referência (agendamentoId)
  // Retornar: sucesso
}

export async function carregarNotificacoes(destinatarioId, naoLidas = true) {
  // Query: notificações do usuário
  // Filtro opcional: apenas não lidas
  // Ordenar por criadoEm DESC
  // Retornar: array
}

export async function marcarComoLida(notificacaoId) {
  // Update: lida = true
  // Retornar: sucesso
}

export function ouvirNotificacoes(destinatarioId, callback) {
  // Real-time listener
  // Chamar callback quando novas notificações chegam
  // Retornar: unsubscribe function
}
```

## `src/js/relatorios.js`

```javascript
// Agregação de dados para relatórios

export async function gerarRelatorioPeriodo(empresaId, dataInicio, dataFim) {
  // Query: agendamentos no período
  // Agrupar por status
  // Calcular: total, confirmados, cancelados
  // Retornar: objeto com estatísticas
}

export async function gerarRelatorioClientes(empresaId) {
  // Query: clientes + contar agendamentos
  // Calcular taxa de show-up
  // Ordenar por frequência
  // Retornar: array
}
```

## `src/js/utils.js`

```javascript
// Helpers gerais

export function formatarData(date, formato = 'DD/MM/YYYY') {
  // Retornar data formatada
}

export function formatarHora(time) {
  // Retornar hora em HH:MM
}

export function validarEmail(email) {
  // Retornar: boolean
}

export function validarTelefone(phone) {
  // Retornar: boolean
}

export function gerarId() {
  // Gerar ID único (UUID ou similar)
  // Retornar: string
}

export function salvarLocalStorage(chave, valor) {
  // Salvar em localStorage
}

export function lerLocalStorage(chave) {
  // Ler de localStorage
  // Retornar: valor
}

export function limparLocalStorage(chave) {
  // Limpar chave
}

// Feature flags
export const FEATURES_BY_PLAN = {
  free: {
    agendamentoOnline: true,
    trocas: true,
    personalizacaoLimitada: true,
    imagemFundo: false,
    relatorioAvancado: false,
    removerMarcaDagua: false
  },
  premium: {
    agendamentoOnline: true,
    trocas: true,
    personalizacaoCompleta: true,
    imagemFundo: true,
    relatorioAvancado: true,
    removerMarcaDagua: true
  }
};

export function temFeature(feature, plano) {
  // Verificar se feature está ativada no plano
  // Retornar: boolean
}
```

## `src/js/app.js`

```javascript
// Bootstrap e inicialização

export async function inicializar() {
  // 1. Chamar config.js (setup Firebase)
  // 2. Chamar verificarSessao() de auth.js
  // 3. Se logado:
  //    a. Proteger rota se necessário
  //    b. Carregar tema
  //    c. Configurar listeners
  // 4. Se não: redirecionar login
}

// Executar ao carregar página
document.addEventListener('DOMContentLoaded', () => {
  inicializar();
});
```

---

# 6. ESTRUTURA DO FIRESTORE

## Collections Principais

### `usuarios` (Root Level)

```
usuarios/{uid}
  - uid: string
  - empresaId: string
  - role: "profissional" | "cliente"
  - nome: string
  - contato: string (email ou telefone)
  - ativo: boolean
  - criadoEm: timestamp
  - ultimoAcesso: timestamp
```

### `empresas` (Root Level)

```
empresas/{empresaId}
  - empresaId: string (slug, ex: "barbearia-joao")
  - nome: string
  - nicho: string (texto livre)
  - status: "ativa" | "suspensa"
  - plano: "free" | "premium"
  - criadaEm: timestamp
  
  [Subcollections abaixo]
```

#### Subcollection: `profissionais`

```
empresas/{empresaId}/profissionais/{profissionalId}
  - uid: string (referência a usuarios)
  - nome: string
  - role: "admin" | "colaborador"
  - ativo: boolean
  - criadoEm: timestamp
```

#### Subcollection: `configuracoes`

```
empresas/{empresaId}/configuracoes/config
  - agendamentoOnlineAtivo: boolean
  - tempoMinimoRemarcacao: number (horas)
  - limiteSolicitacoesTroca: number
  - politicaCancelamento: string
  - diasAtivos: array ["segunda", "terca", ...]
  - horariosBase: object
    {
      segunda: { inicio: "09:00", fim: "18:00" },
      terca: { inicio: "09:00", fim: "18:00" },
      ...
    }
  - durationPadrao: number (minutos)
  - intervaloPadrao: number (minutos)
```

#### Subcollection: `perfil`

```
empresas/{empresaId}/perfil/dados
  - nomePublico: string
  - descricao: string
  - fotoPerfil: string (URL Firebase Storage)
  - banner: string (URL Firebase Storage, apenas premium)
  - tema: object
    {
      plan: "free" | "premium",
      primary: string (cor, ex: "#e91e63"),
      background: string (cor, ex: "#ffffff"),
      text: string (cor, ex: "#333333"),
      backgroundImage: string (URL, apenas premium) | null,
      mostrarMarcaDagua: boolean
    }
```

#### Subcollection: `clientes`

```
empresas/{empresaId}/clientes/{clienteId}
  - uid: string (Firebase Auth)
  - empresaId: string
  - nome: string
  - contato: string (email ou telefone)
  - preferencias: object {}
  - criadoEm: timestamp
  - status: "ativo" | "inativo" | "bloqueado"
  - observacoes: array
    [
      { texto: string, criadoEm: timestamp },
      ...
    ]
```

#### Subcollection: `agenda`

```
empresas/{empresaId}/agenda/{data}
  - data: string (YYYY-MM-DD)
  - horariosDisponiveis: array
    [
      { horario: "09:00", disponivel: true, ocupado: false },
      { horario: "10:00", disponivel: true, ocupado: false },
      ...
    ]
  - horariosBloqueados: array
    [
      { horario: "12:00", motivo: "almoço" },
      ...
    ]
  - excecao: boolean (dia fora do padrão)
  - criadoEm: timestamp
```

#### Subcollection: `agendamentos`

```
empresas/{empresaId}/agendamentos/{agendamentoId}
  - clienteId: string
  - profissionalId: string
  - empresaId: string
  - data: string (YYYY-MM-DD)
  - horario: string (HH:MM)
  - duracao: number (minutos)
  - status: "pendente" | "confirmado" | "cancelado" | "concluido" | "remarcado"
  - observacoes: string (do cliente)
  - observacoesInternas: string (do profissional)
  - criadoEm: timestamp
  - atualizadoEm: timestamp
  - confirmadoEm: timestamp (opcional)
  - canceladoEm: timestamp (opcional)
```

#### Subcollection: `trocas`

```
empresas/{empresaId}/trocas/{trocaId}
  - agendamentoId: string
  - clienteId: string
  - dataAtual: string (YYYY-MM-DD)
  - horarioAtual: string (HH:MM)
  - dataSugerida: string (YYYY-MM-DD)
  - horarioSugerido: string (HH:MM)
  - status: "pendente" | "aceita" | "recusada"
  - criadoEm: timestamp
  - respondidoEm: timestamp (opcional)
```

#### Subcollection: `notificacoes`

```
empresas/{empresaId}/notificacoes/{notificacaoId}
  - tipo: enum
    "novo_agendamento" |
    "confirmacao" |
    "cancelamento" |
    "troca_pendente" |
    "troca_aceita" |
    "troca_recusada"
  - destinatarioId: string (uid)
  - titulo: string
  - mensagem: string
  - agendamentoId: string (referência)
  - trocaId: string (referência, opcional)
  - lida: boolean
  - criadoEm: timestamp
```

## Índices Recomendados no Firestore

```
Collection: agendamentos
  Índice Composto:
    - empresaId (Ascending)
    - status (Ascending)
    - data (Descending)
    
  Índice Composto:
    - empresaId (Ascending)
    - clienteId (Ascending)
    - data (Descending)

Collection: notificacoes
  Índice Composto:
    - empresaId (Ascending)
    - destinatarioId (Ascending)
    - lida (Ascending)
    - criadoEm (Descending)
```

---

# 7. REGRAS DE SEGURANÇA FIRESTORE

## Estratégia Geral

1. **Isolamento por `empresaId`**: Toda query deve filtrar por empresa
2. **Autenticação obrigatória**: Nenhum acesso anônimo
3. **Validação de role**: Profissional (admin) vs Cliente
4. **Documentos privados**: Cliente só acessa seus dados

## Rules Completas

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Usuários: acesso apenas ao próprio documento
    match /usuarios/{uid} {
      allow read: if request.auth.uid == uid;
      allow create: if request.auth.uid == uid;
      allow update: if request.auth.uid == uid 
        && request.resource.data.empresaId == resource.data.empresaId
        && !('role' in request.resource.data);
      allow delete: if false; // Não permitir deleção
    }

    // Empresas: acesso controlado
    match /empresas/{empresaId} {
      // Leitura: profissional ou cliente da empresa
      allow read: if request.auth.uid != null 
        && exists(/databases/$(database)/documents/usuarios/$(request.auth.uid))
        && get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.empresaId == empresaId;

      // Criação: apenas primeira vez (novo profissional)
      allow create: if request.auth.uid != null
        && request.resource.data.empresaId == empresaId;

      // Atualização: profissional (admin) apenas
      allow update: if request.auth.uid != null
        && exists(/databases/$(database)/documents/usuarios/$(request.auth.uid))
        && get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.role == 'profissional'
        && get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.empresaId == empresaId;

      allow delete: if false; // Não permitir deleção

      // Subcollections: profissional (admin) acesso total
      match /profissionais/{doc=**} {
        allow read, write: if isProfissionalDaEmpresa(empresaId);
      }

      match /configuracoes/{doc=**} {
        allow read: if isClienteOuProfissionalDaEmpresa(empresaId);
        allow write: if isProfissionalDaEmpresa(empresaId);
      }

      match /perfil/{doc=**} {
        allow read: if isClienteOuProfissionalDaEmpresa(empresaId);
        allow write: if isProfissionalDaEmpresa(empresaId);
      }

      match /clientes/{clienteId} {
        allow read: if isClienteOuProfissionalDaEmpresa(empresaId)
          && (isProfissionalDaEmpresa(empresaId) 
            || request.auth.uid == resource.data.uid);
        allow create, update: if isClienteOuProfissionalDaEmpresa(empresaId);
        allow delete: if false;
      }

      match /agenda/{doc=**} {
        allow read: if isClienteOuProfissionalDaEmpresa(empresaId);
        allow write: if isProfissionalDaEmpresa(empresaId);
      }

      match /agendamentos/{agendamentoId} {
        allow read: if isClienteOuProfissionalDaEmpresa(empresaId)
          && (isProfissionalDaEmpresa(empresaId) 
            || request.auth.uid == resource.data.clienteId);
        allow create: if isClienteOuProfissionalDaEmpresa(empresaId);
        allow update: if isClienteOuProfissionalDaEmpresa(empresaId)
          && (isProfissionalDaEmpresa(empresaId) 
            || (request.auth.uid == resource.data.clienteId 
              && canClienteModificar(resource)));
        allow delete: if false;
      }

      match /trocas/{trocaId} {
        allow read: if isClienteOuProfissionalDaEmpresa(empresaId)
          && (isProfissionalDaEmpresa(empresaId) 
            || request.auth.uid == resource.data.clienteId);
        allow create: if isClienteOuProfissionalDaEmpresa(empresaId)
          && request.auth.uid == request.resource.data.clienteId;
        allow update: if isClienteOuProfissionalDaEmpresa(empresaId)
          && (isProfissionalDaEmpresa(empresaId) 
            || request.auth.uid == resource.data.clienteId);
        allow delete: if false;
      }

      match /notificacoes/{notificacaoId} {
        allow read: if request.auth.uid != null
          && request.auth.uid == resource.data.destinatarioId
          && isClienteOuProfissionalDaEmpresa(empresaId);
        allow create, update: if isProfissionalDaEmpresa(empresaId);
        allow delete: if request.auth.uid == resource.data.destinatarioId;
      }
    }

    // Helper functions
    function isProfissionalDaEmpresa(empresaId) {
      return request.auth.uid != null
        && exists(/databases/$(database)/documents/usuarios/$(request.auth.uid))
        && get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.role == 'profissional'
        && get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.empresaId == empresaId;
    }

    function isClienteDaEmpresa(empresaId) {
      return request.auth.uid != null
        && exists(/databases/$(database)/documents/usuarios/$(request.auth.uid))
        && get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.role == 'cliente'
        && get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.empresaId == empresaId;
    }

    function isClienteOuProfissionalDaEmpresa(empresaId) {
      return request.auth.uid != null
        && exists(/databases/$(database)/documents/usuarios/$(request.auth.uid))
        && get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.empresaId == empresaId;
    }

    function canClienteModificar(resource) {
      // Cliente pode modificar apenas cancelamento
      return request.resource.data.status == 'cancelado'
        || request.resource.data.status == 'remarcado';
    }
  }
}
```

## Pontos Críticos de Segurança

| Ponto | Risco | Mitigação |
|-------|-------|-----------|
| Acesso cruzado entre empresas | Cliente de empresa A acessa dados de empresa B | Filtrar `empresaId` em TODAS as queries + Rules |
| Cliente modifica agendamento alheio | Cliente modifica status de outro cliente | Rules: cliente só pode deletar próprio agendamento |
| Profissional sem autenticação forte | Acesso à conta do profissional comprometida | Firebase Auth: email + senha reforçadas |
| Excesso de leitura em Firestore | Quota excedida, custo alto | Estrutura de dados plana, índices otimizados |
| SQL Injection (NoSQL) | Injeção de dados | Usar Firebase SDK (não concatenar strings) |
| Exposição de dados sensíveis | Telefone/email expostos | Subcollections com acesso restrito |

---

# 8. FLUXOS CRÍTICOS DETALHADOS

## Fluxo 1: Login e Primeira Entrada

### Cenário: Profissional novo (nunca acessou antes)

```
1. Usuário acessa https://agendaestetica.com/
   ↓
2. Clica em "Sou Profissional"
   ↓
3. É direcionado a /login.html?type=profissional
   ↓
4. Preenche: Email, Senha, Nome, Nicho
   ↓
5. Clica "Entrar"
   ↓
6. auth.js: cadastroProfissional()
   - Firebase Auth: createUserWithEmailAndPassword()
   - Criar doc em usuarios/{uid}
   - Criar doc em empresas/{empresaId}
   - Subcollection profissionais criada
   ↓
7. Sistema verifica: verificarOnboardingCompleto() = false
   ↓
8. Redireciona automaticamente para /onboarding.html
   ↓
9. Profissional preenche:
   - Nome profissional
   - Nicho
   - Dias ativos (segunda-domingo)
   - Horários por dia
   - Duração padrão
   - Intervalo
   ↓
10. Clica "Concluir Onboarding"
    ↓
11. auth.js: salvarOnboarding()
    - Salva em empresas/{empresaId}/configuracoes/config
    - Salva em empresas/{empresaId}/perfil/dados
    - Sistema marca: onboardingConcluido = true
    ↓
12. Redireciona para /dashboard.html
    ↓
13. Dashboard carregado com sucesso
```

### Cenário: Cliente novo (sem cadastro)

```
1. Profissional compartilha link:
   https://agendaestetica.com/p/barbearia-joao
   ↓
2. Cliente acessa link
   ↓
3. Sistema extrai empresaId = "barbearia-joao"
   ↓
4. Página /public.html carregada
   ↓
5. Se cliente não logado:
   - Botão "Agendar" redireciona para /login.html?type=cliente&empresa=barbearia-joao
   ↓
6. Cliente preenche: Nome, Contato (WhatsApp)
   ↓
7. Clica "Agendar"
   ↓
8. auth.js: loginCliente()
   - Verifica se cliente existe em clientes/{clienteId}
   - Se não: cria automaticamente
   - Salva sessão (uid, empresaId, role)
   ↓
9. Redireciona para fluxo de agendamento
```

## Fluxo 2: Criação de Agendamento (Cliente)

```
Pré-requisito: Cliente já está autenticado em /public.html

1. Cliente clica "Agendar Horário"
   ↓
2. Redireciona para /agendamento-data.html
   ↓
3. Calendário mensal exibido
   - agenda.js: carregarAgendaMês()
   - Mostra apenas dias com vagas
   ↓
4. Cliente escolhe data (ex: 15/02/2026)
   ↓
5. Clica "Próximo"
   ↓
6. Redireciona para /agendamento-horario.html
   ↓
7. agenda.js: carregarAgendaDia()
   - Gera horários disponíveis
   - Filtra horários bloqueados
   - Mostra lista: ["09:00", "10:15", "11:30", ...]
   ↓
8. Cliente escolhe horário (ex: 10:15)
   ↓
9. Clica "Próximo"
   ↓
10. Redireciona para /agendamento-confirmacao.html
    ↓
11. Mostrada resumo:
    - Profissional: Barbearia do João
    - Data: 15/02/2026
    - Horário: 10:15
    - Duração: 60 minutos
    ↓
12. Campos pré-preenchidos (se logado):
    - Nome: [nome do cliente]
    - Contato: [contato do cliente]
    ↓
13. Cliente clica "Confirmar Agendamento"
    ↓
14. agendamentos.js: criarAgendamento()
    - Transação Firestore:
      a. Verificar conflito (agenda.js: verificarConflito())
      b. Se conflito: erro, voltar ao passo 7
      c. Se OK: criar doc em agendamentos
    - Criar cliente se não existir
    - Status = "pendente"
    - notificacoes.js: criarNotificacao()
      → Tipo: "novo_agendamento"
      → Destinatário: profissional
    ↓
15. Redireciona para /public.html com mensagem:
    "Agendamento solicitado! Aguarde confirmação."
    ↓
16. [FIM]
```

## Fluxo 3: Confirmação de Agendamento (Profissional)

```
Pré-requisito: Profissional vê dashboard com abas (Agendamentos)

1. Dashboard mostra:
   "Você tem 1 agendamento pendente"
   ↓
2. Profissional clica em abaPendente"
   ↓
3. agendamentos.js: carregarAgendamentos(status='pendente')
   - Query: agendamentos where status = "pendente"
   - Mostra cards com:
     Cliente: Maria
     Data: 15/02/2026
     Horário: 10:15
     Botões: [Confirmar] [Recusar]
   ↓
4. Profissional clica "Confirmar"
   ↓
5. agendamentos.js: confirmarAgendamento()
   - Update: status = "confirmado"
   - Update: confirmadoEm = now()
   - notificacoes.js: criarNotificacao()
     → Tipo: "confirmacao"
     → Destinatário: cliente (Maria)
   ↓
6. UI atualiza em tempo real (listeners do Firestore)
   - Card desaparece de "Pendentes"
   - Aparece em "Confirmados"
   ↓
7. [FIM]

Alternativa: Profissional clica "Recusar"

1. Modal aparece: "Cancelar agendamento?"
   ↓
2. Profissional confirma
   ↓
3. agendamentos.js: cancelarAgendamento()
   - Update: status = "cancelado"
   - Update: canceladoEm = now()
   - Liberar horário (não criar novo doc, apenas não contar)
   - notificacoes.js: criarNotificacao()
     → Tipo: "cancelamento"
     → Destinatário: cliente (Maria)
   ↓
4. Cliente recebe notificação
   ↓
5. [FIM]
```

## Fluxo 4: Cancelamento/Troca (Cliente)

```
Pré-requisito: Cliente vê agendamento confirmado em /meus-agendamentos.html

1. Cliente vê agendamento:
   Data: 15/02/2026, Horário: 10:15, Status: Confirmado
   Botões: [Ver detalhes] [Cancelar] [Remarcar]
   ↓
2. Cliente clica "Cancelar"
   ↓
3. Modal de confirmação aparece
   ↓
4. Cliente confirma
   ↓
5. agendamentos.js: cancelarAgendamento()
   - Update: status = "cancelado"
   - notificacoes.js: criarNotificacao()
     → Tipo: "cancelamento"
     → Destinatário: profissional
   ↓
6. Horário fica disponível novamente
   ↓
7. [FIM]

Alternativa: Cliente clica "Remarcar"

1. Modal aparece: "Escolha nova data/horário"
   ↓
2. Calendário (mesmo como criar novo)
   ↓
3. Cliente escolhe data + horário
   ↓
4. agendamentos.js: remarcarAgendamento()
   - Verificar conflito na nova data/horário
   - Update: data, horario, status = "remarcado"
   - notificacoes.js: criarNotificacao()
     → Tipo: "troca_pedida"
     → Destinatário: profissional
   ↓
5. Profissional recebe notificação
   ↓
6. Profissional confirma ou recusa
   ↓
7. Cliente é notificado
   ↓
8. [FIM]
```

## Fluxo 5: Gestão de Cliente (Profissional)

```
Pré-requisito: Profissional em /clientes.html

1. Lista de clientes exibida
   agendamentos.js: carregarClientes()
   - Query: todos os clientes da empresa
   - Mostrar: Nome, Contato, Total de agendamentos, Próximo
   ↓
2. Profissional clica em um cliente (ex: Maria)
   ↓
3. Abre /cliente-perfil.html?id=maria123
   ↓
4. clientes.js: carregarClientePerfil()
   - Query: cliente
   - Query: agendamentos dessa cliente
   - Query: observações
   ↓
5. Exibido:
   - Dados básicos: Nome, Contato
   - Histórico: [Agen1] [Agen2] [Agen3] ...
   - Observações internas:
     - "Cliente sempre chega atrasada (5-10 min)"
     - "Alergia a XXX — avisar"
   ↓
6. Profissional quer adicionar observação
   ↓
7. Campo: "Nova observação"
   ↓
8. Digita: "Preferência: cor melena sempre escura"
   ↓
9. Clica "Adicionar"
   ↓
10. clientes.js: salvarObservacao()
    - Adicionar ao array observacoes
    - Adicionar timestamp
    ↓
11. Observação aparece na lista
    ↓
12. [FIM]
```

---

# 9. CHECKLIST DE TESTES MANUAIS

## Testes Obrigatórios por Sprint

### Sprint 1 Tests (Autenticação)

| # | Teste | Passos | Resultado Esperado |
|---|-------|--------|-------------------|
| TC-001 | Login Cliente Novo | 1. Abrir /login.html 2. Preencher nome, contato 3. Escolher "Cliente" 4. Clicar "Entrar" | Usuário criado em BD, sessão salva, redireciona para /public.html |
| TC-002 | Login Cliente Existente | 1. Cliente já criado 2. Login com mesmo contato | Acesso permitido, sessão restaurada |
| TC-003 | Login Profissional Novo | 1. Abrir /login.html?type=profissional 2. Preencher email, senha, nome, nicho 3. Clicar "Cadastrar" | Usuário e empresa criados, redireciona para /onboarding.html |
| TC-004 | Login Profissional Existente | 1. Profissional já cadastrado 2. Email + Senha corretos | Acesso permitido, redireciona para /dashboard.html |
| TC-005 | Login com Credenciais Inválidas | 1. Email ou senha errados 2. Clicar "Entrar" | Mensagem de erro, não permite acesso |
| TC-006 | Logout | 1. Logado 2. Clicar "Logout" | Sessão limpa, redireciona para /login.html |
| TC-007 | Refresh da Página | 1. Logado em /dashboard.html 2. F5 (refresh) | Sessão mantida, dashboard recarrega |
| TC-008 | Tentativa Acesso Cruzado | 1. Profissional logado 2. URL manual: /public.html | Redireciona para /dashboard.html ou erro |

### Sprint 2 Tests (Agenda)

| # | Teste | Passos | Resultado Esperado |
|---|-------|--------|-------------------|
| TC-009 | Onboarding Obrigatório | 1. Profissional novo (1º login) 2. Tenta acessar /dashboard.html | Redireciona para /onboarding.html, bloqueia acesso |
| TC-010 | Completar Onboarding | 1. Preencher todos os campos 2. Clicar "Concluir" | Dashboard liberado, redireciona para /dashboard.html |
| TC-011 | Salvar Configurações | 1. Editar horários 2. Clicar "Salvar" | Dados persistem, refresh mantém valores |
| TC-012 | Visualização Mensal | 1. Abrir /agenda.html 2. Ver calendário do mês | Dias com agendamentos destacados em verde |
| TC-013 | Visualização Semanal | 1. Clicar em um dia 2. Passar para visualização semanal | Grid com dias e horários exibido corretamente |
| TC-014 | Bloquear Horário | 1. Clicar em horário livre 2. "Bloquear" 3. Motivo: "Almoço" | Horário marcado como bloqueado, não aparece para cliente |
| TC-015 | Desbloquear Horário | 1. Horário bloqueado 2. Clicar "Desbloquear" | Horário liberado, volta a aparecer para cliente |
| TC-016 | Bloquear Dia Inteiro | 1. Clicar em dia 2. "Bloquear dia inteiro" | Todos os horários desabilitados naquele dia |

### Sprint 3 Tests (Agendamentos)

| # | Teste | Passos | Resultado Esperado |
|---|-------|--------|-------------------|
| TC-017 | Criar Agendamento (Cliente) | 1. Cliente acessa /public.html 2. "Agendar" 3. Data + Horário + Confirmar | Agendamento criado com status "pendente" |
| TC-018 | Bloquear Duplicado | 1. Dois clientes tentam agendar mesmo horário 2. Segundo envia solicitação | Primeiro é confirmado, segundo recebe erro "Horário não disponível" |
| TC-019 | Confirmar Agendamento (Prof) | 1. Profissional vê agendamento pendente 2. Clica "Confirmar" | Status muda para "confirmado", cliente é notificado |
| TC-020 | Recusar Agendamento | 1. Profissional clica "Recusar" 2. Confirma | Agendamento cancelado, cliente notificado, horário liberado |
| TC-021 | Cancelar Agendamento (Cliente) | 1. Cliente em /meus-agendamentos.html 2. "Cancelar" | Agendamento cancelado, profissional notificado |
| TC-022 | Remarcar Agendamento | 1. Cliente clica "Remarcar" 2. Escolhe nova data/horário | Agendamento remarcado, profissional notificado |
| TC-023 | Ver Perfil Cliente | 1. Profissional em /clientes.html 2. Clica em um cliente | Perfil, histórico e observações exibidos |
| TC-024 | Adicionar Observação | 1. Em perfil do cliente 2. "Adicionar observação" | Observação salva e aparece na lista |

### Sprint 4 Tests (UX, Temas, Notificações)

| # | Teste | Passos | Resultado Esperado |
|---|-------|--------|-------------------|
| TC-025 | Tema Free | 1. Profissional (plano free) 2. /configuracoes.html 3. Selecionar cor | Apenas 4-5 cores disponíveis, marca d'água visível |
| TC-026 | Tema Premium | 1. Profissional (plano premium) 2. Color picker | Qualquer cor possível, sem marca d'água |
| TC-027 | Aplicar Tema | 1. Salvar tema 2. Navegar páginas | Tema aplicado em todas as páginas |
| TC-028 | Notificação Novo Agendamento | 1. Cliente cria agendamento 2. Ver notificações do prof | Notificação aparece no badge e dropdown |
| TC-029 | Marcar Notificação Lida | 1. Clicar em notificação 2. Badge diminui | Número de não lidas decresce |
| TC-030 | Relatório Período | 1. /relatorios.html 2. Selecionar mês | Estatísticas exibidas corretamente |
| TC-031 | Responsividade Mobile | 1. Abrir em iPhone (375px) 2. Navegar | Layout adjusts, sem overflow, clicável |
| TC-032 | Validação Form | 1. Deixar campo obrigatório em branco 2. Submit | Mensagem de erro inline, campo em destaque |

### Sprint 5 Tests (Deploy + Produção)

| # | Teste | Passos | Resultado Esperado |
|---|-------|--------|-------------------|
| TC-033 | Build Local | 1. npm run build | Sem erros, output gerado |
| TC-034 | Deploy Vercel | 1. Push para main 2. Ver status no Vercel | Deploy bem-sucedido, URL acessível |
| TC-035 | Segurança Rules | 1. Cliente tenta acessar dados de outra empresa | Firestore bloqueia, erro na console |
| TC-036 | Core Web Vitals | 1. PageSpeed Insights | LCP < 2.5s, FID < 100ms, CLS < 0.1 |
| TC-037 | Smoke Test Login | 1. Login em produção | Funciona, sem erros |
| TC-038 | Smoke Test Agendamento | 1. Criar agendamento em produção | Funciona, dados salvos |
| TC-039 | Analytics | 1. Vercel Analytics | Dados coletados, métricas visíveis |
| TC-040 | Monitoramento Firebase | 1. Firebase Console | Sem quotas excedidas, sem erros críticos |

---

## Matriz de Teste Crítico por User Flow

```
┌─────────────────────────────────────────────────┐
│  FLUXO CRÍTICO 1: Login → Onboarding → Dashboard│
├─────────────────────────────────────────────────┤
│ Test: TC-001, TC-002, TC-003, TC-004            │
│ Sprint: 1, 2                                    │
│ Criticidade: CRÍTICA (impede tudo mais)         │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  FLUXO CRÍTICO 2: Cliente Agenda → Confirmação │
├─────────────────────────────────────────────────┤
│ Tests: TC-017, TC-018, TC-019, TC-020          │
│ Sprint: 3                                       │
│ Criticidade: CRÍTICA (main revenue flow)        │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  FLUXO CRÍTICO 3: Isolamento de Dados          │
├─────────────────────────────────────────────────┤
│ Tests: TC-035, TC-008                          │
│ Sprint: 1, 5                                    │
│ Criticidade: CRÍTICA (segurança)                │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  FLUXO CRÍTICO 4: Conflito de Horário          │
├─────────────────────────────────────────────────┤
│ Tests: TC-018, TC-013                          │
│ Sprint: 2, 3                                    │
│ Criticidade: CRÍTICA (integridade de dados)     │
└─────────────────────────────────────────────────┘
```

---

## Checklist Final de Validação Pré-Launch

```
Segurança
─────────
☐ Nenhuma chave privada no git
☐ Firestore Rules testadas (acesso cruzado bloqueado)
☐ HTTPS enforçado (Vercel)
☐ Variáveis de ambiente configuradas

Funcionalidade
──────────────
☐ Login funciona em 2 navegadores
☐ CRUD agendamentos completo
☐ Notificações disparam
☐ Tema aplica

Performance
───────────
☐ LCP < 2.5s
☐ FID < 100ms
☐ CLS < 0.1

Acessibilidade
──────────────
☐ Contraste de cores OK
☐ Labels em formulários
☐ Navegação por teclado

UX
──
☐ Mobile responsivo (4+ tamanhos)
☐ Fluxo intuitivo
☐ Mensagens de erro claras
☐ Loading states visíveis

Documentação
────────────
☐ README atualizado
☐ Firestore Schema documentado
☐ Rules documentadas
☐ Funções JS documentadas
```

---

## Resumo: Cronograma Estimado

| Sprint | Duração | Foco | Saídas |
|--------|---------|------|--------|
| 0 | 3-4 dias | Setup | Repo, Firebase, Vercel |
| 1 | 7-9 dias | Auth | Login, Firestore base, Dashboard |
| 2 | 7-9 dias | Agenda | Onboarding, Configurações, Visualizações |
| 3 | 8-10 dias | Agendamentos | Fluxo cliente, Confirmação, Clientes |
| 4 | 6-8 dias | UX | Temas, Notificações, Relatórios |
| 5 | 5-7 dias | Deploy | Testes, Segurança, Go-live |
| **TOTAL** | **35-50 dias** | **MVP Completo** | **Pronto para produção** |

---

**FIM DO PLANO MESTRE TÉCNICO**

Versão Final: 31 de Janeiro de 2026  
Qualidade: Pronta para Implementação  
Status: ✅ Aprovada para Desenvolvimento
