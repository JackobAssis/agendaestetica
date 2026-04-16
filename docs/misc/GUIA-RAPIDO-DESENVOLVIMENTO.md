# 📑 GUIA RÁPIDO — Arquivos Técnicos de Desenvolvimento

**Data:** 31 de Janeiro de 2026  
**Projeto:** AgendaEstética — MVP Robusto  
**Status:** Pronto para Desenvolvimento

---

## 📚 Arquivos de Documentação Disponíveis

### 1️⃣ Plano Mestre Técnico (USE ESTE PRIMEIRO!)

**Arquivo:** `PLANO-MESTRE-TECNICO.md`

**Conteúdo:**
- Visão geral do sistema
- Mapa de arquitetura completo
- Estrutura final de pastas
- Checklist detalhado por Sprint (0-5)
- Todas as funções obrigatórias por arquivo JS
- Estrutura completa do Firestore
- Regras de Segurança (Security Rules)
- Fluxos críticos com diagramas
- 40 testes manuais obrigatórios

**Para quem:** Desenvolvedor que vai implementar, Tech Lead, Arquiteto

**Tempo de leitura:** 45-60 minutos

---

### 2️⃣ Checklist de Desenvolvimento Simplificado

**Arquivo:** `CHECKLIST-DESENVOLVIMENTO-COMPLETO.md`

**Conteúdo:**
- Versão resumida do plano mestre
- Checklist em formato simples
- Sprints com tarefas checkáveis
- Referência rápida

**Para quem:** PM, Gerente de projeto, Desenvolvedor em execução

**Tempo de leitura:** 20-30 minutos

---

### 3️⃣ Documentos Originais (Escopo)

**Arquivos:**
- `EscopoLogineCadastro.md` — Sistema de acesso detalhado
- `EscopoFluxodaPlataforma.md` — Fluxos funcionais
- `EscopoFluxodeTela.md` — UX/Wireframes
- `escopo-funcional-detalhado.md` — Funcionalidades
- `monetizacao.md` — Plano free/premium
- `arquitetura-tecnica.md` — Stack técnico
- `ux-fluxo-profissional-cliente.md` — Fluxos completos

**Para quem:** Gerente de produto, Designer, Stakeholders

**Objetivo:** Entender regras de negócio e fluxos

---

## 🚀 COMO COMEÇAR

### Cenário 1: Desenvolvedor vai começar agora

```
1. Leia: PLANO-MESTRE-TECNICO.md (Seções 1-3)
   ↓ (30 min)
2. Copie: Estrutura de pastas (Seção 3)
   ↓ (Sprint 0)
3. Comece: Sprint 0 do checklist (Setup)
   ↓ (Seção 4)
4. Consulte: Seção 5 (Funções JS) durante a implementação
   ↓
5. Use: Seção 6 (Firestore Schema) para criar collections
   ↓
6. Teste: Seção 9 (Testes Manuais) ao terminar cada sprint
```

### Cenário 2: Gerente de Projeto acompanhando

```
1. Leia: CHECKLIST-DESENVOLVIMENTO-COMPLETO.md
   ↓ (30 min)
2. Leia: PLANO-MESTRE-TECNICO.md Seção 1 (Visão Geral)
   ↓ (15 min)
3. Use Sprint Progress (Seção 4 do Plano Mestre)
   ↓ (Acompanhamento diário)
4. Acompanhe Testes (Seção 9 do Plano Mestre)
   ↓ (Validação)
```

### Cenário 3: Tech Lead revisando arquitetura

```
1. Leia: PLANO-MESTRE-TECNICO.md (todas as seções)
   ↓ (60 min)
2. Revise: Seção 2 (Arquitetura)
   ↓ (15 min)
3. Revise: Seção 7 (Regras de Segurança)
   ↓ (20 min)
4. Valide: Seção 5 (Funções obrigatórias)
   ↓ (20 min)
```

---

## 📊 Estrutura do Plano Mestre Técnico

