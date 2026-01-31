# ✅ FASE 5 — Agendamentos [EM PROGRESSO]

**Data:** 31 de Janeiro de 2026

---

## Objetivo
Implementar todo o fluxo de agendamentos: solicitações por cliente, confirmação pelo profissional, cancelamento, remarcação e listagem.

## Arquivos Criados/Atualizados
- `src/modules/agendamentos.js` — operações principais: `solicitarAgendamento`, `confirmarAgendamento` (transactional), `cancelarAgendamento`, `solicitarRemarcacao`, `aceitarRemarcacao`, `rejeitarRemarcacao`, `listAgendamentosEmpresa`, `listAgendamentosCliente`.
- `src/pages/agendamentos.html` — UI básica para listar e filtrar agendamentos
- `src/pages/agendamentos.js` — lógica de listagem e ações (confirmar/cancelar)
- `src/styles/agendamentos.css` — estilos

## Regras de Negócio Implementadas
- Pedido inicial: status `solicitado` (cliente)
- Profissional confirma → transaction verifica conflitos com `status=='confirmado'`
- Cancelamento muda status para `cancelado` e registra `motivoCancelamento`
- Remarcação é um subdocumento em `remarcacoes` com status pendente
- Listagens por empresa e por cliente

## Testes planejados (TC-021 a TC-032)
```
TC-021: Cliente solicita agendamento -> documento criado com status 'solicitado'
TC-022: Prof confirma solicitacao sem conflito -> status 'confirmado'
TC-023: Prof tenta confirmar com conflito -> erro
TC-024: Cliente ou prof cancela -> status 'cancelado' e motivo salvo
TC-025: Cliente solicita remarcacao -> remarcacao criada com status 'pendente'
TC-026: Prof aceita remarcacao sem conflito -> agendamento atualizado
TC-027: Prof rejeita remarcacao -> remarcacao status 'rejeitada'
TC-028: Listagem empresa filtra por data
TC-029: Listagem cliente retorna seus agendamentos
TC-030: Ver que bloqueios removem slots gerados (integração com FASE 4)
TC-031: Tentativa de criar agendamento já confirmado falha (concurrency)
TC-032: Notas internas podem ser adicionadas (manual)
```

## Notas Técnicas e Riscos
- As transações usam `db.runTransaction` com queries — Firestore permite, mas cuidado com leituras de queries em transações: todas as docs lidas contam para snapshot.
- Em cenários de alta concorrência recomenda-se Cloud Function que cria reserva atômica.
- `addNota` usa FieldValue.arrayUnion — adaptar conforme SDK disponível no runtime.

## Próximos passos imediatos
1. Implementar UI de cliente para solicitar agendamento público (`/agendar/:profissionalId`) — prioridade para teste manual.
2. Integrar notificações (email/in-app) para mudanças de status (FASE 6/7).
3. Executar os testes TC-021 a TC-032 e ajustar Firestore Rules.

---

**Status:** Core do FASE 5 implementado. Aguardando validação manual e instruções para UI pública do cliente. 
