#!/usr/bin/env node

// Script to verify that every HTML page has its linked CSS file present on disk.
// Usage: node tests/e2e/check-css-links.js

import fs from 'fs';
import path from 'path';
import glob from 'glob';

const workspace = process.cwd();
const htmlFiles = glob.sync('pages/**/*.html', { cwd: workspace }).concat(glob.sync('public/pages/**/*.html', { cwd: workspace }));

let missing = [];

for (const relPath of htmlFiles) {
  const absPath = path.join(workspace, relPath);
  const content = fs.readFileSync(absPath, 'utf-8');
  const matches = [...content.matchAll(/<link\s+[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi)];
  if (matches.length === 0) {
    console.log(`⚠️  No stylesheet link found in ${relPath}`);
    continue;
  }
  for (const m of matches) {
    let href = m[1];
    // resolve to disk path
    let cssPath;
    if (href.startsWith('/')) {
      cssPath = path.join(workspace, href.replace(/^\//, ''));
    } else {
      // relative to html file
      cssPath = path.join(path.dirname(absPath), href);
    }
    cssPath = path.normalize(cssPath);
    if (!fs.existsSync(cssPath)) {
      console.log(`❌ ${relPath} → missing CSS at ${href} (resolved ${cssPath})`);
      missing.push({ html: relPath, href, resolved: cssPath });
    } else {
      console.log(`✅ ${relPath} → ${href}`);
    }
  }
}

console.log(`\nChecked ${htmlFiles.length} HTML files. ${missing.length} missing stylesheets.`);
if (missing.length > 0) process.exit(1);
else process.exit(0);
