import { html, raw } from '../lib/html.mjs';
import { profile, site } from '../content/site.mjs';
import { icons } from './icons.mjs';

// Runs before first paint: applies a saved theme choice and flags JS support.
const THEME_BOOT = `(function(){var d=document.documentElement;d.classList.add('js');try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')d.setAttribute('data-theme',t);}catch(e){}})();`;

function personSchema(ctx) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.role,
    url: ctx.siteUrl + '/',
    image: ctx.siteUrl + '/' + profile.portrait,
    email: 'mailto:' + profile.email,
    alumniOf: { '@type': 'CollegeOrUniversity', name: 'University of Waterloo' },
    knowsAbout: ['Reinforcement learning', 'Causal inference', 'Robust machine learning', 'Computer-use agents'],
    sameAs: Object.values(profile.links),
  };
}

export function navLinks(ctx) {
  const home = ctx.isHome ? '' : ctx.base || './';
  return [
    { href: `${home}#research`, label: 'Research', id: 'research' },
    { href: `${home}#publications`, label: 'Publications', id: 'publications' },
    { href: `${home}#experience`, label: 'Experience', id: 'experience' },
  ];
}

export function layout(ctx, { title, description = site.description, body, bodyClass = '', scripts = [] }) {
  const fullTitle = title ? `${title} · ${profile.name}` : `${profile.name} · ${profile.role}`;
  const ogImage = `${ctx.siteUrl}/assets/img/og.png`;
  return html`<!doctype html>
<html lang="${site.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${fullTitle}</title>
<meta name="description" content="${description}">
<meta name="author" content="${profile.name}">
<link rel="canonical" href="${ctx.pageUrl}">
<meta name="color-scheme" content="light dark">
<meta name="theme-color" content="#fbfaf7" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#121211" media="(prefers-color-scheme: dark)">
<meta property="og:type" content="${ctx.isHome ? 'profile' : 'website'}">
<meta property="og:title" content="${fullTitle}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${ctx.pageUrl}">
<meta property="og:image" content="${ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${ctx.asset('assets/img/favicon.svg')}" type="image/svg+xml">
<link rel="apple-touch-icon" href="${ctx.asset('assets/img/apple-touch-icon.png')}">
<link rel="preload" href="${ctx.base}assets/fonts/newsreader-latin-opsz.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${ctx.base}assets/fonts/inter-latin-wght.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${ctx.asset('assets/css/site.css')}">
<script>${raw(THEME_BOOT)}</script>
${ctx.isHome ? html`<script type="application/ld+json">${raw(JSON.stringify(personSchema(ctx)))}</script>` : ''}
</head>
<body class="${bodyClass}">
<a class="skip" href="#main">Skip to content</a>
<header class="masthead" data-masthead>
  <div class="masthead__inner">
    <a class="masthead__name" href="${ctx.base || './'}" aria-label="${profile.name}, home">${profile.name}</a>
    <nav class="masthead__nav" aria-label="Primary">
      ${navLinks(ctx).map(
        (l) => html`<a href="${l.href}" data-nav="${l.id}"${l.current ? raw(' aria-current="page"') : ''}>${l.label}</a>`,
      )}
      <button class="theme-toggle" type="button" data-theme-toggle aria-label="Switch colour theme" title="Switch colour theme">
        <span class="theme-toggle__sun">${raw(icons.sun)}</span><span class="theme-toggle__moon">${raw(icons.moon)}</span>
      </button>
    </nav>
  </div>
</header>
<main id="main">
${body}
</main>
<footer class="colophon">
  <div class="colophon__inner">
    <p>© ${ctx.year} ${profile.name}</p>
    <p>Last updated ${ctx.updated}</p>
    <p><a href="#main" data-to-top>Back to top</a></p>
  </div>
</footer>
${scripts.map((s) => html`<script type="module" src="${ctx.asset(s)}"></script>`)}
</body>
</html>
`;
}
