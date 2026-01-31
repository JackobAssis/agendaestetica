# 🧪 Guia de Testes Automatizados — AgendaEstética

## 📋 Visão Geral

Este documento descreve como executar os testes automatizados do projeto AgendaEstética usando o Firebase Emulator Suite.

---

## 🚀 Começo Rápido

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar os emuladores Firebase (em outro terminal)
npm run emulators:start

# 3. Executar todos os testes
npm test

# Ou usando o script otimizado
./scripts/run-tests.sh
```

---

## 📁 Estrutura de Testes

```
tests/
├── emulator-sanity.test.js   ✅ Teste básico de sanidade
├── auth.test.js              ✅ TC-001 a TC-008 (Autenticação)
├── agenda.test.js            ✅ TC-013 a TC-020 (Agenda)
└── agendamentos.test.js      ✅ TC-021 a TC-032 (Agendamentos)
```

---

## 🧪 Casos de Teste Cobertos

### **Auth Module (TC-001 a TC-008)**

| TC | Descrição | Status |
|----|-----------|--------|
| TC-001 | Cadastro de Profissional | ✅ |
| TC-002 | Cadastro de Cliente | ✅ |
| TC-003 | Login de Profissional | ✅ |
| TC-004 | Login de Cliente | ✅ |
| TC-005 | Logout | ✅ |
| TC-006 | Proteção de Rotas | ✅ |
| TC-007 | Separação de Roles | ✅ |
| TC-008 | Feature Flags | ✅ |

### **Agenda Module (TC-013 a TC-020)**

| TC | Descrição | Status |
|----|-----------|--------|
| TC-013 | Salvar configuração de agenda | ✅ |
| TC-014 | Configuração incompleta (erro) | ✅ |
| TC-015 | Criar bloqueio | ✅ |
| TC-016 | Bloqueio inválido (erro) | ✅ |
| TC-017 | Slots para data sem disponibilidade | ✅ |
| TC-018 | Slots para data disponível | ✅ |
| TC-019 | Slots sem bloqueios | ✅ |
| TC-020 | Criar agendamento duplicado (erro) | ✅ |

### **Agendamentos Module (TC-021 a TC-032)**

| TC | Descrição | Status |
|----|-----------|--------|
| TC-021 | Cliente solicita agendamento | ✅ |
| TC-022 | Profissional confirma | ✅ |
| TC-023 | Conflito ao confirmar | ✅ |
| TC-024 | Cancelar agendamento | ✅ |
| TC-025 | Solicitar remarcação | ✅ |
| TC-026 | Aceitar remarcação | ✅ |
| TC-027 | Rejeitar remarcação | ✅ |
| TC-028 | Listagem por empresa | ✅ |
| TC-029 | Listagem por cliente | ✅ |
| TC-030 | Bloqueios removem slots | ✅ |
| TC-031 | Prevenção de duplicação | ✅ |
| TC-032 | Notas internas | ✅ |

---

## 🖥️ Executando Testes

### **Executar todos os testes**
```bash
npm test
# ou
npm run test:all
```

### **Executar por módulo**
```bash
# Apenas autenticação
npm run test:auth

# Apenas agenda
npm run test:agenda

# Apenas agendamentos
npm run test:agendamentos
```

### **Usando o script otimizado**
```bash
# Verificar se emuladores estão rodando
./scripts/run-tests.sh check

# Executar todos os testes
./scripts/run-tests.sh

# Executar módulo específico
./scripts/run-tests.sh auth
./scripts/run-tests.sh agenda
./scripts/run-tests.sh agendamentos
```

---

## 🔧 Configuração de Ambiente

### **Variáveis de Ambiente**

```bash
# Firestore Emulator
export FIRESTORE_EMULATOR_HOST=localhost:8080

# Auth Emulator
export FIREBASE_AUTH_EMULATOR_HOST=localhost:9099

