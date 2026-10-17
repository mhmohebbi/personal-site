// Progressive enhancement only: every page is complete without this script.

import { mountLandscape } from './landscape.js';
import { mountTrajectory } from './figures/trajectory.js';
import { mountPoser } from './figures/poser.js';
import { mountCrda } from './figures/crda.js';

const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- theme ---------- */

// Light by default; dark only when chosen with the toggle.
const activeTheme = () => (root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
const themeColor = document.querySelector('meta[name="theme-color"]');

function setTheme(next) {
  root.setAttribute('data-theme', next);
  if (themeColor) themeColor.content = next === 'dark' ? '#131312' : '#fbfaf7';
  try {
    localStorage.setItem('theme', next);
  } catch {
    /* storage unavailable: the choice lasts for this page view */
  }
}

// The whole page cross-fades as one picture where the browser supports view
// transitions; elsewhere it switches at once. Either way, per-element colour
// transitions are held off so nothing changes out of step.
let switching = 0; // switches in flight; a quick second click overlaps the first
document.querySelector('[data-theme-toggle]')?.addEventListener('click', () => {
  const next = activeTheme() === 'dark' ? 'light' : 'dark';
  switching++;
  root.classList.add('theme-switching');
  const done = () => --switching || root.classList.remove('theme-switching');

  if (document.startViewTransition && !reduced) {
    const fade = document.startViewTransition(() => setTheme(next));
    fade.ready.catch(() => {}); // a newer click skips this fade; that's fine
    fade.finished.finally(done);
  } else {
    setTheme(next);
    requestAnimationFrame(() => requestAnimationFrame(done));
  }
});

/* ---------- masthead ---------- */

const masthead = document.querySelector('[data-masthead]');
const onScroll = () => masthead?.classList.toggle('is-scrolled', window.scrollY > 4);
addEventListener('scroll', onScroll, { passive: true });
onScroll();

const heroName = document.querySelector('[data-hero-name]');
if (heroName) {
  new IntersectionObserver(
    ([entry]) => document.body.classList.toggle('show-name', !entry.isIntersecting && entry.boundingClientRect.top < 0),
    { rootMargin: '-56px 0px 0px 0px' },
  ).observe(heroName);
}

// Underline the nav link for the section currently in the reading band.
const navLinks = [...document.querySelectorAll('[data-nav]')].filter((a) => a.getAttribute('href').includes('#'));
const tracked = navLinks.map((a) => document.getElementById(a.dataset.nav)).filter(Boolean);
if (tracked.length) {
  const visible = new Set();
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => (e.isIntersecting ? visible.add(e.target.id) : visible.delete(e.target.id)));
      const current = tracked.find((s) => visible.has(s.id))?.id;
      navLinks.forEach((a) => a.classList.toggle('is-current', a.dataset.nav === current));
    },
    { rootMargin: '-35% 0px -60% 0px' },
  );
  tracked.forEach((s) => io.observe(s));
}

/* ---------- hero backdrop ---------- */

const landscape = document.querySelector('[data-landscape]');
if (landscape) {
  try {
    mountLandscape(landscape, { reduced, clear: document.querySelector('.hero__body') });
  } catch (err) {
    console.error('hero backdrop failed to start', err);
  }
}

/* ---------- BibTeX ---------- */

document.addEventListener('click', async (evt) => {
  const toggle = evt.target.closest('[data-bib-toggle]');
  if (toggle) {
    const box = document.getElementById(toggle.getAttribute('aria-controls'));
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    box.hidden = open;
    return;
  }

  const copy = evt.target.closest('[data-copy]');
  if (copy) {
    const code = document.getElementById(copy.dataset.copy).querySelector('code');
    const label = copy.querySelector('span');
    try {
      await navigator.clipboard.writeText(code.textContent);
      label.textContent = 'Copied';
    } catch {
      const range = document.createRange();
      range.selectNodeContents(code);
      getSelection().removeAllRanges();
      getSelection().addRange(range);
      label.textContent = 'Selected';
    }
    copy.classList.add('is-done');
    setTimeout(() => {
      label.textContent = 'Copy';
      copy.classList.remove('is-done');
    }, 1600);
  }
});

/* ---------- figures ---------- */

const figures = { trajectory: mountTrajectory, poser: mountPoser, crda: mountCrda };
document.querySelectorAll('[data-figure]').forEach((el) => {
  try {
    figures[el.dataset.figure]?.(el, { reduced });
  } catch (err) {
    console.error(`figure "${el.dataset.figure}" failed to start`, err);
  }
});
