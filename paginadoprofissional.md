# 🧍‍♀️ Página do Profissional — AgendaEstética

Este documento define **de forma completa e oficial** o fluxo, a lógica, as permissões e as funcionalidades da **Página do Profissional** no sistema **AgendaEstética**.

Ele deve ser tratado como **fonte única de verdade** para desenvolvimento, integrações e decisões técnicas.

---

## 🎯 Objetivo da Página do Profissional

A Página do Profissional é o **painel central de controle do sistema**, responsável por:

* Gerenciar agenda e atendimentos
* Definir regras de funcionamento
* Controlar clientes
* Personalizar a identidade visual
* Gerenciar monetização e plano

> O profissional tem **controle total** do seu ambiente.

---

## 🔐 Acesso e Contexto

* Apenas usuários autenticados como **profissionais** podem acessar
* O acesso ocorre após login
* Redirecionamento automático para `/dashboard`

O sistema identifica o usuário como profissional via:

* Firebase Auth
* Documento `professionals/{professionalId}`

---

## 🔗 Link Público do Profissional (Entrada do Cliente)

Cada profissional possui um **link público único**, usado pelos clientes.

### Formato do link

```
https://agendaestetica.app/p/{slugProfissional}
```

### Regras do Slug

* Gerado no cadastro do profissional
* Único no sistema
* Baseado no nome profissional
* Editável apenas pelo profissional (com validação)

### Uso do Link

* Define o contexto do cliente
* Carrega identidade visual e regras
* Isola dados por profissional

---

## 🧠 Estrutura Geral da Página

```
DASHBOARD DO PROFISSIONAL
│
├── Visão Geral
├── Agenda
├── Clientes
├── Cursos (condicional)
├── Personalização (condicional)
├── Monetização
└── Configurações
```

A renderização de módulos depende do **plano e permissões**.

---

## 🏠 Visão Geral (Home do Dashboard)

### Conteúdo

* Agenda do dia
* Próximos atendimentos
* Alertas importantes

### Objetivo

Dar uma visão rápida e clara do dia do profissional.

---

## 📆 Agenda

### Funcionalidades

* Visualização mensal, semanal e diária
* Criação manual de agendamentos
* Edição de agendamentos
* Cancelamento
* Bloqueio de horários
* Definição de dias de trabalho

### Regras

* O profissional controla 100% da agenda
* O cliente apenas solicita

---

## 👥 Clientes

### Funcionalidades

* Lista de clientes
* Histórico de atendimentos
* Observações internas

### Restrições

* Cliente não vê observações internas

---

## 📚 Cursos (Condicional)

### Disponível apenas para profissionais Premium

Funcionalidades:

* Criar cursos
* Definir vagas
* Aprovar solicitações
* Gerenciar inscritos

---

## 🎨 Personalização (Condicional)

### Plano Free

* Tema padrão
* Identidade básica

### Plano Premium

* Escolha de cores
* Imagem de fundo
* Personalização da página pública

Tudo controlado por **feature flags**.

---

## 💰 Monetização

### Funcionalidades

* Visualizar plano atual
* Ver recursos bloqueados
* Botão de upgrade

### Integração

* Mercado Pago
* Confirmação via webhook
* Atualização automática do plano

---

## ⚙️ Configurações

### Opções

* Regras de agendamento
* Tempo mínimo para remarcação
* Ativar/desativar agendamento online
* Editar slug público

---

## 🔐 Permissões e Segurança

* Profissional tem acesso total apenas aos próprios dados
* Dados isolados por `professionalId`
* Permissões controladas via Firestore Rules

---

## 🧩 Modelo de Permissões (Feature Flags)

```json
features: {
  customTheme: false,
  backgroundImage: false,
  courses: false,
  rewards: false,
  advancedReports: false
}
```

Essas flags definem:

* O que aparece no dashboard
* O que pode ser configurado

---

## 🚀 Considerações Finais

A Página do Profissional é:

* Escalável
* Modular
* Segura
* Preparada para novos planos

Este documento deve ser usado como base para:

* Desenvolvimento frontend
* Regras de backend
* Prompts para IA

---

📌 **Qualquer funcionalidade nova deve respeitar este fluxo.**
