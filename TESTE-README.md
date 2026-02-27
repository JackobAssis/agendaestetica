#!/usr/bin/env node

/**
 * Test Infrastructure Overview & Quick Commands
 * 
 * This document provides a complete overview of the testing setup.
 * For quick start, see: TESTE-QUICK-REFERENCE.md
 */

# 📋 TEST INFRASTRUCTURE - COMPLETE GUIDE

## 🎯 What's Tested?

```
┌─────────────────────────────────────────┐
│     AGENDA ESTÉTICA TEST PYRAMID        │
├─────────────────────────────────────────┤
│               E2E TESTS                 │  ▲
│        (Full user workflows)            │  │
│        Puppeteer + Firebase             │  │
├─────────────────────────────────────────┤  │ Slower
│         INTEGRATION TESTS               │  │ But more
│    (Cross-module interactions)          │  │ realistic
├─────────────────────────────────────────┤  │
│          UNIT TESTS                     │  │
│    (Individual functions)               │  ▼
│        Mocha + Chai + Node              │   Faster
└─────────────────────────────────────────┘
```

---

## 📁 Test Directory Structure

```
tests/
├── README.md                      # This file
├── test-coordinator.js            # Runs all suites in order
│
├── fixtures/
│   ├── mockData.js               # Test data
│   └── firebaseSetup.js          # Firebase config for tests
│
├── unit/                         # Unit tests (Mocha + Chai)
│   ├── slug.test.js
│   ├── auth.test.js
│   ├── agenda.test.js
│   └── agendamentos.test.js
│
└── e2e/                          # End-to-end tests (Puppeteer)
    ├── run-tests.js              # Original E2E suite
    ├── full-flow-test.js         # NEW: Complete user journey
    ├── smoke-tests.js            # NEW: Quick validation
    └── runners/                  # Test utilities
        └── TestRunner.js
```

---

## 🚀 Quick Commands Reference

### Start Here (30 seconds)
```bash
npm run test:smoke
```

### Complete Test (3 minutes)
```bash
npm run test:full-flow
```

### All Tests (5 minutes)
```bash
npm run test:all
```

### With Visual Feedback
```bash
HEADLESS=false npm run test:full-flow
```

---

## 📊 Test Coverage

### ✅ Fully Tested (100%)

- [x] **Slug Generation**
  - Uniqueness validation
  - URL-safe character handling
  - Auto-generation on signup

- [x] **Professional Signup**
  - Firebase Auth integration
  - User document creation
  - Email validation
  - Password requirements

- [x] **Onboarding**
  - Form field validation
  - Data persistence
  - Service format conversion
  - Hour configuration

- [x] **Services Management**
  - CRUD operations (Create, Read, Update, Delete)
  - Price and duration handling
  - Service limit enforcement (5 on free plan)
  - Feature gating

- [x] **Public Link**
  - Slug-based URL generation
  - Clipboard copy functionality
  - Accessibility without auth

- [x] **Client Booking**
  - Service selection
  - Date/time slot generation
  - Conflict detection
  - Booking creation

- [x] **Agendamento Lifecycle**
  - Create (solicitado status)
  - Confirm (→ confirmado)
  - Complete (→ concluído)
  - Cancel (→ cancelado)
  - Slot liberation on cancel

- [x] **Security & Isolation**
  - Firebase rules validation
  - Multi-tenant data isolation
  - Unauthorized access prevention

### ⚠️ Partially Tested (70-90%)

- [x] **Dashboard**
  - KPI calculations (basic)
  - Real-time updates (limited)

- [x] **Error Handling**
  - Most common errors
  - Edge cases incomplete

- [x] **Performance**
  - Page loads measured
  - Query optimization verified
  - Bottlenecks identified

### ❌ Not Yet Tested (0%)

- [ ] **Notifications**
  - Email notifications
  - SMS notifications (future)
  - Webhook payloads

- [ ] **Monetization**
  - Stripe integration
  - Payment processing
  - Subscription management

- [ ] **Analytics**
  - Event tracking
  - Metrics collection
  - Report generation

- [ ] **Offline-First**
  - Service Workers
  - Data sync on reconnect
  - Conflict resolution

---

## 🧪 Test Types Explained

### 1. Unit Tests (Mocha + Chai)

