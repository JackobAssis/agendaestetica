# Testes Manuais — FASE 6 (TC-033..TC-038)

Pré-requisitos:
- Usuário profissional autenticado com `empresaId` configurado.
- A página de `Clientes` deve estar acessível em `/clientes`.

TC-033 — Adicionar cliente manualmente no painel
- Passos: Faça login como profissional; vá para `Clientes`; adicione um cliente com nome/email.
- Resultado esperado: Cliente aparece na lista; documento criado em `empresas/{empresaId}/clientes`.

TC-034 — Ver detalhes e histórico de um cliente
- Passos: Clique em `Ver` em um cliente; verifique painel de detalhes e histórico de agendamentos.
- Resultado esperado: Histórico traz agendamentos associados ao `clienteUid`.

TC-035 — Adicionar observação interna ao cliente
- Passos: No painel de detalhes, adicione uma observação e salve.
- Resultado esperado: Observação aparece na ficha do cliente e é persistida no documento `clientes/{id}.observacoes`.

TC-036 — Proteção de dados (apenas owner lê clientes)
- Passos: Tente acessar `empresas/{outraEmpresa}/clientes` com um usuário que não é proprietario.
- Resultado esperado: Firestore Rules impedem leitura (ou UI não exibe dados sensíveis).

TC-037 — Integração com agendamento público (cliente criado automaticamente)
- Passos: Em `/agendar/:profissionalId`, solicite um agendamento usando email único.
- Resultado esperado: `createCliente` Cloud Function cria ou retorna cliente existente; `agendamentos` contém `clienteUid` apontando para o cliente.

TC-038 — CRUD de clientes via Cloud Function
- Passos: Testar criar cliente via `createCliente` function (curl/postman) e validar retorno e deduplicação por email.
- Resultado esperado: Primeiro POST cria (201), segundo POST com mesmo email retorna `exists:true` e não cria duplicata.

Registro: Marque PASS/FAIL e adicione logs/screenshots quando ocorrerem erros.
