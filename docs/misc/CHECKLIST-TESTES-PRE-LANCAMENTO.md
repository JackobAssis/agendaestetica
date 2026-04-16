# ✅ Testing Checklist - Pre-Launch

Use this checklist before deploying to production.

---

## 🚀 Pre-Launch Testing

### Phase 1: Automated Tests (⏱️ 5 minutes)

- [ ] **Unit Tests Pass**
  ```bash
  npm test
  ```
  Expected: `Passed: XX` with 0 failures

- [ ] **Smoke Tests Pass**
  ```bash
  npm run dev &
  sleep 3
  npm run test:smoke
  ```
  Expected: Success rate 100%

- [ ] **Full-Flow E2E Test Pass**
  ```bash
  npm run test:full-flow
  ```
  Expected: All 8-10 scenarios pass

- [ ] **No Console Errors**
  - F12 → Console tab
  - No red error messages
  - Warnings are okay

---

### Phase 2: Manual Testing - Professional Journey (⏱️ 30 minutes)

#### 2.1 Signup & Onboarding

- [ ] Can create new profissional account
  - Email: `test_prof_$(date +%s)@test.local`
  - Password validates (min 6 chars)
  - Error handling for duplicate email works

- [ ] Slug auto-generates
  - From profissão or nome
  - Is unique (no duplicates)
  - Contains only valid URL characters

- [ ] Onboarding form appears
  - All required fields present:
    - [ ] Estabelecimento
    - [ ] Telefone
    - [ ] Endereço *(NEW)*
    - [ ] Serviços (comma-separated)
    - [ ] Horários (dias + horas)
    - [ ] Duração slots

- [ ] Onboarding saves data
  - After "Salvar e Continuar"
  - Redirects to dashboard
  - Data persists after reload

#### 2.2 Dashboard

- [ ] Dashboard displays
  - [ ] Welcome message with nome
  - [ ] KPI cards:
    - [ ] Agendamentos Hoje (0 initially)
    - [ ] Total de Clientes (0 initially)
  - [ ] Public link section
    - [ ] Correct URL `/p/{slug}`
    - [ ] Copy button works (clipboard updated)

#### 2.3 Perfil (Professional Profile)

- [ ] Perfil page loads
  - [ ] Slug editor visible
    - [ ] Can edit slug
    - [ ] Validation on save (check duplicates)
    - [ ] Copy link button works
  
  - [ ] Services section visible
    - [ ] List current services
    - [ ] Can edit: name, price (R$), duration (min)
    - [ ] Can delete service
    - [ ] Can add new service
    - [ ] Limit warning if >5 services on free plan
  
  - [ ] Address displays correctly
    - [ ] From onboarding data
    - [ ] Can be edited

#### 2.4 Public Link (As Client - Incognito)

- [ ] Public page loads without login
  - Open in private/incognito window
  - URL: `https://agendaestetica.app/p/{slug}` (or localhost equivalent)

- [ ] Public page displays
  - [ ] Professional name
  - [ ] Profissão
  - [ ] Endereço *(NEW)*
  - [ ] Services with prices and durations
  - [ ] "Agendar" button

- [ ] 404 handling
  - [ ] Try invalid slug: `/p/inexistente`
  - [ ] Shows friendly error message

---

### Phase 3: Manual Testing - Client Journey (⏱️ 20 minutes)

#### 3.1 Booking Flow

- [ ] Click "Agendar" button
  - [ ] Agendamento form appears
  - [ ] Step 1: Service selection
    - [ ] Dropdown shows all services
    - [ ] Shows price and duration
  
  - [ ] Step 2: Date & time
    - [ ] Date picker shows next Monday onward
    - [ ] "Gerar slots" button generates times
    - [ ] Slots show: 30min intervals
    - [ ] Slots span business hours (e.g., 9:00-18:00)
  
  - [ ] Step 3: Select slot
    - [ ] Click any slot
    - [ ] Slot highlights/selects
  
  - [ ] Step 4: Client info
    - [ ] Name input (required)
    - [ ] Email input (required, with validation)
    - [ ] Phone input (optional)
  
  - [ ] Confirm booking
    - [ ] "Confirmar agendamento" button submits
    - [ ] Success message shows: "Solicitação enviada"

