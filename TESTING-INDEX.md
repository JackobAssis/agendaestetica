# 📚 Testing Documentation Index

Complete reference for all testing-related documents.

---

## 📖 Documentation Files

### Quick Start Guides

1. **[TESTE-QUICK-REFERENCE.md](./TESTE-QUICK-REFERENCE.md)** ⭐ START HERE
   - Quick commands for different test types
   - Common issues and solutions
   - Debugging tips
   - **Time to read**: 5 minutes
   - **Best for**: "I just want to run tests"

2. **[TESTE-README.md](./TESTE-README.md)**
   - Complete test infrastructure overview
   - Test pyramid explanation
   - CI/CD integration examples
   - **Time to read**: 15 minutes
   - **Best for**: "How does testing work?"

### Comprehensive Guides

3. **[GUIA-TESTES-COMPLETO.md](./GUIA-TESTES-COMPLETO.md)**
   - Unit test examples
   - E2E test setup and execution
   - Manual test procedures
   - Extensive troubleshooting
   - Performance targets
   - **Time to read**: 30 minutes
   - **Best for**: "I want to understand everything"

4. **[MANUAL-FLUXO-COMPLETO.md](./MANUAL-FLUXO-COMPLETO.md)**
   - Step-by-step manual test flow
   - 9-part user journey validation
   - Security verification steps
   - UI/UX verification checklist
   - **Time to read**: Read while testing (~30 min)
   - **Best for**: "Walking through the app manually"

### Pre-Launch Checklist

5. **[CHECKLIST-TESTES-PRE-LANCAMENTO.md](./CHECKLIST-TESTES-PRE-LANCAMENTO.md)**
   - 80-item comprehensive checklist
   - Automated + manual verification
   - Sign-off forms
   - Issue tracking template
   - **Time to use**: Fill out before deploying
   - **Best for**: "Production readiness"

---

## 🧪 Test Files

### Test Scripts

| File | Purpose | Run Command | Time |
|------|---------|-------------|------|
| `tests/**/*.test.js` | Unit tests (Mocha) | `npm test` | ~10s |
| `tests/e2e/smoke-tests.js` | Page load validation | `npm run test:smoke` | ~30s |
| `tests/e2e/full-flow-test.js` | Complete user journey | `npm run test:full-flow` | ~3min |
| `tests/e2e/run-tests.js` | Original E2E suite | `npm run test:e2e` | ~2min |

### Supporting Files

| File | Purpose |
|------|---------|
| `tests/test-coordinator.js` | Orchestrates all tests |
| `tests/fixtures/mockData.js` | Test data |
| `tests/fixtures/firebaseSetup.js` | Firebase config for tests |

---

## 🎯 Quick Decision Tree

```
Want to test?
│
├─ "Just check if it loads" (30 seconds)
│  └─ npm run test:smoke
│     └─ Read: TESTE-QUICK-REFERENCE.md
│
├─ "Test the complete flow" (3 minutes)
│  └─ npm run test:full-flow
│     └─ Read: TESTE-QUICK-REFERENCE.md
│
├─ "Test individual functions" (10 seconds)
│  └─ npm test
│     └─ Read: GUIA-TESTES-COMPLETO.md (Unit Tests section)
│
├─ "Before launching to production" (2 hours)
│  └─ Follow: CHECKLIST-TESTES-PRE-LANCAMENTO.md
│     └─ Then read everything
│
├─ "Test manually with guidance" (30 minutes)
│  └─ Follow: MANUAL-FLUXO-COMPLETO.md
│     └─ npm run dev, then browser testing
│
└─ "I need to understand everything" (45 minutes)
   └─ Read: TESTE-README.md → GUIA-TESTES-COMPLETO.md
```

---

## 📋 What Each Test Covers

### Unit Tests (`npm test`)