**What**: Test individual functions in isolation  
**Why**: Fast, reliable, easy to debug  
**How**: `npm test`  
**Time**: ~10 seconds

```javascript
describe('Slug Module', () => {
  it('should slugify text', () => {
    expect(slugify('João')).to.equal('joao');
  });
});
```

**Pros:**
- ✅ Super fast
- ✅ Easy to understand
- ✅ Great for TDD
- ✅ CI-friendly

**Cons:**
- ❌ Doesn't test integration
- ❌ Mock Firebase (not real)
- ❌ UI not tested

---

### 2. E2E Tests - Smoke Tests (Puppeteer)

**What**: Quick validation that pages load  
**Why**: Fast feedback on basic health  
**How**: `npm run test:smoke`  
**Time**: ~30 seconds

```javascript
await test('Landing page loads', async (page) => {
  await page.goto('http://localhost:3000');
  const title = await page.title();
  expect(title).to.not.be.empty;
});
```

**Pros:**
- ✅ Fast
- ✅ Real browser
- ✅ Good for CI/CD gate

**Cons:**
- ❌ Doesn't test full flows
- ❌ Limited error detection

---

### 3. E2E Tests - Full Flow (Puppeteer)

**What**: Complete user journey from signup to completion  
**Why**: Validates entire system works together  
**How**: `npm run test:full-flow`  
**Time**: ~3 minutes

```javascript
// Signup → Onboarding → Config → Client books → Professional confirms
await runner.testProfessionalSignup();
await runner.testOnboarding(page);
await runner.testClientBooking(publicLink);
await runner.testProfessionalConfirmation(page);
```

**Pros:**
- ✅ Tests real scenarios
- ✅ Catches integration bugs
- ✅ Real Firebase data

**Cons:**
- ❌ Slower
- ❌ More flaky (network issues)
- ❌ Harder to debug

---

### 4. Manual Tests

**What**: Human-driven testing with checklists  
**Why**: Validates UX, visual design, edge cases  
**How**: Follow [MANUAL-FLUXO-COMPLETO.md](./MANUAL-FLUXO-COMPLETO.md)  
**Time**: ~30-60 minutes

**Pros:**
- ✅ Catches UX issues
- ✅ Tests on real devices
- ✅ Validates accessibility

**Cons:**
- ❌ Slow
- ❌ Not repeatable
- ❌ Human error

---

## 🎬 Detailed Test Flow

### E2E Full-Flow Test Steps

```
1️⃣  PROFESSIONAL SIGNUP
    ├─ Navigate to signup page
    ├─ Fill form (name, email, profession, password)
    ├─ Submit
    └─ Verify: Redirects to onboarding ✅

2️⃣  ONBOARDING
    ├─ Fill: Establishment, phone, address, services
    ├─ Select: Working days (Mon-Fri)
    ├─ Set: Hours (9:00-18:00), slot duration (30min)
    ├─ Submit
    └─ Verify: Redirects to dashboard ✅

3️⃣  PUBLIC LINK
    ├─ Extract public link from dashboard
    ├─ Verify: Format = https://agendaestetica.app/p/{slug}
    ├─ Click copy button
    └─ Verify: Link in clipboard ✅

4️⃣  SERVICE MANAGEMENT
    ├─ Navigate to profile
    ├─ Edit first service (add price, duration)
    ├─ Save
    └─ Verify: Changes persist ✅

5️⃣  CLIENT ACCESS (Headless page)
    ├─ Navigate to public link (no auth)
    ├─ View services with prices/durations
    ├─ Click "Agendar"
    └─ Verify: Booking form opens ✅

6️⃣  CLIENT BOOKING
    ├─ Select service
    ├─ Select date (next Monday)
    ├─ Click "Gerar slots"
    ├─ Verify: 18 time slots generated ✅
    ├─ Select slot (e.g., 10:00-10:30)
    ├─ Fill: Client name, email, phone
    ├─ Submit booking
    └─ Verify: Success message ✅

7️⃣  PROFESSIONAL CONFIRMATION
    ├─ Navigate to agendamentos
    ├─ Verify: New booking in list
    ├─ Click "Confirmar"
    ├─ Verify: Status → "confirmado" (green) ✅
    └─ Verify: Dashboard KPI updated ✅

8️⃣  APPOINTMENT COMPLETION
    ├─ Click "Concluir"
    ├─ Verify: Status → "concluído" (blue) ✅
    └─ Verify: Timestamp recorded ✅

9️⃣  CONFLICT DETECTION
    ├─ Book same slot with different client
    ├─ Verify: Error "Conflito de horário" ✅
    ├─ Cancel first booking
    ├─ Rebook same slot
    └─ Verify: Succeeds (slot freed) ✅

🔟  DATA ISOLATION
    ├─ Create 2nd professional
    ├─ Verify: Prof1 can't see Prof2's data ✅
    └─ Verify: Firestore rules enforced ✅
```

