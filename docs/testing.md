# 🧪 Guia de Testes - AgendaEstética

Este documento descreve a estratégia de testes da plataforma AgendaEstética.

## 🎯 Estratégia de Testes

### Camadas de Teste

1. **Unitários**: Funções isoladas, lógica de negócio
2. **Integração**: Interação com Firebase (emulador)
3. **E2E**: Fluxos completos usuário (Cypress)
4. **Manuais**: Validação visual e casos críticos

### Cobertura Objetivo

- **Unitários**: 80%+ cobertura de código
- **Integração**: Todos os CRUD operations
- **E2E**: Fluxos críticos (cadastro → agendamento)
- **Manuais**: 40+ casos documentados

## 🧪 Testes Automatizados

### Pré-requisitos

```bash
npm install
npx firebase emulators:start --only firestore,auth
```

### Executando Testes

```bash
# Todos os testes
npm test

# Testes específicos
npx mocha tests/auth.test.js
npx mocha tests/agenda.test.js
npx mocha tests/agendamentos.test.js

# Com emulador
npm run test:emulator

# Cobertura
npm run test:coverage
```

### Estrutura dos Testes

```
tests/
├── auth.test.js          # Autenticação e autorização
├── agenda.test.js        # Configuração e slots
├── agendamentos.test.js  # CRUD compromissos
├── clientes.test.js      # Gestão clientes
├── notifications.test.js # Sistema notificações
├── firebase.test.js      # Integração Firebase
└── e2e/
    └── full-flow.test.js # Fluxo completo
```

## 📋 Testes Manuais

### Casos de Teste Principais

#### TC-001: Cadastro Profissional
1. Acessar landing page
2. Clicar "Sou Profissional"
3. Preencher cadastro
4. Completar onboarding
5. Verificar dashboard

#### TC-002: Configuração Agenda
1. Acessar configurações
2. Definir dias/horários
3. Configurar serviços
4. Salvar alterações
5. Verificar slots gerados

#### TC-003: Agendamento Cliente
1. Acessar página pública
2. Selecionar data/horário
3. Preencher dados
4. Confirmar agendamento
5. Verificar status pendente

#### TC-004: Confirmação Profissional
1. Receber notificação
2. Visualizar agendamento pendente
3. Confirmar agendamento
4. Verificar atualização status

### Checklist por Funcionalidade

#### Autenticação
- [ ] Login com credenciais válidas
- [ ] Login com credenciais inválidas
- [ ] Cadastro novo usuário
- [ ] Recuperação de senha
- [ ] Logout

#### Agenda
- [ ] Configuração horários
- [ ] Bloqueio datas
- [ ] Exceções especiais
- [ ] Visualização mensal/semanal/diária

#### Agendamentos
- [ ] Criação pendente
- [ ] Confirmação profissional
- [ ] Cancelamento
- [ ] Remarcação
- [ ] Histórico

#### Clientes
- [ ] Cadastro automático
- [ ] Histórico atendimentos
- [ ] Observações
- [ ] Filtros

#### Notificações
- [ ] Push notifications
- [ ] In-app alerts
- [ ] Centro notificações
- [ ] Configurações

## 🔧 Configuração do Ambiente de Teste

### Firebase Emulator

```bash
# Instalar CLI
npm install -g firebase-tools

# Iniciar emuladores
firebase emulators:start --only firestore,auth

# Executar testes
npm test
```

### Variáveis de Teste

```javascript
// config.test.js
export const testConfig = {
  firebase: {
    projectId: 'demo-project',
    // ... outras configs
  }
};
```

## 📊 Relatórios de Teste

### Métricas Coletadas

- Cobertura de código
- Tempo de execução
- Taxa de sucesso/falha
- Performance (tempo resposta)

### Ferramentas

- **Mocha**: Framework de testes
- **Chai**: Assertions
- **Istanbul**: Cobertura
- **Firebase Emulator**: Backend local

## 🚨 Troubleshooting

### Problemas Comuns

#### Emulador não inicia
```bash
# Verificar portas
lsof -i :8080
lsof -i :9099

# Matar processos
kill -9 <PID>
```

#### Testes falham
```bash
# Limpar cache
rm -rf node_modules/.cache

# Reinstalar
npm install

# Executar individualmente
npx mocha tests/auth.test.js --timeout 10000
```

#### Cobertura baixa
- Adicionar mais testes unitários
- Verificar branches não cobertos
- Melhorar isolamento de funções

## 🔄 CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
```

### Vercel

- Testes automáticos em deploy
- Preview deployments com testes E2E
- Bloqueio de deploy em falha

## 📈 Melhorias Futuras

- [ ] Testes E2E com Cypress
- [ ] Testes de performance
- [ ] Testes de acessibilidade
- [ ] Testes visuais (screenshot diff)
- [ ] Integração com ferramentas de QA

---

Para desenvolvimento, consulte `docs/developer-guide.md`.