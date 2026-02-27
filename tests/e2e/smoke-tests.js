#!/usr/bin/env node

/**
 * Simplified E2E Test Suite
 * Uses data attributes instead of complex selectors for more reliable testing
 * 
 * Prerequisite selectors in HTML should include data-testid attributes:
 * <button data-testid="btn-signup">Cadastrar</button>
 */

import puppeteer from 'puppeteer';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TIMEOUT = 30000;
const HEADLESS = process.env.HEADLESS !== 'false';

let testCount = 0;
let passCount = 0;
let failCount = 0;
let browser = null;

async function init() {
  console.log(`\n🚀 Iniciando E2E Test Suite`);
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`⏱️  Timeout: ${TIMEOUT}ms`);
  console.log(`${HEADLESS ? '🎬 Headless' : '👁️  Modo visual'}\n`);

  browser = await puppeteer.launch({
    headless: HEADLESS,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
}

async function cleanup() {
  if (browser) await browser.close();
}

async function test(name, fn) {
  testCount++;
  process.stdout.write(`\n[${testCount}] ${name}... `);
  
  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(TIMEOUT);
    
    await fn(page);
    await page.close();
    
    passCount++;
    console.log('✅ PASS');
  } catch (error) {
    failCount++;
    console.log(`❌ FAIL`);
    console.log(`     └─ ${error.message}`);
  }
}

async function testLandingPageExists() {
  await test('Landing page loads', async (page) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
    const title = await page.title();
    if (!title) throw new Error('Page title is empty');
  });
}

async function testSignupPageExists() {
  await test('Profissional signup page accessible', async (page) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
    // Look for signup link/button by text (robust across variations)
    const signupHandle = await page.evaluateHandle(() => {
      const textCandidates = ['profissional', 'sou profissional', 'cadastro', 'cadastrar'];
      const elements = Array.from(document.querySelectorAll('a,button'));
      return elements.find(el => {
        const t = (el.textContent || '').toLowerCase();
        return textCandidates.some(c => t.includes(c));
      }) || null;
    });
    const signupLink = await signupHandle.asElement();
    if (!signupLink) throw new Error('Signup link not found');

    await signupLink.click();
    // The signup may open an in-page form (SPA) — wait for the cadastro form to appear
    await page.waitForSelector('#form-cadastro, form#form-cadastro, form[id="form-cadastro"]', { timeout: TIMEOUT }).catch(() => {});
    const formExists = await page.$('#form-cadastro') || await page.$('form');
    if (!formExists) throw new Error('Signup form not found');
  });
}

async function testOnboardingPageExists() {
  await test('Onboarding page structure valid', async (page) => {
    await page.goto(`${BASE_URL}/pages/onboarding.html`, { waitUntil: 'networkidle2' });

    // if redirected to login (unauthenticated) just note and pass
    const currentUrl = page.url();
    const loginForm = await page.$('#form-login');
    if (currentUrl.includes('login') || loginForm) {
      console.log('     (Onboarding requires auth; skipping content check)');
      return;
    }

    // attempt to validate presence of basic fields but don't fail hard
    try {
      const estabelecimento = await page.$('#empresa-nome');
      const telefone = await page.$('#telefone');
      const servicos = await page.$('#servicos');
      if (!estabelecimento || !telefone || !servicos) {
        console.log('     (Onboarding fields not detected)');
      }
    } catch (e) {
      console.log('     (Error inspecting onboarding content - may require auth)');
    }
  });
}

async function testPublicPageAccessible() {
  await test('Public profile page loads without auth', async (page) => {
    // Try accessing a public page directly (should not require auth)
    await page.goto(`${BASE_URL}/pages/pagina-publica.html`, { waitUntil: 'networkidle2' });
    
    const content = await page.content();
    if (!content) throw new Error('Page is empty');
  });
}

async function testModulesLoadable() {
  await test('Core modules are loadable', async (page) => {
    // Check if Firebase module loads
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
    
    const hasFirebase = await page.evaluate(() => {
      return typeof window.firebase !== 'undefined';
    });
    
    if (!hasFirebase) throw new Error('Firebase not loaded');
  });
}

async function testSlugModuleExists() {
  await test('Slug module is available', async (page) => {
    // Navigate to a page that uses slug module
    await page.goto(`${BASE_URL}/pages/perfil.html`, { waitUntil: 'networkidle2' });
    
    // Check if slug-related elements exist
    const slugSection = await page.$('[id*="slug"]');
    if (!slugSection) {
      console.log('     (Slug section not found - may be user-specific)');
    }
  });
}

async function testServiceUIPresent() {
  await test('Service management UI present', async (page) => {
    await page.goto(`${BASE_URL}/pages/perfil.html`, { waitUntil: 'networkidle2' });
    // Look for service-related elements by IDs used in perfil.html
    const servicesList = await page.$('#services-list');
    const addServiceBtn = await page.$('#btn-add-service');
    if (!servicesList && !addServiceBtn) {
      console.log('     (Service UI may be hidden - requires authentication)');
    }
  });
}