# Project ID (para emuladores)
export GCLOUD_PROJECT=demo-project
```

### **Configuração no .env**

Crie um arquivo `.env` na raiz do projeto:

```env
FIRESTORE_EMULATOR_HOST=localhost:8080
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
GCLOUD_PROJECT=demo-project
```

---

## 🐳 Docker (Opcional)

Para executar os testes em um ambiente isolado:

```bash
# Criar docker-compose.yml para testes
cat > docker-compose.test.yml << 'EOF'
version: '3.8'
services:
  firestore:
    image: google/cloud-sdk:alpine
    command: >
      gcloud beta emulators firestore start
      --host-port=0.0.0.0:8080
    ports:
      - "8080:8080"
    
  auth:
    image: google/cloud-sdk:alpine
    command: >
      gcloud beta emulators auth start
      --host-port=0.0.0.0:9099
    ports:
      - "9099:9099"
      
  tests:
    image: node:18-alpine
    working_dir: /app
    command: npm test
    depends_on:
      - firestore
      - auth
    environment:
      FIRESTORE_EMULATOR_HOST: firestore:8080
      FIREBASE_AUTH_EMULATOR_HOST: auth:9099
      GCLOUD_PROJECT: demo-project
EOF

docker-compose -f docker-compose.test.yml up tests
```

---

## 📊 Relatório de Testes

### **Exemplo de Saída**

```
🧪 AgendaEstética - Test Runner
================================
📡 Verificando emuladores...
✓ Firestore Emulator está rodando em localhost:8080
✓ Auth Emulator está rodando em localhost:9099

🚀 Executando testes: all
--------------------------------

  Auth Module
    ✓ TC-001: should create user document in Firestore
    ✓ TC-002: should create client document with role cliente
    ✓ TC-003: should find profissional by email and return empresaId
    ✓ TC-004: should correctly distinguish between profissional and cliente
    ✓ TC-005: should return correct features for free plan
    ✓ TC-006: should return correct features for premium plan

  Agenda Module
    ✓ TC-013: should save agenda configuration
    ✓ TC-014: should validate required configuration fields
    ✓ TC-015: should create a blocking period
    ✓ TC-016: should reject invalid block (missing dates)
    ✓ TC-019: should return empty for days not in working days
    ✓ TC-020: should generate correct number of slots

  Agendamentos Module
    ✓ TC-021: should create agendamento with status solicitado
    ✓ TC-022: should update status to confirmado
    ✓ TC-023: should detect conflict with existing confirmed appointment
    ✓ TC-024: should update status to cancelado and save reason
    ✓ TC-025: should create remarcacao with status pendente
    ✓ TC-026: should update agendamento with new date/time
    ✓ TC-027: should update remarcacao status to rejeitada
    ✓ TC-028: should filter agendamentos by empresa
    ✓ TC-029: should filter agendamentos by cliente
    ✓ TC-030: should exclude blocked times from available slots
    ✓ TC-031: should prevent creating duplicate confirmed appointment
    ✓ TC-032: should add nota to agendamento


  24 passing

✓ Todos os testes passaram!
```

---

## ⚠️ Troubleshooting

### **Erro: Emulator not running**
```
✗ Firestore Emulator não está rodando!
```
**Solução:** Execute `firebase emulators:start` antes de rodar os testes.

### **Erro: Connection refused**
```
Firebase Configuration Error: Missing configuration fields
```
**Solução:** Verifique se as variáveis de ambiente estão configuradas corretamente.

### **Erro: Timeout**
```
Error: Timeout of 10000ms exceeded
```
**Solução:** Aumente o timeout no comando:
```bash
mocha --timeout 30000 tests/**/*.test.js
```

### **Erro: Permission denied**
```
EACCES: permission denied
```
**Solução:** Dê permissão de execução ao script:
```bash
chmod +x scripts/run-tests.sh
```

---

## 🔄 Integração Contínua (CI/CD)

### **GitHub Actions**

Crie `.github/workflows/tests.yml`:

```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Start Firebase Emulators
        run: |
          npm run emulators:start &
          sleep 10
          
      - name: Run tests
        run: npm test
        env:
          FIRESTORE_EMULATOR_HOST: localhost:8080
          FIREBASE_AUTH_EMULATOR_HOST: localhost:9099
          GCLOUD_PROJECT: demo-project
```

---

## 📈 Próximos Testes (Futuro)

| Módulo | Descrição | Prioridade |
|--------|-----------|------------|
| **Notifications** | TC-024 a TC-026 | Alta |
| **Tema** | TC-020 a TC-023 | Média |
| **Relatórios** | Relatórios básicos | Média |
| **UI/UX** | Responsividade | Baixa |
| **Performance** | Core Web Vitals | Baixa |

---

## 📚 Referências

- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)
- [Mocha Documentation](https://mochajs.org/)
- [Chai Assertion Library](https://www.chaijs.com/)
- [PLANO-MESTRE-TECNICO.md](PLANO-MESTRE-TECNICO.md)

---

**Versão:** 1.0.0  
**Última atualização:** Janeiro 2026

