# 🏗️ PLANO MESTRE TÉCNICO — AgendaEstética

**Versão:** 2.0 — Análise Profunda + Implementação  
**Data:** 31 de Janeiro de 2026  
**Status:** Pronto para Desenvolvimento Imediato  
**Objetivo:** Implementação 100% funcional do MVP Robusto em 5-6 Sprints  
**Tempo Estimado:** 35-50 dias de desenvolvimento

---

## 🎯 Índice Completo

- [1️⃣ Visão Geral do Sistema](#1️⃣-visão-geral-do-sistema)
- [2️⃣ Mapa de Arquitetura](#2️⃣-mapa-de-arquitetura)
- [3️⃣ Estrutura Final de Pastas](#3️⃣-estrutura-final-de-pastas)
- [4️⃣ Checklist de Desenvolvimento por Sprint](#4️⃣-checklist-de-desenvolvimento-por-sprint)
- [5️⃣ Funções Obrigatórias por Arquivo JS](#5️⃣-funções-obrigatórias-por-arquivo-js)
- [6️⃣ Estrutura do Firestore](#6️⃣-estrutura-do-firestore)
- [7️⃣ Regras de Segurança](#7️⃣-regras-de-segurança-firestore)
- [8️⃣ Checklist de Testes Manuais](#8️⃣-checklist-de-testes-manuais)
- [9️⃣ Fluxos Críticos Detalhados](#9️⃣-fluxos-críticos-detalhados)

---

## 1️⃣ VISÃO GERAL DO SISTEMA

### O que é AgendaEstética?

**AgendaEstética** é uma plataforma SaaS multi-tenant que permite profissionais do ramo estético (cabeleireiras, manicures, esteticistas, barbeiros, etc) gerenciar seu calendário de atendimentos online sem dependência de WhatsApp.

**Foco central:** Reduzir fricção entre profissional e cliente através de um sistema simples, visual e intuitivo.

### Tipos de Usuários

| Tipo | Características | Permissões |
|------|---|---|
| **Profissional (Admin)** | Dono do negócio, gestor único | Acesso total: criar, editar, deletar agendamentos; configurar horários; gerenciar clientes; personalizar tema |
| **Cliente** | Pessoa que agenda | Acesso limitado: visualizar horários; criar agendamentos; cancelar/remarcar; ver histórico próprio |

### Fluxos Principais

#### 🔄 Fluxo Profissional
```
1. Login → 2. Onboarding (obrigatório na 1ª vez)
   ↓
3. Dashboard (resumo do dia)
   ↓
4. Agenda (mensal/semanal/diária)
   ↓
5. Agendamentos (confirmação, cancelamento)
   ↓
6. Clientes (gestão, histórico, observações)
   ↓
7. Configurações (horários, regras, tema)
```

#### 🔄 Fluxo Cliente
```
1. Acessa link público do profissional
   ↓
2. Visualiza agenda disponível
   ↓
3. Escolhe data (calendário) → horário (lista)
   ↓
4. Confirma dados
   ↓
5. Agendamento criado (pendente)
   ↓
6. Profissional confirma
   ↓
7. Cliente vê "Confirmado"
```

#### 🔄 Fluxo Crítico: Cancelamento/Troca
```
Cliente solicita cancelamento/troca
   ↓
Profissional recebe notificação
   ↓
Profissional aceita/recusa
   ↓
Sistema atualiza automaticamente
   ↓
Cliente é notificado
```

### Regras de Negócio Essenciais

| Regra | Implementação | Responsável |
|-------|---------------|-------------|
| Um profissional = uma empresa | `empresaId` único por profissional | Frontend + Firestore |
| Isolamento total de dados | Queries filtradas por `empresaId` | Firestore Rules |
| Um agendamento = um horário exclusivo | Verificar conflito antes de salvar | Transação Firestore |
| Onboarding é obrigatório | Bloquear dashboard até conclusão | Frontend (permissões.js) |
| Cliente não vê horários bloqueados | Filtrar na geração de horários | agenda.js |
| Notificação dispara em eventos críticos | Criar doc em `notificacoes` | Na ação correspondente |

---

## 2️⃣ MAPA DE ARQUITETURA

### Arquitetura Geral

```
┌─────────────────────────────────────────────┐
│         CLIENTE (Frontend - Vanilla JS)      │
│  ┌─────────┬──────────┬──────────┬────────┐ │
│  │  HTML   │   CSS    │    JS    │ Assets │ │
│  └─────────┴──────────┴──────────┴────────┘ │
│              (Mobile-first)                   │
└────────────────┬────────────────────────────┘
                 │
         ┌───────┴────────┐
         │                │
    ┌────▼──────┐    ┌───▼────────┐
    │  Firebase  │    │   Vercel   │
    │  (BaaS)    │    │   (Hosting)│
    │            │    │            │
    │ • Auth     │    │ • CDN      │
    │ • Firestore│    │ • Build    │
    │ • Storage  │    │ • Deploy   │
    └────────────┘    └────────────┘
```

### Stack Tecnológico

**Frontend:**
- HTML5 (semântico, mobile-first)
- CSS3 (CSS Variables para temas, Grid/Flexbox)
- JavaScript Vanilla ES6+ (sem frameworks)

**Backend (BaaS):**
- Firebase Authentication (email + telefone)
- Firestore (base de dados em tempo real, NoSQL)
- Firebase Storage (fotos de perfil, imagens de fundo)

**Infraestrutura:**
- Vercel (hosting, CI/CD, deploy automático)
- GitHub (versionamento)

### Módulos JS e Responsabilidades

```
┌──────────────────────────────────────────┐
│         MÓDULOS JAVASCRIPT               │
├──────────────────────────────────────────┤
│ config.js         → Firebase config      │
│ auth.js           → Login/Logout/Sessão  │
│ permissoes.js     → Acesso/Rotas         │
│ firestore.js      → Abstração BD         │
│ agenda.js         → Lógica de horários   │
│ agendamentos.js   → CRUD agendamentos    │
│ clientes.js       → Gestão de clientes   │
│ tema.js           → CSS Variables        │
│ notificacoes.js   → Sistema de notif     │
│ relatorios.js     → Dados agregados      │
│ utils.js          → Helpers gerais       │
│ app.js            → Inicialização        │
└──────────────────────────────────────────┘
```

### Relações entre Módulos

```
app.js (inicialização)
  ├─ config.js (setup Firebase)
  └─ auth.js (verificar/restaurar sessão)
     ├─ permissoes.js (redirecionar por tipo)
     └─ firestore.js (queries seguras)

dashboard.html (após login)
  ├─ agenda.js (carregar agenda)
  │  └─ firestore.js (query agendamentos)
  ├─ agendamentos.js (confirmar/cancelar)
  │  ├─ firestore.js (atualizar status)
  │  └─ notificacoes.js (criar notificação)
  └─ clientes.js (listar clientes)
     └─ firestore.js (query clientes)

public.html (link cliente)
  ├─ agenda.js (dados públicos)
  ├─ agendamentos.js (criar agendamento)
  └─ tema.js (aplicar tema do profissional)
```

---

## 3️⃣ ESTRUTURA FINAL DE PASTAS

### Árvore Completa

```
agendaestetica/
│
├── .github/
│   └── workflows/
│       └── deploy.yml (CI/CD automático — Vercel)
│
├── src/
│   ├── index.html (landing/selector de acesso)
│   ├── login.html (tela unificada de login)
│   ├── onboarding.html (configuração inicial profissional)
│   ├── dashboard.html (área do profissional)
│   ├── agenda.html (calendário profissional)
│   ├── agendamentos.html (gestão de agendamentos)
│   ├── clientes.html (lista e perfil de clientes)
│   ├── configuracoes.html (settings profissional)
│   ├── public.html (página pública do profissional)
│   ├── notificacoes.html (centro de notificações)
│   ├── relatorios.html (relatórios básicos)
│   ├── 404.html (página de erro)
│   │
│   ├── css/
│   │   ├── main.css (estilos globais, tipografia, reset)
│   │   ├── variables.css (CSS Variables para temas)
│   │   ├── responsive.css (breakpoints mobile-first)
│   │   ├── components.css (componentes reutilizáveis)
│   │   ├── forms.css (validação visual)
│   │   └── animations.css (transições suaves)
│   │
│   ├── js/
│   │   ├── config.js (Firebase config + constants)
│   │   ├── auth.js (login, logout, cadastro)
│   │   ├── firestore.js (CRUD genérico + queries)
│   │   ├── permissoes.js (verificação de acesso)
│   │   ├── agenda.js (lógica de horários + geração)
│   │   ├── agendamentos.js (CRUD de agendamentos)
│   │   ├── clientes.js (gestão de clientes)
│   │   ├── tema.js (CSS Variables dinâmicos)
│   │   ├── notificacoes.js (criar, ler, deletar)
│   │   ├── relatorios.js (agregação de dados)
│   │   ├── utils.js (helpers: date, format, etc)
│   │   └── app.js (bootstrap da aplicação)
│   │
│   └── assets/
│       ├── icons/ (SVGs de ícones)
│       ├── images/ (imagens estáticas)
│       └── fonts/ (fontes custom se houver)
│
├── docs/
│   ├── 01-tarefas-mvp.md (original)
│   ├── 02-estrutura-do-projeto.md (original)
│   ├── 03-roadmap.md (original)
│   ├── arquitetura-tecnica.md (original)
│   ├── escopo-funcional-detalhado.md (original)
│   ├── ux-fluxo-profissional-cliente.md (original)
│   ├── FIRESTORE-SCHEMA.md (schema detalhado)
│   ├── REGRAS-SEGURANCA.md (rules Firestore)
│   └── API-FUNCOES.md (referência de funções JS)
│
├── .env.example
├── .env (NÃO commitar)
├── .gitignore
├── vercel.json
├── package.json (básico, se usar build tools)
└── README.md
```

### Responsabilidade de Cada Arquivo

#### 🌐 HTML (Telas)

| Arquivo | Responsabilidade |
|---------|------------------|
| `index.html` | Landing page / Seletor: Login como Cliente vs Profissional |
| `login.html` | Tela unificada de login (nome, contato, tipo) |
| `onboarding.html` | Setup obrigatório do profissional (nome, nicho, horários) |
| `dashboard.html` | Resumo do dia + Menu de acesso (Agenda, Clientes, Config) |
| `agenda.html` | Visualização mensal/semanal/diária + Bloqueios |
| `agendamentos.html` | Detalhes do agendamento + Ações (confirmar, cancelar, remarcar) |
| `clientes.html` | Lista de clientes + Perfil individual + Observações |
| `configuracoes.html` | Horários, Regras, Tema, Dados do profissional |
| `public.html` | Página pública (cliente externo) — Agenda + Agendar |
| `notificacoes.html` | Centro de notificações (lista, marcas como lidas) |
| `relatorios.html` | Relatórios básicos (atendimentos, clientes recorrentes) |
| `404.html` | Página de erro (empresa não existe, acesso bloqueado) |

#### 🎨 CSS (Estilos)

| Arquivo | Responsabilidade |
|---------|------------------|
| `main.css` | Reset, tipografia, cores base, layout padrão |
| `variables.css` | CSS Variables (cores, espaçamentos, raios de borda) |
| `responsive.css` | Breakpoints mobile-first (smartphone, tablet, desktop) |
| `components.css` | Estilos de botões, cards, modais, inputs |
| `forms.css` | Validação visual, placeholder, focus, disabled |
| `animations.css` | Transições, loaders, toasts, hover effects |

#### ⚙️ JS (Lógica)

| Arquivo | Responsabilidade |
|---------|------------------|
| `config.js` | Configuração Firebase, constantes da app, enums |
| `auth.js` | Firebase Auth, login, logout, cadastro automático, sessão |
| `firestore.js` | Abstração de operações Firestore (CRUD, queries filtradas) |
| `permissoes.js` | Verificação de acesso, redirecionamento, proteção de rotas |
| `agenda.js` | Geração de horários, verificação de conflitos, visualizações |
| `agendamentos.js` | CRUD de agendamentos, status, transações |
| `clientes.js` | CRUD de clientes, observações, histórico |
| `tema.js` | Aplicar CSS Variables, validar por plano (free/premium) |
| `notificacoes.js` | Criar notificações, marcar como lida, limpar |
| `relatorios.js` | Agregar dados, filtros, exportar |
| `utils.js` | Helpers (date, format, validation, localStorage) |
| `app.js` | Inicializar app, restaurar sessão, carregar tema |

---

## 4️⃣ CHECKLIST DE DESENVOLVIMENTO POR SPRINT

### 0.1 Repositório e Versionamento

- [ ] Criar repositório GitHub `/agendaestetica`
- [ ] Inicializar Git local
- [ ] Criar `.gitignore` (node_modules, .env, .firebase/)
- [ ] Criar branch `main` (protegido)
- [ ] Criar branch `develop` para desenvolvimento
- [ ] Documentar estratégia de branches (feature/*, hotfix/*)

### 0.2 Estrutura de Pastas (Frontend)

Criar estrutura:

```
agendaestetica/
├── README.md
├── .gitignore
├── .env.example
├── package.json (inicializar)
│
├── src/
│   ├── index.html
│   ├── login.html
│   ├── dashboard.html
│   ├── agenda.html
│   ├── clientes.html
│   ├── configuracoes.html
│   ├── public.html (página pública do profissional)
│   │
│   ├── css/
│   │   ├── main.css (estilos base)
│   │   ├── variables.css (CSS Variables para temas)
│   │   ├── responsive.css (mobile-first)
│   │   └── components.css (componentes reutilizáveis)
│   │
│   ├── js/
│   │   ├── config.js (configuração Firebase)
│   │   ├── auth.js (autenticação)
│   │   ├── firestore.js (abstração Firestore)
│   │   ├── agenda.js (lógica de agenda)
│   │   ├── agendamentos.js (agendamentos)
│   │   ├── clientes.js (gestão de clientes)
│   │   ├── configuracoes.js (configurações)
│   │   ├── tema.js (sistema de temas)
│   │   ├── permissoes.js (controle de acesso)
│   │   ├── notificacoes.js (notificações)
│   │   ├── utils.js (funções auxiliares)
│   │   └── app.js (inicialização)
│   │
│   └── assets/
│       ├── icons/
│       ├── images/
│       └── fonts/
│
├── docs/
│   └── (documentação já presente)
│
└── vercel.json (configuração Vercel)
```

- [ ] Criar estrutura de pastas exata
- [ ] Inicializar `package.json` (básico)
- [ ] Criar `.env.example` com variáveis Firebase

### 0.3 Configuração Firebase

**Projeto Firebase:**

- [ ] Criar projeto Firebase Console: `agendaestetica-prod`
- [ ] Ativar **Authentication** (Email/Telefone)
- [ ] Ativar **Firestore Database**
- [ ] Ativar **Storage** (para fotos)
- [ ] Gerar chaves de configuração
- [ ] Documentar `firebaseConfig` no `.env.example`

**Regras de Segurança (base):**

- [ ] Definir regras padrão (será refinado em Sprint 1)

### 0.4 Configuração Vercel

- [ ] Criar conta Vercel
- [ ] Conectar repositório GitHub
- [ ] Configurar variáveis de ambiente em Vercel
- [ ] Ativar auto-deploy na branch `main`
- [ ] Testar build inicial

### 0.5 Documentação de Setup

- [ ] Criar `SETUP-LOCAL.md` (instruções para rodar localmente)
- [ ] Documentar dependências Node (se houver)
- [ ] Criar exemplo de `.env`

---

## 🔐 SPRINT 1: AUTENTICAÇÃO E BASE

### 1.1 Firebase Auth — Configuração

- [ ] Ativar autenticação por email/senha
- [ ] Ativar autenticação por telefone (opcional)
- [ ] Testar Firebase Auth no console
- [ ] Documentar fluxo de autenticação

### 1.2 Estrutura Firestore (Collections)

Criar estrutura no Firestore:

- [ ] **Collection: `usuarios`**
  - [ ] Document: `{uid}`
    - `uid` (string)
    - `empresaId` (string)
    - `role` ("profissional" | "cliente")
    - `nome` (string)
    - `contato` (string)
    - `ativo` (boolean)
    - `criadoEm` (timestamp)
    - `ultimoAcesso` (timestamp)

- [ ] **Collection: `empresas`**
  - [ ] Document: `{empresaId}`
    - `empresaId` (string)
    - `nome` (string)
    - `nicho` (string)
    - `slug` (string)
    - `status` ("ativa" | "suspensa")
    - `plano` ("free" | "premium")
    - `criadaEm` (timestamp)
    
    - **Subcollection: `profissionais`**
      - Document: `{profissionalId}`
        - `uid` (string)
        - `nome` (string)
        - `role` ("admin" | "colaborador")
        - `ativo` (boolean)
        - `criadoEm` (timestamp)

    - **Subcollection: `configuracoes`**
      - Document: `config`
        - `agendamentoOnlineAtivo` (boolean)
        - `tempoMinimoRemarcacao` (number, em horas)
        - `limiteSolicitacoesTroca` (number)
        - `politicaCancelamento` (string)

    - **Subcollection: `perfil`**
      - Document: `dados`
        - `nomePublico` (string)
        - `descricao` (string)
        - `fotoPerfil` (string, URL)
        - `tema` (object)

### 1.3 Tela de Login (Entrada Única)

**Arquivo: `src/login.html`**

- [ ] Criar formulário de login com:
  - [ ] Campo: Nome
  - [ ] Campo: Contato (WhatsApp/Telefone)
  - [ ] Radio buttons: "Sou Cliente" | "Sou Profissional"
  - [ ] Botão: Entrar
  - [ ] Link: Acessibilidade e termos

- [ ] Implementar validação básica (campos obrigatórios)
- [ ] Design mobile-first
- [ ] Estados visuais (loading, erro)

### 1.4 Lógica de Autenticação (`src/js/auth.js`)

- [ ] Função: `loginCliente(nome, contato, empresaId)`
  - [ ] Verificar se cliente existe em `usuarios`
  - [ ] Se não existir, criar novo documento
  - [ ] Redirecionar para dashboard cliente
  - [ ] Guardar `uid`, `empresaId`, `role` em sessionStorage

- [ ] Função: `loginProfissional(email, senha, empresaId)`
  - [ ] Autenticar com Firebase Auth
  - [ ] Verificar se usuário pertence à empresa
  - [ ] Se primeiro acesso, redirecionar para onboarding
  - [ ] Guardar sessão

- [ ] Função: `logout()`
  - [ ] Limpar Firebase Auth
  - [ ] Limpar sessionStorage
  - [ ] Redirecionar para login

- [ ] Função: `verificarSessao()`
  - [ ] Detectar refresh da página
  - [ ] Revalidar sessão
  - [ ] Redirecionar se inválida

- [ ] Função: `extrairEmpresaIdDaURL()`
  - [ ] Extrair `empresaId` da URL (ex: `/empresaA` ou query param)

### 1.5 Controle de Acesso (`src/js/permissoes.js`)

- [ ] Função: `verificarTipoUsuario()`
  - [ ] Retornar "cliente" ou "profissional"

- [ ] Função: `redirecionarPorPermissao(tipo)`
  - [ ] Se profissional → `/dashboard.html`
  - [ ] Se cliente → `/public.html` (página pública)

- [ ] Função: `protegerRota(tipoPermitido)`
  - [ ] Executar em cada página protegida
  - [ ] Bloquear acesso se não autorizado

- [ ] Função: `obterUidAtual()` e `obterEmpresaIdAtual()`
  - [ ] Retornar dados da sessão

### 1.6 Dashboard Básico do Profissional

**Arquivo: `src/dashboard.html`**

- [ ] Verificar permissão (profissional)
- [ ] Layout básico:
  - [ ] Header: Logo + Nome do Profissional + Logout
  - [ ] Menu lateral: Agenda | Clientes | Configurações
  - [ ] Seção principal: Resumo do dia
  - [ ] Cards informativos (próximos atendimentos)

- [ ] Implementar proteção de rota

### 1.7 Regras de Segurança Firestore (Sprint 1)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Acesso geral
    match /usuarios/{uid} {
      allow read, write: if request.auth.uid == uid;
    }

    match /empresas/{empresaId} {
      // Profissional: acesso total
      allow read, write: if request.auth.uid != null 
        && exists(/databases/$(database)/documents/usuarios/$(request.auth.uid))
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

- [ ] Implementar regras acima no Firestore
- [ ] Testar acesso cruzado (deve bloquear)

### 1.8 Testes Manuais (Sprint 1)

- [ ] Login com novo cliente → cria documento automaticamente
- [ ] Login com profissional → redireciona para onboarding (se 1º acesso)
- [ ] Logout → limpa sessão
- [ ] Tentativa de acesso com URL inválida → redireciona
- [ ] Refresh da página → mantém sessão
- [ ] Bloqueia acesso cliente ao dashboard do profissional

---

## 📅 SPRINT 2: AGENDA E CONFIGURAÇÕES

### 2.1 Onboarding do Profissional (Primeira Configuração)

**Arquivo: `src/onboarding.html`**

Sistema bloqueia acesso ao dashboard até conclusão.

**Etapa 1 — Dados Básicos:**

- [ ] Campo: Nome Profissional
- [ ] Campo: Nicho (texto livre)
- [ ] Upload: Foto de Perfil (opcional)
- [ ] Botão: Próximo

**Etapa 2 — Configuração de Horários:**

- [ ] Checkboxes: Dias da semana (quais trabalha)
- [ ] Campos: Horário inicio e fim (por dia, se customizado)
- [ ] Campo: Duração padrão do atendimento (em minutos)
- [ ] Campo: Intervalo entre atendimentos (em minutos)
- [ ] Botão: Salvar e Concluir

**Lógica (`src/js/onboarding.js`):**

- [ ] Função: `verificarOnboardingCompleto(uid, empresaId)`
  - [ ] Retornar boolean (completo ou não)

- [ ] Função: `salvarOnboarding(dados)`
  - [ ] Salvar em `empresas/{empresaId}/perfil`
  - [ ] Salvar em `empresas/{empresaId}/configuracoes`
  - [ ] Marcar profissional como "onboarding concluído"

- [ ] Função: `bloquearAcessoPrincipal()`
  - [ ] Se onboarding incompleto → redirecionar para `/onboarding.html`

### 2.2 Página de Configurações

**Arquivo: `src/configuracoes.html`**

- [ ] Seção: Dados do Perfil (editáveis)
  - [ ] Nome profissional
  - [ ] Nicho
  - [ ] Foto de perfil
  - [ ] Descrição (texto livre)

- [ ] Seção: Horários de Trabalho
  - [ ] Checkboxes para dias ativos
  - [ ] Horário inicio/fim por dia
  - [ ] Duração padrão
  - [ ] Intervalo entre atendimentos
  - [ ] Botão: Salvar

- [ ] Seção: Regras de Cancelamento
  - [ ] Tempo mínimo para cancelar (horas)
  - [ ] Limite de trocas por mês
  - [ ] Permitir agendamento online (toggle)
  - [ ] Botão: Salvar

- [ ] Seção: Personalização (tema) — **Será completo no Sprint 4**
  - [ ] Preview básico

### 2.3 Collection Agenda no Firestore

Estrutura para armazenar disponibilidade:

```
empresas/{empresaId}/agenda/{data}
  - data (string, formato YYYY-MM-DD)
  - horariosDisponiveis (array)
    - { horario: "09:00", duracao: 60, disponivel: true }
  - horariosBloqueados (array)
    - { horario: "12:00", motivo: "almoço" }
  - excecao (boolean) — se dia está fora do padrão
  - criadoEm (timestamp)
```

- [ ] Criar collection e exemplo de documento
- [ ] Documentar estrutura

### 2.4 Lógica de Geração de Horários

**Função: `gerarHorariosDisponiveis(data, configuracoes)` em `src/js/agenda.js`**

- [ ] Inputs: data (YYYY-MM-DD), configurações (horário inicio/fim, duração, intervalo)
- [ ] Gerar array de horários disponíveis
- [ ] Exemplo:
  - Início: 09:00, Fim: 17:00, Duração: 60min, Intervalo: 15min
  - Resultado: ["09:00", "10:15", "11:30", ...]

- [ ] Implementar função

### 2.5 Tela de Agenda (Profissional)

**Arquivo: `src/agenda.html`**

**Visualização Mensal:**

- [ ] Calendário mensal
- [ ] Cores:
  - [ ] Verde: dias com agendamentos
  - [ ] Cinza: dias sem disponibilidade
  - [ ] Azul: dias de folga
- [ ] Interação: clicar em dia → ver detalhes

**Visualização Semanal:**

- [ ] Grade semanal (7 dias)
- [ ] Horários no eixo Y
- [ ] Mostrar blocos ocupados/livres
- [ ] Cores por status de agendamento

**Visualização Diária:**

- [ ] Grade horária (30 em 30 min ou 1 em 1 hora)
- [ ] Mostrar agendamentos confirmados
- [ ] Mostrar horários livres
- [ ] Botão: Bloquear horário

**Lógica (`src/js/agenda.js`):**

- [ ] Função: `carregarAgendaMês(empresaId, ano, mês)`
  - [ ] Query Firestore: dias com agendamentos
  - [ ] Retornar dados para renderizar

- [ ] Função: `carregarAgendaSemana(empresaId, dataSemana)`
  - [ ] Carregar 7 dias
  - [ ] Retornar com agendamentos e bloqueios

- [ ] Função: `carregarAgendaDia(empresaId, data)`
  - [ ] Carregar todos os horários do dia
  - [ ] Marcar quais estão ocupados

### 2.6 Ação: Bloquear Horário

**Função em `src/js/agenda.js`:**

- [ ] Função: `bloquearHorario(empresaId, data, horario, motivo)`
  - [ ] Criar documento em `empresas/{empresaId}/agenda/{data}`
  - [ ] Adicionar ao array `horariosBloqueados`
  - [ ] Mostrar confirmação

- [ ] UI: Modal ou inline para:
  - [ ] Selecionar data
  - [ ] Selecionar horário
  - [ ] Campo: Motivo (opcional)
  - [ ] Botão: Confirmar

### 2.7 Ação: Bloquear Dia Inteiro

- [ ] Função: `bloquearDia(empresaId, data, motivo)`
  - [ ] Marcar `excecao: true`
  - [ ] Desabilitar todos os horários

### 2.8 Collection Clientes no Firestore

```
empresas/{empresaId}/clientes/{clienteId}
  - nome (string)
  - contato (string)
  - preferencias (object)
  - criadoEm (timestamp)
  - status (string)
  - observacoes (array)
    - { texto: "...", data: timestamp }
```

- [ ] Criar collection
- [ ] Documentar estrutura

### 2.9 Testes Manuais (Sprint 2)

- [ ] Profissional completa onboarding
- [ ] Sistema libera acesso ao dashboard
- [ ] Configurações salvam corretamente
- [ ] Horários são gerados baseado em config
- [ ] Bloquear horário → impede agendamento
- [ ] Bloquear dia → desabilita todos os horários
- [ ] Visualizações (mês/semana/dia) carregam dados

---

## 👥 SPRINT 3: AGENDAMENTOS E FLUXO CLIENTE

### 3.1 Collection Agendamentos no Firestore

```
empresas/{empresaId}/agendamentos/{agendamentoId}
  - clienteId (string)
  - profissionalId (string)
  - data (string, YYYY-MM-DD)
  - horario (string, HH:MM)
  - duracao (number, minutos)
  - status ("pendente" | "confirmado" | "cancelado" | "concluido" | "remarcado")
  - observacoes (string)
  - observacoesInternas (string)
  - criadoEm (timestamp)
  - atualizadoEm (timestamp)
  - confirmadoEm (timestamp, opcional)
  - canceladoEm (timestamp, opcional)
```

- [ ] Criar collection
- [ ] Documentar estrutura

### 3.2 Página Pública (Cliente)

**Arquivo: `src/public.html`**

Layout:

- [ ] Header: Nome do profissional
- [ ] Seção: Descrição breve (nicho)
- [ ] Seção: Foto de perfil
- [ ] Seção: "Agendar Horário" (CTA principal)
- [ ] Seção: "Meus Agendamentos" (apenas se logado)
- [ ] Rodapé: Plano (free/premium)

Mobile-first: design responsivo

**Lógica (`src/js/public.js`):**

- [ ] Função: `carregarPerfilPublico(empresaId)`
  - [ ] Query: `empresas/{empresaId}/perfil`
  - [ ] Renderizar dados

- [ ] Função: `verificarSeClienteLogado()`
  - [ ] Retornar boolean
  - [ ] Se logado, mostrar agendamentos

### 3.3 Fluxo de Agendamento (Cliente)

**Tela 1: Escolha de Data**

**Arquivo: `src/agendamento-passo1.html`**

- [ ] Calendário mensal
- [ ] Destaque dias disponíveis (verde)
- [ ] Desabilitar dias cheios ou bloqueados
- [ ] Botão: "Próximo"

**Lógica (`src/js/agendamentos.js`):**

- [ ] Função: `carregarDatasDisponiveis(empresaId, mesAno)`
  - [ ] Query: agendamentos do mês
  - [ ] Query: bloqueios do mês
  - [ ] Calcular dias com vagas
  - [ ] Retornar array de datas

**Tela 2: Escolha de Horário**

**Arquivo: `src/agendamento-passo2.html`**

- [ ] Lista de horários disponíveis para o dia escolhido
- [ ] Mostrar duração (ex: "60 minutos")
- [ ] Selecionar um horário
- [ ] Botão: "Próximo"

**Lógica:**

- [ ] Função: `carregarHorariosDisponiveisDia(empresaId, data)`
  - [ ] Query: agenda base (configurações)
  - [ ] Query: agendamentos do dia
  - [ ] Query: bloqueios do dia
  - [ ] Calcular horários livres
  - [ ] Retornar array

**Tela 3: Confirmação de Dados**

**Arquivo: `src/agendamento-passo3.html`**

- [ ] Mostrar resumo:
  - [ ] Profissional
  - [ ] Data
  - [ ] Horário
  - [ ] Duração
- [ ] Campo: Nome do cliente (pré-preenchido se logado)
- [ ] Campo: Contato (pré-preenchido se logado)
- [ ] Campo: Observações (opcional)
- [ ] Botão: "Confirmar Agendamento"
- [ ] Botão: "Voltar"

**Lógica:**

- [ ] Função: `criarAgendamento(empresaId, dados)`
  - [ ] Validar conflito de horário (read + write em transação)
  - [ ] Se cliente não existe, criar automaticamente
  - [ ] Criar documento em `agendamentos`
  - [ ] Status inicial: "pendente"
  - [ ] Retornar confirmação

- [ ] Função: `verificarConflito(empresaId, data, horario)`
  - [ ] Query: agendamento para essa data/horário
  - [ ] Se existe (e está confirmado), retornar erro
  - [ ] Se não, permitir

### 3.4 Tela: Detalhes do Agendamento (Profissional)

**Arquivo: `src/agendamento-detalhes.html`**

- [ ] Dados do cliente
- [ ] Data e horário
- [ ] Status (badge colorido)
- [ ] Observações do cliente
- [ ] Campo: Observações internas (editável)
- [ ] Botão: Confirmar agendamento
- [ ] Botão: Cancelar
- [ ] Botão: Remarcar

**Lógica (`src/js/agendamentos.js`):**

- [ ] Função: `confirmarAgendamento(agendamentoId)`
  - [ ] Update: `status = "confirmado"`
  - [ ] Update: `confirmadoEm = now()`
  - [ ] Disparar notificação ao cliente

- [ ] Função: `cancelarAgendamento(agendamentoId, motivo)`
  - [ ] Update: `status = "cancelado"`
  - [ ] Update: `canceladoEm = now()`
  - [ ] Liberar horário automaticamente
  - [ ] Disparar notificação ao cliente

### 3.5 Criar Agendamento Manual (Profissional)

**Modal em `src/dashboard.html` ou `src/agenda.html`**

- [ ] Campo: Selecionar cliente
- [ ] Campo: Data
- [ ] Campo: Horário
- [ ] Campo: Observações
- [ ] Botão: Criar

**Lógica:**

- [ ] Função: `criarAgendamentoManual(empresaId, dados)`
  - [ ] Mesma validação de conflito
  - [ ] Status inicial: "confirmado"

### 3.6 Tela: Meus Agendamentos (Cliente)

**Arquivo: `src/meus-agendamentos.html`**

- [ ] Lista de agendamentos futuros
- [ ] Cards com:
  - [ ] Data e horário
  - [ ] Status (badge)
  - [ ] Profissional
  - [ ] Ações: Ver detalhes | Cancelar | Solicitar troca

- [ ] Lista de histórico (passados)

**Lógica (`src/js/agendamentos.js`):**

- [ ] Função: `carregarAgendamentosCliente(clienteId, empresaId)`
  - [ ] Query: `agendamentos` where `clienteId`
  - [ ] Separar futuros vs passados
  - [ ] Retornar

### 3.7 Ação: Cancelar Agendamento (Cliente)

**Modal de Confirmação**

- [ ] Mensagem: "Você tem certeza?"
- [ ] Botão: Confirmar | Cancelar

**Lógica:**

- [ ] Função: `solicitarCancelamento(agendamentoId)`
  - [ ] Update: `status = "cancelado"`
  - [ ] Liberar horário
  - [ ] Notificar profissional

### 3.8 Ação: Solicitar Troca de Data

**Arquivo: `src/troca-data.html`**

- [ ] Mostrar agendamento atual
- [ ] Calendário: selecionar nova data
- [ ] Lista: selecionar novo horário
- [ ] Botão: Enviar solicitação

**Collection Trocas no Firestore:**

```
empresas/{empresaId}/trocas/{trocaId}
  - agendamentoId (string)
  - clienteId (string)
  - dataAtual (string)
  - horarioAtual (string)
  - dataSugerida (string)
  - horarioSugerido (string)
  - status ("pendente" | "aceita" | "recusada")
  - criadoEm (timestamp)
  - respondidoEm (timestamp, opcional)
```

**Lógica (`src/js/agendamentos.js`):**

- [ ] Função: `solicitarTroca(empresaId, agendamentoId, novadata, novoHorario)`
  - [ ] Validar conflito na nova data/horário
  - [ ] Criar documento em `trocas`
  - [ ] Status: "pendente"
  - [ ] Notificar profissional

### 3.9 Gerenciar Solicitações de Troca (Profissional)

**Tela em `src/dashboard.html`**

- [ ] Seção: "Solicitações Pendentes"
- [ ] Cards com:
  - [ ] Cliente
  - [ ] Data/horário atual
  - [ ] Data/horário solicitado
  - [ ] Botão: Aceitar | Recusar

**Lógica (`src/js/agendamentos.js`):**

- [ ] Função: `aceitarTroca(trocaId)`
  - [ ] Update: `status = "aceita"`
  - [ ] Update agendamento: nova data/horário
  - [ ] Update: `status = "remarcado"`
  - [ ] Notificar cliente

- [ ] Função: `recusarTroca(trocaId)`
  - [ ] Update: `status = "recusada"`
  - [ ] Notificar cliente

### 3.10 Gestão de Clientes (Profissional)

**Arquivo: `src/clientes.html`**

- [ ] Lista de clientes
- [ ] Cards com:
  - [ ] Nome
  - [ ] Contato
  - [ ] Próximo agendamento
  - [ ] Total de agendamentos
  - [ ] Botão: Ver perfil

**Tela: Perfil do Cliente**

- [ ] Dados básicos
- [ ] Histórico de agendamentos (todos)
- [ ] Observações internas (editável)
- [ ] Adicionar observação

**Lógica (`src/js/clientes.js`):**

- [ ] Função: `carregarClientes(empresaId)`
  - [ ] Query: todos os clientes
  - [ ] Enriched: próximo agendamento, total de agendamentos

- [ ] Função: `salvarObservacao(clienteId, observacao)`
  - [ ] Adicionar ao array `observacoes` em clientes

### 3.11 Testes Manuais (Sprint 3)

- [ ] Cliente acessa página pública → vê perfil do profissional
- [ ] Cliente cria agendamento → passa por 3 passos
- [ ] Sistema bloqueia horário duplicado
- [ ] Profissional vê agendamento pendente
- [ ] Profissional confirma agendamento
- [ ] Cliente vê agendamento confirmado
- [ ] Cliente solicita cancelamento → horário é liberado
- [ ] Cliente solicita troca → profissional recebe notificação
- [ ] Profissional aceita/recusa troca
- [ ] Observações de cliente são salvas

---

## 🎨 SPRINT 4: UX, TEMAS E REFINAMENTO

### 4.1 Sistema de Temas (CSS Variables)

**Arquivo: `src/css/variables.css`**

```css
:root {
  /* Cores Padrão */
  --color-primary: #e91e63;
  --color-background: #ffffff;
  --color-text: #333333;
  --color-text-light: #666666;
  --color-border: #e0e0e0;
  --color-success: #4caf50;
  --color-error: #f44336;
  --color-warning: #ff9800;
  
  /* Aplicado dinamicamente por theme.js */
}
```

**Arquivo: `src/js/tema.js`**

- [ ] Função: `aplicarTema(empresaId, temaConfig)`
  - [ ] Inputs: cores do tema
  - [ ] Aplicar CSS Variables dinamicamente
  - [ ] Salvar em localStorage (para evitar flicker)

- [ ] Função: `carregarTemaDoFirestore(empresaId)`
  - [ ] Query: `empresas/{empresaId}/perfil`
  - [ ] Extrair cores
  - [ ] Aplicar tema

- [ ] Chamar ao carregar página

### 4.2 Configuração de Tema (Free vs Premium)

**Tela: `src/personalizacao.html` ou seção em `src/configuracoes.html`**

**Para Plano Free:**

- [ ] Seletor: Cor principal (paleta limitada)
  - [ ] Opções: rosa, azul, verde, roxo (4 cores)
- [ ] Seletor: Cor de fundo (paleta limitada)
  - [ ] Opções: branco, cinza claro, creme (3 cores)
- [ ] Marca d'água da plataforma (não removível)
- [ ] Preview em tempo real

**Para Plano Premium:**

- [ ] Picker: Cor principal (paleta completa)
- [ ] Picker: Cor de fundo (paleta completa)
- [ ] Picker: Cor de texto (qualquer cor)
- [ ] Upload: Imagem de fundo
- [ ] Toggle: Remover marca d'água
- [ ] Preview em tempo real

**Collection Tema no Firestore:**

```
empresas/{empresaId}/perfil/dados
  - tema: {
      plan: "free" | "premium",
      primary: "#e91e63",
      background: "#ffffff",
      text: "#333333",
      backgroundImage: "url(...)" ou null,
      mostrarMarcaDagua: true
    }
```

**Lógica (`src/js/tema.js`):**

- [ ] Função: `salvarTema(empresaId, config)`
  - [ ] Validar se plano permite essa customização
  - [ ] Salvar em Firestore
  - [ ] Aplicar tema imediatamente

- [ ] Função: `validarTemaComPlano(plano, temaConfig)`
  - [ ] Se free: apenas cores pré-definidas
  - [ ] Se premium: qualquer cor/imagem

### 4.3 Notificações (UI e Lógica)

**Collection Notificações:**

```
empresas/{empresaId}/notificacoes/{notificacaoId}
  - tipo ("novo_agendamento" | "confirmacao" | "cancelamento" | "troca_pendente" | ...)
  - destinatarioId (string, uid do profissional ou cliente)
  - titulo (string)
  - mensagem (string)
  - agendamentoId (string, referência)
  - lida (boolean)
  - criadoEm (timestamp)
```

**Lógica (`src/js/notificacoes.js`):**

- [ ] Função: `criarNotificacao(empresaId, tipo, destinatarioId, dados)`
  - [ ] Disparada por eventos (novo agendamento, troca, etc)
  - [ ] Criar documento em `notificacoes`

- [ ] Função: `carregarNotificacoes(destinatarioId, naoLidas = true)`
  - [ ] Query: notificações do usuário
  - [ ] Ordenar por data decrescente

- [ ] Função: `marcarComoLida(notificacaoId)`
  - [ ] Update: `lida = true`

**UI: Badge de Notificações**

- [ ] Número de notificações não lidas (header/menu)
- [ ] Dropdown com últimas notificações
- [ ] Link "Ver todas"

**Eventos que disparam Notificação:**

- [ ] Novo agendamento criado (notificar profissional)
- [ ] Agendamento confirmado (notificar cliente)
- [ ] Agendamento cancelado (notificar ambos)
- [ ] Solicitação de troca criada (notificar profissional)
- [ ] Troca aceita/recusada (notificar cliente)

### 4.4 Página: Lista de Notificações

**Arquivo: `src/notificacoes.html`**

- [ ] Lista de todas as notificações
- [ ] Filtros: Todas | Não lidas
- [ ] Cards com:
  - [ ] Tipo (ícone)
  - [ ] Mensagem
  - [ ] Data/hora
  - [ ] Status: Lida | Não lida
- [ ] Ação: Clicar → ir para agendamento/detalhes

### 4.5 Refinamento de UX

**Responsividade:**

- [ ] Testar todas as páginas em celular (80% do uso)
- [ ] Ajustar layouts (stack vertical)
- [ ] Testar touch interactions
- [ ] Garantir legibilidade

**Acessibilidade:**

- [ ] Verificar contraste de cores
- [ ] Labels em formulários
- [ ] Alt text em imagens
- [ ] Navegação por teclado

**Feedback Visual:**

- [ ] Loading spinners (durante requisições)
- [ ] Mensagens de sucesso (toast)
- [ ] Mensagens de erro (toast + detalhe)
- [ ] Confirmações antes de ações destrutivas

**Forms:**

- [ ] Validação em tempo real
- [ ] Mensagens de erro inline
- [ ] Desabilitar botão durante submit
- [ ] Focar em campo inválido

### 4.6 Relatórios Básicos

**Seção em `src/configuracoes.html` ou página separada `src/relatorios.html`**

**Relatório 1: Atendimentos por Período**

- [ ] Seletor de período (mês, semana)
- [ ] Tabela/gráfico:
  - [ ] Data
  - [ ] Horário
  - [ ] Cliente
  - [ ] Status
  - [ ] Total de atendimentos

**Relatório 2: Clientes Recorrentes**

- [ ] Tabela:
  - [ ] Nome do cliente
  - [ ] Total de agendamentos
  - [ ] Última visita
  - [ ] % de show-up

**Lógica (`src/js/relatorios.js`):**

- [ ] Função: `gerarRelatorioPeriodo(empresaId, dataInicio, dataFim)`
  - [ ] Query: agendamentos confirmados e concluídos
  - [ ] Calcular estatísticas

- [ ] Função: `gerarRelatorioClientes(empresaId)`
  - [ ] Query: todos os clientes
  - [ ] Agrupar por cliente
  - [ ] Contar agendamentos

### 4.7 Marca d'água (Free vs Premium)

**HTML (em cada página visível):**

```html
<div class="marca-dagua" id="marcaDagua">Powered by AgendaEstética</div>
```

**CSS:**

```css
.marca-dagua {
  position: fixed;
  bottom: 10px;
  right: 10px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.3);
  z-index: 100;
}

.premium .marca-dagua {
  display: none;
}
```

**Lógica (`src/js/tema.js`):**

- [ ] Função: `mostrarMarcaDagua(plano)`
  - [ ] Se free: mostrar
  - [ ] Se premium: esconder

### 4.8 Feature Flags (Preparação para Monetização)

**Conceito: Controlar quais features estão ativas por plano**

**Arquivo: `src/js/features.js`**

```javascript
const featureFlags = {
  free: {
    agendamentoOnline: true,
    trocas: true,
    personalizado: false,
    relatoriAvancado: false,
    imagemFundo: false
  },
  premium: {
    agendamentoOnline: true,
    trocas: true,
    personalizado: true,
    relatorioAvancado: true,
    imagemFundo: true
  }
};

function verificarFeature(feature, plano) {
  return featureFlags[plano]?.[feature] ?? false;
}
```

- [ ] Implementar função acima
- [ ] Usar em validações (UI + lógica)

### 4.9 Testes Manuais (Sprint 4)

- [ ] Free: cores limitadas, marca d'água visível
- [ ] Premium: cores livres, imagem de fundo, marca d'água removida
- [ ] Tema se aplica em todas as páginas
- [ ] Notificações são criadas nos eventos corretos
- [ ] Notificações não lidas aparecem no badge
- [ ] Marcar como lida funciona
- [ ] Relatórios mostram dados corretos
- [ ] Página responsiva em celular
- [ ] Acessibilidade básica OK

---

## 🚀 SPRINT 5: DEPLOY, TESTES E GO-LIVE

### 5.1 Otimização de Produção

**Performance:**

- [ ] Minificar CSS e JS
- [ ] Comprimir imagens
- [ ] Lazy load de imagens
- [ ] Cache de assets (Vercel automático)
- [ ] Remover console.log em produção

**Build:**

- [ ] Configurar build process (se usar bundler)
- [ ] Testar build localmente: `npm run build`
- [ ] Verificar tamanho dos assets

### 5.2 Variáveis de Ambiente

**Arquivo: `.env` (local)**

```
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_STORAGE_BUCKET=xxx
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_FIREBASE_APP_ID=xxx
VITE_PRODUCTION_ENV=false
```

**Arquivo: `.env.example` (versionado)**

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
# ... (vazio, para serve de template)
```

- [ ] Criar `.env` com valores reais (NÃO commitar)
- [ ] Configurar variáveis em Vercel dashboard
- [ ] Verificar se `.env` está em `.gitignore`

### 5.3 Regras de Segurança Firestore (Finalização)

Revisar e finalizar regras:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários podem ler/escrever seu próprio documento
    match /usuarios/{uid} {
      allow read, write: if request.auth.uid == uid;
    }

    // Empresa: acesso controlado por empresaId
    match /empresas/{empresaId} {
      // Cliente: leitura apenas perfil público
      allow read: if request.auth.uid != null 
        && (
          // Profissional da empresa
          exists(/databases/$(database)/documents/empresas/$(empresaId)/profissionais/{request.auth.uid})
          // OU cliente com agendamento nessa empresa
          || exists(/databases/$(database)/documents/empresas/$(empresaId)/agendamentos/*/
             where clienteId == request.auth.uid)
        );

      // Profissional: acesso total
      allow read, write: if request.auth.uid != null 
        && exists(/databases/$(database)/documents/empresas/$(empresaId)/profissionais/{request.auth.uid});

      match /profissionais/{doc=**} {
        allow read: if request.auth.uid != null;
        allow write: if isAdmin(empresaId);
      }

      match /clientes/{doc=**} {
        allow read, write: if isAdmin(empresaId) 
          || request.auth.uid == resource.data.uid;
      }

      match /agendamentos/{doc=**} {
        allow read, write: if isAdmin(empresaId) 
          || request.auth.uid == resource.data.clienteId;
      }

      match /{subcollection=**} {
        allow read, write: if isAdmin(empresaId);
      }
    }

    function isAdmin(empresaId) {
      return request.auth.uid != null 
        && exists(/databases/$(database)/documents/empresas/$(empresaId)/profissionais/{request.auth.uid});
    }
  }
}
```

- [ ] Implementar regras acima
- [ ] Testar acesso cruzado (bloquear)
- [ ] Testar acesso legítimo (permitir)

### 5.4 Checklist de Segurança

- [ ] Nenhuma chave privada no frontend (usar variáveis ambiente)
- [ ] Autenticação obrigatória em todas as rotas protegidas
- [ ] Validação de `empresaId` em todas as queries
- [ ] Não confia em `uid` direto do cliente (validar no Firestore rules)
- [ ] CORS configurado (se houver backend separado)
- [ ] HTTPS só (Vercel enforça)
- [ ] Senhas não armazenadas em cliente
- [ ] Rate limiting em funções críticas (Firestore)

### 5.5 Testes Automatizados (Manuais por Enquanto)

**Casos de Teste Críticos:**

#### Auth e Acesso

- [ ] TC-001: Login cliente novo cria usuário automático
- [ ] TC-002: Login profissional bloqueia se onboarding incompleto
- [ ] TC-003: Cliente acessa apenas sua empresa
- [ ] TC-004: Profissional acessa apenas sua empresa
- [ ] TC-005: Logout limpa sessão
- [ ] TC-006: Refresh mantém sessão válida
- [ ] TC-007: URL inválida redireciona para login

#### Agenda e Configurações

- [ ] TC-008: Onboarding completo desbloqueia dashboard
- [ ] TC-009: Configurações salvam e persisem
- [ ] TC-010: Horários bloqueados não aparecem para cliente
- [ ] TC-011: Dia bloqueado desabilita todos os horários

#### Agendamentos

- [ ] TC-012: Cliente cria agendamento em 3 passos
- [ ] TC-013: Sistema bloqueia agendamento duplicado
- [ ] TC-014: Profissional confirma agendamento
- [ ] TC-015: Cliente vê agendamento confirmado
- [ ] TC-016: Cliente cancela agendamento e horário libera
- [ ] TC-017: Cliente solicita troca
- [ ] TC-018: Profissional aceita troca
- [ ] TC-019: Profissional recusa troca

#### Tema e UI

- [ ] TC-020: Free: apenas cores limitadas
- [ ] TC-021: Premium: cores livres + imagem fundo
- [ ] TC-022: Tema aplica em todas as páginas
- [ ] TC-023: Marca d'água esconde no premium

#### Notificações

- [ ] TC-024: Novo agendamento dispara notificação
- [ ] TC-025: Badge mostra número correto
- [ ] TC-026: Marcar como lida funciona

**Teste cada caso manualmente antes de deploy**

### 5.6 Testes de Responsividade

- [ ] Testar em:
  - [ ] iPhone SE (375px)
  - [ ] iPhone 12 (390px)
  - [ ] iPhone Pro Max (430px)
  - [ ] Android comum (360px)
  - [ ] Tablet (800px+)
  - [ ] Desktop (1440px+)

- [ ] Verificar:
  - [ ] Texto legível
  - [ ] Botões clicáveis
  - [ ] Formulários usáveis
  - [ ] Imagens carregam
  - [ ] Layout não quebra

### 5.7 Teste de Carga e Performance

- [ ] Acessar Vercel Analytics
- [ ] Verificar Core Web Vitals:
  - [ ] LCP (Largest Contentful Paint) < 2.5s
  - [ ] FID (First Input Delay) < 100ms
  - [ ] CLS (Cumulative Layout Shift) < 0.1

- [ ] Se ruim, otimizar:
  - [ ] Lazy load
  - [ ] Minify
  - [ ] Comprimir imagens

### 5.8 Build e Deploy em Produção

**Local:**

- [ ] Rodar: `npm run build`
- [ ] Verificar output (sem erros)
- [ ] Testar build: `npm run preview`

**Vercel:**

- [ ] Confirmar variáveis de ambiente
- [ ] Confirmar branch `main` está protegida
- [ ] Fazer push para `main`
- [ ] Vercel auto-deploya
- [ ] Verificar deployment bem-sucedido
- [ ] Acessar URL de produção

### 5.9 Smoke Tests em Produção

Após deploy, executar testes básicos no ar:

- [ ] Login funciona
- [ ] Dashboard carrega
- [ ] Página pública acessível
- [ ] Criar agendamento funciona
- [ ] Notificações disparam
- [ ] Tema aplica
- [ ] Analytics coletando dados

### 5.10 Monitoramento em Produção

- [ ] Vercel Analytics: vigilar métricas
- [ ] Firestore: vigilar quota
- [ ] Firebase Auth: verificar erros
- [ ] Logs: verificar console (no Vercel ou Firebase)

### 5.11 Documentação Final

- [ ] Atualizar `README.md` com:
  - [ ] O que é AgendaEstética
  - [ ] Stack técnico
  - [ ] Como rodar localmente
  - [ ] Como fazer deploy
  - [ ] Roadmap futuro

- [ ] Criar `DEPLOYMENT.md`:
  - [ ] Checklist de deployment
  - [ ] Variáveis de ambiente
  - [ ] Troubleshooting

- [ ] Criar `ARQUITETURA.md`:
  - [ ] Decisões técnicas
  - [ ] Diagrama de fluxo
  - [ ] Estrutura de dados

### 5.12 Preparação para Fase 2

Documentar para o futuro:

- [ ] [ ] Onde adicionar pagamentos (Stripe/Mercado Pago)
- [ ] [ ] Onde adicionar WhatsApp automático
- [ ] [ ] Onde adicionar lista de espera
- [ ] [ ] Onde adicionar avaliações
- [ ] [ ] Onde adicionar templates por nicho

### 5.13 Testes Finais (Sprint 5)

- [ ] Todos os 26 TCs passam em produção
- [ ] Responsividade OK em 6+ dispositivos
- [ ] Performance OK (Core Web Vitals)
- [ ] Segurança OK (Firestore rules testadas)
- [ ] Sem erros no console (produção)
- [ ] Analytics coletando dados

### 5.14 Go-Live Checklist

- [ ] [ ] Code review completado
- [ ] [ ] Testes finais OK
- [ ] [ ] Documentação atualizada
- [ ] [ ] Backup de dados (se houver)
- [ ] [ ] Monitoramento ativo
- [ ] [ ] Suporte pronto (docs/FAQ)
- [ ] [ ] Comunicar aos primeiros usuários

---

## 📊 RESUMO POR SPRINT

| Sprint | Foco | Saídas | Duração Estimada |
|--------|------|--------|-----------------|
| **0** | Setup e Infraestrutura | Repo + Firebase + Vercel | 2-3 dias |
| **1** | Auth + Base de Dados | Login, Firestore estrutura, Dashboard | 5-7 dias |
| **2** | Agenda | Onboarding, Configurações, Agenda visual | 5-7 dias |
| **3** | Agendamentos | Fluxo cliente, Trocas, Gestão clientes | 7-10 dias |
| **4** | UX/Temas | Personalização, Notificações, Relatórios | 5-7 dias |
| **5** | Deploy | Testes, Deploy, Go-Live | 3-5 dias |
| **TOTAL** | | MVP Completo e em Produção | **27-39 dias** (~6-8 semanas) |

---

## ✅ CRITÉRIOS DE ACEITAÇÃO POR SPRINT

### Sprint 0 ✅
- [x] Repo criado e estruturado
- [x] Firebase configurado
- [x] Vercel conectado
- [x] Pastas criadas
- [x] .env ready

### Sprint 1 ✅
- [x] Login funciona (cliente e profissional)
- [x] Firestore estruturado
- [x] Autenticação segura
- [x] Dashboard básico
- [x] Sessão mantém após refresh

### Sprint 2 ✅
- [x] Onboarding obrigatório
- [x] Configurações salvam
- [x] Agenda visual (3 visualizações)
- [x] Bloqueio de horários
- [x] Todos os horários gerados dinamicamente

### Sprint 3 ✅
- [x] Cliente cria agendamento completo
- [x] Página pública funcional
- [x] Profissional confirma/cancela
- [x] Sistema previne conflito
- [x] Trocas funcionam
- [x] Gestão de clientes completa

### Sprint 4 ✅
- [x] Temas (free vs premium)
- [x] Notificações criadas
- [x] Relatórios básicos
- [x] Marca d'água (free/premium)
- [x] Feature flags implementadas
- [x] UI responsiva (celular-first)

### Sprint 5 ✅
- [x] Deploy em produção
- [x] 26 Testes Críticos PASS
- [x] Performance OK (Core Web Vitals)
- [x] Firestore Rules testadas
- [x] Documentação completa
- [x] Go-Live com segurança

---

## 🎯 CHECKLIST FINAL PRÉ-LAUNCH

**Antes de comunicar para primeiros usuários:**

### Segurança
- [ ] Todas as variáveis sensíveis em `.env`
- [ ] Firestore Rules implementadas e testadas
- [ ] CORS validado
- [ ] Sem chaves expostas no frontend

### Funcionalidade
- [ ] Login funciona em 2 navegadores diferentes
- [ ] Criar, editar, deletar agendamento OK
- [ ] Trocas funcionam
- [ ] Notificações disparam
- [ ] Tema aplica corretamente

### Performance
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] Carregamento rápido em 3G

### Acessibilidade Básica
- [ ] Contraste de cores OK
- [ ] Labels em formulários
- [ ] Alt text em imagens
- [ ] Teclado navigável

### Documentação
- [ ] README atualizado
- [ ] Como rodar localmente documentado
- [ ] Variáveis de ambiente documentadas
- [ ] Roadmap futuro claro

### UX
- [ ] Mobile responsivo
- [ ] Fluxo intuitivo
- [ ] Mensagens de erro claras
- [ ] Loading states visíveis

---

## 🚨 RISCOS E MITIGAÇÃO

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|--------|-----------|
| Firestore quota excedida | Média | Alto | Monitorar uso, otimizar queries |
| Conflito de horário durante agendamento | Alta | Médio | Usar transações Firestore |
| Problemas de sincronização de dados | Média | Médio | Implementar listeners reativo |
| Tema quebrando layout | Baixa | Baixo | Testar cores extremas |
| Deploy falha em produção | Baixa | Alto | Ter rollback pronto, testar build localmente |

---

## 🔮 ROADMAP PÓS-MVP

**Não inclusos neste checklist, mas preparados:**

- Integração Stripe/Mercado Pago
- WhatsApp automático (Twilio)
- Lista de espera
- Avaliações e reviews
- Templates por nicho
- Multi-profissionais por empresa
- API pública (webhooks)
- Aplicativo mobile (React Native)
- Integrações (Google Calendar, etc)
- Cursos online (módulo opcional)
- Sistema de pontos/rewards completo
- Analytics avançado
- Domínio personalizado
- Chat em tempo real

---

## 📝 NOTAS IMPORTANTES

1. **NÃO ESCREVA CÓDIGO AINDA** — Este é um checklist, não um guia de código
2. **SIGA RIGOROSAMENTE O ESCOPO** — Não invente funcionalidades
3. **TESTE CADA SPRINT** — Não acumule bugs para depois
4. **SECURITY FIRST** — Firestore Rules são críticas
5. **MOBILE FIRST** — 80% do uso será celular
6. **MVP ROBUSTO** — Melhor fazer pouco bem do que muito mal

---

**Versão Final: Janeiro 2026**  
**Status: Pronto para Desenvolvimento**  
**Próximo Passo: Começar Sprint 0**

