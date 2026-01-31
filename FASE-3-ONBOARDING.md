# ✅ FASE 3 — Onboarding do Profissional [CONCLUÍDA]

**Data de conclusão:** 31 de Janeiro de 2026  
**Status:** ✅ Implementado e pronto para testes manuais

---

## 📁 Arquivos Criados

```
src/pages/onboarding.html
src/pages/onboarding.js
src/styles/onboarding.css
FASE-3-ONBOARDING.md
```

---

## 🧠 Resumo das decisões

- Onboarding é obrigatório para profissionais; o app redireciona para `/onboarding` quando `empresas/{empresaId}.onboardingCompleto` for `false`.
- Dados coletados: `nome`, `telefone`, `servicos[]`, `dias[]`, `horaInicio`, `horaFim`, `duracaoSlot`.
- Ao salvar, atualizamos `empresas/{empresaId}` com `onboardingCompleto: true` e `configuracao` (campos acima).
- Validações mínimas no frontend (presença de campos, duração mínima de slot)
- Proteção: se usuário não autenticado, redireciona para `/login`.

---

## 🧪 Testes manuais (TC-009 a TC-012)

```
TC-009: Acessar /onboarding sem login -> redireciona para /login
TC-010: Preencher onboarding corretamente -> salva em Firestore, onboardingCompleto = true, redireciona /dashboard
TC-011: Tentar salvar sem dias selecionados -> mostra erro
TC-012: Duração de slot < 5 -> mostra erro
```

---

## ⏭️ Próxima Fase

**FASE 4 — Agenda** (implementar configuração detalhada de horários, bloqueios, prevenção de conflitos)

Arquivos previstos:
- `src/modules/agenda.js`
- `src/pages/agenda.html`, `agenda.js`, `agenda.css`
- Testes: TC-013 a TC-020

**Ação recomendada:** validar TC-009 a TC-012 em ambiente local com Firebase conectado.

---

## Observações

- A escrita em Firestore usa `db.collection('empresas').doc(empresaId).update(...)`. Garanta permissões no Firestore Rules antes de produção.
- Em ambiente de desenvolvimento, verifique se o documento em `empresas/{empresaId}` existe (criado na fase de cadastro do profissional).

**Status:** Aguardando validação manual. Após aprovação, avanço para **FASE 4 — Agenda**.
