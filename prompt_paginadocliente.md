🔹 PROMPT FINAL — DESENVOLVIMENTO DA PÁGINA DO CLIENTE (AGENDAESTÉTICA)

Copie tudo abaixo e cole diretamente no Blackbox / Cursor / Copilot

Você é um desenvolvedor full stack sênior, responsável por evoluir um sistema real em produção.

Este projeto chama-se AgendaEstética e já possui:

Sistema de login e cadastro funcional

Firebase configurado (Auth + Firestore)

Estrutura de pastas existente

Fluxos definidos em arquivos .md

📄 CONTEXTO OBRIGATÓRIO

Existe no diretório raiz do projeto um arquivo chamado:

📄 paginadocliente.md

👉 Este arquivo é a FONTE PRINCIPAL DE REGRAS, FLUXOS E FUNCIONALIDADES da Página do Cliente.

Você DEVE:

Ler e seguir integralmente o conteúdo desse arquivo

Não contradizer decisões descritas nele

Usá-lo como base para lógica, permissões e UI

🎯 OBJETIVO DA SUA TAREFA

Desenvolver a Página do Cliente totalmente funcional, integrada ao restante do sistema, garantindo que:

O cliente visualize seus dados corretamente

O fluxo de agendamentos funcione de ponta a ponta

Não haja quebra de funcionalidades já existentes

Tudo esteja corretamente configurado e conectado

🧠 RESPONSABILIDADES OBRIGATÓRIAS
1️⃣ Integração com o Sistema Existente

Você deve:

Identificar como o login do cliente funciona

Utilizar o usuário autenticado (Firebase Auth)

Buscar dados corretos no Firestore

Respeitar a estrutura atual do banco

📌 Não criar sistemas paralelos
📌 Não duplicar lógica
📌 Não quebrar fluxos existentes

2️⃣ Implementação da Página do Cliente

A página deve conter, conforme definido em paginadocliente.md:

Identidade visual do profissional (dados públicos)

Próximo agendamento do cliente

Status do agendamento

Botão para:

Solicitar troca de data/horário

Cancelar agendamento

Listagem de datas e horários disponíveis

Histórico de agendamentos

Cursos (se existirem)

⚠️ Rewards NÃO devem ser implementados

3️⃣ Regras de Permissão (CRÍTICO)

O cliente:

❌ NÃO pode criar horários

❌ NÃO pode confirmar agendamentos

❌ NÃO pode editar agenda

❌ NÃO pode acessar dados de outros clientes

Toda ação deve:

Respeitar regras do Firestore

Validar dados antes de salvar

Atualizar apenas documentos permitidos

4️⃣ Estrutura Técnica Esperada

Você deve:

Criar ou ajustar arquivos necessários (HTML, CSS, JS)

Linkar corretamente:

Firebase

Auth

Firestore

Garantir que imports e scripts estejam funcionais

Organizar o código de forma clara

📌 Caso algum arquivo precise ser criado:

Use nomes claros

Siga o padrão já existente no projeto

5️⃣ Estados da Interface (Obrigatório)

A página do cliente deve tratar:

Loading de dados

Nenhum agendamento encontrado

Erros de permissão

Ações concluídas com sucesso

Tudo deve ser:

Mobile-first

Simples

Visualmente claro

6️⃣ Manter o Projeto Funcional

⚠️ ISSO É CRÍTICO:

Não remover funcionalidades existentes

Não alterar comportamento do login

Não mudar regras globais sem necessidade

Se precisar ajustar algo existente, explique no código com comentários

📂 RESULTADO ESPERADO

Ao final, o projeto deve:

Compilar normalmente

Funcionar no navegador

Permitir que um cliente:

Entre

Veja seus agendamentos

Solicite troca

Cancele

Veja histórico

Estar totalmente integrado ao sistema AgendaEstética

🧠 ORIENTAÇÃO FINAL

Trate este projeto como:

um SaaS real, em evolução contínua

Priorize:

Clareza

Segurança

Simplicidade

Manutenção futura

🔥 FIM DO PROMPT