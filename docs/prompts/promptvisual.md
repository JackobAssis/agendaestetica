🔹 PROMPT OFICIAL — IMPLEMENTAÇÃO DO LAYOUT BASE (AGENDAESTÉTICA)

Copie tudo abaixo e cole diretamente no Blackbox / Cursor / Copilot

Você é um desenvolvedor frontend sênior, responsável por implementar a base visual e estrutural de um webapp SaaS real chamado AgendaEstética.

Este projeto utiliza HTML, CSS e JavaScript puro, sem frameworks, e já possui documentação detalhada em arquivos .md.

📄 CONTEXTO OBRIGATÓRIO

Antes de codar, você DEVE analisar os seguintes arquivos do projeto:

paginadocliente.md

paginadoprofissional.md

Documento de Guia Visual e Estrutural (Base Oficial)

Arquivos de MVP, monetização e arquitetura (se existirem)

👉 Essas documentações são a fonte de verdade.
👉 O código deve refletir exatamente o que está definido nelas.

🎯 OBJETIVO DA TAREFA

Implementar a estrutura base do webapp AgendaEstética, incluindo:

Layout com cara de aplicativo mobile

Estrutura HTML reutilizável

CSS global com sistema de temas (CSS Variables)

Tema base Neo Clinic

Navegação inferior (bottom navigation)

Header fixo

Preparação para páginas de cliente e profissional

⚠️ Esta etapa NÃO envolve regras de negócio complexas nem monetização ativa.
O foco é visual + estrutura.

🧱 REQUISITOS DE ESTRUTURA (OBRIGATÓRIO)
HTML (Base de Todas as Páginas)

Implementar a seguinte estrutura padrão:

<body data-theme="neo">
  <header class="app-header"></header>

  <main class="app-main">
    <!-- Conteúdo dinâmico -->
  </main>

  <nav class="app-bottom-nav"></nav>
</body>


Regras:

Header e nav-bottom fixos

Main rolável

Nenhuma lógica de negócio no HTML

🎨 CSS — SISTEMA DE TEMAS
Tema Base: Neo Clinic (default)

Implementar CSS Variables globais, por exemplo:

:root {
  --bg-app: #F4F6F8;
  --bg-card: #FFFFFF;
  --color-primary: #2563EB;
  --text-main: #111827;
  --text-muted: #6B7280;
  --border-color: #E5E7EB;
}


Criar arquivo CSS base

Criar arquivo CSS exclusivo para temas

Não usar estilos inline

Todo visual deve depender de variáveis

📱 UX / UI (OBRIGATÓRIO)

Mobile-first

Cards para exibição de dados

Espaçamento confortável

Tipografia limpa

Ícones simples (pode usar SVG ou Unicode)

Estados de interface obrigatórios:

Loading

Sem dados

Erro

Sucesso

🧭 Navegação Inferior (Bottom Navigation)

Implementar uma navegação fixa com:

Ícone + texto

Destaque para item ativo

Estrutura preparada para SPA simples (troca de telas sem reload)

🧩 JavaScript (BASE)

Criar JS responsável por:

Renderizar layout base

Alternar telas (SPA simples)

Aplicar tema baseado em atributo data-theme

Preparar funções reutilizáveis (renderHeader, renderNav, etc.)

⚠️ Não implementar regras de negócio complexas nesta etapa.

📂 ORGANIZAÇÃO DE ARQUIVOS (SUGESTÃO)
/ public
  / css
    base.css
    themes.css
  / js
    app.js
    navigation.js
  index.html


Se já existir estrutura, adapte sem quebrar.

🚫 RESTRIÇÕES CRÍTICAS

❌ Não usar frameworks (React, Vue, etc.)

❌ Não quebrar páginas existentes

❌ Não hardcodear dados

❌ Não misturar lógica de negócio com UI

📦 RESULTADO ESPERADO

Ao final da implementação:

O app deve abrir com layout funcional

Ter aparência de app mobile

Ter navegação fluida

Estar pronto para receber:

Página do cliente

Página do profissional

Temas premium

Lógica de monetização

🧠 ORIENTAÇÃO FINAL

Trate este projeto como:

um SaaS profissional, escalável e em crescimento

Priorize:

Clareza

Organização

Manutenibilidade

Simplicidade

🔥 FIM DO PROMPT