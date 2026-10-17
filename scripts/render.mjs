#!/usr/bin/env node
// Renders the generated binary assets that are committed to the repo:
//   src/assets/img/og.png               1200×630 social preview
//   src/assets/img/apple-touch-icon.png 180×180 home-screen icon
//
// Needs Playwright (any of: a local `playwright` install, a global one, or
// `npx playwright`). Set CHROME_PATH to use an existing Chrome/Chromium.
// Re-run after editing src/content/site.mjs:  npm run render

import { execSync, spawnSync } from 'node:child_process';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { site } from '../src/content/site.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, '_site');

async function loadPlaywright() {
  for (const name of ['playwright', 'playwright-core']) {
    try {
      return await import(name);
    } catch {}
  }
  const globalRoot = execSync('npm root -g').toString().trim();
  for (const name of ['playwright', 'playwright-core']) {
    const entry = path.join(globalRoot, name, 'index.mjs');
    if (existsSync(entry)) return import(pathToFileURL(entry).href);
  }
  throw new Error('Playwright not found. Install it with `npm i -D playwright` and run `npx playwright install chromium`.');
}

function serve() {
  const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.jpg': 'image/jpeg', '.png': 'image/png' };
  const server = createServer((req, res) => {
    let file = path.join(OUT, decodeURIComponent(req.url.split('?')[0]));
    if (existsSync(file) && statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!file.startsWith(OUT) || !existsSync(file)) return res.writeHead(404).end();
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

const build = spawnSync(process.execPath, [path.join(ROOT, 'scripts/build.mjs')], { stdio: 'inherit' });
if (build.status !== 0) process.exit(build.status ?? 1);

const { chromium } = await loadPlaywright();
const server = await serve();
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});

try {
  // ---- social preview
  const og = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1, colorScheme: 'light' });
  await og.goto(`${origin}/`, { waitUntil: 'networkidle' });
  await og.evaluate(({ host, role }) => {
    const figure = document.querySelector('[data-figure="trajectory"] svg').cloneNode(true);
    document.body.className = 'og';
    document.body.innerHTML = '';
    const card = document.createElement('div');
    card.innerHTML = `
      <style>
        body.og { margin: 0; background: var(--bg); }
        .og-card { box-sizing: border-box; width: 1200px; height: 630px; padding: 76px 80px; display: grid; grid-template-columns: 1fr 470px; gap: 56px; align-items: center; }
        .og-name { margin: 0; font: 380 84px/0.98 var(--serif); letter-spacing: -0.03em; color: var(--ink); }
        .og-role { margin: 28px 0 0; font: 360 29px/1.32 var(--serif); color: var(--ink-2); }
        .og-host { margin: 44px 0 0; font: 500 18px/1 var(--sans); letter-spacing: 0.02em; color: var(--accent); }
        .og-fig { padding: 26px; background: var(--panel); border-radius: 14px; }
        .og-fig svg { display: block; width: 100%; height: auto; }
      </style>
      <div class="og-card">
        <div>
          <h1 class="og-name">Hossein<br>Mohebbi</h1>
          <p class="og-role">${role}</p>
          <p class="og-host">${host}</p>
        </div>
        <div class="og-fig"></div>
      </div>`;
    card.querySelector('.og-fig').append(figure);
    document.body.append(card);
  }, {
    host: new URL(site.url).host,
    role: 'Machine learning researcher. Reinforcement learning, causal inference and computer-use agents.',
  });
  await og.evaluate(() => document.fonts.ready);
  await og.screenshot({ path: path.join(ROOT, 'src/assets/img/og.png') });
  console.log('rendered src/assets/img/og.png');

  // ---- touch icon
  const icon = await browser.newPage({ viewport: { width: 180, height: 180 }, colorScheme: 'light' });
  await icon.goto(`${origin}/assets/img/favicon.svg`); // a bare SVG document scales to the viewport
  await icon.screenshot({ path: path.join(ROOT, 'src/assets/img/apple-touch-icon.png'), omitBackground: true });
  console.log('rendered src/assets/img/apple-touch-icon.png');
} finally {
  await browser.close();
  server.close();
}

// Rebuild so _site/ carries the fresh files.
spawnSync(process.execPath, [path.join(ROOT, 'scripts/build.mjs')], { stdio: 'inherit' });
