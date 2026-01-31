# Guia de Testes Manuais — AgendaEstética

## Ambiente de Teste
- **App URL**: http://localhost:8000
- **Emuladores**: Rodando (Firestore:8080, Auth:9099, Functions:5001)
- **Estado**: MVP Completo — FASE 1-6 Implementado

---

## Checklist de Testes Manuais

### 1️⃣ **FASE 5** — Agendamentos (TC-021 a TC-032)

#### TC-021: Cadastro de Profissional
**Objetivo**: Verificar se um profissional consegue se cadastrar
1. Acesse http://localhost:8000
2. Clique em "Registrar como Profissional"
3. Preencha: Email, Senha, Nome, Especialidade
4. Clique em "Cadastrar"
5. **Esperado**: Redirecionado para dashboard do profissional
6. **Status**: ✅ IMPLEMENTADO

#### TC-022: Login de Profissional
**Objetivo**: Verificar autenticação do profissional
1. Faça logout (se necessário)
2. Digite email/senha de profissional cadastrado
3. Clique "Login"
4. **Esperado**: Redirecionado para dashboard
5. **Status**: ✅ IMPLEMENTADO

#### TC-023: Configuração de Agenda
**Objetivo**: Profissional configura dias/horários atendimento
1. No dashboard, clique em "Minha Agenda"
2. Configure dias da semana e horário início/fim
3. Salve configuração
4. **Esperado**: Agenda salva em Firestore
5. **Status**: ✅ IMPLEMENTADO

#### TC-024: Criar Bloqueio de Horário
**Objetivo**: Profissional bloqueia horários específicos
1. Em "Minha Agenda", clique em "Novo Bloqueio"
2. Selecione data e horário
3. Clique "Bloquear"
4. **Esperado**: Horário bloqueado não aparece na agenda pública
5. **Status**: ✅ IMPLEMENTADO

#### TC-025: Gerar Slots de Disponibilidade
**Objetivo**: Sistema gera automaticamente slots disponíveis
1. Configure agenda e bloqueios
2. Acesse página pública do profissional: http://localhost:8000/#/agendar/[profissionalId]
3. **Esperado**: Slots aparecem respeitando horários e bloqueios
4. **Status**: ✅ IMPLEMENTADO

#### TC-026: Cliente Solicita Agendamento
**Objetivo**: Cliente não logado solicita agendamento
1. Acesse página pública do profissional
2. Selecione slot disponível
3. Preencha: Nome, Email, Telefone, Observações
4. Clique "Solicitar Agendamento"
5. **Esperado**: Solicitação criada com status "solicitado"
6. **Status**: ✅ IMPLEMENTADO

#### TC-027: Profissional Confirma Agendamento
**Objetivo**: Profissional confirma agendamento solicitado
1. No dashboard, veja "Agendamentos Pendentes"
2. Clique em agendamento "solicitado"
3. Clique "Confirmar"
4. **Esperado**: Status muda para "confirmado"
5. **Status**: ✅ IMPLEMENTADO (Via Cloud Function)

#### TC-028: Profissional Rejeita Agendamento
**Objetivo**: Profissional rejeita agendamento
1. Em agendamento "solicitado", clique "Rejeitar"
2. **Esperado**: Status muda para "rejeitado"
3. **Status**: ✅ IMPLEMENTADO

#### TC-029: Cliente Cancela Agendamento
**Objetivo**: Cliente cancela agendamento confirmado
1. Acesse perfil público do profissional
2. Localize agendamento confirmado
3. Clique "Cancelar"
4. **Esperado**: Status muda para "cancelado"
5. **Status**: ✅ IMPLEMENTADO

#### TC-030: Remarcação de Agendamento
**Objetivo**: Profissional permite remarcação
1. Em agendamento, clique "Permitir Remarcação"
2. Cliente seleciona novo slot
3. **Esperado**: Nova data registrada em subcollection `remarcacoes`
4. **Status**: ✅ IMPLEMENTADO

#### TC-031: Notificação In-App
**Objetivo**: Profissional recebe notificações de novos agendamentos
1. Abra dashboard em duas abas
2. Em uma aba, cliente solicita agendamento
3. Na outra aba, verifique notificação in-app
4. **Esperado**: Notificação exibida no topo
5. **Status**: ✅ IMPLEMENTADO

#### TC-032: Webhook de Notificação
**Objetivo**: Sistema envia webhook para serviço externo
1. Configure webhook URL em dashboard
2. Cliente solicita agendamento
3. Verifique logs do serviço externo
4. **Esperado**: POST enviado com dados do agendamento
5. **Status**: ✅ STUB IMPLEMENTADO (Aguardando integração externa)

---

### 2️⃣ **FASE 6** — Gestão de Clientes (TC-033 a TC-038)

#### TC-033: Cadastro Automático de Cliente
**Objetivo**: Sistema cria cliente automaticamente ao agendar
1. Cliente solicita agendamento
2. Sistema busca cliente por email
3. Se não existe, cria novo
4. **Esperado**: Cliente salvo em `empresas/{id}/clientes`
5. **Status**: ✅ IMPLEMENTADO (Via Cloud Function `createCliente`)

#### TC-034: Listar Clientes
**Objetivo**: Profissional vê lista de seus clientes
1. No dashboard, clique "Clientes"
2. **Esperado**: Lista de clientes com emails, phones, agendamentos
3. **Status**: ✅ IMPLEMENTADO

#### TC-035: Adicionar Observação ao Cliente
**Objetivo**: Profissional anota informações sobre cliente
1. Clique em cliente
2. Clique "Adicionar Observação"
3. Digite observação, clique salvar
4. **Esperado**: Observação salva em Firestore
5. **Status**: ✅ IMPLEMENTADO

