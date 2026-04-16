# AgendaEstética — Parte 2

## Fluxo Funcional da Plataforma (Profissional e Cliente)

Este documento descreve **todo o fluxo de usabilidade e funcionamento interno** da plataforma **AgendaEstética**, após login, contemplando profissionais e clientes, de forma flexível para múltiplos nichos do ramo estético.

---

## 1. Princípios da Plataforma

* Um único sistema para múltiplos nichos
* Total personalização por empresa
* Fluxos simples para o cliente
* Controle total para o profissional
* Mobile-first
* Redução máxima de dependência do WhatsApp

---

## 2. Primeiro Acesso do Profissional (Onboarding)

### 2.1 Fluxo Inicial

Após o primeiro login como profissional:

1. Sistema identifica primeiro acesso
2. Inicia fluxo de configuração guiada
3. Profissional define:

   * Nome do negócio
   * Nicho (texto livre)
   * Serviços oferecidos (opcional no MVP)
   * Dias e horários de trabalho
4. Sistema salva configurações iniciais
5. Profissional é direcionado ao painel principal

---

## 3. Painel do Profissional (Dashboard)

### 3.1 Informações principais

* Agenda do dia
* Próximos atendimentos
* Alertas importantes
* Acesso rápido às funções principais

### 3.2 Ações rápidas

* Criar agendamento
* Bloquear horário
* Visualizar semana
* Compartilhar link da agenda

---

## 4. Agenda e Calendário

### 4.1 Visualizações

* Diário
* Semanal
* Mensal

Cada visualização deve destacar:

* Horários ocupados
* Horários livres
* Bloqueios
* Cancelamentos

---

### 4.2 Configuração de Dias de Trabalho

Profissional pode:

* Definir dias ativos da semana
* Definir dias de folga
* Criar exceções (feriados, viagens)
* Bloquear dias manualmente

---

### 4.3 Configuração de Horários

* Horário de abertura e fechamento
* Intervalos entre atendimentos
* Horários personalizados por dia
* Bloqueio manual de horários
* Ajustes rápidos (abrir / fechar)

---

## 5. Agendamentos

### 5.1 Criação de Agendamento (Profissional)

* Criar manualmente
* Selecionar cliente
* Definir data e horário
* Inserir observações internas
* Definir status inicial

---

### 5.2 Agendamento pelo Cliente

Fluxo:

1. Cliente acessa link da empresa
2. Visualiza horários disponíveis
3. Seleciona data e horário
4. Confirma agendamento
5. Sistema cria registro pendente ou confirmado

---

### 5.3 Status de Agendamento

* Pendente
* Confirmado
* Cancelado
* Concluído
* Remarcado

---

## 6. Cancelamentos e Regras

### 6.1 Cancelamento pelo Cliente

* Permitido conforme regras da empresa
* Pode gerar:

  * bloqueio temporário
  * perda de benefícios

---

### 6.2 Cancelamento pelo Profissional

* Cliente recebe notificação
* Sistema libera horário automaticamente

---

## 7. Sistema de Troca de Datas

### 7.1 Fluxo do Cliente

* Solicitar troca
* Visualizar horários disponíveis
* Enviar solicitação

### 7.2 Fluxo do Profissional

* Receber notificação
* Aceitar ou recusar
* Sistema confirma automaticamente

---

## 8. Perfil do Cliente

### 8.1 Dados básicos

* Nome
* Contato

### 8.2 Histórico

* Agendamentos
* Cancelamentos
* Trocas
* Cursos

---

## 9. Cursos (Opcional no MVP)

### 9.1 Gestão de Cursos (Profissional)

* Criar curso
* Definir tipo (iniciante / aperfeiçoamento)
* Datas
* Vagas
* Valor (opcional)

---

### 9.2 Participação do Cliente

* Visualizar cursos
* Solicitar vaga
* Acompanhar status

---

## 10. Notificações

Eventos que geram notificações:

* Novo agendamento
* Confirmação
* Lembrete
* Cancelamento
* Troca de data
* Novos cursos

Canais:

* App
* WhatsApp (futuro)

---

## 11. Configurações do Profissional

* Ativar/desativar agendamento online
* Definir regras de cancelamento
* Definir regras de troca
* Definir limite de solicitações
* Controle de visibilidade

---

## 12. Tratamento de Erros e Exceções

Casos previstos:

* Tentativa de agendar horário ocupado
* Datas inválidas
* Excesso de solicitações
* Empresa suspensa

Sistema deve:

* Bloquear ação
* Informar motivo
* Orientar o usuário

---

## 13. Flexibilidade por Nicho

A plataforma não impõe regras fixas por nicho.

O profissional define:

* Duração de atendimento
* Intervalos
* Quantidade diária
* Tipos de serviço

---

## 14. Próxima Etapa

Com o fluxo funcional definido, o próximo documento será:

**PARTE 3 — Requisitos de Dados e Modelagem**

---

Fim do documento — Parte 2
