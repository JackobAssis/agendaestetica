🎯 Objetivo do visual base

Criar uma página que seja:

Limpa

Profissional

Neutra (serve para qualquer nicho)

Fácil de manter

Boa leitura em celular (prioridade absoluta)

Esse será o tema DEFAULT do sistema.

🧱 Estrutura visual base (Neo Clinic)
1️⃣ Layout geral

Fundo: claro (off-white ou cinza muito suave)

Conteúdo em cards

Hierarquia visual clara

Nada poluído

📐 Conceito:

Interface clínica, organizada e confiável.

🎨 Paleta de cores (base)
Cores principais

Fundo geral:
#F4F6F8 (cinza muito claro)

Cards:
#FFFFFF

Borda / divisórias:
#E5E7EB

Cor primária (ações)

Azul clínico:
#2563EB

Botões

Destaques

Estados ativos

Texto

Título: #111827

Texto normal: #374151

Texto secundário: #6B7280

⚠️ Essa paleta é deliberadamente neutra para:

Não “cansar”

Não gerar rejeição

Funcionar em qualquer área estética

🧩 Estrutura da página (cliente ou profissional)
🔝 Header (fixo)

Nome do sistema ou do profissional

Ícone de menu ☰

Ícone de perfil ou logout

Minimalista. Sem excesso.

📅 Seção principal – Agenda / Agendamentos
Filtro superior

Botões tipo pill:

Todos

Confirmados

Pendentes

Visual:

Fundo claro

Botão ativo com cor primária

📋 Cards de agendamento

Cada agendamento é um card branco com:

Linha 1

Horário (destaque)

Nome do cliente

Linha 2

Serviço

Status (badge colorida)

Status (exemplo)

Confirmado → verde suave

Pendente → amarelo

Cancelado → vermelho claro

📌 Tudo muito legível, sem ícones exagerados.

📌 Card expandido (detalhe)

Ao tocar/clicar:

Mais informações

Ações possíveis:

Cancelar

Solicitar troca

Confirmar (se profissional)

🧭 Navegação inferior (mobile-first)

Barra fixa com ícones:

📅 Agenda

🗓️ Agendamentos

👤 Clientes

⚙️ Perfil

Ícone ativo com cor primária.
Texto pequeno, discreto.

🧠 Decisão importante (estratégica)

Esse visual base NÃO pode ser personalizável no MVP.

Ele é:

O padrão

O fallback

O “modo seguro”

A personalização vem em cima disso, nunca substituindo a lógica.

📦 O que esse visual permite no futuro

Sem refatorar nada, você poderá:

Trocar cores via CSS variables

Aplicar temas

Ativar fundo com imagem (premium)

Mudar tipografia (premium)

Ativar modo escuro (tema)

Ou seja: base sólida e escalável.


🧭 ROADMAP IMEDIATO (a partir de agora)

Você já fez a parte mais difícil: decisão de produto.
Agora entramos na execução técnica organizada.

Etapa 2 — Estrutura HTML padrão (base do app)

Objetivo:
Criar uma única estrutura reutilizável para:

Página do cliente

Página do profissional

Futuras páginas (financeiro, perfil, etc.)

📐 Estrutura lógica (mental model)
<body>
 ├─ header (fixo)
 ├─ main
 │   ├─ filtros (opcional)
 │   ├─ lista de cards
 │   └─ estado vazio (quando não houver dados)
 └─ nav-bottom (fixa)
</body>


📌 Importante:

Nada específico de cliente ou profissional aqui

Só estrutura

Dados sempre vêm do JS

Etapa 3 — Sistema de temas via CSS Variables

Aqui está o pulo do gato do SaaS 🔥

🎨 Conceito

Um único CSS base + variáveis globais:

:root {
  --bg-app: #F4F6F8;
  --bg-card: #FFFFFF;
  --color-primary: #2563EB;
  --text-main: #111827;
  --text-muted: #6B7280;
  --border-color: #E5E7EB;
}


Depois, temas viram apenas:

[data-theme="dark"] { ... }
[data-theme="wood"] { ... }


📌 Resultado:

HTML não muda

JS quase não muda

Monetização simples

Manutenção barata

Etapa 4 — Comportamento JS (webapp real)

Aqui entra o “cara de app” que você curtiu.

