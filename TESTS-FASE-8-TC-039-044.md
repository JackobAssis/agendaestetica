# Testes Manuais — FASE 8 (TC-039..TC-044)

Pré-requisitos:
- Usuário profissional autenticado com `empresaId` configurado.
- `perfil` page acessível e `dashboard` carregado.

TC-039 — Alterar plano para Premium
- Passos: Em `/perfil`, selecione `Premium` e clique em `Salvar Plano`.
- Resultado esperado: `empresas/{empresaId}.plano` atualizado para `premium`; UI reflete `Premium`.

TC-040 — Verificar feature flag `tema_avancado`
- Passos: Após atualizar para `Premium`, recarregue dashboard; verifique se a opção `Premium` no seletor de tema está habilitada.
- Resultado esperado: `tema_avancado` liberado; usuário pode selecionar `Premium` e o site aplica o tema.

TC-041 — UI gating impede seleção de tema avançado em Free
- Passos: Em uma conta `Free`, abra Dashboard; tente selecionar `Premium` no seletor de tema.
- Resultado esperado: opção `Premium` está desabilitada e uma mensagem orienta a alterar o plano em `Perfil`.

TC-042 — Persistência de tema
- Passos: Selecione `Premium` (em conta Premium) ou `Free` em dashboard; recarregue página.
- Resultado esperado: o tema permanece conforme selecionado (valores de `empresas/{empresaId}.theme` e `localStorage` atualizados).

TC-043 — Features por plano
- Passos: Usar `temFeature('notificacoes_email')` manualmente no console após alternar planos.
- Resultado esperado: `notificacoes_email` é `true` apenas para `premium`, `false` para `free`.

TC-044 — Reversão de plano
- Passos: Trocar plano de `Premium` para `Free` e verificar o comportamento do seletor de tema e outras features.
- Resultado esperado: funcionalidades premium travam; tema premium não aplicável; dados do plano persistem.

Registro: marcar PASS/FAIL, incluir screenshots e logs de console se houver erro.
