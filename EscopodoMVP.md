# 🧩 AgendaEstética — MVP Robusto

Este documento define o **escopo oficial do MVP Robusto** da plataforma **AgendaEstética**. Ele serve como base única de verdade para desenvolvimento, validação e evolução do produto.

---

## 🎯 Objetivo do MVP Robusto

Entregar uma plataforma **completa, funcional e confiável** para profissionais do ramo estético gerenciarem seus atendimentos, com foco em:

* Redução de mensagens manuais (WhatsApp)
* Organização de agenda
* Autonomia do profissional
* Boa experiência para a cliente
* Base sólida para monetização futura

---

## 👥 Tipos de Usuário

### 1. Profissional (Admin)

* Dono do espaço / serviço
* Controle total do sistema
* Personaliza e gerencia dados

### 2. Cliente

* Acesso limitado
* Apenas visualiza e solicita ações permitidas

---

## 🔐 1. Autenticação e Acesso

### Login Unificado

* Entrada via link da plataforma
* Escolha do tipo de acesso:

  * Cliente
  * Profissional

### Cadastro Automático

* Caso o usuário não exista:

  * Cadastro automático
  * Nome
  * Contato (telefone ou e-mail)

### Segurança Diferenciada

* Profissional:

  * Autenticação reforçada
  * Sessão persistente
* Cliente:

  * Login simplificado
  * Acesso restrito

---

## 🏠 2. Onboarding do Profissional

### Primeira Configuração Obrigatória

* Nome profissional
* Nicho (texto livre)
* Horários de trabalho
* Dias de atendimento
* Duração padrão de atendimento

> Sem concluir o onboarding, o sistema não libera agendamentos.

---

## 📆 3. Agenda e Calendário (Coração do Sistema)

### Visualizações

* Mensal
* Semanal
* Diária

### Configurações

* Dias ativos
* Dias de folga
* Bloqueio manual de dias
* Horários personalizados por dia

---

## ⏰ 4. Agendamentos

### Pelo Profissional

* Criar agendamento manual
* Editar
* Cancelar
* Observações internas

### Pela Cliente

* Visualizar horários disponíveis
* Solicitar agendamento
* Ver status:

  * Confirmado
  * Cancelado
  * Remarcado

---

## 🔄 5. Cancelamento e Remarcação

### Regras Configuráveis

* Tempo mínimo para cancelamento
* Limite de solicitações

### Fluxo

* Cliente solicita
* Profissional aprova ou recusa
* Sistema atualiza automaticamente

---

## 👥 6. Gestão de Clientes

* Lista de clientes
* Histórico de atendimentos
* Observações internas
* Frequência de comparecimento

---

## 🔔 7. Notificações

* Confirmação de agendamento
* Lembrete automático
* Aviso de cancelamento
* Resposta de remarcação

---

## 🎨 8. Personalização Básica (Inclusa no MVP Robusto)

### Disponível para Todos

* Cor principal
* Cor de fundo

> Recursos avançados ficam reservados para pós-MVP / Premium.

---

## 🔐 9. Permissões e Isolamento de Dados

* Cada profissional possui um espaço isolado
* Clientes só acessam dados do profissional relacionado
* Firestore estruturado por `professional_id`

---

## 📊 10. Relatórios Básicos

* Atendimentos por dia
* Atendimentos por mês
* Clientes recorrentes

---

## 🚀 Fora do MVP (Planejado)

* Pagamento online
* Assinaturas
* Lista de espera
* Avaliações
* Templates por nicho
* Integração com WhatsApp

---

## ✅ Critério de Conclusão do MVP

O MVP Robusto será considerado pronto quando:

* Um profissional conseguir se cadastrar
* Configurar agenda
* Receber clientes
* Gerenciar agendamentos sem uso externo

---

**AgendaEstética — MVP Robusto**
Base sólida para escalar, monetizar e evoluir.
