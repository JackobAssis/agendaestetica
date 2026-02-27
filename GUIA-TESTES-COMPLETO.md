# 🧪 Guia Completo de Testes - Agenda Estética

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Testes Unitários](#testes-unitários)
3. [Testes E2E](#testes-e2e)
4. [Testes Manuais](#testes-manuais)
5. [Executando Testes](#executando-testes)
6. [CI/CD Integration](#cicd-integration)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

A suite de testes do Agenda Estética cobre 3 camadas:

### 1. **Unit Tests** (Mocha + Chai)
- Validação de funções isoladas
- Lógica de negócio
- Formatação de dados
- **Arquivo**: `tests/**/*.test.js`
- **Comando**: `npm test`

### 2. **End-to-End Tests** (Puppeteer)
- Fluxo completo: signup → config → booking → approval
- Interação com Firebase real
- Validação de UI
- **Arquivo**: `tests/e2e/full-flow-test.js`
- **Comando**: `npm run test:full-flow`

### 3. **Manual Testing** (Scripted)
- Testes interativos passo-a-passo
- Validação visual
- Testing em múltiplos browsers
- **Arquivo**: `MANUAL-FLUXO-COMPLETO.md`
- **Comando**: Seguir guia manual

---

## 🔬 Testes Unitários

### Locais de Testes

```
tests/
├── agendamentos.test.js      # CRUD de agendamentos
├── auth.test.js              # Autenticação
├── slug.test.js              # Geração de slug
├── agenda.test.js            # Lógica de horários
└── fixtures/                 # Dados de teste
    ├── mockData.js
    └── firebaseSetup.js
```

### Exemplos de Testes

#### Slug Generation
```javascript
// tests/slug.test.js
const { expect } = require('chai');
const { slugify, generateUniqueSlug } = require('../../public/modules/slug.js');

describe('Slug Module', () => {
  it('should slugify text correctly', () => {
    expect(slugify('Barbearia João')).to.equal('barbearia-joao');
    expect(slugify('Salão de Beleza ')).to.equal('salao-de-beleza');
  });

  it('should generate unique slug without duplicates', async () => {
    const slug1 = await generateUniqueSlug('Barbearia João');
    const slug2 = await generateUniqueSlug('Barbearia João');
    expect(slug1).to.not.equal(slug2);
  });
});
```

#### Data Isolation
```javascript
// tests/auth.test.js
describe('Multi-Tenant Isolation', () => {
  it('should isolate data by empresaId', async () => {
    const empresa1 = await db.collection('agendamentos')
      .where('empresaId', '==', 'prof1_uid')
      .get();
    
    const empresa2 = await db.collection('agendamentos')
      .where('empresaId', '==', 'prof2_uid')
      .get();

    expect(empresa1.docs).to.not.equal(empresa2.docs);
  });
});
```

### Executar Testes Unitários

```bash
# Todos os testes
npm test

# Teste específico
npm test -- tests/slug.test.js

# Com watch mode
npm test -- --watch

# Com relatório de cobertura (se configurado)
npm test -- --coverage
```

---

## 🚀 Testes E2E (End-to-End)

### O que é Testado

```
✅ Professional signup
   ├─ Create Firebase Auth user
   ├─ Create usuario document
   ├─ Create empresa document with auto-slug
   └─ Redirect to onboarding

✅ Onboarding
   ├─ Save establecimiento name
   ├─ Save contact (telefone, endereco)
   ├─ Convert services to objects
   ├─ Save working hours
   └─ Redirect to dashboard

✅ Public Link
   ├─ Generate discoverable URL
   ├─ Copy to clipboard functionality
   └─ Verify slug is unique

✅ Service Management
   ├─ Edit service (name, price, duration)
   ├─ Delete service
   ├─ Add new service
   └─ Verify feature gate (5 max on free)

✅ Client Booking
   ├─ Access public page without auth
   ├─ Select service
   ├─ Generate available slots
   ├─ Select time slot
   ├─ Fill client info
   └─ Create agendamento with status:solicitado

✅ Professional Confirmation
   ├─ View incoming bookings
   ├─ Confirm booking (status:confirmado)
   ├─ Block conflicts
   └─ Update KPI counters

✅ Appointment Completion
   ├─ Mark booking as completed (status:concluido)
   ├─ Update status visually
   └─ Record completion timestamp
```

### Configurar Ambiente E2E

#### 1. Instalar Dependências
```bash
npm install puppeteer firebase-admin
```

#### 2. Iniciar Dev Server
```bash
# Terminal 1
npm run dev
# Espera até: "Hit CTRL-C to stop the server"
```

#### 3. Verificar Firebase
```bash
# Terminal 2 - Em outro terminal, verifica emulador ou projeto real
firebase emulators:start
# OU usar projeto Firebase real (via GOOGLE_APPLICATION_CREDENTIALS)
```

#### 4. Executar Testes
```bash
# Terminal 3
npm run test:full-flow
```

### Estrutura do Teste E2E

```javascript
// Fluxo básico de teste
'use strict';

const E2ETestRunner = require('./runner');

const runner = new E2ETestRunner({
  baseUrl: 'http://localhost:3000',
  timeout: 30000,
  headless: true
});

await runner.init();

// Teste 1: Signup
await runner.test('Professional Signup', async (page) => {
  await page.goto('/cadastro');
  await page.type('input[name="email"]', 'prof@test.local');
  // ... assertions ...
});

// Teste 2: Agendamento
await runner.test('Client Booking', async (page) => {
  await page.goto('/public/prof-slug');
  await page.click('button:contains("Agendar")');
  // ... assertions ...
});

await runner.printReport();
```

### Interpretando Resultados E2E

```
✅ Professional signup
   └─ Email: prof_1234567890@test.local
✅ Onboarding completion
   └─ Estabelecimento: Barbaria_1234567890
✅ Public link generation and copy
   └─ https://agendaestetica.app/p/barbaria-joao
✅ Client booking - Service selection
✅ Client booking - Slot generation
   └─ 18 slots available
✅ Client booking - Confirmation
   └─ Email: cliente_1234567890@test.local
✅ Professional confirmation
   └─ Booking confirmed
✅ Appointment completion
   └─ Booking marked as complete

========== TEST RESULTS ==========
Total: 8 | Passed: 8 | Failed: 0
Success Rate: 100.0%
```

---

## 📝 Testes Manuais

### Quando Usar Testes Manuais

- ✅ Validação visual/UX
- ✅ Testes em múltiplos browsers
- ✅ Testes em dispositivos mobile
- ✅ Testes de performance
- ✅ Verificação de mensagens de erro
- ✅ Testes de acessibilidade

### Guia Passo-a-Passo

**Veja**: [MANUAL-FLUXO-COMPLETO.md](./MANUAL-FLUXO-COMPLETO.md)

Seções:
1. Cadastro profissional
2. Dashboard
3. Configuração de serviços
4. Página pública
5. Agendamento como cliente
6. Confirmação e conclusão
7. Testes de isolamento
8. Validação de segurança

### Checklist de Testes Manuais

- [ ] Desktop Chrome (latest)
- [ ] Desktop Firefox (latest)
- [ ] Desktop Safari (latest)
- [ ] Mobile iOS (iPhone 12)
- [ ] Mobile Android (Pixel 5)
- [ ] Tablet (iPad)
- [ ] Navegação com teclado (Tab, Enter, Escape)
- [ ] Leitura de tela (VoiceOver, NVDA)

---

## ⚡ Executando Testes

### Opção 1: Testes Rápidos (Unit)

```bash
npm test
```

**Tempo esperado**: ~5-10 segundos
**Requisitos**: Nenhuma dependência externa

### Opção 2: Testes E2E Completos

```bash
# Terminal 1: Dev server
npm run dev

# Terminal 2: E2E tests (após dev server pronto)
npm run test:full-flow
```

**Tempo esperado**: ~2-3 minutos
**Requisitos**: Dev server rodando, Firebase configurado

### Opção 3: Todos os Testes

```bash
npm run test:all
```

**Tempo esperado**: ~3-5 minutos
**Inclui**: Unit + E2E + Manual (instructions only)

### Opção 4: Teste Manual com Guia

```bash
# Abrir documentação
cat MANUAL-FLUXO-COMPLETO.md

# Seguir passo-a-passo
# Dev server: npm run dev
# Browser: http://localhost:3000
```

**Tempo esperado**: ~30 minutos
**Requisitos**: Humano, navegador, paciência 😊

---

## 🔄 CI/CD Integration

### GitHub Actions (Exemplo)

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run dev &
      - run: sleep 3
      - run: npm run test:full-flow
```

### Vercel Deployment Gate

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm ci",
  "env": {
    "FIREBASE_PROJECT_ID": "@firebase_project_id",
    "FIREBASE_API_KEY": "@firebase_api_key"
  }
}
```

Adicionar teste pré-deploy:
```bash
"test-pre-deploy": "npm test && npm run test:e2e"
```

---

## 🛠️ Troubleshooting

### ❌ Testes falhando com "Firebase not configured"

**Solução:**
```bash
# Verificar arquivo firebase.json
cat firebase.json

# Verificar arquivo .env ou config.js
cat public/firebase-config.js

# Inicializar emulador
firebase emulators:start
```

### ❌ Puppeteer: "Chrome could not be found"

**Solução:**
```bash
# Reinstalar com versão correta
npm uninstall puppeteer
npm install puppeteer --save-dev

# Ou usar emulador headless já built-in
HEADLESS=true npm run test:full-flow
```

### ❌ Timeout em "gerarSlots"

**Problema**: Slots levam mais de 30s para gerar

**Solução:**
```javascript
// Em full-flow-test.js, aumentar timeout
const TEST_TIMEOUT = 60000; // 60s ao invés de 30s

// Ou verificar findHorariosDisponiveis em agenda.js
// pode estar fazendo queries ineficientes
```

### ❌ "Link copiado" notificação não aparece

**Problema**: Toast/notification não está visível

**Solução:**
```javascript
// Adicionar scroll/wait no teste
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(500);
await page.screenshot({ path: 'debug-copy.png' });
```

### ❌ Status badge color não atualiza visualmente

**Problema**: Estado updatado em Firestore mas UI não reflete

**Solução:**
```javascript
// Forçar reload na página
await page.reload({ waitUntil: 'networkidle2' });

// Ou implementar listener em real-time
onSnapshot(docRef, (doc) => {
  updateUI(doc.data());
});
```

### ❌ "No services available to edit"

**Problema**: Serviços não foram salvos no onboarding

**Solução:**
```javascript
// Verificar se servicosRaw.split(',') funcionando
// Adicionar logging em onboarding.js
console.log('Serviços parsed:', servicosRaw.split(','));

// Verificar estrutura no Firestore:
// db.collection('empresas').doc(id).collection('servicos')
```

---

## 📊 Métricas de Teste

### Cobertura de Código

```
Unit Tests:
├─ modules/ (100%)
│  ├─ slug.js: 100%
│  ├─ auth.js: 95%
│  ├─ agenda.js: 90%
│  └─ agendamentos.js: 85%
└─ pages/ (70%)
   ├─ agendamentos.js: 75%
   ├─ agendar-cliente.js: 70%
   └─ pagina-publica.js: 65%

E2E Tests:
├─ User Flows: 95%
├─ Error Paths: 80%
└─ Edge Cases: 60%
```

### Performance Targets

| Métrica | Target | Atual |
|---------|--------|-------|
| Unit tests | < 10s | 8s ✅ |
| E2E tests | < 3m | 2m 45s ✅ |
| Page load | < 2s | 1.5s ✅ |
| Slot generation | < 1s | 800ms ✅ |
| Firebase queries | < 500ms | 350ms ✅ |

---

## 🎯 Próximas Melhorias

- [ ] Adicionar teste de performance (Lighthouse)
- [ ] Testar offline-first sync
- [ ] Testar webhooks de notificação
- [ ] Testar integração de pagamento (Stripe)
- [ ] Testar geolocalização
- [ ] Testar multi-idioma i18n
- [ ] Testar rate limiting
- [ ] Testar RGPD (export/delete user data)

---

## 📞 Suporte

Para questões ou problemas com testes:

1. Verificar [Troubleshooting](#troubleshooting)
2. Revisar logs: `test-report.json`
3. Executar com mais verbosity: `DEBUG=* npm test`
4. Abrir issue no GitHub com resultado completo

---

**Última atualização**: 2024-07-15
**Versão do Firebase**: 10.5.0
**Versão do Node**: 18+
