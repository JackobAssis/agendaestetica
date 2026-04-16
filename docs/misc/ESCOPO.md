🧱 ESTRUTURA OFICIAL DO PROJETO — AGENDAESTÉTICA
📦 PARTE 1 — ACESSO À PLATAFORMA

(Entrada, controle e segurança)

Tudo que envolve quem entra, como entra e o que pode acessar.

1.1 Autenticação

Cadastro de profissional

Login

Recuperação de senha

Sessão ativa

Logout

1.2 Fluxo de Primeiro Acesso (Onboarding)

Criação do perfil profissional

Definição do nicho

Configurações mínimas iniciais

Estado “app pronto para uso”

1.3 Perfis de Acesso

Profissional (admin)

Cliente (acesso limitado)

1.4 Controle de Sessão

Persistência de login

Expiração

Troca de dispositivo

1.5 Segurança Básica

Proteção de rotas

Acesso por permissões

Regras de leitura/escrita

📌 Regra da Parte 1:

Sem Parte 1 bem definida, o resto quebra.

🧩 PARTE 2 — FUNCIONAMENTO DA PLATAFORMA

(Fluxos, regras de negócio e usabilidade)

Aqui vive o coração do AgendaEstética.

2.1 Estrutura de Nichos

Nicho como configuração

Presets por nicho

Customização livre

Escalabilidade para novos nichos

2.2 Perfil do Profissional

Informações públicas

Informações privadas

Contato

Redes sociais

2.3 Identidade Visual

Foto de perfil

Banner/capa

Tema

Paleta de cores

Pré-visualização

2.4 Configuração da Agenda

Dias de trabalho

Horários

Intervalos

Exceções

Bloqueios

2.5 Gestão de Clientes

Cadastro

Edição

Observações internas

Histórico

2.6 Agendamentos

Criação manual

Visualização

Edição

Cancelamento

Status (confirmado, concluído, não compareceu)

2.7 Troca de Datas

Solicitação da cliente

Sugestão de horários

Aprovação ou recusa

Histórico de trocas

2.8 Cursos

Criação

Tipos (iniciante / aperfeiçoamento)

Datas e vagas

Inscrições

2.9 Notificações

Confirmações

Lembretes

Trocas

Cursos

2.10 Gestão e Visão Geral

Agenda do dia

Resumos

Indicadores básicos

📌 Regra da Parte 2:

Tudo aqui é fluxo e regra, não banco nem código ainda.

🗄️ PARTE 3 — DADOS E GERENCIAMENTO

(O que é salvo, como é salvo e por quê)

Esta parte garante consistência, segurança e escalabilidade.

3.1 Tipos de Dados

Usuários

Profissionais

Clientes

Agendamentos

Trocas

Cursos

Notificações

3.2 Estrutura dos Dados

Identificadores (IDs)

Relacionamentos

Referências

Histórico

3.3 Estados dos Dados

Ativo

Cancelado

Concluído

Arquivado

3.4 Regras de Persistência

O que nunca é apagado

O que pode ser editado

Versionamento simples

Logs de ações

3.5 Segurança dos Dados

Acesso por userId

Isolamento entre profissionais

Visibilidade da cliente

Proteção contra leitura indevida

3.6 Escalabilidade

Novos nichos

Novos módulos

Crescimento sem quebra

📌 Regra da Parte 3:

Dados mal definidos = bugs infinitos.