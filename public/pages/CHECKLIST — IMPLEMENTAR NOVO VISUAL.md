🔵 FASE 1 — Preparação (NÃO mexer no layout ainda)
1️⃣ Criar branch separada

 Criar branch feature/ui-refactor

 Nunca aplicar direto na main

 Garantir backup funcional

2️⃣ Mapear estrutura atual

 Listar todas as páginas existentes

 Identificar layout repetido

 Identificar CSS duplicado

 Verificar dependências JS ligadas ao DOM atual

Objetivo: saber o que pode quebrar.

3️⃣ Separar lógica de visual (obrigatório)

Verificar se:

 JS depende de classes visuais?

 JS usa IDs que serão alterados?

 Há eventos acoplados a estrutura visual?

Se sim:
→ Refatorar para separar lógica de apresentação.

🔵 FASE 2 — Criar Estrutura Base (App Shell)

⚠ NÃO alterar páginas ainda.

Criar:

 layout.html (ou componente AppLayout)

 Sidebar fixa

 Topbar fixa

 Container principal dinâmico

 Bottom nav mobile

Objetivo:
Criar uma estrutura que envolva todas as páginas.

Arquitetura ideal:

/layout
   app-shell.html
/css
   base.css
   components.css
   layout.css
🔵 FASE 3 — Sistema de Design (ANTES de aplicar em tudo)

Criar padronização:

🎨 Cores

 Variáveis CSS definidas no :root

 Cor primária

 Cor de fundo

 Cor de card

 Cor de texto principal/secundário

📦 Componentes reutilizáveis

Criar classes padrão:

 .card

 .btn-primary

 .btn-secondary

 .nav-item

 .input-field

 .badge

 .kpi-card

Nunca mais usar estilo inline.

🔵 FASE 4 — Aplicar Layout Página por Página

⚠ Nunca refatorar tudo de uma vez.

Para cada página:

 Envolver no AppShell

 Substituir estrutura antiga por grid moderno

 Aplicar classes padrão

 Ajustar espaçamento (24px entre blocos)

 Testar funcionalidades

Checklist por página:

 H1 único

 Cards organizados

 Botões padronizados

 Responsivo funcional

 Nenhum erro no console

🔵 FASE 5 — Persistência de Navegação

 Sidebar ativa corretamente

 Item ativo destacado

 Navegação não recarrega layout inteiro

 SPA ou partial loading funcionando

 Bottom nav ativa no mobile

🔵 FASE 6 — Experiência SaaS Real

Adicionar:

 Loading states

 Skeleton loading

 Feedback visual ao salvar

 Toast notifications

 Estado vazio estilizado

 Animações suaves

🔵 FASE 7 — Multi-tenant (se for SaaS real)

Verificar:

 Layout não depende de dados fixos

 Nome do negócio é dinâmico

 Cores podem ser personalizadas

 Logo dinâmica

 Estrutura escalável

🔵 FASE 8 — Teste Profissional

Testar:

 Mobile real

 Tablet

 Desktop

 Diferentes navegadores

 Performance Lighthouse

 Tempo de carregamento

🔵 FASE 9 — Refinamento Premium

 Microinterações

 Hover elegante

 Animações 0.2s ease

 Transições suaves

 Hierarquia visual clara

 Espaçamento consistente

🧠 Regra de Ouro

Nunca:

❌ Refatorar lógica junto com visual
❌ Misturar estilos antigos com novos
❌ Aplicar design sem padronização
❌ Alterar tudo de uma vez

🚀 Estratégia Profissional (A mais inteligente)

Ordem correta:

Criar sistema de design

Criar App Shell

Migrar dashboard

Migrar outras páginas

Refinar UX

Otimizar performance