# 💰 AgendaEstética — Modelo de Monetização

Este documento define o **modelo de monetização** da plataforma AgendaEstética, separando claramente recursos **Free** e **Premium**, com foco em valor percebido, simplicidade técnica e escalabilidade.

---

## 🎯 Objetivos da Monetização

* Manter o MVP funcional gratuitamente
* Criar incentivo claro ao upgrade
* Monetizar sem quebrar a experiência
* Evitar dependência inicial de pagamentos

---

## 🆓 Plano Free

### Público-alvo

* Profissionais iniciantes
* Autônomos
* Validação inicial da plataforma

### Funcionalidades

* Cadastro e login
* Agenda completa
* Agendamentos ilimitados
* Gestão de clientes
* Cancelamento e remarcação
* Notificações básicas
* Personalização básica:

  * Cor principal
  * Cor de fundo (paleta limitada)

### Limitações

* Marca d’água da plataforma
* Sem imagem de fundo
* Sem cor de texto personalizada
* Sem relatórios avançados

---

## ⭐ Plano Premium

### Público-alvo

* Profissionais ativos
* Negócios recorrentes
* Profissionais que valorizam marca

### Funcionalidades Extras

* Remoção da marca d’água
* Imagem de fundo personalizada
* Cor de texto personalizada
* Personalização visual avançada
* Relatórios estendidos
* Prioridade em novidades

---

## 🔐 Controle Técnico de Acesso

* Campo `plan: free | premium`
* Verificação no frontend
* Revalidação no backend
* Feature flags por funcionalidade

---

## 🧱 Estratégia de Upgrade

* CTA discreto nas configurações
* Preview bloqueado de recursos premium
* Mensagem clara de benefício

---

## 💳 Pagamentos (Pós-MVP)

* Integração futura:

  * Stripe
  * Mercado Pago
* Cobrança recorrente mensal
* Cancelamento simples

---

## 🚀 Evoluções Futuras

* Plano intermediário
* Templates por nicho
* Temas sazonais
* Domínio personalizado

---

**Monetização simples, honesta e escalável.**