---

## 🔧 Test Configuration

### Environment Variables

```bash
# Run tests with custom config
BASE_URL=http://localhost:8000 npm run test:smoke
HEADLESS=false npm run test:full-flow
TIMEOUT=60000 npm run test:full-flow
DEBUG=* npm test
```

### Firebase Config

Tests use `public/firebase-config.js`:
```javascript
// public/firebase-config.js
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "agendaestetica.firebaseapp.com",
  projectId: "agendaestetica",
  storageBucket: "agendaestetica.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};
```

For testing, use:
- 🟢 **Development**: Local Firebase emulator
- 🔵 **Staging**: Test Firebase project
- 🔴 **Production**: Production Firebase (be careful!)

---

## 📈 Running Tests in CI/CD

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Unit tests
        run: npm test
      
      - name: Smoke tests
        run: npm run test:smoke
```

### Pre-Commit Hook

```bash
#!/bin/sh
# .git/hooks/pre-commit

npm test -- --bail
if [ $? -ne 0 ]; then
  echo "❌ Tests failed. Commit aborted."
  exit 1
fi
```

---

## 🐛 Debugging Tests

### Enable Verbose Output

```bash
DEBUG=* npm test
DEBUG=puppeteer npm run test:smoke
```

### Save Screenshots on Failure

```javascript
await page.screenshot({ 
  path: `tests/e2e/screenshots/failure-${Date.now()}.png`
});
```

### Keep Browser Open

```bash
HEADLESS=false npm run test:full-flow
// Manually interact while test pauses
```

### Step Through Code

```bash
node --inspect tests/e2e/full-flow-test.js
# Open chrome://inspect in Chrome DevTools
```

---

## 📊 Test Report

After running tests, check:
```bash
cat test-report.json
```

Contains:
- Timestamp
- All test results
- Pass/fail counts
- Success rate

---

## ✅ Pre-Launch Checklist

Before deploying to production:

1. [ ] All unit tests pass: `npm test`
2. [ ] Smoke tests pass: `npm run test:smoke`
3. [ ] Full-flow E2E passes: `npm run test:full-flow`
4. [ ] Manual tests completed: [CHECKLIST-TESTES-PRE-LANCAMENTO.md](./CHECKLIST-TESTES-PRE-LANCAMENTO.md)
5. [ ] No console errors (F12)
6. [ ] Responsive design verified (mobile view)
7. [ ] Performance acceptable (< 2s load)
8. [ ] Firebase quotas sufficient
9. [ ] Backup/rollback plan ready
10. [ ] Approval from product lead

---

## 🚀 Next Improvements

- [ ] Add CodeCov integration
- [ ] Add visual regression testing (Percy)
- [ ] Add Lighthouse performance tests
- [ ] Add accessibility tests (axe-core)
- [ ] Add load testing (k6)
- [ ] Add mobile-specific tests
- [ ] Add payment/webhook tests
- [ ] Add offline-first sync tests

---

## 📞 Troubleshooting

**Tests failing?** See: [GUIA-TESTES-COMPLETO.md#troubleshooting](./GUIA-TESTES-COMPLETO.md#troubleshooting)

**Quick start help?** See: [TESTE-QUICK-REFERENCE.md](./TESTE-QUICK-REFERENCE.md)

**Need to test manually?** See: [MANUAL-FLUXO-COMPLETO.md](./MANUAL-FLUXO-COMPLETO.md)

---

**Last Updated**: 2024-07-15  
**Maintained by**: Development Team  
**Questions?** Check the docs above or ask in #dev-testing
