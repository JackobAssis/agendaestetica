# 🧪 Manual de Teste - Fluxo Completo End-to-End

## Objetivo
Validar que um profissional pode se cadastrar, configurar sua agenda, e clientes possam agendar horários via link público.

---

## 1️⃣ PROFISSIONAL: CADASTRO E ONBOARDING

### 1.1 Acessar Landing  
- 🌐 Abrir: `http://localhost:3000/` (ou ambiente de teste)
- ✅ Verificar: Landing exibe "Sou Profissional" e "Agendar Horário"

### 1.2 Cadastro de Profissional
- 📋 Clique em "Sou Profissional"
- 📝 Preencha:
  - **Tab Cadastro** → Profissional ativo
  - **Nome**: "João Cabeleireiro"
  - **Email**: `joao@example.com`
  - **Profissão**: "Cabeleireiro"
  - **Senha**: (confirmada)
- ✅ Sistema deve:
  - Criar usuário no Firebase Auth
  - Criar doc em `usuarios/{uid}`
  - Criar `empresas/prof_{uid}` com slug automático
  - Redirecionar a onboarding

### 1.3 Onboarding
- 📋 Preencha:
  - **Estabelecimento**: "Barbaria Joao"
  - **Telefone**: "(11) 99999-9999"
  - **Endereço**: "Rua das Flores, 123"
  - **Serviços**: "Corte,Barba,Hidratação" (separar por vírgula)
  - **Dias**: Seg-Sex (6 dias)
  - **Horário**: 9:00 - 18:00
  - **Duração slot**: 30 minutos
- 📤 Clique "Salvar e Continuar"
- ✅ Sistema deve:
  - Converter serviços em lista de objetos `{nome, preco: 0, duracao: 0}`
  - Salvar config em `empresas/{empresaId}/horarios` e `servicos`
  - Redirecionar ao dashboard

---

## 2️⃣ PROFISSIONAL: DASHBOARD

### 2.1 Verificar Dashboard
- 📊 KPIs devem exibir:
  - ☑️ "Agendamentos Hoje": 0  
  - ☑️ "Total de Clientes": 0
- 📍 Seção "Link Público" deve exibir: `https://agendaestetica.app/p/barbearia-joao`
- 📋 Botão "Copiar link" funciona (testa clipboard)

### 2.2 Configurar Serviços (Perfil)
- ⚙️ Clique em "Perfil" (sidebar)
- 📝 Seção "Serviços":
  - ✏️ Editar: "Corte" → "Corte - R$ 45.00 - 30min"
  - ➕ Adicionar: "Tingimento" → "R$ 80.00 - 60min"
  - 🗑️ Remover: "Hidratação"
- ✅ Após "Salvar", reload → valores persistem

### 2.3 Editar Slug (Perfil)
- 📍 Seção "Link Público"
- ✏️ Altere slug: "barbearia-joao" → "joao-barber"
- ✅ Verifica duplicação? Tente nome já existente → deve avisar
- ✅ Sistema salva e mostra novo link: `https://agendaestetica.app/p/joao-barber`

### 2.4 Mudar Plano (Perfil)
- 💰 Seção "Plano"
- Altere "Free" → "Premium"
- ✅ Persiste após reload

---

## 3️⃣ CLIENTE: PÁGINA PÚBLICA

### 3.1 Acessar Link Público (Sem Login)
- 🌐 Abrir: `https://agendaestetica.app/p/joao-barber`  
  (ou no emulador local com slug)
- ✅ Exibe:
  - Nome: "Barbearia Joao"
  - Profissão: "Cabeleireiro"
  - Endereço: "Rua das Flores, 123"
  - Serviços: "Corte (R$ 45.00 - 30min)", "Tingimento (R$ 80.00 - 60min)"
  - Botão "Agendar"

### 3.2 Tentar Slug Inexistente
- 🌐 Abrir: `https://agendaestetica.app/p/inexistente`
- ✅ Mensagem amigável: "Profissional não encontrado"

---

## 4️⃣ CLIENTE: AGENDAMENTO

### 4.1 Agendar (1º Cliente)
- ⏰ Clique "Agendar" na página pública
- 📋 Passo 1: Escolher Serviço
  - Selecionar "Corte (R$ 45.00 - 30min)"
- 📅 Passo 2: Escolher Data
  - Calendário: Próxima segunda (ex: 03/03/2026)
  - Clique "Gerar slots"
  - ✅ Deve exibir slots de 30min: 09:00-09:30, 09:30-10:00, ..., 17:30-18:00

### 4.2 Selecionar Slot e Confirmar
- 🕐 Clique em slot "10:00-10:30"
- 👤 Preencha:
  - Nome: "Cliente Um"
  - Email: `cliente1@example.com`
  - Telefone: "(11) 98888-8888"
- ✅ Mensagem: "Solicitação enviada! Aguarde confirmação."

### 4.3 Agendar (2º Cliente - verificar conflito)
- 📋 Repita fluxo, mesmo slot/data
- ✅ Sistema deve bloquear → "Conflito de horário detectado"

---

## 5️⃣ PROFISSIONAL: GERENCIAR AGENDAMENTOS

