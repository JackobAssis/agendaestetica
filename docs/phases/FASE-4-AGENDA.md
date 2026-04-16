# ✅ FASE 4 — Agenda [IMPLENTADA (BÁSICA)]

**Data:** 31 de Janeiro de 2026

---

## Objetivo
Implementar a configuração de agenda do profissional: dias, horários, duração de slots, bloqueios e prevenção básica de conflitos.

## Arquivos Criados
- `src/modules/agenda.js` (funções para salvar config, criar bloqueios, gerar slots, criar agendamento com verificação)
- `src/pages/agenda.html` (UI para configuração e bloqueios)
- `src/pages/agenda.js` (lógica da página)
- `src/styles/agenda.css` (estilos)
- `FASE-4-AGENDA.md` (documentação)

## Decisões Técnicas
- Configuração salva em `empresas/{empresaId}.agendaConfig`.
- Bloqueios salvos em `empresas/{empresaId}/bloqueios`.
- Agendamentos esperados em `empresas/{empresaId}/agendamentos`.
- Conflitos detectados via queries (start < fim && end > start) tanto em `agendamentos` quanto `bloqueios`.
- Geração de slots filtra automaticamente os que conflitam.

## O que testar (TC-013 a TC-020)
```
TC-013: Salvar configuração de agenda correta -> documento `empresas/{empresaId}` atualizado
TC-014: Tentar salvar configuração incompleta -> erro no frontend
TC-015: Criar bloqueio com intervalo inválido -> erro
TC-016: Criar bloqueio válido -> item em `empresas/{empresaId}/bloqueios`
TC-017: Gerar slots para data sem disponibilidade -> retorna vazio
TC-018: Gerar slots para data com disponibilidade -> mostra lista de slots
TC-019: Criar bloqueio e ver que slots são removidos da geração
TC-020: Criar agendamento duplicado (simulação) -> createAppointment lança conflito
```

## Notas e Riscos
- As consultas de conflito são feitas no cliente; para produção recomendamos regras e Cloud Functions para checagem atômica.
- A função `createAppointment` é exemplo e faz verificação otimista; para concorrência forte requer transação no servidor.
- Certifique-se das Firestore Rules permitirem escrita em `empresas/{empresaId}` apenas para o `proprietarioUid`.

## Próximos passos
- Implementar interface para visualizar bloqueios e agendamentos existentes
- Implementar transações/Cloud Function para reservar slots de forma atômica
- Integrar UI de agendamento do cliente (FASE 5)

---

**Status:** Pronto para testes manuais/validação. Após aprovação, sigo para **FASE 5 — Agendamentos**.
