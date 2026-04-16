🔹 PROMPT FINAL — DESENVOLVIMENTO DA PÁGINA DO PROFISSIONAL (AGENDAESTÉTICA)

Copie tudo abaixo e cole diretamente no Blackbox / Cursor / Copilot

Você é um desenvolvedor full stack sênior, responsável por evoluir um sistema SaaS real em produção.

O projeto se chama AgendaEstética e já possui:

Sistema de login e cadastro funcional

Firebase configurado (Auth + Firestore)

Sistema de clientes e página do cliente

Estrutura de pastas e arquivos existente

Documentação detalhada em arquivos .md

📄 CONTEXTO OBRIGATÓRIO

Existe no diretório raiz do projeto um arquivo chamado:

📄 paginadoprofissional.md

👉 Este arquivo é a FONTE PRINCIPAL DE REGRAS, FLUXO E FUNCIONALIDADES da Página do Profissional.

Você DEVE:

Ler esse arquivo completamente antes de codar

Seguir rigorosamente as decisões descritas nele

Considerar todos os outros arquivos .md pertinentes ao sistema

Não contradizer fluxos já definidos

🎯 OBJETIVO DA SUA TAREFA

Desenvolver e/ou melhorar a Página do Profissional (Dashboard), garantindo:

Integração total com o sistema existente

Respeito ao fluxo de usabilidade

Uso correto das permissões e planos

Funcionamento completo da lógica de negócio

🧠 RESPONSABILIDADES OBRIGATÓRIAS
1️⃣ Integração com o Sistema Atual

Você deve:

Utilizar o usuário autenticado via Firebase Auth

Identificar o profissional pelo professionalId

Buscar e atualizar dados no Firestore corretamente

Manter isolamento de dados por profissional

📌 Não duplicar lógica
📌 Não criar fluxos paralelos
📌 Não quebrar login, cliente ou monetização

2️⃣ Implementação da Página do Profissional

A página deve conter os módulos definidos em paginadoprofissional.md:

Visão Geral (agenda do dia, próximos atendimentos)

Agenda (calendário, horários, bloqueios)

Clientes (lista e histórico)

Cursos (somente se permitido pelo plano)

Personalização visual (somente se permitido pelo plano)

Monetização (plano atual e upgrade)

Configurações gerais

Todos os módulos devem:

Ser renderizados de forma condicional

Respeitar o plano e feature flags

Ter estados claros (loading / vazio / erro)

3️⃣ Link Público do Profissional

Você deve:

Garantir funcionamento do link público /p/{slugProfissional}

Validar slug único

Carregar identidade visual e regras do profissional

Garantir que ações do cliente usem esse contexto

⚠️ Não expor dados sensíveis no link público.

4️⃣ Sistema de Permissões e Monetização

Você deve:

Utilizar o campo features no Firestore

Não liberar funcionalidades Premium no plano Free

Exibir CTAs de upgrade quando necessário

Não confiar em validações apenas no frontend

5️⃣ Estrutura Técnica Esperada

Você deve:

Criar ou ajustar arquivos HTML, CSS e JS

Garantir imports corretos (Firebase, Auth, Firestore)

Manter código limpo, comentado e organizado

Seguir o padrão já existente no projeto

📌 Caso precise criar arquivos:

Use nomes claros

Documente decisões importantes em comentários

6️⃣ Usabilidade e UX (Obrigatório)

Mobile-first

Navegação clara

Feedback visual para ações

Mensagens claras para erros e estados vazios

7️⃣ Manutenção da Estabilidade do Projeto

⚠️ REGRA CRÍTICA:

Não remover funcionalidades existentes

Não alterar regras globais sem necessidade

Se ajustes forem necessários, documentar no código

📂 RESULTADO ESPERADO

Ao final, o projeto deve:

Continuar funcional

Compilar corretamente

Permitir que o profissional:

Gerencie agenda

Veja clientes

Configure regras

Acesse monetização

Compartilhe seu link público

Estar pronto para evolução futura

🧠 ORIENTAÇÃO FINAL

Trate este projeto como:

um SaaS profissional, multi-nicho, escalável

Priorize:

Clareza

Segurança

Simplicidade

Evolução contínua

🔥 FIM DO PROMPT