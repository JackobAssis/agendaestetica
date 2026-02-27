# 🧪 Quick Reference - Running Tests

## 🚀 Quick Start

```bash
# 1. Install dependencies (one-time)
npm install

# 2. Start dev server (Terminal 1)
npm run dev
# Wait for: "Hit CTRL-C to stop the server"

# 3. Run tests (Terminal 2)
npm run test:smoke        # ⚡ Fast smoke tests (~30s)
npm run test:full-flow    # 🔄 Complete E2E flow (~3min)
npm test                  # 🧬 Unit tests (~10s)
```

---

## 📋 All Test Commands

| Command | What | Time | Headless? |
|---------|------|------|-----------|
| `npm test` | Unit tests only | ~10s | N/A |
| `npm run test:smoke` | Smoke tests (page loads) | ~30s | yes |
| `npm run test:full-flow` | Complete user flow E2E | ~3min | yes |
| `npm run test:manual` | Manual testing guide | ~30min | N/A |
| `DEBUG=* npm test` | Unit tests with logging | ~15s | N/A |

---

## 🎯 Choose Your Test Type

### ✅ **Quick Validation** (5 minutes)
Best for: "Does the app load?"
```bash
npm run dev &
sleep 3
npm run test:smoke
```

### 🔄 **Full Flow Test** (5 minutes)
Best for: "Does the whole user journey work?"
```bash
npm run dev &
sleep 3
npm run test:full-flow
```

### 📝 **Manual Testing** (30 minutes)
Best for: "Does the UI look right and feel good?"
```bash
npm run dev
# In browser: http://localhost:3000
# Follow: MANUAL-FLUXO-COMPLETO.md
```

### 🧬 **Unit Tests** (30 seconds)
Best for: "Are functions working correctly?"
```bash
npm test
```

---

## 🎬 Visual Mode (See Browser)

By default, Puppeteer runs **headless** (no visible browser).  
To see what the tests are doing:

```bash
# Smoke tests with visual feedback
HEADLESS=false npm run test:smoke

# Or full-flow test
HEADLESS=false npm run test:full-flow
```

---

## 📊 Understanding Results

### ✅ All Tests Pass
```
[1] Landing page loads... ✅ PASS
[2] Profissional signup page accessible... ✅ PASS
...
📊 RESULTS
Total: 14
✅ Passed: 14
❌ Failed: 0
📈 Success Rate: 100.0%
```

**Meaning**: App is ready! ✨

### ⚠️ Some Tests Fail
```
[1] Landing page loads... ✅ PASS
[2] Profissional signup page accessible... ❌ FAIL
     └─ Signup link not found
```

**Next steps**:
1. Check if dev server is running
2. View [TROUBLESHOOTING.md](./GUIA-TESTES-COMPLETO.md#troubleshooting)
3. Check browser console: `npm run dev` → F12

---

## 🔧 Debugging Failed Tests

### Step 1: Run with debug flag
```bash
DEBUG=* npm run test:smoke
```

### Step 2: Check test output
Look for which step failed and the error message

### Step 3: Manual verification
```bash
npm run dev
# Open http://localhost:3000 in browser
# Try the flow manually to see what's wrong
# F12 → Console tab for error details
```

### Step 4: View screenshots
If test saves screenshots:
```bash
ls -la tests/e2e/screenshots/
```

---

## 📱 Testing Different Scenarios

### Test Professional Signup
```bash
npm run test:full-flow
# This will test the complete signup flow
```

### Test Client Booking
```bash
npm run test:full-flow
# Includes client booking as part of full flow
```

### Test Mobile Responsiveness
```bash
# In browser dev tools (F12):
# Click device icon → select mobile
# Or run:
MOBILE=true npm run test:smoke
```

---

## 🆚 Test Coverage

### What's Tested

✅ = Tested  
⚠️ = Partially tested  
❌ = Not yet tested  

| Feature | Smoke | Full-Flow | Manual | Unit |
|---------|-------|-----------|--------|------|
| Landing page | ✅ | ✅ | ✅ | - |
| Profissional signup | ✅ | ✅ | ✅ | ✅ |
| Onboarding | ⚠️ | ✅ | ✅ | ✅ |
| Services CRUD | ⚠️ | ✅ | ✅ | ✅ |
| Public link | ✅ | ✅ | ✅ | ✅ |
| Client booking | ✅ | ✅ | ✅ | ⚠️ |
| Confirmation | ⚠️ | ✅ | ✅ | ✅ |
| Completion | ⚠️ | ✅ | ✅ | ✅ |
| Data isolation | ❌ | ✅ | ✅ | ✅ |
| Security rules | ❌ | ⚠️ | ✅ | - |

---

## 🚨 Common Issues

### ❌ "Dev server not running"
```bash
# Terminal 1: Start dev server
npm run dev
# Wait until you see:
# "Hit CTRL-C to stop the server"

# Terminal 2: Then run tests
npm run test:smoke
```

### ❌ "Timeout waiting for element"
**Means**: Page took too long to load
```bash
# Check if dev server is responding:
curl http://localhost:3000
# Should show HTML, not error

# If slow, try increasing timeout:
TIMEOUT=60000 npm run test:full-flow
```

### ❌ "Firebase not configured"
**Means**: Firebase initialization failed
```bash
# Check firebase config:
cat public/config.js | grep firebase

# Or manually check at localhost:3000 F12 Console:
firebase
# Should show version, not undefined
```

### ❌ "No services found to book"
**Means**: Onboarding didn't save services
```bash
# Manually test:
npm run dev
# Browser → Cadastro → Onboarding
# Fill "Serviços: Corte,Barba"
# Check Firestore if saved
```

---

## 📈 Next Steps

After tests **✅ PASS**:
1. ✅ Deploy to Vercel: `vercel deploy`
2. ✅ Test in production: Visit `https://agendaestetica.app`
3. ✅ Monitor: Check Firebase dashboard for errors
4. ✅ Share: Test link with stakeholders

---

## 📞 Need Help?

1. Check [GUIA-TESTES-COMPLETO.md](./GUIA-TESTES-COMPLETO.md)
2. See [MANUAL-FLUXO-COMPLETO.md](./MANUAL-FLUXO-COMPLETO.md)  
3. Review test output carefully
4. Try manual flow first, then automated
5. Check Firebase console for errors

---

**Pro Tips:**
- 💡 Run smoke tests before full-flow (faster feedback)
- 💡 Use manual testing for visual/UX issues
- 💡 Keep dev server running in background terminal
- 💡 Check Firebase billing/quotas if tests suddenly fail
- 💡 Videos help: record screen during manual testing