```
PLANO-MESTRE-TECNICO.md
│
├─ 1. VISÃO GERAL DO SISTEMA
│  ├─ O que é AgendaEstética?
│  ├─ Tipos de usuários
│  ├─ Fluxos principais
│  └─ Regras de negócio críticas
│
├─ 2. MAPA DE ARQUITETURA
│  ├─ Arquitetura em camadas
│  ├─ Stack tecnológico
│  ├─ Módulos JavaScript
│  └─ Fluxo de dados
│
├─ 3. ESTRUTURA FINAL DE PASTAS
│  ├─ Árvore completa (/src, /docs, config files)
│  └─ Responsabilidade de cada arquivo
│
├─ 4. CHECKLIST POR SPRINT
│  ├─ Sprint 0: Infraestrutura (3-4 dias)
│  ├─ Sprint 1: Autenticação (7-9 dias)
│  ├─ Sprint 2: Agenda (7-9 dias)
│  ├─ Sprint 3: Agendamentos (8-10 dias)
│  ├─ Sprint 4: UX/Temas (6-8 dias)
│  └─ Sprint 5: Deploy (5-7 dias)
│
├─ 5. FUNÇÕES OBRIGATÓRIAS POR ARQUIVO JS
│  ├─ config.js
│  ├─ auth.js
│  ├─ permissoes.js
│  ├─ firestore.js
│  ├─ agenda.js
│  ├─ agendamentos.js
│  ├─ clientes.js
│  ├─ tema.js
│  ├─ notificacoes.js
│  ├─ relatorios.js
│  ├─ utils.js
│  └─ app.js
│
├─ 6. ESTRUTURA DO FIRESTORE
│  ├─ Collections principais
│  ├─ Subcollections
│  ├─ Exemplo de documentos
│  └─ Índices recomendados
│
├─ 7. REGRAS DE SEGURANÇA FIRESTORE
│  ├─ Estratégia geral
│  ├─ Rules completas
│  ├─ Pontos críticos de segurança
│  └─ Mitigação de riscos
│
├─ 8. FLUXOS CRÍTICOS DETALHADOS
│  ├─ Fluxo 1: Login e primeira entrada
│  ├─ Fluxo 2: Criação de agendamento (cliente)
│  ├─ Fluxo 3: Confirmação (profissional)
│  ├─ Fluxo 4: Cancelamento/Troca
│  └─ Fluxo 5: Gestão de cliente
│
└─ 9. CHECKLIST DE TESTES MANUAIS
   ├─ 40 testes críticos (TC-001 a TC-040)
   ├─ Matriz por user flow
   ├─ Testes por Sprint
   ├─ Validação pré-launch
   └─ Cronograma estimado
```

---

## 🎯 Principais Decisões Técnicas

### 1. Frontend Vanilla JS (sem frameworks)

**Por quê?**
- Simples e rápido para MVP
- Fácil manutenção
- Sem overhead de bundler/compiler
- Deploy direto em Vercel

**Como:**
- ES6+ (arrow functions, destructuring, async/await)
- Módulos ES6
- Event delegation para performance
- Listeners do Firestore para reatividade

### 2. Firebase como Backend Completo

**Por quê?**
- Autenticação robusta
- Firestore (NoSQL em tempo real)
- Storage (fotos)
- Segurança via Rules
- Sem servidor próprio

**Como:**
- Auth: email + telefone
- Firestore: collections por empresa (multi-tenant)
- Storage: Firebase Storage SDK

### 3. Multi-tenant com `empresaId`

**Por quê?**
- Isolamento total de dados
- Escalabilidade
- Uma URL serve todas as empresas

**Como:**
```
https://agendaestetica.com/p/{empresaId}
Cada query filtra por empresaId
Firestore Rules enfatizam isolamento
```

### 4. Mobile-first CSS

**Por quê?**
- 80% dos usuários em celular
- Mais barato em Performance
- UX melhor em mobile

**Como:**
- CSS Variables (temas dinâmicos)
- Flexbox/Grid
- Media queries (360px, 600px, 1024px+)

### 5. Testes Manuais (sem Selenium/Jest)

**Por quê?**
- MVP rápido
- Testes manuais suficientes
- 40 fluxos críticos cobertos

**Como:**
- Checklist de testes por Sprint
- Matriz de validação
- Smoke tests em produção

---

## 🔐 Segurança em 3 Camadas