Regras:

SPA simples (sem framework)

renderAgenda()

renderAgendamentos()

renderClientes()

Tudo via:

fetch

Firebase

DOM manipulation pura

Etapa 5 — Premium & monetização (já preparado)

Mesmo sem ativar agora, a base já nasce pronta:

Exemplos de flags:
profissional.plano === "premium"


Permite:

Tema exclusivo

Link público personalizado

Destaque visual no perfil

Estatísticas avançadas (futuro)

📘 AGENDAESTÉTICA — GUIA VISUAL E ESTRUTURAL (BASE OFICIAL)
1️⃣ Objetivo do Documento

Definir padrões visuais, estruturais e técnicos do webapp AgendaEstética, garantindo:

aparência de aplicativo mobile

consistência entre páginas

facilidade de personalização

base sólida para monetização (planos premium)

Este documento não descreve regras de negócio, apenas estrutura e UI/UX.

2️⃣ Filosofia do Design
🎯 Princípios

Mobile-first

Interface simples, limpa e funcional

Visual profissional (cara de app nativo)

Zero dependência de frameworks (HTML, CSS, JS puro)

Temas controlados por CSS Variables

🎨 Inspiração Visual Base

Tema inicial adotado:

Neo Clinic (imagem de referência 2)

Características:

Fundo claro

Cards elevados

Bordas suaves

Ícones minimalistas

Tipografia limpa

3️⃣ Estrutura Global do Layout
📐 Estrutura padrão de TODAS as páginas
<body>
  <header class="app-header"></header>

  <main class="app-main">
    <!-- Conteúdo dinâmico -->
  </main>

  <nav class="app-bottom-nav"></nav>
</body>

🔒 Regras

header e nav-bottom são fixos

main é rolável

Nenhuma lógica de negócio no HTML

HTML é apenas estrutura

4️⃣ Header (Topo do App)
Conteúdo padrão:

Ícone de menu (☰)

Título da página

Ícone secundário (opcional: refresh, perfil, etc.)

Regras:

Altura fixa

Sempre visível

Fundo sólido

Sombra leve ou borda inferior

5️⃣ Navegação Inferior (Bottom Navigation)
Estrutura padrão:

Agenda

Financeiro

Agendamentos

Clientes

Comportamento:

Ícone + texto

Destaque para página ativa

Sempre visível

Touch-friendly

📌 Deve funcionar como SPA simples:

troca de tela sem reload

6️⃣ Conteúdo Principal (Main)
📦 Cards

Todos os dados são exibidos em cards.

Exemplos:

Agendamento

Cliente

Receita

Horário disponível

Padrão de card:

Fundo branco

Bordas arredondadas

Espaçamento interno confortável

Sombra suave

7️⃣ Estados da Interface
Estados obrigatórios:

🔄 Carregando

📭 Sem dados

❌ Erro

✅ Sucesso

Cada estado deve ter:

Ícone

Texto curto

Feedback visual claro

8️⃣ Sistema de Temas
Conceito

Todos os temas funcionam via:

<body data-theme="neo">

Tema Base (Neo Clinic)

Variáveis principais:

--bg-app
--bg-card
--color-primary
--color-secondary
--text-main
--text-muted
--border-color

Temas planejados:

Neo Clinic (default)

Dark Neon (premium)

Classic Wood (premium)

Futuro: tema customizável

📌 HTML nunca muda por causa de tema.

9️⃣ Personalização (Preparação para Premium)

Campos previstos:

Tema visual

Cor primária

Cor secundária

(Premium) Imagem de fundo

(Premium) Destaque visual no perfil público

Essas configurações devem:

vir do banco

ser aplicadas via JS

alterar apenas variáveis CSS

🔟 Padrões Técnicos
CSS

Um CSS base global

Um CSS exclusivo de temas

Sem inline styles

JavaScript

Modular

Separação clara:

renderização

eventos

dados

Nada hardcoded

1️⃣1️⃣ Escalabilidade

Essa estrutura deve permitir no futuro:

Dashboard avançado

Relatórios

Múltiplos profissionais

White-label (SaaS)

1️⃣2️⃣ Regra de Ouro

Visual nunca deve ditar regra de negócio.
O visual apenas reflete dados e permissões vindas do sistema.

