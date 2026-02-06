# 🚀 AgendaEstética

**Plataforma SaaS de agenda online para profissionais do ramo estético.**

---

## 📌 Visão Geral do Negócio

### O Problema que Resolvemos

O mercado de beleza e estética no Brasil movimenta **R$ 100+ bilhões/ano**, com milhões de profissionais autônomos que enfrentam os mesmos problemas operacionais diariamente:

| Problema | Impacto | Solução AgendaEstética |
|----------|---------|------------------------|
| **Desorganização no WhatsApp** | 30% dos agendamentos são perdidos ou esquecidos | Centralização em plataforma dedicado |
| **Conflito de horários** | Overbooking gera insatisfação e perda de receita | Sistema de slots exclusivos |
| **Falta de histórico** | Impossibilidade de entender preferências do cliente | Banco de dados completo por cliente |
| **Gestão manual** | Tempo desperdiçado com administration | Automação de lembretes e confirmações |

### Nossa Proposta de Valor

- ✅ **Para Profissionais**: Eliminar a dependência do WhatsApp, reduzir no-shows em até 50%, aumentar conversão de agendamentos
- ✅ **Para Clientes**: Agendamento 24/7, lembretes automáticos, histórico de atendimentos, fácil remarcação

### Público-Alvo

| Segmento | Perfil | Tamanho do Mercado |
|----------|--------|-------------------|
| **Cabeleireiros** | Autônomos e salões pequenos | ~1.2M profissionais |
| **Esteticistas** | Clínicas e spas | ~800K profissionais |
| **Barbeiros** | Barbearias e autônomos | ~500K profissionais |
| **Manicures** | Salões e domicílio | ~600K profissionais |

**Total endereçável**: ~3M profissionais potenciais no Brasil

---

## ✨ Funcionalidades Principais

### Para Profissionais (Dashboard Admin)

#### 📅 Gestão de Agenda
- **Visualizações**: Mensal, semanal e diária com grid interativo
- **Configuração flexível**: Dias de trabalho, horários, duração e intervalos
- **Bloqueios**: Horários específicos ou dias inteiros (férias, folgas)
- **Exceções**: Datas especiais com regras próprias

#### 📋 Gestão de Agendamentos
- **Criação rápida**: Manual pelo profissional ou online pelo cliente
- **Fluxo de confirmação**: Pendente → Confirmado (ou Recusado)
- **Lifecycle completo**: Cancelamento, remarcação, conclusão automática
- **Status claros**: 5 estados (pendente, confirmado, cancelado, concluído, remarcado)

#### 👥 Gestão de Clientes
- **CRM básico**: Lista completa com informações de contato
- **Perfil enriquecido**: Histórico de atendimentos, preferências
- **Observações internas**: Anotações para melhor atendimento
- **Filtros inteligentes**: Por frequência, status, último atendimento

#### 🎨 Personalização da Marca
- **Cores personalizadas**: Identidade visual do profissional
- **Foto de perfil e banner**: Profissionalismo visual
- **Nicho e descrição**: SEO para página pública

#### 🔔 Sistema de Notificações
- **Badge em tempo real**: Novas solicitações
- **Notificações push**: Confirmações, cancelamentos, trocas
- **Centro de notificações**: Histórico completo

### Para Clientes (Portal Público)

#### 🖥 Página Pública do Profissional
- **Acesso via link único**: SEO-friendly (seudominho.agendaestetica.com)
- **Visual profissional**: Foto, nicho, descrição
- **Horários disponíveis**: Grid inteligente com disponibilidade real-time

#### 📱 Fluxo de Agendamento Simplificado (3 passos)
1. **Selecionar data** — Calendário com apenas dias disponíveis
2. **Escolher horário** — Slots em tempo real
3. **Confirmar dados** — Nome, contato, observações

#### 📲 Gestão Própria
- **Meus agendamentos**: Visualização de todos os futuros e passados
- **Solicitações**: Cancelamento e troca de data/horário
- **Sem cadastro prévio**: Criação automática na primeira vez

