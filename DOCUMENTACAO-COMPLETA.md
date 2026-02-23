# Documentação Completa - AgendaEstética v2

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Arquitetura do Projeto](#arquitetura-do-projeto)
4. [Estrutura de Pastas](#estrutura-de-pastas)
5. [Design System](#design-system)
6. [Funcionalidades Principais](#funcionalidades-principais)
7. [Módulos Core](#módulos-core)
8. [Security & Hardening](#security--hardening)
9. [Testes & Validação](#testes--validação)
10. [Deployment](#deployment)
11. [Desenvolvimento](#desenvolvimento)
12. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

**AgendaEstética** é um **SaaS (Software as a Service)** de agenda online para profissionais de estética (cabeleireiros, maquiadoras, esteticistas, etc).

### Objetivo Principal
Permitir que profissionais de estética gerenciem sua agenda, clientes e agendamentos de forma moderna, intuitiva e segura, com opção de compartilhar um link público de agendamento para seus clientes.

### Público-Alvo
- **Profissionais**: Cabeleireiros, esteticistas, maquiadoras, massoterápeutas
- **Clientes**: Pessoas buscando agendar serviços de estética

### Modelo de Negócio
- Plano **Free**: Funcionalidades básicas
- Plano **Premium**: Funcionalidades avançadas (relatórios, integrações, suporte)

---

## 🛠️ Stack Tecnológico

### Frontend
- **HTML5** - Estrutura semântica
- **CSS3** - Design System v2 (dark-neon theme com tokens CSS)
- **JavaScript (ES6+)** - Módulos ES para client-side rendering
- **Lucide Icons** - Biblioteca de ícones via CDN

### Backend
- **Firebase/Firestore** - Database NoSQL em tempo real
- **Firebase Auth** - Autenticação (email/senha)
- **Firebase Storage** - Armazenamento de imagens/documentos
- **Cloud Functions** (Node.js 18) - APIs serverless

### DevOps & Hosting
- **Vercel** - Deploy estático + serverless functions
- **GitHub** - Controle de versão e CI/CD
- **npm** - Gerenciamento de dependências

### Testing
- **Puppeteer** (v24.15.0) - E2E testing
- **Mocha + Chai** - Unit testing (opcional)

---

## 🏗️ Arquitetura do Projeto

### Fluxo de Requisições

```
┌─────────────────┐
│   Cliente Web   │  (index.html)
│   (Browser)     │
└────────┬────────┘
         │
         ├─ Router.js (roteamento SPA)
         │
         ├─ Carrega: login.html ou dashboard.html (via fetch)
         │
         ├─ Executa: [pagename].js (lógica da página)
         │
         └─ Acessa: Firebase (Firestore, Auth, Storage)
             │
             ├─ Cloud Functions (reCAPTCHA, validações)
             │
             └─ Firestore Rules (controle de acesso)
```

### Auth Flow

```
Não Autenticado
       ↓
    Login Page
       ↓
   validateCredentials() → Firebase Auth
       ↓
   Autenticado
       ↓
   Dashboard / Agenda / Agendamentos
       ↓
  (verificarSessao() valida token a cada rota)
```

### Data Flow

```
Frontend (JS)  →  Firebase SDK  →  Firestore  →  Retorna dados como JSON
   (queries)                           (read/write)

Frontend  →  Cloud Functions  →  Validação  →  Firestore
(eventos)      (reCAPTCHA)        (segurança)
```

---

## 📂 Estrutura de Pastas

```
agendaestetica/
│
├── index.html                 # Página raiz (SPA entry point)
├── router.js                  # Roteador client-side
├── config.js                  # Config Firebase
│
├── public/
│   ├── pages/                 # Todas as páginas HTML
│   │   ├── login.html         # Login/Cadastro (AppShell design)
│   │   ├── dashboard.html     # Dashboard principale (AppShell)
│   │   ├── agenda.html        # Configuração de agenda (AppShell)
│   │   ├── agendamentos.html  # Gerenciar agendamentos (AppShell)
│   │   ├── clientes.html      # Listar clientes (AppShell)
│   │   ├── pagina-cliente.html # Página do cliente autenticado
│   │   ├── pagina-publica.html # Página pública (link de agendamento)
│   │   ├── agendar-cliente.html # Form de agendamento (público)
│   │   └── [outras-páginas].html
│   │
│   ├── styles/
│   │   ├── main.css           # CSS principal (importa v2/*)
│   │   ├── v2/                # Design System v2
│   │   │   ├── reset.css      # Normalização
│   │   │   ├── tokens.css     # Design tokens (cores, spacing)
│   │   │   ├── base.css       # Estilos base (html, body, etc)
│   │   │   ├── layout.css     # Grid, flexbox, estrutura
│   │   │   ├── components.css # Componentes reutilizáveis
│   │   │   ├── utilities.css  # Classes utilitárias
│   │   │   └── app-shell.css  # App shell + dark-neon theme
│   │   └── [legacy]/          # Estilos antigos (deprecated)
│   │
│   ├── scripts/
│   │   ├── ui-shell.js        # Setup UI shell (headers, navs, etc)
│   │   └── [helpers].js
│   │
│   └── assets/
│       ├── icons/
│       └── images/
│
├── pages/                     # JS das páginas (cada página tem seu .js)
│   ├── login.js
│   ├── dashboard.js
│   ├── agenda.js
│   ├── agendamentos.js
│   ├── clientes.js
│   ├── pagina-cliente.js
│   └── [etc].js
│
├── modules/                   # Módulos core da aplicação
│   ├── firebase.js            # Inicialização Firebase
│   ├── auth.js                # Autenticação e sessão
│   ├── agenda.js              # Lógica de agenda
│   ├── agendamentos.js        # Gerenciamento de agendamentos
│   ├── clientes.js            # Gerenciamento de clientes
│   ├── notifications.js       # Sistema de notificações
│   ├── permissions.js         # Controle de acesso
│   ├── theme.js               # Light/Dark theme
│   ├── monetization.js        # Planos Free/Premium
│   ├── feedback.js            # Comentários/Avaliações
│   └── [etc].js
│
├── functions/                 # Cloud Functions (Node.js backend)
│   ├── index.js               # Todas as Cloud Functions
│   └── package.json
│
├── tests/
│   └── e2e/
│       └── run-tests.js       # E2E Puppeteer tests
│
├── deploy/
│   └── README.md             # Deploy guide
│
├── package.json              # npm dependencies
├── vercel.json               # Configuração Vercel
├── firestore.rules           # Firestore security rules
├── firestore.indexes.json    # Firestore indexes
├── .gitignore                # Arquivos ignorados no git
└── [DOCUMENTAÇÃO *.md]       # Guias e documentos

```

---

## 🎨 Design System

### Tema: Dark Neon

O projeto utiliza um **Design System v2** com tema **dark-neon** focado em UX moderna.

### Paleta de Cores (CSS Variables)

Definidas em `public/styles/v2/tokens.css`:

```css
/* Background & Surfaces */
--color-background: #0f172a    /* Azul muito escuro (fundo) */
--color-surface: #1e293b       /* Azul-cinzento (cards) */
--color-card: #1e293b          /* Cartões */

/* Text */
--color-text-primary: #e2e8f0    /* Branco-azulado principal */
--color-text-secondary: #94a3b8  /* Cinzento secundário */
--color-text-tertiary: #64748b   /* Cinzento terciário */

/* Brand */
--color-primary: #8b5cf6     /* Purple */
--color-primary-dark: #7c3aed
--color-accent: #06b6d4      /* Cyan */

/* Feedback */
--color-success: #22c55e     /* Verde */
--color-error: #ef4444       /* Vermelho */
--color-warning: #f59e0b     /* Laranja */

/* Gradients */
--gradient-primary: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)
--gradient-dark: linear-gradient(135deg, #1e293b 0%, #0f172a 100%)

/* Shadows & Effects */
--shadow-card: 0 6px 18px rgba(17,24,39,0.6), 0 1px 0 rgba(99,102,241,0.03)
--neon-glow: 0 0 10px rgba(124,58,237,0.12), 0 0 24px rgba(6,182,212,0.06)
```

### Light Theme (Tema Claro)

Quando `data-theme="light"` está ativo no `<html>`:

```css
[data-theme="light"] {
  --color-background: #f8fafc
  --color-surface: #ffffff
  --color-text-primary: #0f172a
  --color-text-secondary: #475569
}
```

### Componentes Principais

#### 1. **AppShell** (Grid Layout)
```
┌─────────────────────────────────────┐
│          app-header (64px)          │
├──────────────────┬──────────────────┤
│                  │                  │
│  app-sidebar     │   app-main       │
│  (260px, desktop)│  (1fr, flex)     │
│                  │                  │
│  (hidden mobile) │  app-grid (flex) │
│                  │                  │
└──────────────────┴──────────────────┘
Mobile: sidebar oculta, bottom-nav fixa
```

#### 2. **KPI Cards** (Dashboard)
- Grid 4 colunas (desktop), 1-2 (mobile)
- Ícones Lucide, valores em destaque
- Classe: `.kpi-card`

#### 3. **Action Cards** (Dashboard, Ações Rápidas)
- Grid responsivo (auto-fit minmax)
- Gradiente hover, neon-glow
- Classe: `.action-card`

#### 4. **Form Elements**
- Input com focus state
- Label semântica
- Validação via HTML5 + JS

#### 5. **Navigation**
- Desktop: Sidebar vertical
- Mobile: Bottom nav fixa (display: none → flex @ 768px)
- Links com `.nav-item` ativo destacado

---

## 🎯 Funcionalidades Principais

### Para Profissionais

#### 1. **Dashboard** (`/dashboard`)
- KPI Cards (agendamentos hoje, total clientes, receita, avaliação)
- Ações rápidas (configurar agenda, ver agendamentos, gerenciar clientes)
- Perfil resumido

#### 2. **Configurar Agenda** (`/agenda`)
- Definir horários de trabalho por dia
- Definir duração de serviços
- Definir pausas/intervalo de almoço
- Sincronizar com Google Calendar (futura integração)

#### 3. **Gerenciar Agendamentos** (`/agendamentos`)
- Listar todos os agendamentos (próximos/passados)
- Filtrar por período, cliente, serviço
- Confirmar/cancelar agendamentos
- Enviar notificações ao cliente

#### 4. **Meus Clientes** (`/clientes`)
- Listar todos os clientes cadastrados
- Buscar por nome/email
- Histórico de agendamentos por cliente
- Tags/categorias de clientes (clientes VIP, novos, etc)

#### 5. **Perfil Profissional** (`/perfil`)
- Foto de perfil
- Informações pessoais (nome, email, telefone)
- Endereço do estabelecimento
- Descrição de serviços
- Links de redes sociais

#### 6. **Link de Agendamento Público** (`/agenda/:profissionalId`)
- Página pública reutilizável
- Criptografia de ID (encode/decode)
- Mostra disponibilidades do profissional
- Clientes podem agendar sem login

### Para Clientes

#### 1. **Página do Cliente Autenticado** (`/pagina-cliente`)
- Manter histórico de agendamentos do cliente
- Ver agendamentos próximos
- Avaliar profissional
- Cancelar/remarcar agendamento

#### 2. **Agendar (Público)** (`/agendar/:profissionalId`)
- Formulário sem autenticação
- Buscar disponibilidades
- Selecionar data/hora
- Confirmar dados (nome, email, telefone)
- Receber confirmação

#### 3. **Gerenciar Meus Agendamentos** (`/meus-agendamentos`)
- Listar agendamentos do cliente autenticado
- Ver próximos e histórico

---

## 🔧 Módulos Core

### 1. **firebase.js**
```javascript
- initializeApp(config) // Inicializa Firebase
- getAuth() // Retorna instância Auth
- getFirestore() // Retorna instância Firestore
- getStorage() // Retorna instância Storage
- markFirebaseInitialized() // Flag para evitar múltiplas inicializações
```

### 2. **auth.js**
```javascript
// Autenticação
- login(email, senha) // Login com email/senha
- cadastro(dados) // Registrar novo usuário
- logout() // Logout
- resetarSenha(email) // Email para resetar senha
- verificarSessao() // Checar se usuário está autenticado
- obterUsuarioAtual() // Retorna dados do usuário (se autenticado)
- obterToken() // Retorna JWT token
```

### 3. **agenda.js**
```javascript
// Configurar agenda (horários de trabalho)
- salvarHorarios(profissionalId, horarios)
- obterHorarios(profissionalId)
- verificarDisponibilidade(profissionalId, data, horario)
- obterProximoHorarioDisponivel(profissionalId, dataInicial)
```

### 4. **agendamentos.js**
```javascript
// Gerenciar agendamentos
- criarAgendamento(dados) // Criar novo agendamento
- listarAgendamentos(profissionalId, filtros) // Listar agendamentos
- obterAgendamento(agendamentoId) // Get single
- confirmarAgendamento(agendamentoId) // Mark as confirmed
- cancelarAgendamento(agendamentoId) // Cancelar
- atualizarStatus(agendamentoId, novoStatus)
```

### 5. **clientes.js**
```javascript
// Gerenciar clientes
- criarCliente(dados)
- listarClientes(profissionalId)
- buscarCliente(termo)
- atualizarCliente(clienteId, dados)
- obterHistorico(clienteId)
- adicionarTag(clienteId, tag)
```

### 6. **notifications.js**
```javascript
// Sistema de notificações
- enviarEmail(destinatario, assunto, corpo)
- enviarSMS(telefone, mensagem)
- disparar(tipo, dados) // Toast, Push, etc
- obterNotificacoes(userId)
- marcarComoLida(notificacaoId)
```

### 7. **permissions.js**
```javascript
// Controle de acesso
- temPermissao(usuario, recurso, acao) // true/false
- verificarRole(usuario, role) // profissional, cliente, admin
- autorizar(requiredRole) // Redireciona se não autorizado
```

### 8. **theme.js**
```javascript
// Light/Dark theme
- toggleTheme() // Alterna light ↔ dark
- salvarTemaPreferido(tema) // localStorage
- obterTemaAtual() // Lê do localStorage ou preferência do SO
- aplicarTema(tema) // Aplica data-theme na HTML
```

### 9. **monetization.js**
```javascript
// Planos Free/Premium
- obterPlano(usuarioId) // free, premium
- obterLimites(plano) // Limites por funcionalidade
- verificarLimite(usuarioId, feature)
- fazerUpgrade(usuarioId, novoPLano)
- cancelarPlano(usuarioId)
```

---

## 🔒 Security & Hardening

### 1. **XSS Prevention (Cross-Site Scripting)**

**Status**: ✅ **Implementado**

- ❌ **Evitado**: `innerHTML` com conteúdo dinâmico
- ✅ **Usado**: `textContent` para texto, `createElement` + `appendChild` para elementos
- ✅ **Sanitizado**: Todos os 50+ casos de innerHTML foram migrados

**Exemplo**:
```javascript
// ❌ ANTES (Vulnerável)
element.innerHTML = `<p>${userInput}</p>`;

// ✅ DEPOIS (Seguro)
const p = document.createElement('p');
p.textContent = userInput; // textContent previne XSS
element.appendChild(p);
```

### 2. **CSRF Prevention**

- Tokens CSRF em Cloud Functions
- SameSite cookies (Firebase default)

### 3. **Firestore Rules (Security)**

**Status**: ✅ **Hardened**

```
Regra 1: Apenas usuários autenticados podem ler/escrever seus próprios dados
Regra 2: `empresas` (públicos) são lidos apenas se público==true OU proprietário==userId
Regra 3: Clientes não podem ver dados de outros clientes
Regra 4: Profissionais não podem editar dados de outros profissionais
```

### 4. **reCAPTCHA Verification**

**Status**: ⚠️ **Código Pronto, Env Pending**

Cloud Function `createCliente` possui verificação reCAPTCHA opcional (ativável via env var):

```javascript
if (process.env.RECAPTCHA_SECRET) {
  const score = await verifyRecaptcha(request.body.recaptchaToken);
  if (score < 0.5) throw new Error('Suspicious activity');
}
```

**Para ativar**:
1. Gerar reCAPTCHA v3 em https://www.google.com/recaptcha/admin
2. Set `RECAPTCHA_SECRET` no Vercel Dashboard
3. Chamar reCAPTCHA token no frontend antes de enviar form

### 5. **Rate Limiting**

**Status**: ⚠️ **Recomendado, Não Implementado**

Implementação opcional using Firebase `onCall` limits ou Cloud Armor.

### 6. **Environment Variables**

**Status**: ✅ **Seguro**

- ✅ Firebase keys em `config.js` (público, apiKey é limitada por domain)
- ✅ Secrets (RECAPTCHA_SECRET) em Vercel env vars (não commitados)
- ✅ `.env.local` ignorado pelo `.gitignore`

### 7. **HTTPS**

**Status**: ✅ **Vercel + Custom Domain**

- HTTPS automático no Vercel
- Certificates renovados a cada 90 dias

### 8. **Content Security Policy (CSP)**

**Status**: ⚠️ **Recomendado, Não Implementado**

Adicionar ao `vercel.json`:
```json
{
  "headers": [{
    "source": "/(.*)",
    "headers": [{
      "key": "Content-Security-Policy",
      "value": "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net"
    }]
  }]
}
```

---

## ✅ Testes & Validação

### E2E Tests (End-to-End)

**Arquivo**: `tests/e2e/run-tests.js`

**Framework**: Puppeteer (v24.15.0)

**Testes Implementados**:
1. ✅ App header renderizado
2. ✅ Theme toggle funciona (null → light)
3. ✅ Bottom nav visível em mobile (375px)
4. ✅ Sidebar visível em desktop (1200px)
5. ✅ 4 KPI cards renderizados

**Como rodar**:
```bash
npm run dev        # Terminal 1: Inicia servidor na porta 8000
npm run e2e        # Terminal 2: Executa testes
```

**Output Esperado**:
```
✔ app-header found
✔ theme toggled: null → light
✔ bottom-nav visible at mobile: true
✔ sidebar visible at desktop: true
✔ kpi cards count: 4
All checks passed.
```

### Unit Tests (Opcional)

**Framework**: Mocha + Chai

Pode ser adicionado para testar módulos:
```javascript
// tests/unit/auth.test.js
describe('Auth Module', () => {
  it('should login with valid credentials', async () => {
    // test logic
  });
});
```

---

## 🚀 Deployment

### Plataforma: Vercel

Vercel é uma plataforma de deploy integrada com GitHub que suporta:
- Static files (HTML/CSS/JS)
- Serverless Functions (Cloud Functions)
- Environment variables
- Redeploy automático ao fazer push

### Setup Inicial

1. **Conectar GitHub ao Vercel**:
   - Ir para https://vercel.com
   - Importar repositório GitHub
   - Selecionar `agendaestetica`

2. **Configurar Environment Variables**:
   - Ir para "Settings > Environment Variables"
   - Adicionar:
     ```
     RECAPTCHA_SECRET=your-secret-here (opcional)
     VITE_FIREBASE_*=... (se usar VITE)
     ```

3. **Configurar Domínio Custom** (opcional):
   - Vercel dashboard > Domains
   - Adicionar domínio (ex: agendaestetica.com.br)
   - Apontar DNS para Vercel nameservers

### Deploy Process

1. **Fazer Push para Main**:
   ```bash
   git add .
   git commit -m "feat: nova funcionalidade"
   git push origin main
   ```

2. **Vercel Detecta Mudança**:
   - Webhook executado automaticamente
   - Build iniciado

3. **Build Steps** (vercel.json):
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "."
   }
   ```

4. **Deploy Finalizado**:
   - URL gerada (ex: agendaestetica-1a2b3c.vercel.app)
   - Custom domain aponta para novo build
   - Versão anterior mantida como fallback

### Monitoring

- Vercel Dashboard: logs de build/deploy
- Console de erro: Analytics integrado
- Email: Notificações de falha

---

## 💻 Desenvolvimento

### Setup Local

**Requisitos**:
- Node.js 18+
- npm 9+
- Git

**Instalação**:
```bash
# Clone repo
git clone https://github.com/JackobAssis/agendaestetica.git
cd agendaestetica

# Install dependencies
npm install

# Start dev server
npm run dev
# Acessa em http://localhost:8000

# Start E2E tests (em outro terminal)
npm run e2e
```

### Estrutura de Desenvolvimento

#### Adicionar Nova Página

1. **Criar arquivo HTML** em `public/pages/minhapage.html`:
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  ...
  <link rel="stylesheet" href="../styles/main.css">
</head>
<body>
  <div id="app" class="app-shell">
    <!-- AppShell structure -->
    <header class="app-header">...</header>
    <aside class="app-sidebar">...</aside>
    <main class="app-main">...</main>
  </div>
  
  <script type="module" src="./minhapage.js"></script>
</body>
</html>
```

2. **Criar arquivo JS** em `public/pages/minhapage.js`:
```javascript
import { requireAuth } from '../../router.js';
import { obterUsuarioAtual } from '../../modules/auth.js';

export async function initPage() {
  if (!requireAuth('profissional')) return;
  
  const usuario = obterUsuarioAtual();
  // Sua lógica aqui
}

// Auto-init
initPage().catch(console.error);
```

3. **Registrar rota** em `router.js` (PAGES object):
```javascript
MINHAPAGE: { 
  path: '/minhapage', 
  file: '/pages/minhapage.html', 
  public: false, 
  requireAuth: true 
}
```

#### Adicionar Nova Funcionalidade ao Módulo

1. **Abrir** `modules/suamodulo.js`:
```javascript
export async function meunovofunction(params) {
  // Lógica
  return resultado;
}
```

2. **Usar em página**:
```javascript
import { minhanoverflow } from '../../../modules/suamodulo.js';

minhafunction(dados).then(resultado => {
  console.log(resultado);
});
```

#### Adicionar Estilo Custom

1. **Usar CSS variables** (preferível):
```css
.meu-componente {
  background: var(--color-surface);
  color: var(--color-text-primary);
  padding: var(--spacing-4);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
}
```

2. **Ou adicionar ao** `public/styles/v2/components.css`:
```css
.meu-componente {
  /* estilos custom */
}
```

---

## 🐛 Troubleshooting

### Problema: Firebase não está inicializando

**Solução**:
1. Verificar `config.js` tem todas as chaves
2. Verificar `.env.local` se usa VITE (não na versão atual)
3. Abrir console do browser (F12) e procurar erros
4. Verificar CORS: Firebase deve ter domínio no Authorized domains

### Problema: Página em branco após deploy

**Solução**:
1. Verificar build output: `npm run build` localmente
2. Limpar cache do browser: Ctrl+Shift+Del
3. Verificar console do Vercel para erros de build
4. Rollback para versão anterior no Vercel dashboard

### Problema: E2E Tests falhando

**Solução**:
1. Certificar que `npm run dev` estiver rodando
2. Verificar se porta 8000 está disponível
3. Rodar com mais verbosity: `DEBUG=* npm run e2e`
4. Atualizar Puppeteer: `npm install puppeteer@latest`

### Problema: Módulo Firebase não encontrado

**Solução**:
1. Verificar imports estão corretos (case-sensitive em Linux)
2. Certificar que arquivo existe em `modules/`
3. Verificar se `package.json` tem `"type": "module"`
4. Limpar node_modules: `rm -rf node_modules && npm install`

### Problema: Tema Dark não persiste

**Solução**:
1. Verificar localStorage:
   ```javascript
   localStorage.getItem('theme-preference')
   ```
2. Verificar `theme.js` está carregando
3. Verificar `data-theme` atributo na `<html>`

### Problema: Ícones Lucide não aparecem

**Solução**:
1. Verificar CDN está acessível: https://cdn.jsdelivr.net/npm/lucide@latest/dist/umd/lucide.js
2. Verificar atributos `data-lucide="icon-name"` estão corretos
3. Certificar que `lucide.createIcons()` foi chamado
4. Abrir DevTools e procurar erros do CDN

---

## 📚 Referências de Arquivos

| Arquivo | Responsabilidade |
|---------|-----------------|
| `index.html` | SPA entry point, inicialização Firebase |
| `router.js` | Roteamento client-side, gerenciar navegação |
| `config.js` | Configuração Firebase |
| `modules/auth.js` | Autenticação e sessão |
| `modules/firebase.js` | Inicialização Firebase |
| `modules/agenda.js` | Lógica de agenda |
| `public/styles/main.css` | CSS principal (importa v2/*) |
| `public/styles/v2/app-shell.css` | AppShell + dark-neon theme |
| `firestore.rules` | Security rules Firestore |
| `functions/index.js` | Cloud Functions (backend) |
| `.gitignore` | Arquivos ignorados no git |
| `vercel.json` | Configuração Vercel |
| `package.json` | Dependências npm |

---

## 🎓 Aprende Mais

- [Firebase Documentation](https://firebase.google.com/docs)
- [Vercel Deployment](https://vercel.com/docs)
- [Web Components & Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
- [CSS Variables](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [Puppeteer E2E Testing](https://pptr.dev/)

---

## 📝 Changelog

### v2.0 (Atual - Fev 2026)

#### Security Hardening
- ✅ Migração 50+ innerHTML → DOM-safe (textContent/createElement)
- ✅ Firestore rules hardened (read access restrictions)
- ✅ reCAPTCHA verification code (ativação pendente)

#### UI/UX Redesign
- ✅ AppShell layout (header + sidebar + main grid)
- ✅ Dark-neon theme com tokens CSS
- ✅ KPI cards (Dashboard)
- ✅ Action cards (Dashboard)
- ✅ Responsive design (mobile 375px, desktop 1200px+)
- ✅ Lucide icons integration (CDN)
- ✅ Light/Dark theme toggle

#### Testing & DevOps
- ✅ E2E tests com Puppeteer (4/4 passing)
- ✅ Git hooks (auto-commit no deploy)
- ✅ Vercel integration (auto-deploy)

#### Dependencies
- ✅ Puppeteer v24.15.0 (fixed deprecated warnings)
- ✅ Firebase 10.5.0
- ✅ Node.js 18 (Cloud Functions)

---

## 👥 Contribuidores

- **Desenvolvedor Principal**: Jackob Assis
- **Horário de Trabalho**: Disponível via email/WhatsApp

---

## 📞 Suporte & Contato

- **Email**: whybson@hotmail.com.br
- **GitHub Issues**: https://github.com/JackobAssis/agendaestetica/issues
- **Documentação**: Veja pasta `/` para .md files

---

**Última Atualização**: 22 de fevereiro de 2026

**Status**: ✅ Em Desenvolvimento Ativo

**Versão**: 2.0.0
