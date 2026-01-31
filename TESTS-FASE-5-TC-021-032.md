# Testes Manuais — FASE 5 (TC-021..TC-032)

Pré-requisitos:
- Projeto configurado com Firebase (Auth + Firestore) ou Firebase Emulator em execução.
- Se usar a Cloud Function, defina `window.APP_CONFIG.confirmAgendamentoFunctionUrl` apontando para a URL da função.
- Abra o app em um servidor local apontando para `src/` (ex.: `python -m http.server` dentro de `src`).

TC-021 — Criar agendamento pelo profissional
- Passos: Faça login como profissional; vá para `Agendamentos` e crie um agendamento manual.
- Resultado esperado: Documento criado em `empresas/{empresaId}/agendamentos` com `status: 'confirmado'`.

TC-022 — Cliente solicita agendamento pela página pública
- Passos: Abra `/agendar/:profissionalId`, preencha nome/email, gere slots e solicite um slot.
- Resultado esperado: Documento criado em `empresas/{profissionalId}/agendamentos` com `status: 'solicitado'` e campos `inicio`, `fim`, `nomeCliente`.

TC-023 — Profissional confirma solicitação com Cloud Function
- Passos: No painel do profissional, clique em `Confirmar` para um `status: 'solicitado'`.
- Resultado esperado: Agendamento passa para `status: 'confirmado'`; Cloud Function retorna sucesso (200).

TC-024 — Conflito ao confirmar (detectar conflito)
- Passos: Crie manualmente um agendamento confirmado que conflita com outro solicitado; tente confirmar o segundo.
- Resultado esperado: Confirmação falha com erro `Conflito detectado while confirming` e o status permanece `solicitado`.

TC-025 — Notificação in-app ao criar solicitação
- Passos: Depois que o cliente solicitar um agendamento, verifique `empresas/{profissionalId}/notificacoes`.
- Resultado esperado: Um documento de notificação foi criado com `title` e `body` descrevendo o pedido.

TC-026 — Webhook placeholder
- Passos: Configure `webhookUrl` no documento `empresas/{profissionalId}` e faça uma solicitação pública.
- Resultado esperado: O frontend tenta postar para a URL (ver console); webhook pode retornar 200 ou falhar — log no console.

TC-027 — Cancelamento pelo profissional
- Passos: No painel do profissional, clicar `Cancelar` em um agendamento confirmado.
- Resultado esperado: Documento atualizado com `status: 'cancelado'` e `canceladoEm` preenchido.

TC-028 — Remarcação solicitada pelo cliente
- Passos: Criar um pedido de remarcação em `empresas/{id}/agendamentos/{agId}/remarcacoes` com `status: 'pendente'`.
- Resultado esperado: Subcollection criada e campo `temPedidoRemarcacao: true` no agendamento principal.

TC-029 — Aceitar remarcação com verificação de conflito
- Passos: No painel do profissional, aceitar remarcação.
- Resultado esperado: Se não houver conflito, agendamento é atualizado para novo horário; remarcação marcada como `aceita`.

TC-030 — Rejeitar remarcação
- Passos: Rejeitar remarcação no painel.
- Resultado esperado: Remarcação recebe `status: 'rejeitada'` e agendamento `temPedidoRemarcacao` é `false`.

TC-031 — Isolamento por `empresaId`
- Passos: Tentar listar/agendar em `empresas` que não pertencem ao usuário autenticado.
- Resultado esperado: Operações de escrita protegidas por Firestore Rules; leitura pública permitida; updates restritos a owner.

TC-032 — Fallback quando Cloud Function não está configurada
- Passos: Remova `window.APP_CONFIG.confirmAgendamentoFunctionUrl` e confirme uma solicitação no painel.
- Resultado esperado: Confirmação é realizada via transação client-side (fallback) e altera `status` para `confirmado`.

Notas de depuração:
- Use o console do navegador para ver chamadas `fetch` e possíveis erros de webhook/Function.
- Para testes automatizados, considere iniciar o Firebase Emulator Suite e ajustar `firebaseConfig` para apontar para o emulador.

***

Registro de resultados: registre `PASS` / `FAIL` e screenshots para cada TC.