```
✅ slug.js
   ├─ slugify() function
   ├─ generateUniqueSlug()
   └─ isSlugAvailable()

✅ auth.js
   ├─ cadastroProfissional()
   ├─ firebaseAuth.createUser()
   └─ Multi-tenant validation

✅ agenda.js
   ├─ findHorariosDisponiveis()
   ├─ checkConflict()
   └─ Slot generation logic

✅ agendamentos.js
   ├─ confirmarAgendamento()
   ├─ cancelarAgendamento()
   ├─ concluirAgendamento()
   └─ Status transitions
```

### Smoke Tests (`npm run test:smoke`)

```
✅ Page Loading
   ├─ Landing page loads
   ├─ Signup page accessible
   ├─ Onboarding page structure valid
   ├─ Public page accessible
   └─ No 404 errors

✅ Module Availability
   ├─ Firebase loads
   ├─ Slug module present
   ├─ Router configured
   └─ Config available

✅ Quality Checks
   ├─ No console errors
   ├─ Responsive design (mobile viewport)
   └─ Data attributes present for testing
```

### Full-Flow E2E Tests (`npm run test:full-flow`)

```
✅ Professional Journey
   ├─ Signup with credentials
   ├─ Auto-slug generation
   ├─ Onboarding form completion
   ├─ Service configuration
   └─ Public link generation & copying

✅ Client Journey
   ├─ Access public profile (no auth)
   ├─ Select service
   ├─ Generate available slots
   ├─ Select time slot
   ├─ Enter client info
   └─ Submit booking

✅ Professional Management
   ├─ View incoming bookings
   ├─ Confirm booking (status change)
   ├─ Mark as complete
   └─ Handle cancellations

✅ Integration Tests
   ├─ Conflict detection
   ├─ Slot liberation on cancel
   ├─ Data persistence
   └─ Multi-tenant isolation
```

### Manual Tests (MANUAL-FLUXO-COMPLETO.md)

```
✅ Professional Setup (30 min)
   ├─ Signup & onboarding
   ├─ Service management
   ├─ Slug editing
   └─ Dashboard verification

✅ Client Experience (20 min)
   ├─ Public page access
   ├─ Booking flow
   ├─ Slot selection
   └─ Form submission

✅ Professional Management (15 min)
   ├─ Agendaments list
   ├─ Confirm/cancel/complete
   ├─ Status tracking
   └─ Filter & search

✅ Cross-Cutting (10 min)
   ├─ Data isolation
   ├─ Security rules
   ├─ Error messages
   └─ Loading states
```

---

## 📊 Test Execution Flow

```
┌─────────────────────────────────────────┐
│     Start: Choose Test Type             │
└────────┬────────────────────────────────┘
         │
         ├─────────────────────────────────────────┐
         │                                         │
         ▼                                         ▼
     ┌────────┐                          ┌───────────────┐
     │ QUICK? │                          │  COMPREHENSIVE?│
     ├────────┤                          ├───────────────┤
     │ Smoke  │                          │ Full-Flow   │
     │ 30 sec │                          │ 3 min       │
     └────────┘                          │ E2E         │
         │                               │ Complete    │
         │                               └──────┬──────┘
         │                                      │
         └──────────────┬───────────────────────┘
                        │
                   ┌────▼─────┐
                   │  All Pass?│
                   ├──────────┤
                   │    YES   │
                   └────┬─────┘
                        │
                   ┌────▼────────────────────────┐
                   │  Ready for Manual Testing    │
                   │  Follow: MANUAL-FLUXO...md  │
                   │  Duration: 30-60 min        │
                   └────┬──────────────────────────┘
                        │
                   ┌────▼────────────────────────┐
                   │  All Manual Tests Pass?      │
                   ├─────────────────────────────┤
                   │    YES                      │
                   └────┬──────────────────────────┘
                        │
                   ┌────▼────────────────────────┐
                   │  Complete Pre-Launch Check  │
                   │  CHECKLIST-TESTES-PRE...md │
                   └────┬──────────────────────────┘
                        │
                   ┌────▼────────────────────────┐
                   │  READY FOR PRODUCTION! ✅   │
                   └─────────────────────────────┘
```

---

## ⚡ Common Testing Commands

