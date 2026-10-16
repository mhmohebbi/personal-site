#!/usr/bin/env node
// Verifies the built site: every internal link, asset and #fragment resolves,
// and every id is unique per page. Run after a build (npm run check does both).

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.resolve(ROOT, process.env.OUT_DIR || '_site');

const pages = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) walk(full);
    else if (name.endsWith('.html')) pages.push(full);
  }
})(OUT);

const idsOf = (markup) => [...markup.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
const problems = [];

for (const page of pages) {
  const rel = path.relative(OUT, page);
  const markup = readFileSync(page, 'utf8');
  if (rel === '404.html' || /http-equiv="refresh"/.test(markup)) continue; // absolute URLs / redirects

  const ids = idsOf(markup);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dupes.length) problems.push(`${rel}: duplicate ids ${[...new Set(dupes)].join(', ')}`);

  for (const [, attr, value] of markup.matchAll(/\s(href|src)="([^"]*)"/g)) {
    if (/^(https?:|mailto:|data:)/.test(value)) continue;
    const [target, fragment] = value.split('#');
    let file = target ? path.resolve(path.dirname(page), target.split('?')[0]) : page;
    if (existsSync(file) && statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!existsSync(file)) {
      problems.push(`${rel}: ${attr}="${value}" → missing ${path.relative(OUT, file)}`);
      continue;
    }
    if (fragment && file.endsWith('.html') && !idsOf(readFileSync(file, 'utf8')).includes(fragment)) {
      problems.push(`${rel}: ${attr}="${value}" → no #${fragment} in ${path.relative(OUT, file)}`);
    }
  }
}

if (problems.length) {
  console.error(problems.map((p) => `  ✗ ${p}`).join('\n'));
  process.exit(1);
}
console.log(`checked ${pages.length} pages: all internal links resolve`);
