#!/usr/bin/env node

import puppeteer from 'puppeteer';

(async () => {
  const url = process.env.BASE_URL || 'http://localhost:3000/pages/dashboard.html';
  console.log('Checking dashboard at', url);
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' }).catch(e => console.error('goto error', e));

  const sheets = await page.evaluate(() => {
    return Array.from(document.styleSheets).map(s => {
      return {
        href: s.href,
        rules: s.cssRules ? s.cssRules.length : null,
        disabled: s.disabled
      };
    });
  });
  console.log('styleSheets:', sheets);

  const missing = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    return links.map(l => ({ href: l.href, rel: l.rel }));
  });
  console.log('link tags:', missing);

  await browser.close();
})();