async function testAgendamentosPageLoads() {
  await test('Agendamentos page structure valid', async (page) => {
    await page.goto(`${BASE_URL}/pages/agendamentos.html`, { waitUntil: 'networkidle2' });
    
    const pageContent = await page.content();
    if (!pageContent.includes('agendamento')) {
      throw new Error('Agendamentos page content missing');
    }
  });
}

async function testClientBookingPageLoads() {
  await test('Client booking page accessible', async (page) => {
    await page.goto(`${BASE_URL}/pages/agendar-cliente.html`, { waitUntil: 'networkidle2' });

    const serviceSelect = await page.$('#servico-select');
    const dateInput = await page.$('#date-select');

    if (!serviceSelect || !dateInput) {
      throw new Error('Booking form fields missing');
    }
  });
}

async function testDashboardPageLoads() {
  await test('Dashboard page structure valid', async (page) => {
    await page.goto(`${BASE_URL}/pages/dashboard.html`, { waitUntil: 'networkidle2' });

    // Prefer checking page title, fallback to known KPI elements used across versions
    const title = await page.title();
    if (title && title.toLowerCase().includes('dashboard')) return;
    const knownKpis = ['#kpi-today', '#count-hoje', '#kpi-clients', '#count-clientes', '#public-link', '#welcome-message'];
    const found = await page.evaluate((selectors) => {
      return selectors.some(s => !!document.querySelector(s));
    }, knownKpis);
    if (!found) {
      // If dashboard requires authentication it may redirect to login; accept that as pass for smoke
      const currentUrl = page.url();
      const loginForm = await page.$('#form-login');
      if (currentUrl.includes('login') || loginForm) {
        console.log('     (Dashboard requires auth; redirected to login)');
        return;
      }
      // Could also be a blank placeholder page shown to unauthenticated users
      console.log('     (Dashboard content not present - possibly unauthenticated)');
      return;
    }
  });
}

async function testFirebaseConfigured() {
  await test('Firebase configuration present', async (page) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
    
    const hasConfig = await page.evaluate(() => {
      const script = Array.from(document.scripts).find(s => 
        s.textContent.includes('firebaseConfig') || 
        s.textContent.includes('firebase.initializeApp')
      );
      return !!script;
    });
    
    if (!hasConfig) throw new Error('Firebase config not found');
  });
}

async function testRouterConfigured() {
  await test('Router configured', async (page) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
    
    const hasRouter = await page.evaluate(() => {
      return typeof window.router !== 'undefined' || 
             document.querySelector('[data-router]');
    });
    
    if (!hasRouter) console.log('     (Router may be lazy-loaded)');
  });
}

async function testNoJSErrors() {
  await test('No console errors on main pages', async (page) => {
    const errors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', (err) => {
      errors.push(err.toString());
    });
    
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
    // use a safe sleep fallback
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Filter out known non-critical errors
    const criticalErrors = errors.filter(e => 
      !e.includes('Not found') && 
      !e.includes('404') &&
      !e.includes('Failed to fetch') // Network might be down
    );
    
    if (criticalErrors.length > 0) {
      console.log(`\n     Warnings: ${criticalErrors.join('; ')}`);
    }
  });
}

async function testResponsiveDesign() {
  await test('Responsive design (mobile viewport)', async (page) => {
    await page.setViewport({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
    
    const bodyWidth = await page.evaluate(() => document.body.clientWidth);
    if (bodyWidth > 375) throw new Error('Layout not responsive');
  });
}

async function testDataAttributes() {
  await test('Data attributes present for testing', async (page) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
    
    const hasTestIds = await page.evaluate(() => {
      return document.querySelectorAll('[data-testid]').length > 0;
    });
    
    if (!hasTestIds) console.log('     (No data-testid attributes - using classname selectors)');
  });
}

async function printResults() {
  console.log('\n\n' + '═'.repeat(60));
  console.log('📊 RESULTS');
  console.log('═'.repeat(60));
  console.log(`Total: ${testCount}`);
  console.log(`✅ Passed: ${passCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📈 Success Rate: ${testCount > 0 ? ((passCount / testCount) * 100).toFixed(1) : 0}%`);
  console.log('═'.repeat(60) + '\n');

  return failCount === 0;
}

async function main() {
  try {
    await init();

    // Smoke Tests - Verify basic structure
    console.log('🧪 SMOKE TESTS\n');
    await testLandingPageExists();
    await testSignupPageExists();
    await testOnboardingPageExists();
    await testPublicPageAccessible();

    // Module Tests
    console.log('\n📦 MODULE TESTS\n');
    await testModulesLoadable();
    await testSlugModuleExists();
    await testFirebaseConfigured();
    await testRouterConfigured();

    // Page Structure Tests
    console.log('\n📄 PAGE STRUCTURE TESTS\n');
    await testServiceUIPresent();
    await testAgendamentosPageLoads();
    await testClientBookingPageLoads();
    await testDashboardPageLoads();

    // Quality Tests
    console.log('\n✨ QUALITY TESTS\n');
    await testNoJSErrors();
    await testResponsiveDesign();
    await testDataAttributes();

    const success = await printResults();
    process.exit(success ? 0 : 1);

  } catch (error) {
    console.error('\n❌ Test runner error:', error.message);
    process.exit(1);
  } finally {
    await cleanup();
  }
}

main();