#### 3.2 Conflict Detection

- [ ] Book same slot/date with different client
  - [ ] Try to book 10:00 again
  - [ ] Error: "Conflito de horário"
  - [ ] Original slot is blocked

- [ ] Cancel first booking
  - [ ] Go back to professional view
  - [ ] Click "Cancelar" on first agendamento
  - [ ] Confirm modal
  - [ ] Status changes to "cancelado" (red)

- [ ] Rebook cancelled slot
  - [ ] As new client, book 10:00 again
  - [ ] Should succeed (cancelled slot is freed)

---

### Phase 4: Professional Management (⏱️ 15 minutes)

#### 4.1 Agendamentos List

- [ ] Navigate to Agendamentos section
  - [ ] All bookings display in list
  - [ ] Shows: Client name | Service | Date/Time | Status

- [ ] Status visual indicators
  - [ ] **Solicitado** (orange/yellow)
  - [ ] **Confirmado** (green)
  - [ ] **Concluído** (blue)
  - [ ] **Cancelado** (red/gray)

#### 4.2 Manage Bookings

- [ ] **Confirm** action
  - [ ] Click "Confirmar" on solicitado booking
  - [ ] Status changes to confirmado (green)
  - [ ] Confirmation modal works
  - [ ] After confirm, button changes to "Concluir"

- [ ] **Conclude** action *(NEW)*
  - [ ] Click "Concluir" on confirmado booking
  - [ ] Status changes to concluído (blue)
  - [ ] Timestamp recorded
  - [ ] Button disappears or disables

- [ ] **Cancel** action
  - [ ] Click "Cancelar" on any booking
  - [ ] Confirmation modal shows
  - [ ] Status changes to cancelado (red)
  - [ ] Other clients can now rebook that time

#### 4.3 Filters & Date Range

- [ ] Date range filter
  - [ ] "De:" and "Até:" inputs visible
  - [ ] By default shows all
  - [ ] Clicking "Filtrar" updates list
  - [ ] Reset button clears filters

- [ ] Status filter
  - [ ] Checkboxes for each status
  - [ ] Can filter to specific status(es)
  - [ ] List updates accordingly

#### 4.4 Clientes (Clients)

- [ ] Navigate to Clientes section
  - [ ] Shows all clients who booked
  - [ ] Displays: Name | Email | Phone | Bookings count

- [ ] Client detail view
  - [ ] Click on client
  - [ ] Shows all their bookings
  - [ ] Can see history

---

### Phase 5: Data & Security (⏱️ 10 minutes)

#### 5.1 Data Isolation

- [ ] Create 2nd professional account
  - [ ] Prof 1 and Prof 2 separate
  - [ ] Prof 1 cannot see Prof 2's data
  - [ ] Prof 2 cannot see Prof 1's data

#### 5.2 Authentication

- [ ] Logout and re-login
  - [ ] Session persists correctly
  - [ ] Same data loads
  - [ ] No data loss

- [ ] Try accessing other prof's data
  - [ ] Manually edit URL to other uid
  - [ ] Should get access denied/redirect
  - [ ] Firebase rules prevent unauthorized access

---

### Phase 6: UX & Polish (⏱️ 15 minutes)

#### 6.1 Loading States

- [ ] Generating slots shows loading
  - [ ] Button says "Gerando..." and disables
  - [ ] After completion, button restores

- [ ] Confirming agendamento shows loading
  - [ ] Button gives visual feedback
  - [ ] After success, button state updates

#### 6.2 Error Messages

- [ ] Duplicate email signup
  - [ ] Clear error message
  - [ ] User knows what to do

- [ ] Network error
  - [ ] Friendly message (not raw error)
  - [ ] Retry option available

- [ ] Missing required fields
  - [ ] Validation shows which field
  - [ ] Cannot submit incomplete form

#### 6.3 Responsive Design

