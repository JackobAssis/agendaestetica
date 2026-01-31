# 🧭 AgendaEstética — UX e Fluxo de Usabilidade

Documento responsável por definir **todo o fluxo de uso do sistema**, do primeiro acesso ao uso recorrente, separado por tipo de usuário.

---

## 📱 Princípios Gerais de UX

* Mobile-first
* Fluxo simples e direto
* Menor número possível de cliques
* Profissional sempre no controle
* Cliente nunca confusa
* Evitar dependência de WhatsApp

---

# 👩‍💼 FLUXO DO PROFISSIONAL (ADMIN)

## 1. Acesso Inicial

1. Profissional acessa o link da plataforma
2. Escolhe a opção **"Sou Profissional"**
3. Realiza login (e-mail/telefone)
4. Caso não exista, conta é criada automaticamente

---

## 2. Onboarding Obrigatório (Primeiro Acesso)

### Etapa 1 — Dados Básicos

* Nome profissional
* Nicho (texto livre)
* Foto de perfil (opcional)

### Etapa 2 — Configuração de Agenda

* Dias de trabalho
* Horário de início e fim
* Duração padrão do atendimento
* Intervalos

> O sistema bloqueia agendamentos até o onboarding ser concluído.

---

## 3. Dashboard do Profissional

### Elementos principais

* Resumo do dia
* Próximos atendimentos
* Botão rápido: Criar agendamento
* Alertas importantes

---

## 4. Agenda

### Visualizações

* Mensal (visão geral)
* Semanal (organização)
* Diária (execução)

### Ações

* Criar agendamento
* Editar agendamento
* Cancelar
* Bloquear horário

---

## 5. Gestão de Clientes

* Lista de clientes
* Perfil individual
* Histórico de atendimentos
* Observações internas

---

## 6. Configurações

* Ativar/desativar agendamento online
* Regras de cancelamento
* Limite de remarcações
* Personalização básica

---

## 7. Página Pública

* Link exclusivo do profissional
* Visualização da agenda disponível
* Área usada pela cliente

---

# 👩 CLIENTE — FLUXO DE USO

## 1. Acesso

1. Cliente recebe o link do profissional
2. Acessa a página pública
3. Escolhe um horário disponível

---

## 2. Cadastro Automático

* Nome
* Contato

> Caso não exista cadastro, o sistema cria automaticamente.

---

## 3. Solicitação de Agendamento

* Seleciona data
* Seleciona horário
* Confirma solicitação

### Estados possíveis

* Aguardando confirmação
* Confirmado
* Recusado

---

## 4. Pós-Agendamento

* Visualiza detalhes
* Recebe notificações
* Solicita cancelamento ou remarcação (se permitido)

---

## 5. Histórico da Cliente

* Atendimentos realizados
* Cancelamentos
* Remarcações

---

# 🔄 FLUXOS CRÍTICOS E EXCEÇÕES

## Cancelamento

* Cliente solicita
* Profissional aprova ou recusa
* Sistema libera ou mantém horário

## Conflito de Horário

* Sistema impede duplo agendamento
* Horário fica temporariamente reservado durante solicitação

---

## ✅ Objetivo do Fluxo

Garantir que:

* O profissional tenha controle total
* A cliente consiga agendar sem fricção
* O sistema funcione mesmo sem contato externo

---

**AgendaEstética — UX bem definido antes do código.**