### 5.1 Dashboard → Agendamentos
- 📊 Dashboard agora mostra:
  - "Agendamentos Hoje": 0
  - "Agendamentos Próximos": 1 (segunda)
- 🔔 Ou próxima seção confirmada vs. pendente

### 5.2 Lista de Agendamentos
- 📋 Clique seção "Agendamentos"
- 🕐 Exibe: "Cliente Um" | Corte | 03/03 10:00-10:30 | Status: **solicitado** (laranja)
- 🔘 Botões:
  - ✅ "Confirmar" → atualiza status para **confirmado** (verde)
  - ❌ "Cancelar" → atualiza status para **cancelado** (vermelho)

### 5.3 Confirmar Agendamento
- ✅ Clique "Confirmar"
- ✅ Status muda para "confirmado"
- 🔄 Refresh dashboard: KPI mostra "1 Confirmado"

### 5.4 Marcar Concluído
- ✅ List ainda exibe agendamento confirmado
- ✅ Clique "Concluir"
- ✅ Status muda para "concluído" (azul)
- 🔄 Refresh: agendamento sai de stats ativas (opcional)

### 5.5 Cancelar Agendamento
- ❌ Agende novo horário (cliente diferente, outro slot)
- ❌ Na lista, clique "Cancelar" → confirme modal
- ✅ Status → "cancelado" (vermelho)
- ✅ **Horário liberado**: Agora cliente 3 pode agendar o mesmo slot

---

## 6️⃣ INTEGRAÇÃO: VERIFICAR ISOLAMENTO

### 6.1 Múltiplos Profissionais
- Logue com 2º profissional (conta completamente nova)
- 🔒 **Professsor 1 NÃO VÊ agendamentos de Professor 2**
- 🔒 Dashboard, lista de clientes, tudo isolado

### 6.2 Verificar Firestore Queries
- Query agendamentos filtra por `empresaId` ✅
- Query clientes filtra por `empresaId` ✅
- Sem `empresaId`, query retorna vazio ✅

---

## 7️⃣ SEGURANÇA: VALIDAR REGRAS

### 7.1 Verificar Firebase Rules
- 🔐 Cliente SEM autenticação pode:
  - ✅ Ler `empresas/{id}` com `public == true`
  - ✅ Criar agendamento com `status == solicitado`
  - ❌ NÃO pode editar/deletar agendamentos de outro profissional
  - ❌ NÃO pode ler clientes
  
- 🔐 Profissional pode:
  - ✅ Ler própria empresa documento
  - ✅ Atualizar agendamentos (status, etc.)
  - ❌ NÃO pode acessar outra empresa

---

## 8️⃣ UX: MENSAGENS E ESTADOS

### 8.1 Loading States
- ⏳ Ao gerar slots → botão desabilitado com "Gerando..."
- ⏳ Ao confirmar agendamento → botão "Confirmando..."
- ✅ Após sucesso → volta ao normal

### 8.2 Mensagens de Erro
- ❌ Email duplicado no cadastro → erro legível
- ❌ Senha fraca → "Senha deve ter no mínimo 6 caracteres"
- ❌ Servidor indisponível → "Erro ao conectar. Tente novamente"

### 8.3 Mensagens de Sucesso
- ✅ "Cadastro realizado! Redirecionando..."
- ✅ "Agendamento confirmado"
- ✅ "Link copiado para a área de transferência"

---

## 9️⃣ FINAIS: CHECKLIST COMPLETO

| Item | Status | Prova |
|------|--------|-------|
| Cadastro profissional | ✅ | User criado, slug gerado, empresa doc criada |
| Onboarding salva config | ✅ | Horários, serviços, contato persistem |
| Dashboard exibe KPIs | ✅ | "Agendamentos Hoje", "Clientes" com valores reais |
| Link público com slug | ✅ | URL `/p/{slug}` funciona sem login |
| Serviços com preço/duração | ✅ | Aparecem na página pública e lista de agendamento |
| Cliente agenda horário | ✅ | Cria `agendamentos/{id}` com status "solicitado" |
| Profissional confirma | ✅ | Status → "confirmado", conflito bloqueado |
| Profissional conclui | ✅ | Status → "concluído" |
| Cancelamento libera slot | ✅ | Novo cliente consegue agendar mesmo slot |
| Isolamento de dados | ✅ | Prof A não vê dados de Prof B |
| Segurança das rules | ✅ | Cliente não consegue editar dados de prof |
| Loading states | ✅ | Botões desabilitam, feedback visual |
| Mensagens claras | ✅ | Erros, sucessos, validações legíveis |

---

## 🚀 RESULTADO ESPERADO

Após concluir este fluxo:
- ✅ Um profissional cadastrado com configuração completa
- ✅ Link público funcional com dados visíveis
- ✅ Múltiplos agendamentos gerenciáveis
- ✅ Transição fluida entre estado de agendamentos
- ✅ Dados isolados e seguros

---

## 📌 NOTAS

- **Timestamps**: Todos os documentos devem ter `criadoEm` e timestamps de status
- **Offline-first**: Serviços offline devem sincronizar ao reconectar
- **Mobile**: Testar também em emulador mobile/responsive
- **Browsers**: Verificar em Chrome, Firefox, Safari