#### TC-036: Histórico de Agendamentos do Cliente
**Objetivo**: Ver histórico de agendamentos de um cliente
1. Clique em cliente
2. Veja aba "Histórico"
3. **Esperado**: Lista de agendamentos passados e futuros
4. **Status**: ✅ IMPLEMENTADO

#### TC-037: Buscar Cliente por Email
**Objetivo**: Encontrar cliente existente
1. Em "Clientes", clique "Buscar"
2. Digite email
3. **Esperado**: Cliente encontrado ou criado
4. **Status**: ✅ IMPLEMENTADO

#### TC-038: Deletar Cliente
**Objetivo**: Remover cliente (soft delete)
1. Clique em cliente, "Opções"
2. Clique "Deletar"
3. **Esperado**: Cliente marcado como deletado
4. **Status**: ✅ IMPLEMENTADO

---

### 3️⃣ **FASE 8** — Segurança & Regras (TC-039 a TC-044)

#### TC-039: Não pode agendar para profissional inexistente
**Objetivo**: Validar proprietário
1. Tente agendar para UUID aleatório
2. **Esperado**: Erro 403 Forbidden
3. **Status**: ✅ FIRESTORE RULES IMPLEMENTADO

#### TC-040: Profissional A não vê dados de Profissional B
**Objetivo**: Isolamento de dados por empresaId
1. Logar como Prof A, anotar agendamentos
2. Logar como Prof B
3. **Esperado**: Não vê agendamentos de Prof A
4. **Status**: ✅ FIRESTORE RULES IMPLEMENTADO

#### TC-041: Cliente não pode confirmar próprio agendamento
**Objetivo**: Apenas proprietário pode confirmar
1. Cliente tenta confirmar agendamento próprio
2. **Esperado**: Erro 403 Forbidden
3. **Status**: ✅ CLOUD FUNCTION `confirmAgendamento` IMPLEMENTADO

#### TC-042: Criação de cliente requer função
**Objetivo**: Não permite criação pública direta
1. Tente fazer POST direto em `/clientes`
2. **Esperado**: Erro 403 Forbidden (regra)
3. **Status**: ✅ FIRESTORE RULES HARDENED

#### TC-043: Cloud Function assinada verifica token
**Objetivo**: `createCliente` valida autenticação
1. Chame função sem token válido
2. **Esperado**: Erro 403 ou "token inválido"
3. **Status**: ✅ CLOUD FUNCTION IMPLEMENTADO

#### TC-044: Concorrência — múltiplos confirmar simultâneos
**Objetivo**: Apenas uma confirmação por agendamento
1. Tente confirmar mesmo agendamento 2x em paralelo
2. **Esperado**: Uma confirma, outra falha com "já confirmado"
3. **Status**: ✅ CLOUD FUNCTION (TRANSACTION) IMPLEMENTADO

---

### 4️⃣ **FASE 9** — Monetização & Temas (TC-045 a TC-050)

#### TC-045: Profissional vê plano atual
**Objetivo**: Exibir plano ativo
1. No dashboard, clique "Meu Plano"
2. **Esperado**: Plano "free" ou "premium" exibido
3. **Status**: ✅ IMPLEMENTADO

#### TC-046: Alterar entre planos
**Objetivo**: Upgrade/downgrade de plano
1. Em "Meu Plano", clique "Upgradar"
2. Selecione novo plano
3. **Esperado**: Plano atualizado em Firestore
4. **Status**: ✅ IMPLEMENTADO

#### TC-047: Funcionalidades de plano gated
**Objetivo**: Free não pode usar recursos premium
1. Com plano "free", tente criar notificação webhook
2. **Esperado**: Erro "Feature not available on this plan"
3. **Status**: ✅ IMPLEMENTADO (`permissions.temFeature()`)

#### TC-048: Aplicar tema light/dark
**Objetivo**: Trocar tema visual
1. Em dashboard, clique "Tema"
2. Selecione "Dark Mode"
3. **Esperado**: Cores mudam, tema persiste em localStorage
4. **Status**: ✅ IMPLEMENTADO (`src/modules/theme.js`)

#### TC-049: Tema persiste entre sessões
**Objetivo**: Após reload, tema se mantém
1. Aplique tema "dark"
2. Recarre a página (F5)
3. **Esperado**: Tema continua "dark"
4. **Status**: ✅ IMPLEMENTADO

#### TC-050: Perfil público mostra tema correto
**Objetivo**: Cliente vê perfil com tema do profissional
1. Configure tema premium
2. Abra perfil público
3. **Esperado**: Tema aplicado corretamente
4. **Status**: ✅ IMPLEMENTADO

---

## 🎯 Instruções para Rodar Testes

### Opção 1: Teste Manual (Recomendado para UX)
```bash
# Terminal 1 — Emuladores
npm run emulators:start

# Terminal 2 — App
npm run dev

# Abrir http://localhost:8000 no navegador
```

### Opção 2: Testes Automatizados (Recomendado para CI)
```bash
# Já rodando
npm run emulators:test

# Output esperado:
# ✔ writes and reads a document in Firestore emulator
# 1 passing
```

---

## 📊 Status Geral

| Fase | Status | Testes |
|------|--------|--------|
| FASE 5 | ✅ Completo | TC-021–032 |
| FASE 6 | ✅ Completo | TC-033–038 |
| FASE 8 | ✅ Completo | TC-039–044 |
| FASE 9 | ✅ Completo | TC-045–050 |

---

## 🚀 Próximos Passos
1. ✅ **Testes Emulador** — Pronto
2. ✅ **App Local** — Pronto
3. ⏳ **Deploy Firebase** — Aguardando credenciais reais
4. ⏳ **Deploy Vercel** — Aguardando configuração
5. ⏳ **Testes E2E em Produção** — Pós-deploy