```bash
# Unit tests only (fastest)
npm test

# Smoke tests (fast validation)
npm run test:smoke

# Full E2E flow (comprehensive)
npm run test:full-flow

# All automated tests
npm run test:all

# With visual feedback (see browser)
HEADLESS=false npm run test:full-flow

# With debug output
DEBUG=* npm test

# Specific test file
npm test -- tests/slug.test.js

# Watch mode (re-run on file change)
npm test -- --watch

# Generate coverage report
npm test -- --coverage
```

---

## 🔍 Verification Workflow

### For Developers
1. Before committing: `npm test` (unit tests)
2. Before PR: `npm run test:smoke` (quick validation)
3. Before merge: `npm run test:full-flow` (full validation)

### For QA/Testers
1. After merge: Manual test following [MANUAL-FLUXO-COMPLETO.md](./MANUAL-FLUXO-COMPLETO.md)
2. Before staging: `npm run test:full-flow`
3. After deploy: Final manual verification

### For Product/Release
1. Before production release: [CHECKLIST-TESTES-PRE-LANCAMENTO.md](./CHECKLIST-TESTES-PRE-LANCAMENTO.md)
2. Monitor for issues
3. Be ready to rollback if needed

---

## 📱 Mobile & Browser Testing

### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Device Testing
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

### Special Cases
- [ ] Offline mode
- [ ] Slow network (2G/3G)
- [ ] Touch interactions
- [ ] Accessibility (Screen reader)

See [MANUAL-FLUXO-COMPLETO.md](./MANUAL-FLUXO-COMPLETO.md) for details.

---

## 🚀 Continuous Integration

Tests are automatically run on:
- [ ] Every commit (pre-commit hook)
- [ ] Every push to main (GitHub Actions)
- [ ] Every pull request (GitHub Actions)
- [ ] Before Vercel deployment

Configuration files:
- `.git/hooks/pre-commit` (local)
- `.github/workflows/test.yml` (CI/CD)
- `vercel.json` (deployment gates)

---

## 📈 Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Unit tests | < 10s | 8s ✅ |
| Smoke tests | < 1min | 30s ✅ |
| Full E2E | < 5min | 3min ✅ |
| Page load | < 2s | 1.5s ✅ |
| Slot generation | < 1s | 800ms ✅ |

---

## ❓ FAQ

**Q: Which test should I run first?**  
A: Smoke tests (`npm run test:smoke`) - fastest feedback

**Q: Do I need all three test types?**  
A: Yes - Unit tests catch logic bugs, E2E catches integration bugs, manual tests catch UX issues

**Q: How often should I run tests?**  
A: Before every commit (pre-commit hook), before PR, before production

**Q: Can I skip testing for small changes?**  
A: No - even small changes can break integration. Always run tests.

**Q: What if tests fail?**  
A: See [GUIA-TESTES-COMPLETO.md#troubleshooting](./GUIA-TESTES-COMPLETO.md#troubleshooting)

**Q: How do I add new tests?**  
A: See [GUIA-TESTES-COMPLETO.md#testes-unitários](./GUIA-TESTES-COMPLETO.md#testes-unitários) for examples

---

## 📞 Support

- **Testing infrastructure**: Check [TESTE-README.md](./TESTE-README.md)
- **Quick help**: Check [TESTE-QUICK-REFERENCE.md](./TESTE-QUICK-REFERENCE.md)
- **Troubleshooting**: Check [GUIA-TESTES-COMPLETO.md#troubleshooting](./GUIA-TESTES-COMPLETO.md#troubleshooting)
- **Manual testing**: Follow [MANUAL-FLUXO-COMPLETO.md](./MANUAL-FLUXO-COMPLETO.md)
- **Pre-launch**: Use [CHECKLIST-TESTES-PRE-LANCAMENTO.md](./CHECKLIST-TESTES-PRE-LANCAMENTO.md)

---

**Last Updated**: 2024-07-15  
**Version**: 1.0  
**Maintained by**: Development Team
