# 🧪 Testes - AgendaEstética

Esta pasta contém toda a documentação relacionada a testes do sistema AgendaEstética.

## 📁 Arquivos

### Casos de Teste por Fase
- [**TESTS-FASE-5-TC-021-032.md**](TESTS-FASE-5-TC-021-032.md) - Testes da Fase 5 (Agendamentos)
- [**TESTS-FASE-6-TC-033-038.md**](TESTS-FASE-6-TC-033-038.md) - Testes da Fase 6
- [**TESTS-FASE-8-TC-039-044.md**](TESTS-FASE-8-TC-039-044.md) - Testes da Fase 8
- [**TESTS-FASE-9-TC-045-050.md**](TESTS-FASE-9-TC-045-050.md) - Testes da Fase 9

### Guias de Teste
- [**TEST-COMMANDS-CARD.md**](TEST-COMMANDS-CARD.md) - Comandos de teste
- [**TESTE-QUICK-REFERENCE.md**](TESTE-QUICK-REFERENCE.md) - Referência rápida de testes
- [**TESTE-README.md**](TESTE-README.md) - Documentação geral de testes
- [**TESTING-INDEX.md**](TESTING-INDEX.md) - Índice de testes
- [**TESTING-IMPLEMENTATION-SUMMARY.md**](TESTING-IMPLEMENTATION-SUMMARY.md) - Resumo da implementação

### Estratégia de Testes
- [**GUIA-TESTES-COMPLETO.md**](GUIA-TESTES-COMPLETO.md) - Guia completo de testes
- [**MANUAL-TESTING-GUIDE.md**](MANUAL-TESTING-GUIDE.md) - Guia de testes manuais
- [**CHECKLIST-TESTES-PRE-LANCAMENTO.md**](CHECKLIST-TESTES-PRE-LANCAMENTO.md) - Checklist pré-lançamento

## 🧪 Estratégia de Testes

### Camadas
1. **Unitários**: Funções isoladas (Mocha + Chai)
2. **Integração**: Firebase Emulator
3. **E2E**: Fluxos completos (Cypress)
4. **Manuais**: Validação visual e casos críticos

### Cobertura
- **Unitários**: 80%+ de cobertura
- **Integração**: Todos os CRUD operations
- **E2E**: Fluxos críticos (cadastro → agendamento)
- **Manuais**: 40+ casos documentados

## 🚀 Executando Testes

```bash
# Todos os testes
npm test

# Testes específicos
npm run test:e2e
npm run test:smoke

# Com emulador
npm run test:emulator
```

## 📋 Casos de Teste Principais

### TC-001 a TC-010: Cadastro e Onboarding
- Cadastro profissional
- Configuração inicial
- Validação de dados

### TC-011 a TC-020: Autenticação
- Login/logout
- Recuperação de senha
- Controle de acesso

### TC-021 a TC-032: Agendamentos
- Criação de agendamentos
- Confirmação/cancelamento
- Remarcações

### TC-033+: Funcionalidades Avançadas
- Notificações
- Temas personalizados
- Gestão de clientes

## 📊 Relatórios

- [**TESTING-IMPLEMENTATION-SUMMARY.md**](TESTING-IMPLEMENTATION-SUMMARY.md) - Status atual
- [**CHECKLIST-TESTES-PRE-LANCAMENTO.md**](CHECKLIST-TESTES-PRE-LANCAMENTO.md) - Pré-lançamento

## 🎯 Próximos Passos

- [ ] Implementar testes E2E com Cypress
- [ ] Aumentar cobertura de testes unitários
- [ ] Adicionar testes de performance
- [ ] Testes de acessibilidade

---

Para estratégia geral de testes, consulte [`../testing.md`](../testing.md).