- [ ] Desktop (1920px)
  - [ ] Layout proper
  - [ ] Text readable
  - [ ] Buttons clickable

- [ ] Tablet (768px)
  - [ ] Layout adapts
  - [ ] No overflow
  - [ ] Touch targets sufficient

- [ ] Mobile (375px)
  - [ ] Stacked layout
  - [ ] Navigation accessible
  - [ ] Forms full width
  - [ ] Buttons large enough

#### 6.4 Browser Compatibility

- [ ] Chrome (latest)
  - [ ] ✅ Works
  - [ ] Performance: < 2s load time

- [ ] Firefox (latest)
  - [ ] ✅ Works
  - [ ] No layout issues

- [ ] Safari (latest)
  - [ ] ✅ Works
  - [ ] Inputs work properly

- [ ] Edge (latest)
  - [ ] ✅ Works

---

### Phase 7: Performance (⏱️ 5 minutes)

- [ ] Page loads in < 2 seconds
  - DevTools Network tab: measure Time to Interactive

- [ ] Slot generation < 1 second
  - Click "Gerar slots", measured time

- [ ] Database queries efficient
  - Firebase Console: check read counts
  - Should be minimal for list operations

---

### Phase 8: Feature Completeness (✅ Sign-off)

Check all items from original CHECKLIST:

- [ ] ✅ 1. ESTRUTURA BASE (Multi-tenant, slug, isolation)
- [ ] ✅ 2. FLUXO DE ENTRADA (Landing, routes)
- [ ] ✅ 3. CADASTRO (Signup, onboarding, slug)
- [ ] ✅ 4. DASHBOARD (KPIs, link public)
- [ ] ✅ 5. SERVIÇOS (CRUD, price/duration)
- [ ] ✅ 6. HORÁRIOS (Configuration, availability)
- [ ] ✅ 7. AGENDAMENTOS (List, filter, confirm, conclude, cancel)
- [ ] ✅ 8. LINK PÚBLICO (Slug-based, copyable)
- [ ] ✅ 9. PÁGINA PÚBLICA (Profile, contact)
- [ ] ✅ 10. INTEGRAÇÃO (No conflicts, data consistency)
- [ ] ✅ 11. SEGURANÇA (Rules verified, isolation)
- [ ] ✅ 12. UX (Loading states, error messages, colors)
- [ ] ✅ 13. MONETIZAÇÃO (Feature gates, plan selector)
- [ ] ✅ 14. ESCALABILIDADE (Modular, performant)
- [ ] ✅ 15. TESTES (Automated + manual coverage)

---

## 🎯 Results Summary

**Date Tested**: ___________  
**Tester Name**: ___________  
**Environment**: ☐ Local | ☐ Staging | ☐ Production

### Overall Result

| Status | Result |
|--------|--------|
| Automated Tests | ☐ PASS | ☐ FAIL |
| Manual Tests | ☐ PASS | ☐ FAIL |
| UX Quality | ☐ GOOD | ☐ NEEDS WORK |
| Performance | ☐ GOOD | ☐ NEEDS OPTIMIZATION |
| **READY TO LAUNCH?** | ☐ **YES** ✅ | ☐ **NO** ❌ |

### Critical Issues Found

```
1. [Priority] Issue: ____________________
   Impact: ____________________
   Fix: ____________________
   
2. [Priority] Issue: ____________________
   Impact: ____________________
   Fix: ____________________
```

### Nice-to-Have Improvements

```
- [ ] Feature: ____________________
- [ ] Feature: ____________________
- [ ] Feature: ____________________
```

---

## 🚀 Deployment Approval

- [ ] All tests pass
- [ ] No critical issues
- [ ] At least 2 people tested
- [ ] Sign-off from product lead
- [ ] Backup plan if rollback needed

**Approved by**: ___________  
**Date**: ___________  
**Approved for**: ☐ Vercel | ☐ Firebase | ☐ Other: _______

---

## 📝 Notes

```
_________________________________________
_________________________________________
_________________________________________
_________________________________________
```

---

**Version**: 1.0  
**Last Updated**: 2024-07-15  
**Next Review**: Before each production deployment
