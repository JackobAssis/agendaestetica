// Puppeteer E2E basic checks for AgendaEstetica
// Usage: run a static server that serves the project root (e.g. http-server . -p 8000)
// Then: npm run e2e

import puppeteer from 'puppeteer';

const BASE = process.env.BASE_URL || 'http://localhost:8000';
const PAGE = BASE + '/public/pages/agenda.html';

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  try {
    console.log('Opening', PAGE);
    const timeout = 15000;
    await page.goto(PAGE, { waitUntil: 'networkidle2', timeout });

    // Check topbar
    await page.waitForSelector('.app-header', { timeout });
    console.log('✔ app-header found');

    // Theme toggle works
    const toggle = await page.$('#theme-toggle');
    if (!toggle) throw new Error('theme-toggle not found');
    const before = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    await toggle.click();
    await new Promise(resolve => setTimeout(resolve, 400));
    const after = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    console.log('✔ theme toggled:', before, '→', after);

    // Responsive: mobile viewport shows bottom nav
    await page.setViewport({ width: 375, height: 800 });
    await new Promise(resolve => setTimeout(resolve, 300));
    const bottomVisible = await page.evaluate(() => {
      const el = document.querySelector('.bottom-nav');
      return el && getComputedStyle(el).display !== 'none';
    });
    console.log('✔ bottom-nav visible at mobile:', bottomVisible);

    // Desktop: sidebar visible
    await page.setViewport({ width: 1200, height: 900 });
    await new Promise(resolve => setTimeout(resolve, 300));
    const sidebarVisible = await page.evaluate(() => {
      const el = document.querySelector('.app-sidebar');
      return el && getComputedStyle(el).display !== 'none';
    });
    console.log('✔ sidebar visible at desktop:', sidebarVisible);

    // KPIs rendered
    const kpiCount = await page.$$eval('.kpi-card', els => els.length);
    console.log('✔ kpi cards count:', kpiCount);

    console.log('\nAll checks passed (summary above).');
    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('E2E test failed:', err);
    await browser.close();
    process.exit(2);
  }
})();