```
Layer 1: Firebase Auth
├─ Email + Senha (profissional)
├─ Cadastro automático (cliente)
└─ Sessão segura

Layer 2: Firestore Rules
├─ Filtro obrigatório por empresaId
├─ Cliente: apenas seus dados
├─ Profissional: dados da empresa
└─ Transações para conflitos

Layer 3: Frontend Validation
├─ Permissões por role
├─ Proteção de rotas
└─ Feature flags por plano
```

---

## ⏱️ Cronograma Realista

```
Sprint 0 (Setup)           3-4 dias   (Repo, Firebase, Vercel)
Sprint 1 (Auth)            7-9 dias   (Login, Firestore, Dashboard)
Sprint 2 (Agenda)          7-9 dias   (Onboarding, Config, Calendário)
Sprint 3 (Agendamentos)    8-10 dias  (Fluxo cliente, Confirmação, Clientes)
Sprint 4 (UX/Temas)        6-8 dias   (Personalização, Notificações, Relatórios)
Sprint 5 (Deploy)          5-7 dias   (Testes, Segurança, Go-live)
                           ─────────
Total                      35-50 dias (~7-10 semanas)
```

---

## 💾 Estrutura de Pastas (Resumida)

```
agendaestetica/
├── src/
│   ├── *.html (12 telas)
│   ├── css/ (6 arquivos)
│   ├── js/ (12 módulos)
│   └── assets/
├── docs/ (este + originais)
├── .env
├── .gitignore
├── vercel.json
└── README.md
```

**Total:** ~30 arquivos (simples e organizado)

---

## 📈 Métricas de Sucesso

### Funcionalidade
- ✅ 40 testes críticos PASS
- ✅ 3 visualizações de agenda funcionando
- ✅ Notificações disparam em tempo real
- ✅ Conflito de horários bloqueado

### Performance
- ✅ LCP < 2.5s
- ✅ FID < 100ms
- ✅ CLS < 0.1
- ✅ Carregamento < 3s em 3G

### Segurança
- ✅ Firestore Rules testadas
- ✅ Acesso cruzado bloqueado
- ✅ Nenhuma chave exposta
- ✅ HTTPS enforçado

### UX
- ✅ Mobile responsivo (4+ tamanhos)
- ✅ Fluxo intuitivo (3-4 cliques)
- ✅ Mensagens claras
- ✅ Sem 404s

---

## ❓ Perguntas Frequentes

### P: Por que Vanilla JS e não React?
**R:** MVP rápido. React seria overhead. Quando escalar, migra fácil.

### P: Firestore é caro?
**R:** Layer gratuita inclui 25k/dia leituras. Escala barato se otimizar queries.

### P: E se a empresa quiser seu domínio?
**R:** Suporta domínios custom via Vercel. Adicione pós-MVP.

### P: Como adicionar pagamentos?
**R:** Stripe/Mercado Pago depois. Feature flags já preparadas.

### P: O código está pronto para produção?
**R:** Não. Este é o plano mestre. Implementação começará em Sprint 0.

---

## 🚀 Próximos Passos

### Imediato (Hoje)

- [ ] Ler `PLANO-MESTRE-TECNICO.md` seções 1-3
- [ ] Copiar estrutura de pastas
- [ ] Criar repositório GitHub
- [ ] Configurar `.env.example`

### Sprint 0 (Próxima semana)

- [ ] Setup Firebase
- [ ] Setup Vercel
- [ ] Criar pastas
- [ ] Documentação local

### Sprint 1 (Semana 2-3)

- [ ] Implementar `auth.js`
- [ ] Criar telas de login
- [ ] Firestore estrutura
- [ ] Dashboard básico

---

## 📞 Contato / Suporte

Se tiver dúvidas sobre o plano:

1. Releia a seção correspondente em `PLANO-MESTRE-TECNICO.md`
2. Consulte os documentos originais (escopo)
3. Verifique o fluxo crítico na Seção 8

---

**Documento gerado:** 31 de Janeiro de 2026  
**Versão:** 2.1 — Completo e Pronto para Desenvolvimento  
**Aprovado por:** Tech Lead Sênior

🎯 **VOCÊ ESTÁ PRONTO PARA COMEÇAR!**
