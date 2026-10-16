#!/usr/bin/env node
// Zero-dependency static build: src/ → _site/
//
//   SITE_URL   absolute URL the site is served from (default: site.url in content).
//              The GitHub Pages workflow passes the real one, including any sub-path.
//   OUT_DIR    output directory (default: _site)

import { createHash } from 'node:crypto';
import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { site } from '../src/content/site.mjs';
import renderIndex from '../src/pages/index.mjs';
import renderCv from '../src/pages/cv.mjs';
import render404 from '../src/pages/404.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');
const OUT = path.resolve(ROOT, process.env.OUT_DIR || '_site');

const siteUrl = (process.env.SITE_URL || site.url).replace(/\/+$/, '');
const basePath = new URL(siteUrl + '/').pathname; // "/" or "/repo/"

const PAGES = [
  { out: 'index.html', page: 'home', render: renderIndex },
  { out: 'cv/index.html', page: 'cv', render: renderCv },
  // GitHub Pages serves 404.html at arbitrary depths, so it needs absolute URLs.
  { out: '404.html', page: '404', render: render404, absolute: true, noindex: true },
];

// Files kept at their historical URLs for anything that still links to them.
const LEGACY_COPIES = [['cv.pdf', 'Hossein-Mohebbi-Resume.pdf']];

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

async function fingerprints(dir, prefix) {
  const map = {};
  for (const file of await walk(dir)) {
    const rel = prefix + path.relative(dir, file).split(path.sep).join('/');
    map[rel] = createHash('sha1').update(await readFile(file)).digest('hex').slice(0, 10);
  }
  return map;
}

function context({ out, page, absolute }, hashes, now) {
  const depth = out.split('/').length - 1;
  const base = absolute ? basePath : '../'.repeat(depth);
  return {
    page,
    isHome: page === 'home',
    base,
    siteUrl,
    pageUrl: `${siteUrl}/${out.replace(/index\.html$/, '')}`,
    asset: (p) => `${base}${p}${hashes[p] ? `?v=${hashes[p]}` : ''}`,
    year: now.getUTCFullYear(),
    updated: now.toLocaleDateString('en-CA', { month: 'long', year: 'numeric', timeZone: 'UTC' }),
  };
}

export async function build() {
  const started = performance.now();
  const now = process.env.SOURCE_DATE_EPOCH ? new Date(Number(process.env.SOURCE_DATE_EPOCH) * 1000) : new Date();

  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });
  await cp(path.join(SRC, 'static'), OUT, { recursive: true });
  await cp(path.join(SRC, 'assets'), path.join(OUT, 'assets'), { recursive: true });

  for (const [from, to] of LEGACY_COPIES) {
    if (existsSync(path.join(OUT, from))) await cp(path.join(OUT, from), path.join(OUT, to));
  }

  const hashes = await fingerprints(path.join(SRC, 'assets'), 'assets/');

  for (const spec of PAGES) {
    const ctx = context(spec, hashes, now);
    let markup = spec.render(ctx).toString();
    if (spec.noindex) markup = markup.replace('<head>', '<head>\n<meta name="robots" content="noindex">');
    const file = path.join(OUT, spec.out);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, markup);
  }

  const indexable = PAGES.filter((p) => !p.noindex);
  const lastmod = now.toISOString().slice(0, 10);
  await writeFile(
    path.join(OUT, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexable
      .map((p) => `  <url><loc>${siteUrl}/${p.out.replace(/index\.html$/, '')}</loc><lastmod>${lastmod}</lastmod></url>`)
      .join('\n')}\n</urlset>\n`,
  );
  await writeFile(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);

  const ms = Math.round(performance.now() - started);
  console.log(`built ${PAGES.length} pages → ${path.relative(ROOT, OUT) || '.'}/ for ${siteUrl} in ${ms} ms`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  build().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
