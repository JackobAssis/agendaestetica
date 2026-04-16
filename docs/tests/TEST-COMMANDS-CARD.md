# ⚡ Test Commands Quick Card

Print this page and keep at your desk!

---

## 🚀 RUN TESTS

```
npm run test:smoke              # ⚡ Fast (30 sec) - Page loads
npm run test:full-flow          # 🔄 Complete (3 min) - Full journey
npm test                        # 🧬 Unit tests (10 sec) - Functions
npm run test:all                # 📊 Everything (5 min) - All suites
```

---

## 🎬 SETUP

```
# Terminal 1 - Start dev server
npm run dev

# Terminal 2 - Wait 3 seconds, then run tests
sleep 3
npm run test:smoke
```

---

## 🎬 VISUAL MODE (See browser running tests)

```
# Try with one of:
HEADLESS=false npm run test:smoke
HEADLESS=false npm run test:full-flow
NODE_ENV=test npm run test:full-flow
```

---

## 🔍 DEBUG

```
# Debug output
DEBUG=* npm test

# With verbose logging
DEBUG=puppeteer npm run test:smoke

# Debug specific test file
npm test -- tests/slug.test.js
```

---

## 📊 COVERAGE

```
# Generate coverage report (if configured)
npm test -- --coverage
```

---

## 📝 WHICH TEST SHOULD I RUN?

| Situation | Command | Time |
|-----------|---------|------|
| "Quick check" | `npm run test:smoke` | 30s |
| "Full validation" | `npm run test:full-flow` | 3m |
| "Before commit" | `npm test` | 10s |
| "Before PR" | `npm run test:smoke` | 30s |
| "Before deploy" | `npm run test:all` | 5m |
| "Dev server check" | `npm run dev` + F12 | ⏱️ |

---

## ✅ SUCCESS INDICATORS

### ✅ Tests Passed
```
✅ Professional signup
✅ Onboarding completion
✅ Client booking - Confirmation
✅ Appointment completion

========== TEST RESULTS ==========
Total: 8 | Passed: 8 | Failed: 0
Success Rate: 100.0%
```

### ❌ Tests Failed
```
❌ Professional signup
   └─ Signup link not found

Check:
1. Is dev server running? npm run dev
2. Is it at http://localhost:3000?
3. Check browser F12 Console for errors
4. See: TESTE-QUICK-REFERENCE.md
```

---

## 🤔 COMMON ISSUES

| Error | Fix |
|-------|-----|
| "ECONNREFUSED" | Run `npm run dev` first |
| "Timeout" | Dev server too slow, restart it |
| "Element not found" | Check if page loaded, increase timeout |
| "Firebase not found" | Check `public/firebase-config.js` |

---

## 📚 MORE HELP

```
QUICK HELP:     cat TESTE-QUICK-REFERENCE.md
FULL GUIDE:     cat GUIA-TESTES-COMPLETO.md
MANUAL TEST:    cat MANUAL-FLUXO-COMPLETO.md
PRE-LAUNCH:     cat CHECKLIST-TESTES-PRE-LANCAMENTO.md
EVERYTHING:     cat TESTING-INDEX.md
```

---

## 🎯 TESTING WORKFLOW

1. **Code** → `git commit`
2. **Test** → `npm test` (auto-run via pre-commit hook)
3. **Validate** → `npm run test:smoke`
4. **Push** → `git push` (triggers CI/CD)
5. **Full Test** → `npm run test:full-flow` on staging

---

## ✏️ NOTES

```
_________________________________
_________________________________
_________________________________
```

---

**Print & Post**: ⬆️ Keep this card visible while testing!
