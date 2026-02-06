1️⃣ DEFINIÇÃO FINAL — PÁGINA DO CLIENTE (CONSOLIDADA)
🎯 Papel da Página do Cliente

A página do cliente é um painel de consulta e solicitação, nunca de controle.

O cliente PODE:

Ver próximo agendamento

Ver datas disponíveis

Cancelar agendamento

Solicitar troca de data/horário

Ver histórico

Ver cursos (se ativo)

Ver dados públicos do profissional

O cliente NÃO PODE:

Criar horários

Confirmar agendamentos

Editar agenda

Ver dados de outros clientes

Alterar regras do sistema

📌 Rewards fora do MVP do cliente (somente pós-MVP)

2️⃣ ESCOPO FUNCIONAL — PÁGINA DO CLIENTE (MVP ROBUSTO)
🏠 Tela Principal (Home do Cliente)
Bloco: Identidade do Profissional

Nome profissional

Foto ou banner

Tema aplicado automaticamente (cores definidas pelo profissional)

📅 Bloco: Próximo Agendamento

Se existir agendamento ativo:

Data

Horário

Status:

Confirmado

Pendente

Remarcação solicitada

Botões:

Solicitar troca

Cancelar agendamento

Se não existir:

“Você não possui agendamentos ativos no momento.”

🔄 Fluxo: Solicitar Troca

Cliente clica em Solicitar troca

Sistema carrega:

Datas disponíveis

Horários disponíveis

Cliente seleciona

Solicitação enviada

Status muda para:

“Aguardando confirmação do profissional”

📌 Cliente não escolhe data fora da lista

❌ Fluxo: Cancelamento

Botão Cancelar agendamento

Confirmação:

“Deseja realmente cancelar?”

Após cancelar:

Status: Cancelado

Horário volta a ficar disponível (se regra permitir)

📜 Bloco: Histórico

Lista simples:

Data

Horário

Status (concluído / cancelado)

Apenas leitura

📚 Bloco: Cursos (Condicional)

Lista de cursos ativos

Vagas disponíveis

Botão: Solicitar vaga

Status da solicitação

👤 Bloco: Perfil do Cliente

Nome

Contato

Preferências (opcional)

Nenhuma edição sensível

3️⃣ PROMPT FINAL — BLACKBOX / CURSOR / COPILOT

Copie tudo abaixo e cole diretamente na IA

📌 PROMPT — DESENVOLVIMENTO DA PÁGINA DO CLIENTE (AGENDAESTÉTICA)

Você é um desenvolvedor frontend sênior.

Analise todo o projeto AgendaEstética, incluindo os arquivos .md, especialmente:

Fluxo de autenticação e cadastro

Regras de permissões

Estrutura de dados no Firestore

MVP definido

Sua tarefa é desenvolver a Página do Cliente, seguindo rigorosamente as regras abaixo.

🎯 OBJETIVO

Criar um painel do cliente simples, seguro e funcional, usando HTML, CSS e JavaScript puro, integrado ao Firebase (Auth + Firestore).

🔐 CONTEXTO

O cliente já está autenticado

O cadastro do cliente já existe

O cliente acessa a página via link do profissional

O cliente tem acesso APENAS aos próprios dados

📄 FUNCIONALIDADES OBRIGATÓRIAS
1️⃣ Identidade do Profissional

Exibir nome e identidade visual

Aplicar tema configurado pelo profissional

Dados apenas públicos

2️⃣ Próximo Agendamento

Buscar no Firestore o próximo agendamento ativo do cliente

Exibir:

Data

Horário

Status

Se não existir, exibir mensagem clara

3️⃣ Solicitação de Troca

Mostrar botão “Solicitar troca”

Listar apenas datas e horários disponíveis

Enviar solicitação para o profissional

Atualizar status para “Aguardando confirmação”

4️⃣ Cancelamento de Agendamento

Botão “Cancelar agendamento”

Confirmação obrigatória

Atualizar status no Firestore

Respeitar regras do profissional

5️⃣ Histórico

Listar agendamentos passados

Apenas leitura

Ordenado por data

6️⃣ Cursos (Condicional)

Renderizar apenas se existirem cursos ativos

Permitir solicitação de vaga

Mostrar status da solicitação

🚫 RESTRIÇÕES IMPORTANTES

❌ Cliente não pode criar horários

❌ Cliente não pode confirmar agendamento

❌ Cliente não pode editar agenda

❌ Cliente não pode ver dados de outros clientes

❌ Rewards NÃO devem ser implementados

🧠 REQUISITOS TÉCNICOS

Mobile-first

Código organizado

Funções reutilizáveis

Estados claros (loading / vazio / erro)

Segurança baseada em regras do Firestore

UI baseada em dados (renderização condicional)

📂 SAÍDA ESPERADA

Estrutura de arquivos organizada

HTML da página do cliente

CSS básico responsivo

JavaScript integrado ao Firebase

Comentários explicando decisões importantes

⚠️ IMPORTANTE

Respeite rigorosamente:

MVP definido

Permissões do cliente

Estrutura do projeto

Simplicidade e clareza

🧠 RESULTADO ESPERADO

Uma Página do Cliente funcional, segura e pronta para produção, integrada ao sistema AgendaEstética.