---

## 🎯 Modelo de Monetização

### Plano Free (Freemium)

**Objetivo**: Validação inicial e aquisição de usuários

Inclui:
- Agenda online completa
- Agendamentos ilimitados
- Página personalizada básica
- Cadastro de clientes (até 50)
- Gestão de clientes básica
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
├── src/                          # Código fonte principal
│   ├── index.html                # Landing + escolha de perfil
│   ├── login.html                # Tela unificada de autenticação
│   ├── onboarding.html           # Setup inicial obrigatório
│   ├── dashboard.html           # Resumo do dia (profissional)
│   ├── agenda.html              # Calendário 3 visualizações
│   ├── agendamentos.html        # Gestão + ações
│   ├── clientes.html            # Lista + perfil individual
│   ├── configuracoes.html       # Settings completos
│   ├── public.html              # Página pública (cliente)
│   ├── notificacoes.html        # Centro de notificações
│   ├── relatorios.html          # Relatórios e estatísticas
│   ├── meus-agendamentos.html  # Portal do cliente
│   ├── solicitacoes-troca.html  # Gestão de trocas
│   │
│   ├── css/                     # Estilos modulares
│   │   ├── main.css             # Reset, tipografia, base
│   │   ├── variables.css        # CSS Variables (temas)
│   │   ├── responsive.css      # Mobile-first breakpoints
│   │   ├── components.css       # Botões, cards, modais
│   │   ├── forms.css           # Inputs, validações
│   │   ├── animations.css       # Transições, loaders
│   │   └── pages/              # Estilos específicos
│   │
│   ├── js/                      # Lógica modular ES6+
│   │   ├── config.js            # Firebase + constantes
│   │   ├── app.js              # Bootstrap/inicialização
│   │   ├── auth.js             # Login, logout, sessão
│   │   ├── firestore.js        # CRUD genérico + queries
│   │   ├── permissoes.js       # Verificação de acesso
│   │   ├── agenda.js           # Lógica de horários
│   │   ├── agendamentos.js     # Gestão de agendamentos
│   │   ├── clientes.js         # CRM básico
│   │   ├── tema.js             # CSS dinâmicas
│   │   ├── notificacoes.js     # Sistema de notif.
│   │   ├── relatorios.js       # Agregação de dados
│   │   ├── router.js           # Navegação SPA
│   │   └── utils.js            # Helpers genéricos
│   │
│   └── assets/                  # Recursos estáticos
│       ├── icons/              # SVG icons (otimizados)
│       ├── images/             # Imagens estáticas
│       └── fonts/              # Fontes customizadas
│
├── public/                      # Build de produção (copia src)
│   ├── index.html
│   ├── config.js
│   ├── modules/
│   ├── pages/
│   └── styles/
│
├── functions/                   # Firebase Cloud Functions
│   ├── index.js                # Entry point
│   └── package.json
│
├── tests/                       # Testes automatizados
│   ├── agenda.test.js
│   ├── agendamentos.test.js
│   ├── auth.test.js
│   └── emulator-sanity.test.js
│
├── scripts/                     # Scripts de automação
│   ├── build.js                # Build de produção
│   ├── deploy-firebase.sh       # Deploy Firebase
│   ├── deploy-prod.sh          # Deploy produção
│   ├── run-local.sh            # Servidor local
│   └── setup-env.sh            # Configuração de ambiente
│
├── docs/                        # Documentação técnica
│   ├── FIRESTORE-SCHEMA.md
│   ├── REGRAS-SEGURANCA.md
│   ├── API-FUNCOES.md
│   └── GUIA-TESTES.md
│
├── .env.example                 # Template de variáveis
├── .gitignore
├── vercel.json                 # Config Vercel
├── firebase.json               # Config Firebase
├── firestore.rules             # Regras de segurança
├── firestore.indexes.json      # Índices Firestore
├── package.json
└── README.md                   # Este arquivo
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

