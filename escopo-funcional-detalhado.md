# 📐 AgendaEstética — Escopo Funcional Detalhado

Este documento descreve **todas as funcionalidades do sistema**, módulo por módulo, incluindo regras de negócio, estados e limites do MVP Robusto.

---

## 🔐 1. Autenticação e Sessão

### Funcionalidades

* Login por e-mail ou telefone
* Cadastro automático se usuário não existir
* Escolha de tipo de acesso (cliente ou profissional)

### Regras

* Um usuário pode ser cliente de vários profissionais
* Um usuário profissional possui apenas um espaço de gestão

### Estados

* Loading
* Login inválido
* Sessão expirada

---

## 👩‍💼 2. Perfil do Profissional

### Funcionalidades

* Editar nome profissional
* Editar nicho (texto livre)
* Foto de perfil
* Contato

### Regras

* Apenas o profissional pode editar

---

## 📆 3. Agenda

### Funcionalidades

* Visualização mensal, semanal e diária
* Destaque de dias com agendamento

### Regras

* Não permitir dois agendamentos no mesmo horário
* Horários bloqueados não aparecem para clientes

---

## ⏰ 4. Agendamentos

### Funcionalidades

* Criar (profissional)
* Solicitar (cliente)
* Editar
* Cancelar

### Estados

* Aguardando confirmação
* Confirmado
* Cancelado
* Remarcado

---

## 🔄 5. Cancelamento e Remarcação

### Funcionalidades

* Solicitação pela cliente
* Aprovação ou recusa pelo profissional

### Regras

* Tempo mínimo configurável
* Limite de solicitações

---

## 👥 6. Clientes

### Funcionalidades

* Lista de clientes
* Perfil individual
* Histórico
* Observações internas

---

## 🔔 7. Notificações

### Eventos

* Novo agendamento
* Confirmação
* Cancelamento
* Remarcação

---

## 🎨 8. Personalização Básica

### Funcionalidades

* Escolha de cor principal
* Escolha de cor de fundo

### Limites

* Apenas opções pré-definidas

---

## 🔐 9. Permissões

### Profissional

* Acesso total

### Cliente

* Apenas leitura e solicitações

---

## 📊 10. Relatórios

### Dados

* Atendimentos por período
* Frequência de clientes

---

## ❌ Fora do Escopo Atual

* Pagamentos
* Assinaturas
* Avaliações
* Templates avançados

---

**Escopo Funcional fechado para o MVP Robusto.**
