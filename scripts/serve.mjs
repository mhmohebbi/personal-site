#!/usr/bin/env node
// Local preview: builds the site, serves _site/ and rebuilds whenever src/ changes.
//   PORT=4000 npm run dev

import { spawn } from 'node:child_process';
import { createReadStream, existsSync, statSync, watch } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, '_site');
const PORT = Number(process.env.PORT || 4000);
const SITE_URL = process.env.SITE_URL || `http://localhost:${PORT}`;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
};

function build() {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [path.join(ROOT, 'scripts/build.mjs')], {
      env: { ...process.env, SITE_URL },
      stdio: 'inherit',
    });
    child.on('exit', resolve);
  });
}

function resolveFile(urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0]);
  let file = path.join(OUT, path.normalize(clean));
  if (!file.startsWith(OUT)) return null;
  if (existsSync(file) && statSync(file).isDirectory()) file = path.join(file, 'index.html');
  return existsSync(file) ? file : null;
}

await build();

createServer((req, res) => {
  const file = resolveFile(req.url);
  const target = file || path.join(OUT, '404.html');
  res.writeHead(file ? 200 : 404, {
    'Content-Type': TYPES[path.extname(target)] || 'application/octet-stream',
    'Cache-Control': 'no-store',
  });
  createReadStream(target).pipe(res);
}).listen(PORT, () => console.log(`serving ${SITE_URL}`));

let timer;
watch(path.join(ROOT, 'src'), { recursive: true }, () => {
  clearTimeout(timer);
  timer = setTimeout(build, 120);
});
